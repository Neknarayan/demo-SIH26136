from sqlalchemy import Integer, String, Text, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    startup_id: Mapped[int] = mapped_column(Integer, ForeignKey("startups.id", ondelete="CASCADE"), nullable=False)
    challenge_id: Mapped[int] = mapped_column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), nullable=False)
    proposal_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="submitted", nullable=False)  # submitted, under_review, shortlisted, rejected
    file_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    __table_args__ = (
        UniqueConstraint("startup_id", "challenge_id", name="uq_application_startup_challenge"),
    )

    # Relationships
    startup = relationship("Startup", back_populates="applications")
    challenge = relationship("Challenge", back_populates="applications")
    evaluation = relationship("Evaluation", back_populates="application", uselist=False, cascade="all, delete-orphan")
    pilot = relationship("Pilot", back_populates="application", uselist=False, cascade="all, delete-orphan")
