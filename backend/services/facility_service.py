import math
from typing import Optional, List
from sqlalchemy.orm import Session

from models.facility import Facility
from models.service import Service
from models.doctor import Doctor
from models.medicine import Medicine


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Return great-circle distance in kilometres between two geo-points."""
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def get_facilities(
    db: Session,
    district: Optional[str] = None,
    village: Optional[str] = None,
    service_type: Optional[str] = None,
    lat: Optional[float] = None,
    lng: Optional[float] = None,
) -> List[dict]:
    query = db.query(Facility)

    if district:
        query = query.filter(Facility.district.ilike(f"%{district}%"))
    if village:
        query = query.filter(Facility.village.ilike(f"%{village}%"))

    facilities = query.all()

    # Filter by service_type if provided (requires a join)
    if service_type:
        service_facility_ids = {
            row.facility_id
            for row in db.query(Service).filter(Service.name.ilike(f"%{service_type}%")).all()
        }
        facilities = [f for f in facilities if f.id in service_facility_ids]

    result = []
    for facility in facilities:
        data = {
            "id": facility.id,
            "name": facility.name,
            "type": facility.type,
            "village": facility.village,
            "district": facility.district,
            "state": facility.state,
            "latitude": facility.latitude,
            "longitude": facility.longitude,
            "phone": facility.phone,
            "status": facility.status,
            "distance_km": None,
        }
        if lat is not None and lng is not None:
            data["distance_km"] = round(haversine_km(lat, lng, facility.latitude, facility.longitude), 2)
        result.append(data)

    if lat is not None and lng is not None:
        result.sort(key=lambda x: x["distance_km"])

    return result


def get_facility_detail(db: Session, facility_id: str) -> Optional[dict]:
    facility = db.query(Facility).filter(Facility.id == facility_id).first()
    if not facility:
        return None

    services = db.query(Service).filter(Service.facility_id == facility_id).all()
    doctors = db.query(Doctor).filter(Doctor.facility_id == facility_id).all()
    medicines = db.query(Medicine).filter(Medicine.facility_id == facility_id).all()

    return {
        "id": facility.id,
        "name": facility.name,
        "type": facility.type,
        "address": facility.address,
        "village": facility.village,
        "district": facility.district,
        "state": facility.state,
        "latitude": facility.latitude,
        "longitude": facility.longitude,
        "phone": facility.phone,
        "status": facility.status,
        "last_verified": facility.last_verified,
        "created_at": facility.created_at,
        "distance_km": None,
        "services": [{"id": s.id, "name": s.name} for s in services],
        "doctors": [
            {
                "id": d.id,
                "name": d.name,
                "specialization": d.specialization,
                "available_days": d.available_days,
                "available_hours": d.available_hours,
            }
            for d in doctors
        ],
        "medicines": [
            {
                "id": m.id,
                "name": m.name,
                "in_stock": m.in_stock,
                "last_updated": m.last_updated,
            }
            for m in medicines
        ],
    }
