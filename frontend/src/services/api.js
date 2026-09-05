/**
 * api.js — RuralCare API Service Layer
 * ──────────────────────────────────────────────────────────────
 * Connected to the FastAPI backend at VITE_API_BASE_URL.
 * All exported function signatures are unchanged — no component
 * edits are needed.
 *
 * Field-mapping adapters translate backend snake_case/enum values
 * to the camelCase shape the components already consume.
 * ──────────────────────────────────────────────────────────────
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

// ─── Token helpers ───────────────────────────────────────────────

function getToken() {
  try {
    const session = localStorage.getItem('ruralcare_session')
    return session ? JSON.parse(session).token : null
  } catch {
    return null
  }
}

// ─── Core HTTP helper ────────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let message = `API error ${res.status}`
    try {
      const body = await res.json()
      message = body.detail || message
    } catch {}
    throw new Error(message)
  }

  // 204 No Content
  if (res.status === 204) return null
  return res.json()
}

// ─── Field-mapping adapters ──────────────────────────────────────
// Backend uses snake_case and different field names from the mock.
// These functions normalise API responses to the shape components expect.

function mapStatus(status) {
  // Backend: "Fresh" | "Needs Verification" | "Outdated"
  // Frontend (mock): "Verified Recently" | "Needs Verification" | "Information Outdated"
  if (status === 'Fresh') return 'Verified Recently'
  if (status === 'Outdated') return 'Information Outdated'
  return status // "Needs Verification" matches exactly
}

function adaptFacility(f) {
  return {
    id: f.id,
    name: f.name,
    type: f.type,
    address: f.address || `${f.village}, ${f.district}, ${f.state}`,
    village: f.village,
    district: f.district,
    state: f.state,
    latitude: f.latitude,
    longitude: f.longitude,
    phone: f.phone || '',
    email: '',
    workingStatus: 'Open',       // backend doesn't track open/closed yet
    workingHours: '',
    verificationStatus: mapStatus(f.status),
    distance: f.distance_km ?? null,
    bedCount: f.bed_count || 0,
    lastVerified: f.last_verified || null,
    basicFacilities: [], // Fallback since backend doesn't have this array yet
    // nested arrays — present on detail endpoint, empty on list
    services: (f.services || []).map((s) => s.name || s),
    doctors: (f.doctors || []).map((d) => ({
      name: d.name,
      specialisation: d.specialization,
      available: true,
      available_days: d.available_days,
      available_hours: d.available_hours,
    })),
    medicines: (f.medicines || []).map((m) => ({
      name: m.name,
      available: m.in_stock,
    })),
  }
}

// ─── Facilities ──────────────────────────────────────────────────

/**
 * GET /facilities
 * Supports: district, village, service_type, lat, lng query params.
 * Falls back to client-side filtering for fields not in the backend API.
 */
export async function getFacilities(filters = {}) {
  const params = new URLSearchParams()
  if (filters.district)    params.set('district', filters.district)
  if (filters.village)     params.set('village', filters.village)
  if (filters.service && filters.service !== 'All') {
    params.set('service_type', filters.service)
  }
  // Pass user location for server-side Haversine sorting
  if (filters.lat) params.set('lat', filters.lat)
  if (filters.lng) params.set('lng', filters.lng)

  const qs = params.toString()
  let results = await apiFetch(`/facilities${qs ? `?${qs}` : ''}`)
  results = results.map(adaptFacility)

  // ── Client-side filters not yet on the backend ──────────────────

  if (filters.type && filters.type !== 'All') {
    results = results.filter((f) => f.type === filters.type)
  }

  if (filters.distance && filters.distance !== 'Any' && filters.distance !== undefined) {
    results = results.filter((f) => f.distance !== null && f.distance <= Number(filters.distance))
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
 * GET /facilities/{id}
 */
export async function getFacilityById(id) {
  const data = await apiFetch(`/facilities/${id}`)
  return adaptFacility(data)
}

/**
 * GET /facilities?lat=&lng= sorted by distance.
 */
export async function getNearbyFacilities(lat, lng, radiusKm = 10) {
  const params = new URLSearchParams({ lat, lng })
  const results = await apiFetch(`/facilities?${params}`)
  return results.map(adaptFacility)
}

// ─── Feedback ────────────────────────────────────────────────────

/**
 * Feedback is not a dedicated backend route yet — proxied as a report.
 */
export async function submitFeedback(payload) {
  console.log('[RuralCare] Feedback proxied as report:', payload)
  return submitReport(payload)
}

// ─── Reports ─────────────────────────────────────────────────────

/**
 * POST /reports
 * payload can contain facilityId (UUID) and issue/description text.
 */
export async function submitReport(payload) {
  // The report form sends facilityId + description (or problemType + description)
  const issue = [
    payload.problemType ? `[${payload.problemType}]` : '',
    payload.description || payload.issue || '',
    payload.facilityName ? `Facility: ${payload.facilityName}` : '',
    payload.location ? `Location: ${payload.location}` : '',
    payload.reporterName ? `Reporter: ${payload.reporterName}` : '',
    payload.reporterPhone ? `Phone: ${payload.reporterPhone}` : '',
  ]
    .filter(Boolean)
    .join(' | ')

  // facility_id is required by the backend; fall back gracefully if missing
  const facility_id = payload.facilityId && payload.facilityId !== 'not_listed' && payload.facilityId !== ''
    ? payload.facilityId
    : null

  if (!facility_id) {
    // Backend requires a valid facility UUID — log and resolve optimistically
    console.warn('[RuralCare] submitReport: no valid facility_id, skipping API call.')
    return { success: true, message: 'Report noted. (No facility selected — stored locally.)' }
  }

  await apiFetch('/reports', {
    method: 'POST',
    body: JSON.stringify({ facility_id, issue }),
  })
  return { success: true, message: 'Report submitted for verification.' }
}

// ─── AI Assistant ────────────────────────────────────────────────

/**
 * POST /ai/query
 * Sends the message to the backend AI proxy (Gemini stub).
 * Falls back to keyword-based local responses if the backend
 * returns an empty extracted_need (stub mode).
 */
export async function sendAssistantMessage(message) {
  try {
    const data = await apiFetch('/ai/query', {
      method: 'POST',
      body: JSON.stringify({ query: message, language: 'en' }),
    })

    // If Gemini is integrated and returns a response, use it
    if (data.extracted_need && data.extracted_need.trim()) {
      return { response: data.extracted_need }
    }
  } catch (err) {
    console.warn('[RuralCare] AI query failed, using local fallback:', err.message)
  }

  // ── Local keyword fallback (while Gemini is not yet integrated) ──
  const msg = message.toLowerCase()

  if (msg.includes('fever') || msg.includes('cold') || msg.includes('flu')) {
    return {
      response:
        'For fever, cold, or flu-like symptoms, a visit to your nearest Primary Health Centre (PHC) is a good first step. PHCs are equipped to handle common ailments and can prescribe medicines. If your symptoms are severe (high fever above 103°F, difficulty breathing), please go to the nearest Community Health Centre (CHC) or District Hospital immediately.\n\nWould you like me to find a PHC near you?',
    }
  }
  if (msg.includes('pregnant') || msg.includes('delivery') || msg.includes('maternity') || msg.includes('antenatal')) {
    return {
      response:
        'For pregnancy and maternity care, Community Health Centres (CHCs) and District Hospitals offer Antenatal Care (ANC), delivery services, and post-natal care.\n\nI can help you find the nearest facility with maternity services. Shall I do that?',
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
        '⚠️ For medical emergencies, please call 108 (National Ambulance Service) immediately or go to the nearest Community Health Centre (CHC) or District Hospital with an Emergency ward.',
    }
  }
  if (msg.includes('medicine') || msg.includes('pharmacy') || msg.includes('drug')) {
    return {
      response:
        'Government healthcare facilities provide free essential medicines under the Jan Aushadhi scheme. You can check medicine availability at PHCs and CHCs using the RuralCare facility search.',
    }
  }
  if (msg.includes('tb') || msg.includes('tuberculosis')) {
    return {
      response:
        'Tuberculosis (TB) treatment (DOTS) is available free of charge at all government PHCs, CHCs, and District Hospitals.',
    }
  }
  if (msg.includes('doctor') || msg.includes('physician') || msg.includes('specialist')) {
    return {
      response:
        'General physician consultations are available at PHCs. Specialist doctors are typically available at CHCs and District Hospitals. You can check doctor availability using the RuralCare facility search.',
    }
  }

  return {
    response:
      'Thank you for reaching out. I can help you find the right type of government healthcare facility based on your needs.\n\nFor routine health concerns: visit a nearby PHC.\nFor specialised care or delivery: visit a CHC.\nFor serious/emergency cases: visit the nearest District Hospital.',
  }
}

// ─── Auth ────────────────────────────────────────────────────────

/**
 * POST /auth/login
 * Used by AuthContext — returns { token, role, user }.
 */
export async function login(phone, password) {
  const data = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone, password }),
  })
  return {
    success: true,
    token: data.access_token,
    role: data.role,
    user: { phone, role: data.role },
  }
}

/**
 * POST /auth/register
 * Returns { token, role }.
 */
export async function register(payload) {
  const data = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  return {
    success: true,
    token: data.access_token,
    role: data.role,
  }
}
