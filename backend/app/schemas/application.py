from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.startup import StartupResponse
from app.schemas.evaluation import EvaluationResponse

class ApplicationBase(BaseModel):
    challenge_id: int
    proposal_text: str = Field(..., min_length=10)

class ApplicationCreate(ApplicationBase):
    file_url: str | None = None

class ApplicationStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(submitted|under_review|shortlisted|rejected)$")

class ApplicationResponse(BaseModel):
    id: int
    startup_id: int
    challenge_id: int
    proposal_text: str
    status: str
    file_url: str | None = None
    reference_id: str = ''
    created_at: datetime | None = None
    startup: StartupResponse | None = None
    evaluation: EvaluationResponse | None = None

    @model_validator(mode='after')
    def compute_reference_id(self):
        year = self.created_at.year if self.created_at else 2026
        self.reference_id = f'APP-{year}-{self.id:05d}'
        return self

    model_config = ConfigDict(from_attributes=True)
