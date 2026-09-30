from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field

class InvoiceResponse(BaseModel):
    id: int
    milestone_id: int
    startup_id: int
    amount: Decimal
    description: str
    file_url: Optional[str] = None
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None
    review_notes: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class MilestoneCreate(BaseModel):
    name: str = Field(..., min_length=2)
    description: str = Field(..., min_length=5)
    percentage_of_budget: Decimal = Field(..., gt=0, le=100)
    due_date: date

class MilestoneRelease(BaseModel):
    release_notes: Optional[str] = None

class MilestoneResponse(BaseModel):
    id: int
    pilot_id: int
    name: str
    description: str
    percentage_of_budget: Decimal
    due_date: date
    status: str
    released_at: Optional[datetime] = None
    release_notes: Optional[str] = None
    invoices: list[InvoiceResponse] = []
    model_config = ConfigDict(from_attributes=True)

