import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import FacilityCard from '../components/FacilityCard'
import FacilityFilters from '../components/FacilityFilters'
import { getFacilities } from '../services/api'

const DEFAULT_FILTERS = {
  type: 'All',
  service: 'All',
  distance: 'Any',
  availability: 'all',
  verification: 'All',
}

export default function Facilities() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [facilities, setFacilities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiFilters = {
          ...filters,
          query,
          distance: filters.distance === 'Any' ? undefined : filters.distance,
        }
        const data = await getFacilities(apiFilters)
        setFacilities(data)
      } catch (err) {
        setError('Could not load facilities. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [query, filters])

  const handleSearch = (q) => {
    setQuery(q)
    setSearchParams(q ? { q } : {})
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Find Healthcare Near You</h1>
        <p className="text-slate-500 text-sm mt-1">
          Search and filter government healthcare facilities — PHCs, CHCs, hospitals, and sub-centres.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search for hospital, PHC, CHC, doctor, medicine..."
          initialValue={query}
        />
      </div>

      <div className="flex items-center justify-between mb-4 lg:hidden">
        <p className="text-sm text-slate-600">
          {loading ? 'Loading...' : `${facilities.length} facilit${facilities.length !== 1 ? 'ies' : 'y'} found`}
        </p>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="flex items-center gap-2 text-sm font-medium text-primary-600 border border-primary-200 px-4 py-2 rounded-lg hover:bg-primary-50"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
          </svg>
          Filters
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
            <p className="text-sm text-slate-600">
              {loading ? 'Searching...' : `${facilities.length} facilit${facilities.length !== 1 ? 'ies' : 'y'} found`}
            </p>
            {query && (
              <p className="text-sm text-slate-500">
                Showing results for <span className="font-medium text-slate-800">"{query}"</span>
              </p>
            )}
          </div>

          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-slate-100 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div className="text-center py-16 text-red-600">
              <p className="text-lg font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && facilities.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
              <div className="text-5xl mb-4">🏥</div>
              <h3 className="font-semibold text-slate-800 mb-2">No facilities found</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Try adjusting your search or filters. You can also clear the filters and search again.
              </p>
              <button
                onClick={() => { setQuery(''); setFilters(DEFAULT_FILTERS) }}
                className="mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all filters
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
