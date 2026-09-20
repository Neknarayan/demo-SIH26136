from datetime import datetime
from sqlalchemy import Integer, String, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    officer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    outcomes: Mapped[str] = mapped_column(Text, nullable=False)
    constraints: Mapped[str] = mapped_column(Text, nullable=False)
    budget_band: Mapped[str] = mapped_column(String(100), nullable=False)
    required_sector: Mapped[str] = mapped_column(String(100), nullable=False)
    dpiit_required: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="draft", nullable=False)  # draft, published, closed
    department_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("departments.id"), nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    department = relationship("Department", back_populates="challenges")
    officer = relationship("User", back_populates="challenges")
    applications = relationship("Application", back_populates="challenge", cascade="all, delete-orphan")
