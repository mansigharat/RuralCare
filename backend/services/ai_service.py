"""
Gemini AI Navigation Assistant service.

This module wraps the official google-genai SDK to:
  1. Detect diagnosis requests (safety pre-check) and refuse them.
  2. Send a structured prompt to Gemini that classifies the user's intent
     and extracts a healthcare_need + search_query.
  3. Return a normalised dict that the route layer can serialise.

It NEVER diagnoses, prescribes, or suggests medication.
"""

import os
import re
import logging
from typing import Optional

from google import genai
from google.genai import types as genai_types

logger = logging.getLogger(__name__)

# ── Controlled healthcare_need vocabulary ──────────────────────────────────
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

# ── Diagnosis-request detection (keyword-based, pre-Gemini) ──────────────────
DIAGNOSIS_PATTERNS = [
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
]

_DIAGOSIS_RE = re.compile("|".join(DIAGNOSIS_PATTERNS), re.IGNORECASE)

# ── Language detection (simple, pre-Gemini) ──────────────────────────────────
_DEVANAGARI_RE = re.compile(r"[\u0900-\u097F]")
# Hindi uses Devanagari; Marathi also uses Devanagari, so we rely on the
# message content + a simple heuristic.  For disambiguation we check for
# Marathi-specific words.
_MARATHI_WORDS = {"आहे", "आहेत", "काय", "किंवा", "म्हणजे", "तुम्ही", "तुमचे", "आवश्यक"}


def _detect_language(text: str) -> str:
    """Return 'en', 'hi', or 'mr' based on script + keyword heuristics."""
    if _DEVANAGARI_RE.search(text):
        # Both Hindi and Marathi use Devanagari; disambiguate by keywords
        words = set(re.findall(r"[\u0900-\u097F]+", text))
        if words & _MARATHI_WORDS:
            return "mr"
        return "hi"
    return "en"


# ── System instruction for Gemini ────────────────────────────────────────────
SYSTEM_INSTRUCTION = """
You are RuralCare's AI Navigation Assistant — a healthcare facility finder for rural India.

YOUR ROLE:
- You help citizens find the right government healthcare facility (PHC, CHC, hospital, etc.) based on their plain-language needs.
- You support English, Hindi (hi), and Marathi (mr).
- You are NOT a doctor. You NEVER diagnose medical conditions, NEVER prescribe medication, and NEVER suggest specific treatments.
- When you are uncertain about the healthcare need, return "general" instead of guessing a specific category.

HEALTHCARE NEED VOCABULARY (use ONLY these values):
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
2. Determine the language (en, hi, or mr).
3. Determine the intent: "facility_search" for normal queries, "medical_diagnosis" for diagnosis requests.
4. If the user is asking for a diagnosis, disease name, or medication suggestion, set intent to "medical_diagnosis".
5. For facility_search, classify the healthcare_need using ONLY the vocabulary above.
6. Generate a search_query — a short English phrase (2-5 words) that can be used to search the facility database (e.g., "pregnancy care hospital", "fever clinic", "general hospital").
7. Return ONLY valid JSON. Do not include any extra text, markdown, or explanations.

JSON format:
{
  "language": "en",
  "intent": "facility_search",
  "healthcare_need": "pregnancy_care",
  "search_query": "pregnancy care hospital"
}
"""

# ── Generic error response ───────────────────────────────────────────────────
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
    """Create a Gemini client, raising if the API key is missing."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise RuntimeError("GEMINI_API_KEY is not set")
    return genai.Client(api_key=api_key)


def _call_gemini(message: str) -> dict:
    """Send the message to Gemini and return the parsed JSON dict."""
    client = _get_client()

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[message],
        config=genai_types.GenerateContentConfig(
            system_instruction=SYSTEM_INSTRUCTION,
            response_mime_type="application/json",
            response_schema={
                "type": "object",
                "properties": {
                    "language": {"type": "string"},
                    "intent": {"type": "string"},
                    "healthcare_need": {"type": "string"},
                    "search_query": {"type": "string"},
                },
                "required": ["language", "intent", "healthcare_need", "search_query"],
            },
            temperature=0.1,
            max_output_tokens=512,
        ),
    )

    raw = response.text
    if not raw or not raw.strip():
        raise ValueError("Empty response from Gemini")

    # Parse JSON — the SDK with response_schema should return clean JSON,
    # but we strip any markdown fences just in case.
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1] if "```" in cleaned[3:] else cleaned[3:]
    cleaned = cleaned.strip()

    import json
    data = json.loads(cleaned)

    # Validate healthcare_need against controlled vocabulary
    need = data.get("healthcare_need", "general")
    if need not in VALID_HEALTHCARE_NEEDS:
        need = "general"

    return {
        "language": data.get("language", "en"),
        "intent": data.get("intent", "facility_search"),
        "healthcare_need": need,
        "search_query": data.get("search_query") or None,
    }


def process_query(message: str) -> dict:
    """
    Process a user message and return a structured response dict.

    Returns one of:
      - Diagnosis-safety response (diagnosis_request=True)
      - Normal facility_search response (with search_query)
      - Generic error response (on any failure)
    """
    # ── Empty message ──
    if not message or not message.strip():
        logger.warning("Empty message received")
        return GENERIC_ERROR_RESPONSE

    # ── Diagnosis pre-check ──
    if _is_diagnosis_request(message):
        lang = _detect_language(message)
        logger.info("Diagnosis request detected — returning safety response")
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
        result = _call_gemini(message)
    except RuntimeError as e:
        # Missing API key
        logger.error("AI service configuration error: %s", e)
        return GENERIC_ERROR_RESPONSE
    except Exception as e:
        # API failure, network error, malformed response, etc.
        logger.error("Gemini API error: %s", e, exc_info=True)
        return GENERIC_ERROR_RESPONSE

    return {
        "language": result["language"],
        "intent": result["intent"],
        "healthcare_need": result["healthcare_need"],
        "diagnosis_request": False,
        "search_query": result["search_query"],
    }
