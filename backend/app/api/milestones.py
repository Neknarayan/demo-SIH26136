from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models.milestone import Milestone
from app.models.pilot import Pilot
from app.models.user import User
from app.schemas.milestone import MilestoneCreate, MilestoneRelease, MilestoneResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/pilots", tags=["Milestones"])

@router.post("/{pilot_id}/milestones", response_model=MilestoneResponse, status_code=status.HTTP_201_CREATED)
def create_milestone(
    pilot_id: int,
    m_in: MilestoneCreate,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
    if not pilot:
        raise HTTPException(status_code=404, detail="Pilot not found")
    if pilot.total_budget is None:
        raise HTTPException(status_code=400, detail="Set a total budget on the pilot before adding milestones.")
    # Validate sum of percentages does not exceed 100%
    existing_pct = db.query(Milestone).filter(Milestone.pilot_id == pilot_id).all()
    used_pct = sum(float(m.percentage_of_budget) for m in existing_pct)
    if used_pct + float(m_in.percentage_of_budget) > 100.0:
        raise HTTPException(status_code=400, detail=f"Total milestones would exceed 100% of budget. Currently used: {used_pct}%")
    m = Milestone(
        pilot_id=pilot_id,
        name=m_in.name,
        description=m_in.description,
        percentage_of_budget=m_in.percentage_of_budget,
        due_date=m_in.due_date,
        status="pending"
    )
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.get("/{pilot_id}/milestones", response_model=list[MilestoneResponse])
def list_milestones(
    pilot_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pilot = db.query(Pilot).filter(Pilot.id == pilot_id).first()
    if not pilot:
        raise HTTPException(status_code=404, detail="Pilot not found")
    return db.query(Milestone).options(joinedload(Milestone.invoices)).filter(Milestone.pilot_id == pilot_id).order_by(Milestone.id).all()

@router.patch("/milestones/{milestone_id}/release", response_model=MilestoneResponse)
def release_milestone(
    milestone_id: int,
    m_in: MilestoneRelease,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    m = db.query(Milestone).options(joinedload(Milestone.invoices)).filter(Milestone.id == milestone_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")
    if m.status == "released":
        raise HTTPException(status_code=400, detail="Milestone already released.")
    m.status = "released"
    m.released_at = datetime.now(timezone.utc)
    m.release_notes = m_in.release_notes
    db.commit()
    db.refresh(m)
    return m

