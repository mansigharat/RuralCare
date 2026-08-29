import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import MapView from '../components/MapView'
import FacilityFilters from '../components/FacilityFilters'
import VerificationBadge from '../components/VerificationBadge'
import { getFacilities } from '../services/api'

const DEFAULT_FILTERS = {
  type: 'All',
  service: 'All',
  distance: 'Any',
  availability: 'all',
  verification: 'All',
}

export default function HealthcareMap() {
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [mapCentre, setMapCentre] = useState([18.9167, 73.3167])
  const [selectedFacility, setSelectedFacility] = useState(null)

  useEffect(() => {
    const fetchFacilities = async () => {
      setLoading(true)
      try {
        const apiFilters = {
          ...filters,
          distance: filters.distance === 'Any' ? undefined : filters.distance,
        }
        const data = await getFacilities(apiFilters)
        setFacilities(data)
      } catch {
        // silently fail, keep existing data
      } finally {
        setLoading(false)
      }
    }
    fetchFacilities()
  }, [filters])

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setMapCentre([latitude, longitude])
      },
      () => alert('Could not get your location. Please allow location access.')
    )
  }

  const typeColors = {
    PHC: 'bg-blue-100 text-blue-700',
    CHC: 'bg-indigo-100 text-indigo-700',
    Hospital: 'bg-purple-100 text-purple-700',
    'Sub-Centre': 'bg-cyan-100 text-cyan-700',
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Healthcare Map</h1>
          <p className="text-slate-500 text-sm mt-1">
            View all government healthcare facilities on the map. Click a marker for details.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleGetLocation}
            className="flex items-center gap-2 text-sm font-medium text-primary-600 border border-primary-300 px-4 py-2.5 rounded-xl hover:bg-primary-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            My Location
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 text-sm font-medium border px-4 py-2.5 rounded-xl transition-colors ${showFilters
                ? 'bg-primary-50 text-primary-700 border-primary-300'
                : 'text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {[
          { type: 'PHC', color: '#2563eb' },
          { type: 'CHC', color: '#7c3aed' },
          { type: 'Hospital', color: '#dc2626' },
          { type: 'Sub-Centre', color: '#0891b2' },
        ].map(({ type, color }) => (
          <div key={type} className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full" style={{ background: color }}></div>
            {type}
          </div>
        ))}
        {userLocation && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <div className="w-3 h-3 rounded-full border-2 border-white ring-2 ring-primary-500 bg-primary-500"></div>
            Your Location
          </div>
        )}
        <div className="ml-auto text-xs text-slate-400">
          {loading ? 'Loading...' : `${facilities.length} facilit${facilities.length !== 1 ? 'ies' : 'y'} shown`}
        </div>
      </div>

      <div className="flex gap-5">

        {showFilters && (
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              <FacilityFilters filters={filters} onChange={setFilters} />
            </div>
          </aside>
        )}


        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {loading ? (
            <div className="h-[520px] bg-slate-100 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-slate-400 text-sm">Loading map...</p>
              </div>
            </div>
          ) : (
            <MapView
              facilities={facilities}
              userLocation={userLocation}
              centre={mapCentre}
              zoom={10}
              height="520px"
              onFacilitySelect={setSelectedFacility}
            />
          )}


          {selectedFacility && (
            <div className="bg-white rounded-xl border border-primary-200 shadow-card-hover p-5 animate-fadeIn">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[selectedFacility.type] || 'bg-slate-100 text-slate-700'}`}>
                      {selectedFacility.type}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${selectedFacility.workingStatus === 'Open' ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
                      {selectedFacility.workingStatus === 'Open' ? '● Open Now' : '● Closed'}
                    </span>
                    <VerificationBadge status={selectedFacility.verificationStatus} size="sm" />
                  </div>
                  <h3 className="font-semibold text-slate-900 text-base mb-1">{selectedFacility.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{selectedFacility.address}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {selectedFacility.services.slice(0, 4).map((s) => (
                      <span key={s} className="text-xs bg-primary-50 text-primary-700 border border-primary-100 px-2 py-0.5 rounded-full">
                        {s}
                      </span>
                    ))}
                    {selectedFacility.services.length > 4 && (
                      <span className="text-xs text-slate-400 px-1">+{selectedFacility.services.length - 4} more</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="font-medium text-primary-600">{selectedFacility.distance} km away</span>
                    <span>{selectedFacility.doctors.length} doctor{selectedFacility.doctors.length !== 1 ? 's' : ''}</span>
                    {selectedFacility.bedCount > 0 && <span>{selectedFacility.bedCount} beds</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <Link
                    to={`/facilities/${selectedFacility.id}`}
                    className="bg-primary-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-center"
                  >
                    View Details
                  </Link>
                  {selectedFacility.phone && (
                    <a
                      href={`tel:${selectedFacility.phone}`}
                      className="border border-slate-200 text-slate-700 text-xs font-medium px-4 py-2 rounded-lg hover:border-primary-300 hover:text-primary-600 transition-colors text-center"
                    >
                      📞 Call
                    </a>
                  )}
                  <button
                    onClick={() => setSelectedFacility(null)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    ✕ Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {facilities.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-slate-800 mb-4">
            Facilities on Map
            <span className="ml-2 text-sm font-normal text-slate-400">({facilities.length})</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl border border-slate-200 shadow-card text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Distance</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden sm:table-cell">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase hidden md:table-cell">Verification</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {facilities.map((f) => (
                  <tr
                    key={f.id}
                    className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer ${selectedFacility?.id === f.id ? 'bg-primary-50/40' : ''}`}
                    onClick={() => { setSelectedFacility(f); setMapCentre([f.latitude, f.longitude]) }}
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">{f.name}</td>
                    <td className="px-4 py-3 text-slate-600">{f.type}</td>
                    <td className="px-4 py-3 text-slate-600 font-medium text-primary-600">{f.distance} km</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${f.workingStatus === 'Open' ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-400'}`}>
                        {f.workingStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <VerificationBadge status={f.verificationStatus} size="sm" />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/facilities/${f.id}`}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
