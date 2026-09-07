"""
Gemini AI Navigation Assistant service for RuralCare.

This module wraps the official google-genai SDK to:
  1. Detect diagnosis requests (safety pre-check) and refuse them.
  2. Send a structured prompt to Gemini that classifies the user's intent
     and extracts a healthcare_need + search_query.
  3. Return a normalised dict that the route layer can serialise.

It NEVER diagnoses, prescribes, or suggests medication.
"""

import os
import re
import json
import logging
from typing import Optional, Literal
from pathlib import Path
from dotenv import load_dotenv

# Ensure backend/.env is loaded regardless of the current working directory
_ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(dotenv_path=_ENV_PATH)
load_dotenv()  # also load from CWD if present

from google import genai
from google.genai import types as genai_types
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ── Controlled healthcare_need vocabulary ──────────────────────────────────
# Must NOT let Gemini invent categories outside this list
VALID_HEALTHCARE_NEEDS = {
    "pregnancy_care",
    "general_checkup",
    "childcare",
    "emergency_care",
    "fever",
    "vaccination",
    "maternal_health",
    "dental_care",
    "eye_care",
    "elderly_care",
    "medicine",
    "laboratory_test",
    "general_hospital",
    "general",
}

HealthcareNeed = Literal[
    "pregnancy_care",
    "general_checkup",
    "childcare",
    "emergency_care",
    "fever",
    "vaccination",
    "maternal_health",
    "dental_care",
    "eye_care",
    "elderly_care",
    "medicine",
    "laboratory_test",
    "general_hospital",
    "general",
]

LanguageCode = Literal["en", "hi", "mr"]
IntentType = Literal["facility_search", "medical_diagnosis"]


class GeminiStructuredOutput(BaseModel):
    language: LanguageCode
    intent: IntentType
    healthcare_need: HealthcareNeed
    search_query: str


# ── Diagnosis-request detection (keyword & regex pre-check) ─────────────────
# Safety rule: If the message resembles a diagnosis request, immediately refuse.
# Catches English, Hindi, and Marathi patterns (both native script and romanized).
DIAGNOSIS_PATTERNS = [
    # English direct & indirect
    r"\bwhat\s+disease\b",
    r"\bdo\s+i\s+have\b",
    r"\bdiagnos(?:e|is)\b",
    r"\bwhat\s+medicine\b",
    r"\bwhat\s+medication\b",
    r"\bshould\s+i\s+take\b",
    r"\bwhat\s+illness\b",
    r"\bwhat\s+condition\b",
    r"\bhaving\s+cancer\b",
    r"\bdo\s+i\s+have\s+cancer\b",
    r"\bwhat\s+is\s+wrong\s+with\s+me\b",
    r"\btest\s+me\b",
    r"\bcheck\s+my\s+symptoms\b",
    r"\bwhat\s+should\s+i\s+do\s+for\b",
    r"\bam\s+i\s+going\s+to\s+die\b",
    r"\bwhat\s+is\s+causing\s+my\b",
    r"\bwhy\s+do\s+i\s+have\b",
    r"\bprescribe\b",
    r"\bmedication\b.*\bshould\b",
    r"\bi\s+think\s+i\s+(?:might\s+)?have\b",
    r"\bis\s+this\s+serious\b",
    r"\bdo\s+i\s+need\s+medicine\b",
    r"\bwhich\s+tablet\b",
    r"\bwhich\s+syrup\b",
    # Hindi / Hinglish
    r"\bbimar[iy]\b",
    r"\bkya\s+bimari\b",
    r"\bkya\s+mujhe\s+cancer\b",
    r"\bkya\s+mujhe\s+tb\b",
    r"\bkaun\s+si\s+dawa\b",
    r"\bkaun\s+sa\s+ilaj\b",
    r"\bmujhe\s+lagta\s+hai\s+(?:mujhe\s+)?(?:tb|cancer)\b",
    r"बीमारी|बिमारी",
    r"क्या\s+बीमारी",
    r"क्या\s+मुझे",
    r"कौन\s+सी\s+दवा",
    r"इलाज\s+बताओ",
    r"मुझे\s+क्या\s+हुआ",
    # Marathi / Romanized Marathi
    r"\baaj[a]?r\b",
    r"\bkont[a-z]*\s+aaj[a]?r\b",
    r"\bmala\s+cancer\s+aahe\s+ka\b",
    r"\bkay\s+aushadh\b",
    r"आजार",
    r"कोणता\s+आजार",
    r"मला\s+कर्करोग\s+आहे\s+का",
    r"मला\s+कॅन्सर\s+आहे\s+का",
    r"मला\s+काय\s+झाले",
    r"काय\s+औषध",
]

_DIAGNOSIS_RE = re.compile("|".join(DIAGNOSIS_PATTERNS), re.IGNORECASE)

# ── Language detection heuristics ──────────────────────────────────────────
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
_MARATHI_DEVANAGARI_WORDS = {
    "आहे", "आहेत", "काय", "किंवा", "म्हणजे", "तुम्ही", "तुमचे", "आवश्यक", "हवे",
    "हवी", "होते", "नाही", "आणि", "कसे", "मला", "माझे", "आम्हाला", "करावे", "द्या"
}
_MARATHI_ROMAN_WORDS = {"mala", "aahe", "ahet", "aahet", "maza", "majha", "havi", "hawa", "pahije", "sathi", "aajar", "kuthe", "kashasathi", "dakhva"}
_HINDI_ROMAN_WORDS = {"mujhe", "mera", "meri", "chahiye", "hoga", "hogi", "hote", "kaise", "kya", "nahin", "dawa", "bimari", "liye", "kahan", "batao"}


def _detect_language(text: str) -> str:
    """Return 'en', 'hi', or 'mr' based on script and keyword heuristics."""
    if _DEVANAGARI_RE.search(text):
        words = set(re.findall(r"[\u0900-\u097F]+", text))
        if words & _MARATHI_DEVANAGARI_WORDS:
            return "mr"
        return "hi"
    
    # Roman script checks for transliterated Hindi/Marathi
    lower_tokens = set(re.findall(r"[a-z]+", text.lower()))
    if lower_tokens & _MARATHI_ROMAN_WORDS:
        return "mr"
    if lower_tokens & _HINDI_ROMAN_WORDS:
        return "hi"

    return "en"


# ── System instruction for Gemini ────────────────────────────────────────────
SYSTEM_INSTRUCTION = """
You are RuralCare's AI Navigation Assistant — a healthcare facility finder for rural India.

YOUR ROLE & LIMITS:
- You help citizens find the right government healthcare facility (PHC, CHC, Sub-Centre, Sub-District Hospital, District Hospital) based on their plain-language need.
- You support English, Hindi (hi), and Marathi (mr).
- You are NOT a doctor. You NEVER diagnose medical conditions, NEVER give disease names, NEVER prescribe medication, and NEVER suggest treatments.
- If the user asks for a diagnosis, medication, or asks what disease they have (e.g., "what disease do I have", "do I have cancer", "what medicine should I take", "I think I have TB"), you MUST set intent to "medical_diagnosis".
- When you are uncertain about the specific healthcare need, return "general" instead of guessing.

HEALTHCARE NEED VOCABULARY (You must choose ONLY from this list):
- pregnancy_care
- general_checkup
- childcare
- emergency_care
- fever
- vaccination
- maternal_health
- dental_care
- eye_care
- elderly_care
- medicine
- laboratory_test
- general_hospital
- general (fallback when unclear — never guess a specific need you're not confident about)

INSTRUCTIONS:
1. Read the user's message.
2. Determine the language: "en", "hi", or "mr".
3. Determine the intent: "facility_search" for facility queries, or "medical_diagnosis" if the user is asking for medical diagnosis/prescription/symptom diagnosis.
4. For facility_search, select the best matching healthcare_need from the vocabulary above.
5. Provide a short English search_query (2-5 words) suitable for finding facilities (e.g. "pregnancy care hospital", "fever clinic", "general hospital").
6. If intent is medical_diagnosis, set search_query to "general hospital" and healthcare_need to "general".
"""

# ── Generic error and safety responses ───────────────────────────────────────
GENERIC_ERROR_RESPONSE = {
    "language": "en",
    "intent": "error",
    "healthcare_need": None,
    "diagnosis_request": False,
    "search_query": None,
    "response": "The assistant is temporarily unavailable. Please try again later or use the facility search to find a healthcare facility near you.",
}

DIAGNOSIS_SAFETY_RESPONSE = (
    "I can help you find a healthcare facility, but I cannot diagnose medical conditions. "
    "Please consult a qualified healthcare professional."
)


def _is_diagnosis_request(message: str) -> bool:
    """Pre-check: does the message resemble a diagnosis request?"""
    return bool(_DIAGNOSIS_RE.search(message))


def _get_client():
    """Create a Gemini client, raising RuntimeError if the API key is missing."""
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=api_key)


def _call_gemini(message: str) -> dict:
    """Send the message to Gemini and return the structured JSON dict."""
    client = _get_client()
    model_name = os.environ.get("GEMINI_MODEL", "gemini-3.6-flash")

    response = client.models.generate_content(
        model=model_name,
        contents=[message],
        config=genai_types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema=GeminiStructuredOutput,
            temperature=0.1,
            max_output_tokens=512,
        ),
    )

    raw = response.text
    if not raw or not raw.strip():
        raise ValueError("Empty response from Gemini")

    # Clean markdown code fences if present
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1] if "```" in cleaned[3:] else cleaned[3:]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
    cleaned = cleaned.strip()

    data = json.loads(cleaned)

    # Post-validation against controlled vocabulary
    need = data.get("healthcare_need", "general")
    if need not in VALID_HEALTHCARE_NEEDS:
        need = "general"

    return {
        "language": data.get("language", "en"),
        "intent": data.get("intent", "facility_search"),
        "healthcare_need": need,
        "search_query": data.get("search_query") or "general hospital",
    }


def process_query(message: Optional[str]) -> dict:
    """
    Process a user message and return a structured response dict.

    Returns one of:
      - Diagnosis-safety response (diagnosis_request=True)
      - Normal facility_search response (diagnosis_request=False, healthcare_need, search_query)
      - Generic error response (on missing API key, API failure, network error, or empty message)
    """
    # ── Empty or whitespace message ──
    if not message or not message.strip():
        logger.warning("Empty message received")
        return GENERIC_ERROR_RESPONSE

    cleaned_msg = message.strip()

    # ── Diagnosis pre-check (defense-in-depth before API call) ──
    if _is_diagnosis_request(cleaned_msg):
        lang = _detect_language(cleaned_msg)
        logger.info("Diagnosis request detected by pre-check — returning safety response")
        return {
            "language": lang,
            "intent": "medical_diagnosis",
            "healthcare_need": None,
            "diagnosis_request": True,
            "search_query": None,
            "response": DIAGNOSIS_SAFETY_RESPONSE,
        }

    # ── Normal flow: call Gemini ──
    try:
        result = _call_gemini(cleaned_msg)
    except RuntimeError as e:
        # Missing API key — log server-side only, never expose to client
        logger.error("AI service configuration error: %s", e)
        return GENERIC_ERROR_RESPONSE
    except Exception as e:
        # API failure, network error, malformed response, etc. — log server-side only
        logger.error("Gemini API error: %s", e, exc_info=True)
        return GENERIC_ERROR_RESPONSE

    # If Gemini classified intent as medical diagnosis
    if result.get("intent") == "medical_diagnosis":
        return {
            "language": result.get("language", _detect_language(cleaned_msg)),
            "intent": "medical_diagnosis",
            "healthcare_need": None,
            "diagnosis_request": True,
            "search_query": None,
            "response": DIAGNOSIS_SAFETY_RESPONSE,
        }

    return {
        "language": result.get("language", "en"),
        "intent": result.get("intent", "facility_search"),
        "healthcare_need": result.get("healthcare_need", "general"),
        "diagnosis_request": False,
        "search_query": result.get("search_query"),
    }
