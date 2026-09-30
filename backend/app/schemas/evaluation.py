from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class EvaluationBase(BaseModel):
    application_id: int
    score: int = Field(..., ge=0, le=100)
    notes: str = Field(..., min_length=3)

class EvaluationCreate(EvaluationBase):
    pass

class EvaluationResponse(EvaluationBase):
    id: int
    evaluator_id: int
    created_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
