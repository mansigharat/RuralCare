import uuid
from sqlalchemy import Column, String, Float, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum

from database.connection import Base


class FacilityStatus(str, enum.Enum):
    fresh = "Fresh"
    needs_verification = "Needs Verification"
    outdated = "Outdated"


class Facility(Base):
    __tablename__ = "facilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # PHC / CHC / Hospital / Dispensary
    address = Column(String, nullable=False)
    village = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False, default="Maharashtra")
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    phone = Column(String, nullable=True)
    status = Column(Enum(FacilityStatus), nullable=False, default=FacilityStatus.fresh)
    last_verified = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
