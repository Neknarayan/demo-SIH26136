from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

class InvoiceCreate(BaseModel):
    amount: Decimal = Field(..., gt=0)
    description: str = Field(..., min_length=5)
    file_url: Optional[str] = None

class InvoiceReview(BaseModel):
    status: str = Field(..., pattern="^(approved|rejected)$")
    review_notes: Optional[str] = None


