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
    # 1. Duplicate email guard
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists. Please log in instead.",
        )

    db_role = _ROLE_MAP[payload.role]

    # 2. Validate role-specific required fields
    if db_role == "startup" and not payload.startup_profile:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="startup_profile (sector, dpiit_status, profile_text) is required for startup registration.",
        )

    # 3. Create user
    user = User(
        name=payload.name,
        email=payload.email,
        role=db_role,
        hashed_password=hash_password(payload.password),
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
@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticate with email + password.
    Returns JWT access token.
    Works for ALL roles (officer, startup, evaluator) including
    seeded demo users whose passwords were set via set_demo_passwords.
    """
    user = db.query(User).filter(User.email == payload.email).first()

    # Generic error — never reveal whether email exists
    _INVALID = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
    )

    if not user:
        raise _INVALID

    if not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This account is pending, disabled, or unavailable for login.",
        )

    if not verify_password(payload.password, user.hashed_password):
        raise _INVALID

    token = create_access_token({"sub": str(user.id)})

    # Attach startup profile to response if role == startup
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
