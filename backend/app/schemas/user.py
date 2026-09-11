from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Literal, Optional

# ── Existing response schema (extended with created_at) ──────────────────────
class UserBase(BaseModel):
    name: str
    role: str
    email: str

class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# ── Auth-specific schemas ─────────────────────────────────────────────────────
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["startup", "gov_officer"]

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
