from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse
from app.auth import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=list[UserResponse])
def get_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """List all users - admin only for security."""
    return db.query(User).order_by(User.id.asc()).all()

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    """Get user by ID - admin only for security."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user
