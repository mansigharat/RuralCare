from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from models.facility import FacilityStatus


class ServiceOut(BaseModel):
    id: uuid.UUID
    name: str

    model_config = {"from_attributes": True}


class DoctorOut(BaseModel):
    id: uuid.UUID
    name: str
    specialization: str
    available_days: Optional[str] = None
    available_hours: Optional[str] = None

    model_config = {"from_attributes": True}


class MedicineOut(BaseModel):
    id: uuid.UUID
    name: str
    in_stock: bool
    last_updated: Optional[datetime] = None

    model_config = {"from_attributes": True}


class FacilityCreate(BaseModel):
    name: str
    type: str
    address: str
    village: str
    district: str
    state: str = "Maharashtra"
    latitude: float
    longitude: float
    phone: Optional[str] = None
    status: FacilityStatus = FacilityStatus.fresh


class FacilityUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    address: Optional[str] = None
    village: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    status: Optional[FacilityStatus] = None


class FacilityListOut(BaseModel):
    id: uuid.UUID
    name: str
    type: str
    village: str
    district: str
    state: str
    latitude: float
    longitude: float
    phone: Optional[str] = None
    status: FacilityStatus
    distance_km: Optional[float] = None

    model_config = {"from_attributes": True}


class FacilityDetailOut(FacilityListOut):
    address: str
    last_verified: Optional[datetime] = None
    created_at: datetime
    services: List[ServiceOut] = []
    doctors: List[DoctorOut] = []
    medicines: List[MedicineOut] = []

    model_config = {"from_attributes": True}
