import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import SearchBar from '../components/SearchBar'
import ManualLocationInput from '../components/ManualLocationInput'
import FacilityCard from '../components/FacilityCard'
import FacilityFilters from '../components/FacilityFilters'
import LastSyncedLabel from '../components/LastSyncedLabel'
import { getFacilities } from '../services/api'

const DEFAULT_FILTERS = {
  type: 'All',
  service: 'All',
  distance: 'Any',
  availability: 'all',
  verification: 'All',
}

export default function Facilities() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [village, setVillage] = useState(searchParams.get('village') || '')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [lastSyncedAt, setLastSyncedAt] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiFilters = {
          ...filters,
          query,
          village: village || undefined,
          distance: filters.distance === 'Any' ? undefined : filters.distance,
        }
        const data = await getFacilities(apiFilters)
        if (isMounted) {
          setFacilities(data)
          setLastSyncedAt(new Date())
        }
      } catch (err) {
        if (isMounted) {
          setError(t('facilities.error', 'Unable to load facilities. Please try again.'))
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [query, village, filters, t])

  const handleSearch = (q) => {
    setQuery(q)
    const newParams = {}
    if (q) newParams.q = q
    if (village) newParams.village = village
    setSearchParams(newParams)
  }

  const handleLocationSubmit = (loc) => {
    setVillage(loc)
    const newParams = {}
    if (query) newParams.q = query
    if (loc) newParams.village = loc
    setSearchParams(newParams)
  }

  const handleLocationClear = () => {
    setVillage('')
    const newParams = {}
    if (query) newParams.q = query
    setSearchParams(newParams)
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {t('facilities.title', 'Find Healthcare Near You')}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {t('facilities.subtitle', 'Search and filter government healthcare facilities — PHCs, CHCs, hospitals, and sub-centres.')}
        </p>
      </div>

      {/* Search & Location Controls */}
      <div className="space-y-3 mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder={t('search.placeholder', 'Search for hospital, PHC, CHC, doctor, medicine...')}
          initialValue={query}
        />

        {/* Manual Village/Town Location Fallback */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t('location.manualFallbackPrompt', 'Or find by village / town:')}
            </span>
            {village && (
              <span className="text-xs text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md font-medium">
                {village}
              </span>
            )}
          </div>
          <ManualLocationInput
            onLocationSubmit={handleLocationSubmit}
            onLocationClear={handleLocationClear}
            value={village}
            placeholder={t('search.villagePlaceholder', 'Enter village or town name...')}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 lg:hidden">
        <div className="flex items-center gap-2">
          <p className="text-sm text-slate-600">
            {loading ? t('facilities.searching', 'Searching...') : t('facilities.foundCount', { count: facilities.length, defaultValue: `${facilities.length} facilities found` })}
          </p>
          <LastSyncedLabel lastSyncedAt={lastSyncedAt} />
        </div>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 text-sm font-medium text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          {t('facilities.filters', 'Filters')}
        </button>
      </div>

      {showMobileFilters && (
        <div className="lg:hidden mb-6">
          <FacilityFilters filters={filters} onChange={handleFilterChange} />
        </div>
      )}

      <div className="flex gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <FacilityFilters filters={filters} onChange={handleFilterChange} />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="hidden lg:flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-slate-600">
                {loading
                  ? t('facilities.searching', 'Searching...')
                  : t('facilities.foundCount', { count: facilities.length, defaultValue: `${facilities.length} facilities found` })}
              </p>
              <LastSyncedLabel lastSyncedAt={lastSyncedAt} />
            </div>
            {(query || village) && (
              <p className="text-sm text-slate-500">
                {t('search.showingResults', 'Showing results for')}{' '}
                <span className="font-medium text-slate-800">
                  {[query && `"${query}"`, village && `"${village}"`].filter(Boolean).join(' in ')}
                </span>
              </p>
            )}
          </div>

          {loading && (
            <div>
              <p className="text-sm text-primary-700 font-medium mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                {t('facilities.loading', 'Finding nearby healthcare facilities...')}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                    <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16 text-red-600 bg-red-50/50 rounded-xl border border-red-100 p-6">
              <div className="text-4xl mb-3">⚠️</div>
              <p className="text-base font-semibold">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  getFacilities({ ...filters, query, village: village || undefined })
                    .then(setFacilities)
                    .catch(() => setError(t('facilities.error', 'Unable to load facilities. Please try again.')))
                    .finally(() => setLoading(false))
                }}
                className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                {t('actions.retry', 'Retry')}
              </button>
            </div>
          )}

          {!loading && !error && facilities.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="text-5xl mb-4">🏥</div>
              <h3 className="font-semibold text-slate-800 mb-2">
                {t('facilities.empty', 'No healthcare facilities found.')}
              </h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                {t('facilities.emptyHint', 'Try adjusting your search or filters. You can also clear the filters and search again.')}
              </p>
              <button
                onClick={() => {
                  setQuery('')
                  setVillage('')
                  setFilters(DEFAULT_FILTERS)
                }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                {t('facilities.clearFilters', 'Clear all filters')}
              </button>
            </div>
          )}

          {!loading && !error && facilities.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {facilities.map((facility) => (
                <FacilityCard key={facility.id} facility={facility} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

