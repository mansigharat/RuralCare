from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import uuid
from models.report import ReportStatus


class ReportCreate(BaseModel):
    facility_id: uuid.UUID
    issue: str


class ReportUpdate(BaseModel):
    status: ReportStatus
    admin_note: Optional[str] = None


class ReportOut(BaseModel):
    id: uuid.UUID
    facility_id: uuid.UUID
    reported_by: Optional[uuid.UUID] = None
    issue: str
    status: ReportStatus
    admin_note: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}
