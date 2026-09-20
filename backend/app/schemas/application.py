from pydantic import BaseModel, ConfigDict, Field
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
    startup: StartupResponse | None = None
    evaluation: EvaluationResponse | None = None

    model_config = ConfigDict(from_attributes=True)
