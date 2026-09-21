from fastapi import HTTPException, status
from app.models.challenge import Challenge
from app.models.user import User

def transition_challenge(challenge: Challenge, target_status: str, user: User) -> None:
    current = challenge.status
    
    if current == target_status:
        return
        
    if user.role not in ("officer", "admin"):
        raise HTTPException(status_code=403, detail="Only officers can change challenge status.")
        
    if current == "draft" and target_status == "published":
        # Guard: publishing needs all fields complete and future deadline
        if not challenge.deadline:
            raise HTTPException(status_code=409, detail="Cannot publish: challenge requires a deadline.")
        from datetime import datetime, timezone
        if challenge.deadline < datetime.now(timezone.utc):
            raise HTTPException(status_code=409, detail="Cannot publish: deadline must be in the future.")
        challenge.status = "published"
        return
        
    if current == "published" and target_status == "closed":
        challenge.status = "closed"
        return
        
    raise HTTPException(status_code=409, detail=f"Illegal challenge transition from {current} to {target_status}.")
