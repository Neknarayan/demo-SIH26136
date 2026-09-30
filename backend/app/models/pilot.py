from decimal import Decimal
from sqlalchemy import Integer, String, Text, Date, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Pilot(Base):
    __tablename__ = "pilots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    application_id: Mapped[int] = mapped_column(Integer, ForeignKey("applications.id", ondelete="CASCADE"), unique=True, nullable=False)
    scope: Mapped[str] = mapped_column(Text, nullable=False)
    timeline_start: Mapped[Date] = mapped_column(Date, nullable=False)
    timeline_end: Mapped[Date] = mapped_column(Date, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="planned", nullable=False)  # planned, active, completed, extended, discontinued

    __table_args__ = (
        CheckConstraint("timeline_end >= timeline_start", name="chk_pilot_timeline"),
    )

    # Relationships
    application = relationship("Application", back_populates="pilot")
    kpis = relationship("KPI", back_populates="pilot", cascade="all, delete-orphan")
    evidence_records = relationship("Evidence", back_populates="pilot", cascade="all, delete-orphan")
    decision = relationship("Decision", back_populates="pilot", uselist=False, cascade="all, delete-orphan")
    total_budget: Mapped[Decimal | None] = mapped_column(Numeric(15, 2), nullable=True)
    milestones = relationship("Milestone", back_populates="pilot", cascade="all, delete-orphan")
