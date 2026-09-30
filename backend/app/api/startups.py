from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.startup import Startup
from app.models.challenge import Challenge
from app.models.user import User
from app.schemas.startup import StartupCreate, StartupResponse
from app.auth import get_current_user, require_role
from app.services.matching import check_informational_eligibility

router = APIRouter(prefix="/startups", tags=["Startups"])

@router.post("", response_model=StartupResponse, status_code=status.HTTP_201_CREATED)
def create_or_update_startup(
    startup_in: StartupCreate,
    current_user: User = Depends(require_role("startup")),
    db: Session = Depends(get_db)
):
    """Create or update startup profile for the logged in startup user."""
    startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
    if startup:
        startup.name = startup_in.name
        startup.sector = startup_in.sector
        startup.dpiit_status = startup_in.dpiit_status
        startup.profile_text = startup_in.profile_text
    else:
        startup = Startup(
            user_id=current_user.id,
            name=startup_in.name,
            sector=startup_in.sector,
            dpiit_status=startup_in.dpiit_status,
            profile_text=startup_in.profile_text
        )
        db.add(startup)
    
    db.commit()
    db.refresh(startup)
    return startup

@router.get("/me", response_model=StartupResponse)
def get_my_startup(
    current_user: User = Depends(require_role("startup")),
    db: Session = Depends(get_db)
):
    startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup profile not found")
    return startup

@router.get("/{startup_id}", response_model=StartupResponse)
def get_startup(
    startup_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    startup = db.query(Startup).filter(Startup.id == startup_id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup not found")
    return startup

@router.get("/eligibility/{challenge_id}")
def get_informational_eligibility(
    challenge_id: int,
    current_user: User = Depends(require_role("startup")),
    db: Session = Depends(get_db)
):
    """
    Informational eligibility comparison between the logged-in startup and challenge.
    Never blocks submission!
    """
    startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
    if not startup:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Startup profile not found")
    
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    
    result = check_informational_eligibility(
        startup_sector=startup.sector,
        challenge_sector=challenge.required_sector,
        startup_dpiit=startup.dpiit_status,
        challenge_dpiit_required=challenge.dpiit_required
    )
    return result
