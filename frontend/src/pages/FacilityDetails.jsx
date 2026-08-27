import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getFacilityById } from '../services/api'
import VerificationBadge from '../components/VerificationBadge'
import MapView from '../components/MapView'

export default function FacilityDetails() {
  const { id } = useParams()
  const [facility, setFacility] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      try {
        const data = await getFacilityById(id)
        setFacility(data)
      } catch {
        setError('Facility not found.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-2/3 mb-4"></div>
        <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
      </div>
    )
  }

  if (error || !facility) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="text-5xl mb-4">🏥</div>
        <h2 className="text-xl font-semibold text-slate-800 mb-2">Facility not found</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <Link to="/facilities" className="text-primary-600 font-medium hover:underline">← Back to Search</Link>
      </div>
    )
  }

  const {
    name, type, address, distance, phone, email, workingStatus, workingHours,
    services, doctors, medicines, basicFacilities, lastVerified, verificationStatus,
    latitude, longitude, bedCount,
  } = facility

  const isOpen = workingStatus === 'Open'
  const formattedDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown'

  const typeColors = {
    PHC: 'bg-blue-100 text-blue-700',
    CHC: 'bg-indigo-100 text-indigo-700',
    Hospital: 'bg-purple-100 text-purple-700',
    'Sub-Centre': 'bg-cyan-100 text-cyan-700',
  }

  const Section = ({ title, children }) => (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
      <h2 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">{title}</h2>
      {children}
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link to="/facilities" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary-600 mb-5 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Search
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card p-6 mb-5">
        <div className="flex flex-wrap items-start gap-3 mb-4">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[type] || 'bg-slate-100 text-slate-700'}`}>
            {type}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${isOpen ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
            {isOpen ? '● Open Now' : '● Closed'}
          </span>
          <VerificationBadge status={verificationStatus} size="sm" />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">{name}</h1>
        <p className="text-slate-500 text-sm flex items-start gap-1.5 mb-4">
          <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {address}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-primary-600">{distance} km</p>
            <p className="text-xs text-slate-500">Distance</p>
          </div>
          {bedCount > 0 && (
            <div className="bg-slate-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-slate-800">{bedCount}</p>
              <p className="text-xs text-slate-500">Beds</p>
            </div>
          )}
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-800">{services.length}</p>
            <p className="text-xs text-slate-500">Services</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 text-center">
            <p className="text-lg font-bold text-slate-800">{doctors.length}</p>
            <p className="text-xs text-slate-500">Doctors</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-5 py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Get Directions
          </a>
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center justify-center gap-2 border-2 border-slate-200 text-slate-700 font-semibold px-5 py-3 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {phone}
            </a>
          )}
          <Link
            to="/report"
            className="flex items-center justify-center gap-2 border-2 border-warning-500/40 text-warning-600 font-semibold px-5 py-3 rounded-xl hover:bg-warning-50 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Report Incorrect Info
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* Contact & Hours */}
        <Section title="📞 Contact & Hours">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Phone</p>
              <a href={`tel:${phone}`} className="text-slate-800 font-medium hover:text-primary-600">{phone || 'Not available'}</a>
            </div>
            {email && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-0.5">Email</p>
                <a href={`mailto:${email}`} className="text-slate-800 hover:text-primary-600">{email}</a>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Working Hours</p>
              <p className="text-slate-800">{workingHours}</p>
            </div>
          </div>
        </Section>

        {/* Verification */}
        <Section title="✓ Verification Status">
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-slate-400 font-medium mb-1">Status</p>
              <VerificationBadge status={verificationStatus} size="md" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium mb-0.5">Last Verified</p>
              <p className="text-slate-800 font-medium">{formattedDate}</p>
            </div>
            <p className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
              Information is verified by authorised healthcare workers. Citizens can report inaccuracies.
            </p>
          </div>
        </Section>
      </div>

      {/* Services */}
      <Section title="🏥 Available Services">
        <div className="flex flex-wrap gap-2">
          {services.map((s) => (
            <span key={s} className="text-sm bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full">
              {s}
            </span>
          ))}
        </div>
      </Section>

      {/* Doctors */}
      <div className="mt-5">
        <Section title="👨‍⚕️ Doctors & Staff">
          <div className="space-y-3">
            {doctors.map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{doc.name}</p>
                  <p className="text-xs text-slate-500">{doc.specialisation}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${doc.available ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-400'}`}>
                  {doc.available ? 'Available' : 'Not Today'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Medicines */}
      <div className="mt-5">
        <Section title="💊 Medicine Availability">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {medicines.map((med, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700">{med.name}</span>
                <span className={`text-xs font-medium ${med.available ? 'text-success-700' : 'text-slate-400'}`}>
                  {med.available ? '✓ In Stock' : '✗ Not Available'}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      {/* Basic Facilities */}
      <div className="mt-5">
        <Section title="🏗️ Basic Infrastructure">
          <div className="flex flex-wrap gap-2">
            {basicFacilities.map((f) => (
              <span key={f} className="text-sm text-slate-700 bg-slate-100 px-3 py-1 rounded-full flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                {f}
              </span>
            ))}
          </div>
        </Section>
      </div>

      {/* Map */}
      <div className="mt-5">
        <div className="bg-white rounded-xl border border-slate-200 shadow-card p-5">
          <h2 className="font-semibold text-slate-800 mb-4 pb-3 border-b border-slate-100">🗺️ Location</h2>
          <MapView
            facilities={[facility]}
            centre={[latitude, longitude]}
            zoom={14}
            height="320px"
          />
          <div className="mt-3 flex justify-end">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
            >
              Open in Google Maps →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
