from pydantic import BaseModel, ConfigDict
from typing import Optional

class StartupBase(BaseModel):
    name: str
    sector: str
    dpiit_status: bool = False
    profile_text: str
    msme_reg_no: Optional[str] = None
    women_led: bool = False
    make_in_india_class: Optional[str] = None  # 'class_1', 'class_2', or None

class StartupCreate(StartupBase):
    pass

class StartupResponse(StartupBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)
