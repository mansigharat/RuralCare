from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from database.connection import get_db
from models.doctor import Doctor
from models.user import User
from schemas.doctor import DoctorUpdate, DoctorOut
from services.auth_service import require_staff_or_admin

router = APIRouter(prefix="/doctors", tags=["Doctors"])


@router.put("/{doctor_id}", response_model=DoctorOut)
def update_doctor(
    doctor_id: uuid.UUID,
    body: DoctorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    """Staff/Admin only. Update doctor availability or specialization."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(doctor, field, value)

    db.commit()
    db.refresh(doctor)
    return doctor
