from datetime import datetime
from decimal import Decimal
from sqlalchemy import Integer, String, Text, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Invoice(Base):
    __tablename__ = "invoices"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    milestone_id: Mapped[int] = mapped_column(Integer, ForeignKey("milestones.id", ondelete="CASCADE"), nullable=False)
    startup_id: Mapped[int] = mapped_column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(15, 2), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, approved, rejected
    submitted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    review_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    milestone = relationship("Milestone", back_populates="invoices")
    startup = relationship("Startup")

