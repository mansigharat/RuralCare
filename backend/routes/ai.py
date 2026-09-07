from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from typing import Optional, List
from sqlalchemy.orm import Session

from database.connection import get_db
from schemas.facility import FacilityListOut
from services.ai_service import process_query
from services.facility_service import get_facilities

router = APIRouter(prefix="/ai", tags=["AI"])


# ── Request / Response schemas ──────────────────────────────────────────────

class AIQueryRequest(BaseModel):
    # Primary field per specification
    message: Optional[str] = Field(None, description="User's plain-language query")
    # Optional backward-compatibility field for existing frontend callers
    query: Optional[str] = Field(None, description="Fallback query string")


class AIQueryResponse(BaseModel):
    language: str
    intent: str
    healthcare_need: Optional[str] = None
    diagnosis_request: bool = False
    search_query: Optional[str] = None
    response: Optional[str] = None
    facilities: Optional[List[FacilityListOut]] = None


# ── Endpoint ─────────────────────────────────────────────────────────────────

@router.post("/query", response_model=AIQueryResponse)
def ai_query(body: AIQueryRequest, db: Session = Depends(get_db)):
    """
    Healthcare Navigation Assistant endpoint.

    Understands a citizen's plain-language need (English/Hindi/Marathi)
    and converts it into a structured facility search.
    It NEVER diagnoses medical conditions or prescribes treatments.

    Connects directly to the existing facility search logic in
    services.facility_service.get_facilities — reusing existing code.
    """
    user_text = body.message if body.message is not None else body.query

    # Process through the AI service layer (Gemini + Safety Pre-checks)
    result = process_query(user_text)

    # Connect structured output to existing /facilities search logic
    facilities = None
    if result.get("intent") == "facility_search":
        search_term = result.get("search_query") or result.get("healthcare_need")
        if search_term and search_term != "general":
            try:
                facilities = get_facilities(db, service_type=search_term)
            except Exception:
                # Database error should not crash the AI navigation response
                facilities = None

    return AIQueryResponse(
        language=result.get("language", "en"),
        intent=result.get("intent", "facility_search"),
        healthcare_need=result.get("healthcare_need"),
        diagnosis_request=result.get("diagnosis_request", False),
        search_query=result.get("search_query"),
        response=result.get("response"),
        facilities=facilities,
    )
