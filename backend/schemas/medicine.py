from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid


class MedicineUpdate(BaseModel):
    name: Optional[str] = None
    in_stock: Optional[bool] = None


class MedicineOut(BaseModel):
    id: uuid.UUID
    facility_id: uuid.UUID
    name: str
    in_stock: bool
    last_updated: Optional[datetime] = None

    model_config = {"from_attributes": True}
