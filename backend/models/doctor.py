import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from database.connection import Base


class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    facility_id = Column(UUID(as_uuid=True), ForeignKey("facilities.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    available_days = Column(String, nullable=True)   # e.g., "Mon, Wed, Fri"
    available_hours = Column(String, nullable=True)  # e.g., "9:00 AM - 1:00 PM"
