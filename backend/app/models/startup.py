from sqlalchemy import Integer, String, Boolean, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Startup(Base):
    __tablename__ = "startups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    startup_name: Mapped[str] = mapped_column(String(255), nullable=True)  # Optional for existing records
    sector: Mapped[str] = mapped_column(String(100), nullable=False)
    dpiit_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    profile_text: Mapped[str] = mapped_column(Text, nullable=False)

    # Relationships
    user = relationship("User", back_populates="startup")
    applications = relationship("Application", back_populates="startup")
