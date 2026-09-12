"""
app/auth.py — authentication helpers and FastAPI dependencies.

Provides:
  - bcrypt password hashing / verification
  - JWT creation / decoding
  - get_current_user_jwt   — pure JWT Bearer dependency (Task 3 IDOR-safe)
  - get_current_user       — smart dual-mode: JWT Bearer first, X-User-Id fallback
  - require_role           — role guard wrapping get_current_user
"""
from datetime import datetime, timedelta, timezone
from typing import Callable

from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models.user import User

# ── Password hashing ──────────────────────────────────────────────────────────
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(plain: str) -> str:
    return pwd_context.hash(plain)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ── JWT helpers ───────────────────────────────────────────────────────────────
def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is invalid or expired.",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

# ── Strict JWT dependency — for /api/auth/me and future high-security routes ──
_bearer_scheme = HTTPBearer(auto_error=False)

def get_current_user_jwt(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    """
    IDOR-safe: resolves user entirely from JWT sub claim.
    No user-controlled ID in the URL.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Bearer token required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    payload = decode_access_token(credentials.credentials)
    user_id: str | None = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        )
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found.",
        )
    return user


# ── Smart dual-mode dependency — used by existing dashboard routes ─────────────
# Priority: JWT Bearer > X-User-Id header (demo fallback)
# This allows the same dashboard endpoints to serve both:
#   - JWT-authenticated real users (new auth flow)
#   - demo persona selector (legacy header, still works in dev)
def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_scheme),
    x_user_id: int | None = Header(None, alias="X-User-Id"),
    db: Session = Depends(get_db),
) -> User:
    """
    Dual-mode auth dependency.
    1. If Authorization: Bearer <token> is present → validate JWT → return user.
       The user is resolved from the token's 'sub' claim, preventing IDOR.
    2. Else if X-User-Id header is present → use demo persona (dev/demo only).
    3. Else → 401.
    """
    # Mode 1: JWT Bearer
    if credentials:
        payload = decode_access_token(credentials.credentials)
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload.",
            )
        user = db.query(User).filter(User.id == int(user_id)).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found.",
            )
        return user

    # Mode 2: Legacy demo header
    if x_user_id is not None:
        user = db.query(User).filter(User.id == x_user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with ID {x_user_id} not found.",
            )
        return user

    # Mode 3: No credentials
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required: provide a Bearer token or X-User-Id header.",
        headers={"WWW-Authenticate": "Bearer"},
    )


# ── Role guard ────────────────────────────────────────────────────────────────
def require_role(*allowed_roles: str) -> Callable:
    """Dependency factory that enforces role-based access after authentication."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access forbidden: your role '{current_user.role}' is not "
                    f"authorized for this action. Required: {list(allowed_roles)}"
                ),
            )
        return current_user
    return role_checker
