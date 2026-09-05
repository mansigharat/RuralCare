from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from database.connection import get_db
from models.medicine import Medicine
from models.user import User
from schemas.medicine import MedicineUpdate, MedicineOut
from services.auth_service import require_staff_or_admin

router = APIRouter(prefix="/medicines", tags=["Medicines"])


@router.put("/{medicine_id}", response_model=MedicineOut)
def update_medicine(
    medicine_id: uuid.UUID,
    body: MedicineUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    """Staff/Admin only. Update medicine stock status."""
    medicine = db.query(Medicine).filter(Medicine.id == medicine_id).first()
    if not medicine:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Medicine not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(medicine, field, value)

    db.commit()
    db.refresh(medicine)
    return medicine
