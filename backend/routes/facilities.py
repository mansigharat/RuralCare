from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from database.connection import get_db
from models.facility import Facility
from models.user import User
from schemas.facility import FacilityCreate, FacilityUpdate, FacilityListOut, FacilityDetailOut
from services.auth_service import require_staff_or_admin
from services.facility_service import get_facilities, get_facility_detail

router = APIRouter(prefix="/facilities", tags=["Facilities"])


@router.get("", response_model=List[FacilityListOut])
def list_facilities(
    district: Optional[str] = Query(None),
    village: Optional[str] = Query(None),
    service_type: Optional[str] = Query(None),
    lat: Optional[float] = Query(None),
    lng: Optional[float] = Query(None),
    db: Session = Depends(get_db),
):
    """Public. List facilities with optional filters and Haversine distance sorting."""
    return get_facilities(db, district=district, village=village, service_type=service_type, lat=lat, lng=lng)


@router.get("/{facility_id}", response_model=FacilityDetailOut)
def get_facility(facility_id: uuid.UUID, db: Session = Depends(get_db)):
    """Public. Full detail including doctors, medicines, services."""
    detail = get_facility_detail(db, str(facility_id))
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")
    return detail


@router.post("", response_model=FacilityDetailOut, status_code=status.HTTP_201_CREATED)
def create_facility(
    body: FacilityCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    """Staff/Admin only. Create a new healthcare facility."""
    facility = Facility(**body.model_dump())
    db.add(facility)
    db.commit()
    db.refresh(facility)
    detail = get_facility_detail(db, str(facility.id))
    return detail


@router.put("/{facility_id}", response_model=FacilityDetailOut)
def update_facility(
    facility_id: uuid.UUID,
    body: FacilityUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    """Staff/Admin only. Update facility fields."""
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Facility not found")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(facility, field, value)

    db.commit()
    db.refresh(facility)
    return get_facility_detail(db, str(facility.id))
