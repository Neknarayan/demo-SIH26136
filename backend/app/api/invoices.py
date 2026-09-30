from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.invoice import Invoice
from app.models.milestone import Milestone
from app.models.startup import Startup
from app.models.user import User
from app.schemas.invoice import InvoiceCreate, InvoiceReview
from app.schemas.milestone import InvoiceResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/milestones", tags=["Invoices"])

@router.post("/{milestone_id}/invoices", response_model=InvoiceResponse, status_code=status.HTTP_201_CREATED)
def submit_invoice(
    milestone_id: int,
    inv_in: InvoiceCreate,
    current_user: User = Depends(require_role("startup")),
    db: Session = Depends(get_db)
):
    m = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")
    startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
    if not startup:
        raise HTTPException(status_code=404, detail="Startup profile not found")
    inv = Invoice(
        milestone_id=milestone_id,
        startup_id=startup.id,
        amount=inv_in.amount,
        description=inv_in.description,
        file_url=inv_in.file_url,
        status="pending"
    )
    db.add(inv)
    db.commit()
    db.refresh(inv)
    return inv

@router.get("/{milestone_id}/invoices", response_model=list[InvoiceResponse])
def list_invoices(
    milestone_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    m = db.query(Milestone).filter(Milestone.id == milestone_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Milestone not found")
    return db.query(Invoice).filter(Invoice.milestone_id == milestone_id).order_by(Invoice.id).all()

@router.patch("/{milestone_id}/invoices/{invoice_id}/review", response_model=InvoiceResponse)
def review_invoice(
    milestone_id: int,
    invoice_id: int,
    review_in: InvoiceReview,
    current_user: User = Depends(require_role("officer")),
    db: Session = Depends(get_db)
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.milestone_id == milestone_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    if inv.status != "pending":
        raise HTTPException(status_code=400, detail="Invoice already reviewed.")
    inv.status = review_in.status
    inv.reviewed_at = datetime.now(timezone.utc)
    inv.review_notes = review_in.review_notes
    db.commit()
    db.refresh(inv)
    return inv

