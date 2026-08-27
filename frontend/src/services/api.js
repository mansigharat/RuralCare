/**
 * api.js — RuralCare API Service Layer
 * ──────────────────────────────────────────────────────────────
 * Currently returns mock data. To connect to the FastAPI backend:
 *  1. Set VITE_API_BASE_URL in your .env file (e.g. http://localhost:8000)
 *  2. Replace each mock function body with the corresponding fetch() call
 *  3. Keep the same function signatures so components don't need changes
 * ──────────────────────────────────────────────────────────────
 */

import mockFacilities from '../data/mockFacilities'

// ─── Config ─────────────────────────────────────────────────────
// Future: const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// Helper for future HTTP calls
// async function apiFetch(path, options = {}) {
//   const res = await fetch(`${BASE_URL}${path}`, {
//     headers: { 'Content-Type': 'application/json', ...options.headers },
//     ...options,
//   })
//   if (!res.ok) throw new Error(`API error ${res.status}`)
//   return res.json()
// }

// ─── Facilities ──────────────────────────────────────────────────

/**
 * Get all facilities (with optional filters).
 * Future: GET /facilities?type=PHC&service=OPD&distance=5
 */
export async function getFacilities(filters = {}) {
  // Simulate network latency
  await delay(300)

  let results = [...mockFacilities]

  if (filters.type && filters.type !== 'All') {
    results = results.filter((f) => f.type === filters.type)
  }

  if (filters.service && filters.service !== 'All') {
    results = results.filter((f) => f.services.includes(filters.service))
  }

  if (filters.distance) {
    results = results.filter((f) => f.distance <= Number(filters.distance))
  }

  if (filters.availability === 'open') {
    results = results.filter((f) => f.workingStatus === 'Open')
  }

  if (filters.verification && filters.verification !== 'All') {
    results = results.filter((f) => f.verificationStatus === filters.verification)
  }

  if (filters.query) {
    const q = filters.query.toLowerCase()
    results = results.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.address.toLowerCase().includes(q) ||
        f.services.some((s) => s.toLowerCase().includes(q))
    )
  }

  return results
}

/**
 * Get a single facility by ID.
 * Future: GET /facilities/{id}
 */
export async function getFacilityById(id) {
  await delay(200)
  const facility = mockFacilities.find((f) => f.id === String(id))
  if (!facility) throw new Error('Facility not found')
  return facility
}

/**
 * Get nearby facilities given lat/lng.
 * Future: GET /facilities/nearby?lat=18.91&lng=73.31&radius=10
 */
export async function getNearbyFacilities(lat, lng, radiusKm = 10) {
  await delay(300)
  // For mock data: just return all sorted by distance
  return [...mockFacilities].sort((a, b) => a.distance - b.distance)
}

// ─── Feedback ────────────────────────────────────────────────────

/**
 * Submit user feedback about a facility.
 * Future: POST /feedback
 */
export async function submitFeedback(payload) {
  await delay(400)
  console.log('[Mock] Feedback submitted:', payload)
  return { success: true, message: 'Feedback received. Thank you!' }
}

// ─── Reports ─────────────────────────────────────────────────────

/**
 * Submit a report about incorrect/missing facility information.
 * Future: POST /reports
 */
export async function submitReport(payload) {
  await delay(400)
  console.log('[Mock] Report submitted:', payload)
  return { success: true, message: 'Report submitted for verification.' }
}

// ─── AI Assistant ────────────────────────────────────────────────

/**
 * Send a message to the AI healthcare assistant.
 * Future: POST /ai/assistant
 * Backend will call Gemini API and return guidance.
 *
 * DO NOT call Gemini directly from the frontend.
 */
export async function sendAssistantMessage(message) {
  await delay(1200)

  const msg = message.toLowerCase()

  // Simple keyword-based mock responses (real responses come from Gemini via FastAPI)
  if (msg.includes('fever') || msg.includes('cold') || msg.includes('flu')) {
    return {
      response:
        'For fever, cold, or flu-like symptoms, a visit to your nearest Primary Health Centre (PHC) is a good first step. PHCs are equipped to handle common ailments and can prescribe medicines. If your symptoms are severe (high fever above 103°F, difficulty breathing), please go to the nearest Community Health Centre (CHC) or District Hospital immediately.\n\nWould you like me to find a PHC near you?',
    }
  }

  if (msg.includes('pregnant') || msg.includes('delivery') || msg.includes('maternity') || msg.includes('antenatal')) {
    return {
      response:
        'For pregnancy and maternity care, Community Health Centres (CHCs) and District Hospitals offer Antenatal Care (ANC), delivery services, and post-natal care. Regular check-ups are important for both mother and child.\n\nI can help you find the nearest facility with maternity services. Shall I do that?',
    }
  }

  if (msg.includes('child') || msg.includes('vaccination') || msg.includes('immunisation') || msg.includes('baby')) {
    return {
      response:
        'Child immunisation services are available at Sub-Centres, PHCs, and CHCs. The Government of India provides free vaccines under the Universal Immunisation Programme (UIP) for children up to 2 years.\n\nWould you like to find the nearest facility offering immunisation services?',
    }
  }

  if (msg.includes('emergency') || msg.includes('accident') || msg.includes('injury') || msg.includes('urgent')) {
    return {
      response:
        '⚠️ For medical emergencies, please call 108 (National Ambulance Service) immediately or go to the nearest Community Health Centre (CHC) or District Hospital with an Emergency ward.\n\nShall I show you the nearest 24×7 emergency facility on the map?',
    }
  }

  if (msg.includes('medicine') || msg.includes('pharmacy') || msg.includes('drug')) {
    return {
      response:
        'Government healthcare facilities provide free essential medicines under the Jan Aushadhi scheme. You can check medicine availability at PHCs and CHCs using the RuralCare facility search.\n\nWould you like to search for a facility with a specific medicine?',
    }
  }

  if (msg.includes('tb') || msg.includes('tuberculosis')) {
    return {
      response:
        'Tuberculosis (TB) treatment (DOTS – Directly Observed Treatment, Short-course) is available free of charge at all government PHCs, CHCs, and District Hospitals. TB treatment is fully funded by the Government of India.\n\nI can help you find the nearest DOTS centre. Would you like that?',
    }
  }

  if (msg.includes('doctor') || msg.includes('physician') || msg.includes('specialist')) {
    return {
      response:
        'General physician consultations are available at PHCs. Specialist doctors (gynaecologists, surgeons, paediatricians) are typically available at CHCs and District Hospitals. You can check doctor availability in real-time using the RuralCare facility search.\n\nWhich type of doctor are you looking for?',
    }
  }

  // Default response
  return {
    response:
      'Thank you for reaching out. I can help you find the right type of government healthcare facility based on your needs.\n\nFor routine health concerns: visit a nearby PHC (Primary Health Centre).\nFor specialised care or delivery: visit a CHC (Community Health Centre).\nFor serious/emergency cases: visit the nearest District Hospital.\n\nCould you tell me more about what kind of help you need? You can also use the Facility Search to find facilities near you.',
  }
}

// ─── Auth (placeholder for JWT) ──────────────────────────────────

/**
 * Login a user.
 * Future: POST /auth/login
 */
export async function login(email, password) {
  await delay(500)
  // Placeholder — backend will validate and return JWT token
  console.log('[Mock] Login attempt:', { email })
  if (email && password) {
    return { success: true, token: 'mock-jwt-token', user: { email, role: 'citizen' } }
  }
  throw new Error('Invalid credentials')
}

// ─── Utility ─────────────────────────────────────────────────────
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
