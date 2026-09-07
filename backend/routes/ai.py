from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Any
from sqlalchemy.orm import Session

from database.connection import get_db
from services.ai_service import process_query
from services.facility_service import get_facilities

router = APIRouter(prefix="/ai", tags=["AI"])


# ── Request / Response schemas ──────────────────────────────────────────────

class AIQueryRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User's plain-language query")


class FacilityResult(BaseModel):
    id: Any
    name: str
    type: str
    village: str
    district: str
    state: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    phone: Optional[str] = None
    status: Optional[str] = None
    distance_km: Optional[float] = None


class AIQueryResponse(BaseModel):
    language: str
    intent: str
    healthcare_need: Optional[str] = None
    diagnosis_request: bool = False
    search_query: Optional[str] = None
    response: Optional[str] = None
    facilities: Optional[List[FacilityResult]] = None


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/query", response_model=AIQueryResponse)
def ai_query(body: AIQueryRequest, db: Session = Depends(get_db)):
    """
    AI Navigation Assistant endpoint.

    Accepts a plain-language message in English, Hindi, or Marathi and
    returns a structured facility-search intent.  If the message resembles
    a diagnosis request, a safety response is returned instead.

    The structured search_query is connected to the EXISTING /facilities
    search logic (services.facility_service.get_facilities) — no facility
    search code is duplicated.
    """
    # Process the message through the Gemini service
    result = process_query(body.message)

    # If we have a search_query, run it through the existing facility search
    facilities: Optional[List[dict]] = None
    if result.get("search_query") and result.get("intent") == "facility_search":
        try:
            facilities = get_facilities(
                db,
                service_type=result["search_query"],
            )
        except Exception:
            # Don't let facility search failures break the AI response
            facilities = None

    return AIQueryResponse(
        language=result["language"],
        intent=result["intent"],
        healthcare_need=result.get("healthcare_need"),
        diagnosis_request=result.get("diagnosis_request", False),
        search_query=result.get("search_query"),
        response=result.get("response"),
        facilities=facilities,
    )
