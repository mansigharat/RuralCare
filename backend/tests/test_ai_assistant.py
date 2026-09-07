"""
Automated tests for RuralCare AI Healthcare Navigation Assistant.
Verifies all safety rules, language detection, structured output, and error handling.
"""

import os
import unittest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

from main import app
from services import ai_service
from services.ai_service import (
    process_query,
    _is_diagnosis_request,
    _detect_language,
    DIAGNOSIS_SAFETY_RESPONSE,
    GENERIC_ERROR_RESPONSE,
    VALID_HEALTHCARE_NEEDS,
)


class TestAIAssistant(unittest.TestCase):

    def setUp(self):
        self.client = TestClient(app)

    # ── Diagnosis Safety Tests (Non-negotiable) ─────────────────────────────

    def test_diagnosis_what_disease(self):
        """'What disease do I have?' -> diagnosis_request: true, no diagnosis given"""
        res = process_query("What disease do I have?")
        self.assertTrue(res["diagnosis_request"])
        self.assertEqual(res["intent"], "medical_diagnosis")
        self.assertIsNone(res["healthcare_need"])
        self.assertIsNone(res["search_query"])
        self.assertEqual(res["response"], DIAGNOSIS_SAFETY_RESPONSE)

    def test_diagnosis_do_i_have_cancer(self):
        """'Do I have cancer?' -> diagnosis_request: true, no diagnosis given"""
        res = process_query("Do I have cancer?")
        self.assertTrue(res["diagnosis_request"])
        self.assertEqual(res["intent"], "medical_diagnosis")
        self.assertIsNone(res["healthcare_need"])
        self.assertIsNone(res["search_query"])
        self.assertEqual(res["response"], DIAGNOSIS_SAFETY_RESPONSE)

    def test_diagnosis_i_think_i_have_tb(self):
        """'I think I have TB' -> diagnosis_request: true, no diagnosis given"""
        res = process_query("I think I have TB")
        self.assertTrue(res["diagnosis_request"])
        self.assertEqual(res["intent"], "medical_diagnosis")
        self.assertIsNone(res["healthcare_need"])
        self.assertIsNone(res["search_query"])
        self.assertEqual(res["response"], DIAGNOSIS_SAFETY_RESPONSE)

    def test_diagnosis_hindi_and_marathi(self):
        """Hindi and Marathi diagnosis queries should trigger safety response"""
        queries = [
            ("मुझे क्या बीमारी है", "hi"),
            ("मला कोणता आजार आहे", "mr"),
            ("मला कर्करोग आहे का", "mr"),
            ("क्या मुझे कैंसर है", "hi"),
            ("which medicine should I take", "en"),
            ("is this serious?", "en"),
        ]
        for query, expected_lang in queries:
            res = process_query(query)
            self.assertTrue(res["diagnosis_request"], f"Failed for {query}")
            self.assertEqual(res["intent"], "medical_diagnosis")
            self.assertEqual(res["language"], expected_lang)
            self.assertEqual(res["response"], DIAGNOSIS_SAFETY_RESPONSE)

    # ── Language Detection Tests ─────────────────────────────────────────────

    def test_language_detection(self):
        self.assertEqual(_detect_language("I need a hospital"), "en")
        self.assertEqual(_detect_language("मुझे अस्पताल चाहिए"), "hi")
        self.assertEqual(_detect_language("Mujhe pregnancy checkup ke liye hospital chahiye"), "hi")
        self.assertEqual(_detect_language("मला गर्भधारणेच्या तपासणीसाठी हॉस्पिटल हवे आहे."), "mr")
        self.assertEqual(_detect_language("Mala hospital have ahe"), "mr")

    # ── Controlled Vocabulary Tests ──────────────────────────────────────────

    def test_controlled_vocabulary_integrity(self):
        expected_needs = {
            "pregnancy_care", "general_checkup", "childcare", "emergency_care",
            "fever", "vaccination", "maternal_health", "dental_care",
            "eye_care", "elderly_care", "medicine", "laboratory_test",
            "general_hospital", "general"
        }
        self.assertEqual(VALID_HEALTHCARE_NEEDS, expected_needs)

    # ── Gemini Mocked Navigation Tests ───────────────────────────────────────

    @patch("services.ai_service._call_gemini")
    def test_english_pregnancy_care(self, mock_gemini):
        """'I need a hospital for pregnancy checkup.' -> en, facility_search, pregnancy_care"""
        mock_gemini.return_value = {
            "language": "en",
            "intent": "facility_search",
            "healthcare_need": "pregnancy_care",
            "search_query": "pregnancy care hospital",
        }
        res = process_query("I need a hospital for pregnancy checkup.")
        self.assertEqual(res["language"], "en")
        self.assertEqual(res["intent"], "facility_search")
        self.assertEqual(res["healthcare_need"], "pregnancy_care")
        self.assertFalse(res["diagnosis_request"])
        self.assertEqual(res["search_query"], "pregnancy care hospital")

    @patch("services.ai_service._call_gemini")
    def test_hindi_pregnancy_care(self, mock_gemini):
        """'Mujhe pregnancy checkup ke liye hospital chahiye.' -> hi, pregnancy_care"""
        mock_gemini.return_value = {
            "language": "hi",
            "intent": "facility_search",
            "healthcare_need": "pregnancy_care",
            "search_query": "pregnancy care hospital",
        }
        res = process_query("Mujhe pregnancy checkup ke liye hospital chahiye.")
        self.assertEqual(res["language"], "hi")
        self.assertEqual(res["intent"], "facility_search")
        self.assertEqual(res["healthcare_need"], "pregnancy_care")
        self.assertFalse(res["diagnosis_request"])

    @patch("services.ai_service._call_gemini")
    def test_marathi_pregnancy_care(self, mock_gemini):
        """'मला गर्भधारणेच्या तपासणीसाठी हॉस्पिटल हवे आहे.' -> mr, pregnancy_care"""
        mock_gemini.return_value = {
            "language": "mr",
            "intent": "facility_search",
            "healthcare_need": "pregnancy_care",
            "search_query": "maternity hospital",
        }
        res = process_query("मला गर्भधारणेच्या तपासणीसाठी हॉस्पिटल हवे आहे.")
        self.assertEqual(res["language"], "mr")
        self.assertEqual(res["intent"], "facility_search")
        self.assertEqual(res["healthcare_need"], "pregnancy_care")
        self.assertFalse(res["diagnosis_request"])

    @patch("services.ai_service._call_gemini")
    def test_find_nearby_hospital(self, mock_gemini):
        """'Find me a nearby hospital.' -> facility_search, healthcare_need: general"""
        mock_gemini.return_value = {
            "language": "en",
            "intent": "facility_search",
            "healthcare_need": "general",
            "search_query": "general hospital",
        }
        res = process_query("Find me a nearby hospital.")
        self.assertEqual(res["language"], "en")
        self.assertEqual(res["intent"], "facility_search")
        self.assertEqual(res["healthcare_need"], "general")
        self.assertFalse(res["diagnosis_request"])

    # ── Error Handling Tests ─────────────────────────────────────────────────

    def test_empty_message(self):
        """Empty or whitespace message should return generic error response"""
        res1 = process_query("")
        self.assertEqual(res1["intent"], "error")
        self.assertEqual(res1["response"], GENERIC_ERROR_RESPONSE["response"])

        res2 = process_query("   ")
        self.assertEqual(res2["intent"], "error")

    @patch.dict(os.environ, {"GEMINI_API_KEY": ""}, clear=False)
    def test_missing_api_key_returns_generic_error(self):
        """Missing API key should return generic assistant unavailable error without crashing"""
        res = process_query("I need to visit an eye doctor")
        self.assertEqual(res["intent"], "error")
        self.assertEqual(res["response"], GENERIC_ERROR_RESPONSE["response"])

    # ── HTTP POST /ai/query Endpoint Tests ───────────────────────────────────

    def test_endpoint_diagnosis_safety(self):
        """POST /ai/query with diagnosis request returns safety payload"""
        response = self.client.post("/ai/query", json={"message": "What disease do I have?"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "medical_diagnosis")
        self.assertTrue(data["diagnosis_request"])
        self.assertIsNone(data["healthcare_need"])
        self.assertIsNone(data["search_query"])
        self.assertIn("cannot diagnose medical conditions", data["response"])

    def test_endpoint_empty_message(self):
        """POST /ai/query with empty message returns generic error, not HTTP 422"""
        response = self.client.post("/ai/query", json={"message": ""})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["intent"], "error")
        self.assertIn("assistant is temporarily unavailable", data["response"])

    @patch("services.ai_service._call_gemini")
    def test_endpoint_facility_search(self, mock_gemini):
        """POST /ai/query returns structured response for normal query"""
        mock_gemini.return_value = {
            "language": "en",
            "intent": "facility_search",
            "healthcare_need": "pregnancy_care",
            "search_query": "pregnancy care hospital",
        }
        response = self.client.post("/ai/query", json={"message": "I need a hospital for pregnancy checkup."})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["language"], "en")
        self.assertEqual(data["intent"], "facility_search")
        self.assertEqual(data["healthcare_need"], "pregnancy_care")
        self.assertFalse(data["diagnosis_request"])
        self.assertEqual(data["search_query"], "pregnancy care hospital")


if __name__ == "__main__":
    unittest.main()
