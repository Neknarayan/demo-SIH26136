from datetime import date
from pydantic import BaseModel, ConfigDict, Field, model_validator
from app.schemas.kpi import KPIResponse
from app.schemas.decision import DecisionResponse

class PilotBase(BaseModel):
    scope: str = Field(..., min_length=5)
    timeline_start: date
    timeline_end: date

    @model_validator(mode="after")
    def validate_dates(self):
        if self.timeline_end < self.timeline_start:
            raise ValueError("timeline_end must be greater than or equal to timeline_start")
        return self

class PilotCreate(PilotBase):
    application_id: int

from typing import Any
class PilotResponse(PilotBase):
    id: int
    application_id: int
    status: str
    kpis: list[KPIResponse] = []
    decision: DecisionResponse | None = None
    application: dict | None = None

    @model_validator(mode="before")
    def populate_application_dict(cls, values):
        if hasattr(values, "application") and values.application:
            app_obj = values.application
            startup_obj = app_obj.startup
            challenge_obj = app_obj.challenge
            app_dict = {
                "id": app_obj.id,
                "startup": {"name": startup_obj.name, "dpiit_status": startup_obj.dpiit_status} if startup_obj else {},
                "challenge": {"title": challenge_obj.title} if challenge_obj else {}
            }
            if isinstance(values, dict):
                values["application"] = app_dict
            else:
                values.application = app_dict
        return values

    model_config = ConfigDict(from_attributes=True)
