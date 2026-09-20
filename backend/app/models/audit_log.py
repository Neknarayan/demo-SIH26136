from datetime import datetime
from sqlalchemy import Integer, String, DateTime, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
from sqlalchemy.sql import func
from typing import Any

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True, autoincrement=True)
    actor_id: Mapped[int | None] = mapped_column(Integer, index=True, nullable=True)
    actor_role: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    entity_type: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    entity_id: Mapped[int] = mapped_column(Integer, index=True, nullable=False)
    
    # Store state before and after change
    before_state: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    after_state: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    
    # Additional metadata
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(Text, nullable=True)
    request_id: Mapped[str | None] = mapped_column(String(255), index=True, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
