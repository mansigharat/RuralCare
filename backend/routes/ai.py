from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/ai", tags=["AI"])


class AIQuery(BaseModel):
    query: str
    language: str = "en"


class AIResponse(BaseModel):
    extracted_need: str
    language: str
    ready_for_search: bool


@router.post("/query", response_model=AIResponse)
def ai_query(body: AIQuery):
    """
    AI proxy endpoint — stub for Gemini integration.
    Member 4 can replace the body with actual Gemini API calls
    without changing the route contract.
    """
    # TODO: integrate Gemini API here
    return AIResponse(
        extracted_need="",
        language=body.language,
        ready_for_search=True,
    )
