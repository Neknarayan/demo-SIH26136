from datetime import date, datetime
from decimal import Decimal
from sqlalchemy import Integer, String, Text, Date, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Milestone(Base):
    __tablename__ = "milestones"
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    pilot_id: Mapped[int] = mapped_column(Integer, ForeignKey("pilots.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    percentage_of_budget: Mapped[Decimal] = mapped_column(Numeric(5, 2), nullable=False)
    due_date: Mapped[date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(20), default="pending", nullable=False)  # pending, released
    released_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    release_notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    pilot = relationship("Pilot", back_populates="milestones")
    invoices = relationship("Invoice", back_populates="milestone", cascade="all, delete-orphan")

