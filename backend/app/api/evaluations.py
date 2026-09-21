from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.evaluation import Evaluation
from app.models.application import Application
from app.models.user import User
from app.schemas.evaluation import EvaluationCreate, EvaluationResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/evaluations", tags=["Evaluations"])

@router.post("", response_model=EvaluationResponse, status_code=status.HTTP_201_CREATED)
def create_evaluation(
    eval_in: EvaluationCreate,
    current_user: User = Depends(require_role("evaluator")),
    db: Session = Depends(get_db)
):
    """Evaluator only: score an application."""
    application = db.query(Application).filter(Application.id == eval_in.application_id).first()
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")

    existing = db.query(Evaluation).filter(Evaluation.application_id == eval_in.application_id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Evaluation already recorded for this application."
        )

    evaluation = Evaluation(
        application_id=eval_in.application_id,
        evaluator_id=current_user.id,
        score=eval_in.score,
        notes=eval_in.notes
    )
    db.add(evaluation)

    # Transition application status to under_review if currently submitted
    if application.status == "submitted":
        application.status = "under_review"

    db.commit()
    db.refresh(evaluation)
    return evaluation

@router.get("", response_model=list[EvaluationResponse])
def get_evaluations(
    application_id: int | None = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Evaluation)
    
    if current_user.role == "startup":
        # Startups should not see internal evaluation notes/scores
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view evaluations.")
    elif current_user.role == "evaluator":
        # Evaluators only see their own
        query = query.filter(Evaluation.evaluator_id == current_user.id)
    elif current_user.role == "officer":
        # Officers only see evaluations for challenges in their department
        from app.models.challenge import Challenge
        query = query.join(Application).join(Challenge).filter(Challenge.department_id == current_user.department_id)

    if application_id:
        query = query.filter(Evaluation.application_id == application_id)
    return query.all()
