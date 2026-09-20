"""
Authentication endpoints:
  POST /api/auth/register  — create user + role profile in one transaction
  POST /api/auth/login     — email/password → JWT
  GET  /api/auth/me        — JWT-protected own profile
  GET  /api/auth/me/startup — JWT-protected own startup profile
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth import (
    create_access_token,
    get_current_user_jwt,
    hash_password,
    verify_password,
)
from app.database import get_db
from app.models.startup import Startup
from app.models.user import User
from app.schemas.startup import StartupResponse
from app.schemas.user import TokenResponse, UserLogin, UserRegister, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ── Role mapping: frontend → DB ───────────────────────────────────────────────
_ROLE_MAP = {
    "startup": "startup",
    "gov_officer": "officer",
    "evaluator": "evaluator",
}


# ── POST /api/auth/register ───────────────────────────────────────────────────
@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Register a new user.

    - startup    → also requires startup_profile (sector, dpiit_status, profile_text)
                   Automatically creates a linked Startup row.
    - gov_officer / evaluator → optionally accepts officer_profile / evaluator_profile
                   (stored as user.name / role; extended fields stored as metadata).
    """
    # 1. Prevent non-startup registration
    if payload.role not in ("startup",):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Public registration is only available for startups. Officers and evaluators must be invited by an admin."
        )
    db_role = "startup"

    # 2. Duplicate email guard (Generic message per Prompt 2)
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration failed. If you already have an account, please log in.",
        )

    # 3. Validate role-specific required fields
    if not payload.startup_profile:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="startup_profile (sector, dpiit_status, profile_text) is required for startup registration.",
        )

    # 3. Create user
    from datetime import datetime, timezone
    user = User(
        name=payload.name,
        email=payload.email,
        role=db_role,
        hashed_password=hash_password(payload.password),
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()  # get user.id before committing

    # 4. Create startup profile row if role == startup
    startup_obj = None
    if db_role == "startup" and payload.startup_profile:
        sp = payload.startup_profile
        startup_obj = Startup(
            user_id=user.id,
            name=payload.name,          # startup entity name same as user name by default
            sector=sp.sector,
            dpiit_status=sp.dpiit_status,
            profile_text=sp.profile_text,
        )
        db.add(startup_obj)

    db.commit()
    db.refresh(user)
    if startup_obj:
        db.refresh(startup_obj)

    token = create_access_token({"sub": str(user.id)})
    resp = TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        startup=StartupResponse.model_validate(startup_obj).model_dump() if startup_obj else None,
    )
    return resp


# ── POST /api/auth/login ──────────────────────────────────────────────────────
from fastapi import Response
import secrets
import hashlib
from datetime import datetime, timezone, timedelta
from app.models.refresh_token import RefreshToken

@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate with email + password.
    Returns JWT access token.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    _INVALID = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )

    if not user or not user.hashed_password:
        raise _INVALID

    if user.status != "active":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is pending, disabled, or unavailable for login.",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise _INVALID

    # Access Token
    token = create_access_token({"sub": str(user.id)})
    
    # Refresh Token
    refresh_token_plain = secrets.token_urlsafe(32)
    refresh_token_hash = hashlib.sha256(refresh_token_plain.encode()).hexdigest()
    
    now = datetime.now(timezone.utc)
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=refresh_token_hash,
        expires_at=now + timedelta(days=7),
        created_at=now
    )
    db.add(new_rt)
    
    # Update last login
    user.last_login_at = now
    db.commit()

    # Set Cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token_plain,
        httponly=True,
        secure=True, 
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )

    startup_obj = None
    if user.role == "startup":
        startup_obj = db.query(Startup).filter(Startup.user_id == user.id).first()

    return TokenResponse(
        access_token=token,
        user=UserResponse.model_validate(user),
        startup=StartupResponse.model_validate(startup_obj).model_dump() if startup_obj else None,
    )


# ── GET /api/auth/me ──────────────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user_jwt)):
    """
    Return the JWT-authenticated user's own profile.
    The JWT sub claim encodes the user_id — no ID in the URL.
    Prevents IDOR: a user can never see another user's profile
    by manipulating a URL parameter.
    """
    return current_user


# ── GET /api/auth/me/startup ──────────────────────────────────────────────────
@router.get("/me/startup", response_model=StartupResponse)
def get_my_startup_profile(
    current_user: User = Depends(get_current_user_jwt),
    db: Session = Depends(get_db),
):
    """
    Return the JWT-authenticated startup's own Startup record.
    Only accessible if the authenticated user has role=startup.
    """
    if current_user.role != "startup":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only startup accounts have a startup profile.",
        )
    startup = db.query(Startup).filter(Startup.user_id == current_user.id).first()
    if not startup:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Startup profile not found. Please complete your profile.",
        )
    return startup

# ── POST /api/auth/refresh ────────────────────────────────────────────────────
from fastapi import Request, Response
from app.models.refresh_token import RefreshToken

@router.post("/refresh")
def refresh_token(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Refresh the access token using the HTTPOnly refresh_token cookie.
    Rotates the refresh token on success.
    """
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="No refresh token found.")
    
    import hashlib
    token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
    
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    
    if not rt or rt.revoked or rt.expires_at < now:
        if rt:
            rt.revoked = True
            db.commit()
        response.delete_cookie("refresh_token")
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")
    
    user = db.query(User).filter(User.id == rt.user_id).first()
    if not user or user.status != "active":
        raise HTTPException(status_code=401, detail="User account is inactive.")
    
    # Rotate refresh token
    rt.revoked = True
    
    import secrets
    from datetime import timedelta
    new_token = secrets.token_urlsafe(32)
    new_token_hash = hashlib.sha256(new_token.encode()).hexdigest()
    
    new_rt = RefreshToken(
        user_id=user.id,
        token_hash=new_token_hash,
        expires_at=now + timedelta(days=7),
        created_at=now
    )
    db.add(new_rt)
    db.commit()
    
    response.set_cookie(
        key="refresh_token",
        value=new_token,
        httponly=True,
        secure=True, 
        samesite="lax",
        max_age=7 * 24 * 60 * 60
    )
    
    new_access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": new_access_token, "token_type": "bearer"}


# ── POST /api/auth/logout ─────────────────────────────────────────────────────
@router.post("/logout")
def logout(request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Revoke the refresh token and clear the cookie.
    """
    refresh_token = request.cookies.get("refresh_token")
    if refresh_token:
        import hashlib
        token_hash = hashlib.sha256(refresh_token.encode()).hexdigest()
        rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if rt:
            rt.revoked = True
            db.commit()
            
    response.delete_cookie("refresh_token")
    return {"detail": "Successfully logged out."}
