import { FACILITY_TYPES, SERVICES, VERIFICATION_STATUS } from '../data/mockFacilities'

const DISTANCE_OPTIONS = ['2', '5', '10', '20', 'Any']
const VERIFICATION_OPTIONS = ['All', ...Object.values(VERIFICATION_STATUS)]

/**
 * FacilityFilters — sidebar/top filter panel for the Facilities page.
 */
export default function FacilityFilters({ filters, onChange }) {
  const handleChange = (key, value) => {
    onChange({ ...filters, [key]: value })
  }

  const FilterGroup = ({ label, children }) => (
    <div>
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
      {children}
    </div>
  )

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card p-4 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Filters</h3>
        <button
          onClick={() => onChange({ type: 'All', service: 'All', distance: 'Any', availability: 'all', verification: 'All' })}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Facility Type */}
      <FilterGroup label="Facility Type">
        <div className="space-y-1.5">
          {['All', ...FACILITY_TYPES].map((t) => (
            <label key={t} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="type"
                value={t}
                checked={filters.type === t}
                onChange={() => handleChange('type', t)}
                className="accent-primary-600 w-4 h-4"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{t}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Service */}
      <FilterGroup label="Service">
        <select
          value={filters.service}
          onChange={(e) => handleChange('service', e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          <option value="All">All Services</option>
          {SERVICES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </FilterGroup>

      {/* Distance */}
      <FilterGroup label="Distance">
        <div className="space-y-1.5">
          {DISTANCE_OPTIONS.map((d) => (
            <label key={d} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="distance"
                value={d}
                checked={filters.distance === d}
                onChange={() => handleChange('distance', d)}
                className="accent-primary-600 w-4 h-4"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">
                {d === 'Any' ? 'Any distance' : `Within ${d} km`}
              </span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Availability */}
      <FilterGroup label="Availability">
        <div className="space-y-1.5">
          {[
            { value: 'all', label: 'All Facilities' },
            { value: 'open', label: 'Open Now' },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <input
                type="radio"
                name="availability"
                value={opt.value}
                checked={filters.availability === opt.value}
                onChange={() => handleChange('availability', opt.value)}
                className="accent-primary-600 w-4 h-4"
              />
              <span className="text-sm text-slate-700 group-hover:text-slate-900">{opt.label}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      {/* Verification Status */}
      <FilterGroup label="Verification Status">
        <select
          value={filters.verification}
          onChange={(e) => handleChange('verification', e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
        >
          {VERIFICATION_OPTIONS.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
      </FilterGroup>
    </div>
  )
}
