from fastapi import HTTPException, status
from app.models.application import Application
from app.models.user import User

def transition_application(application: Application, target_status: str, user: User) -> None:
    current = application.status
    if current == target_status:
        return
        
    allowed_roles = []
    
    # Define state machine
    # current -> (target, allowed_roles)
    # submitted -> under_review (evaluator)
    # under_review -> rejected (officer) | accepted (officer)
    
    if current == "submitted" and target_status == "under_review":
        if user.role not in ("evaluator", "admin"):
            raise HTTPException(status_code=403, detail="Only evaluators can begin reviewing.")
        application.status = target_status
        return
        
    if current == "under_review" and target_status in ("rejected", "accepted"):
        if user.role not in ("officer", "admin"):
            raise HTTPException(status_code=403, detail="Only officers can make final decisions.")
        application.status = target_status
        return
        
    raise HTTPException(status_code=409, detail=f"Illegal application transition from {current} to {target_status}.")
