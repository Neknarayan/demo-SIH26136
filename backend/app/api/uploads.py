import os
import shutil
import uuid
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from app.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/uploads", tags=["Uploads"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_SIZE = 5 * 1024 * 1024
ALLOWED_TYPES = {"application/pdf", "image/png", "image/jpeg"}

@router.post("")
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """
    Secure file upload.
    Only allows PDF, PNG, JPG. Max size 5MB.
    Returns the file URL/path.
    """
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="File type not allowed. Only PDF, PNG, and JPG are allowed."
        )

    file.file.seek(0, 2)
    file_size = file.file.tell()
    if file_size > MAX_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 5MB limit."
        )
    file.file.seek(0)
    
    ext = os.path.splitext(file.filename)[1].lower() if file.filename else ""
    if ext not in [".pdf", ".png", ".jpg", ".jpeg"]:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Invalid file extension."
        )
        
    safe_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, safe_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return a relative URL that the frontend can use or the DB can store
    return {"file_url": f"/static/uploads/{safe_filename}", "filename": file.filename}
