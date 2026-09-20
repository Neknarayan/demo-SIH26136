from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.application import Application
from app.models.challenge import Challenge
from app.models.startup import Startup
from app.models.user import User
from app.schemas.application import ApplicationCreate, ApplicationStatusUpdate, ApplicationResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/applications", tags=["Applications"])

@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def submit_application(
    app_in: ApplicationCreate,
    current_user: User = Depends(require_role("startup")),
    db: Session = Depends(get_db)
):
    """Startup only: submit application to a challenge."""
    startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
    if not startup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found. Please create your startup profile first."
        )

    challenge = db.query(Challenge).filter(Challenge.id == app_in.challenge_id).first()
    if not challenge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Challenge not found"
        )
    if challenge.status != "published":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Applications can only be submitted to published challenges."
        )

    # Check for duplicate application
    existing = db.query(Application).filter(
        Application.startup_id == startup.id,
        Application.challenge_id == app_in.challenge_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Application already submitted by this startup for this challenge."
        )

    application = Application(
        startup_id=startup.id,
        challenge_id=app_in.challenge_id,
        proposal_text=app_in.proposal_text,
        file_url=app_in.file_url,
        status="submitted"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("", response_model=list[ApplicationResponse])
def list_applications(
    challenge_id: int | None = Query(None),
    startup_id: int | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List applications with role-based visibility.
    Includes startup info and evaluation score when available.
    """
    query = db.query(Application).options(
        joinedload(Application.startup),
        joinedload(Application.evaluation)
    )

    if current_user.role == "startup":
        startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
        if not startup:
            return []
        if startup_id and startup_id != startup.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Startups may only view their own applications."
            )
        query = query.filter(Application.startup_id == startup.id)
    else:
        # Officer or Evaluator
        if challenge_id:
            query = query.filter(Application.challenge_id == challenge_id)
        if startup_id:
            query = query.filter(Application.startup_id == startup_id)

    return query.order_by(Application.id.desc()).all()

@router.get("/{application_id}", response_model=ApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    application = db.query(Application).options(
        joinedload(Application.startup),
        joinedload(Application.evaluation)
    ).filter(Application.id == application_id).first()

    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    if current_user.role == "startup":
        startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
        if not startup or application.startup_id != startup.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")

    return application

from app.workflows.application import transition_application

@router.patch("/{application_id}/status", response_model=ApplicationResponse)
def update_application_status(
    application_id: int,
    status_update: ApplicationStatusUpdate,
    current_user: User = Depends(get_current_user), # role check is inside transition_application
    db: Session = Depends(get_db)
):
    """Officer only: update application status (e.g. shortlisted, rejected, under_review)."""
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    transition_application(application, status_update.status, current_user)
    
    db.commit()
    db.refresh(application)
    return application
