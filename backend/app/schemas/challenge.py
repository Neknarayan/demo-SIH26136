from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class ChallengeBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    outcomes: str = Field(..., min_length=5)
    constraints: str = Field(..., min_length=5)
    budget_band: str = Field(..., max_length=100)
    required_sector: str = Field(..., max_length=100)
    dpiit_required: bool = False
    status: str = Field("draft", pattern="^(draft|published|closed)$")

class ChallengeCreate(ChallengeBase):
    pass

class ChallengeResponse(ChallengeBase):
    id: int
    officer_id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
