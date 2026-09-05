from pydantic import BaseModel
from typing import Optional
import uuid


class DoctorUpdate(BaseModel):
    name: Optional[str] = None
    specialization: Optional[str] = None
    available_days: Optional[str] = None
    available_hours: Optional[str] = None


class DoctorOut(BaseModel):
    id: uuid.UUID
    facility_id: uuid.UUID
    name: str
    specialization: str
    available_days: Optional[str] = None
    available_hours: Optional[str] = None

    model_config = {"from_attributes": True}
