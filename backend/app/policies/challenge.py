from fastapi import HTTPException, status
from app.models.user import User
from app.models.challenge import Challenge

def can_view_challenge(user: User, challenge: Challenge) -> bool:
    if user.role == "admin":
        return True
    if user.role == "officer":
        return user.department_id == challenge.department_id
    # Evaluators and startups can only view published challenges
    return challenge.status != "draft"

def can_edit_challenge(user: User, challenge: Challenge) -> bool:
    if user.role == "admin":
        return True
    if user.role == "officer":
        return user.department_id == challenge.department_id
    return False

def enforce_can_view(user: User, challenge: Challenge):
    if not can_view_challenge(user, challenge):
        # Return 404 to prevent enumeration of draft/other department objects
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found.")

def enforce_can_edit(user: User, challenge: Challenge):
    if not can_edit_challenge(user, challenge):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You do not have permission to edit this challenge.")
