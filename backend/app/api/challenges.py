from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.challenge import Challenge
from app.models.user import User
from app.schemas.challenge import ChallengeCreate, ChallengeResponse
from app.auth import get_current_user, require_role

from app.policies.challenge import enforce_can_view

router = APIRouter(prefix="/challenges", tags=["Challenges"])

@router.post("", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
def create_challenge(
    challenge_in: ChallengeCreate,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    """Officer only: create an innovation challenge."""
    challenge = Challenge(
        officer_id=current_user.id,
        department_id=current_user.department_id,
        title=challenge_in.title,
        description=challenge_in.description,
        outcomes=challenge_in.outcomes,
        constraints=challenge_in.constraints,
        budget_band=challenge_in.budget_band,
        required_sector=challenge_in.required_sector,
        dpiit_required=challenge_in.dpiit_required,
        status="draft" # All new challenges start as draft
    )
    db.add(challenge)
    db.commit()
    db.refresh(challenge)
    return challenge

@router.get("", response_model=list[ChallengeResponse])
def list_challenges(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List challenges visible to authenticated demo users."""
    if current_user.role == "officer":
        return db.query(Challenge).order_by(Challenge.id.desc()).all()
    # Startups and evaluators see published challenges
    return db.query(Challenge).filter(Challenge.status == "published").order_by(Challenge.id.desc()).all()

@router.get("/{challenge_id}", response_model=ChallengeResponse)
def get_challenge(
    challenge_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
        
    enforce_can_view(current_user, challenge)
    return challenge

from app.workflows.challenge import transition_challenge
from pydantic import BaseModel

class ChallengeStatusUpdate(BaseModel):
    status: str

@router.patch("/{challenge_id}/status", response_model=ChallengeResponse)
def update_challenge_status(
    challenge_id: int,
    status_update: ChallengeStatusUpdate,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    challenge = db.query(Challenge).filter(Challenge.id == challenge_id).first()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
        
    from app.policies.challenge import enforce_can_edit
    enforce_can_edit(current_user, challenge)
    
    transition_challenge(challenge, status_update.status, current_user)
    
    db.commit()
    db.refresh(challenge)
    return challenge
