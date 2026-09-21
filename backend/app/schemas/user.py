from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Literal, Optional

# ── Existing response schema ──────────────────────────────────────────────────
class UserBase(BaseModel):
    name: str
    role: str
    email: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ── Auth-specific schemas ─────────────────────────────────────────────────────

class StartupProfile(BaseModel):
    """Extra fields collected during startup registration."""
    startup_name: str
    sector: str
    dpiit_status: bool = False
    profile_text: str

class OfficerProfile(BaseModel):
    """Extra fields for government officer registration."""
    department: Optional[str] = None
    designation: Optional[str] = None

class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["startup", "gov_officer"]

    # Role-specific sub-profiles (each optional at schema level;
    # validated programmatically per role in the endpoint)
    startup_profile: Optional[StartupProfile] = None
    officer_profile: Optional[OfficerProfile] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
    # Forward-declared; filled on startup registration
    startup: Optional[dict] = None
