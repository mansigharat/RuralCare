import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * ManualLocationInput
 * ──────────────────────────────────────────────────────────────
 * Fallback location input when GPS is unavailable, denied, or inaccurate.
 * Allows rural citizens to manually enter their village or town.
 *
 * @param {{
 *   onLocationSubmit: (location: string) => void,
 *   onLocationClear?: () => void,
 *   value?: string,
 *   placeholder?: string,
 *   className?: string
 * }} props
 */
export default function ManualLocationInput({
  onLocationSubmit,
  onLocationClear,
  value = '',
  placeholder,
  className = '',
}) {
  const { t } = useTranslation()
  const [location, setLocation] = useState(value)

  useEffect(() => {
    setLocation(value)
  }, [value])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onLocationSubmit) {
      onLocationSubmit(location.trim())
    }
  }

  const handleClear = () => {
    setLocation('')
    if (onLocationClear) {
      onLocationClear()
    } else if (onLocationSubmit) {
      onLocationSubmit('')
    }
  }

  const defaultPlaceholder = placeholder || t('search.villagePlaceholder', 'Enter village or town name...')

  return (
    <form
      onSubmit={handleSubmit}
      className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-2 ${className}`}
      role="search"
      aria-label={t('location.villageOrTown', 'Village or Town')}
    >
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>

        <input
          type="text"
          id="manual-location-input"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder={defaultPlaceholder}
          className="w-full pl-9 pr-8 py-2.5 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
        />

        {location && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
            aria-label={t('search.clear', 'Clear')}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          id="manual-location-submit"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>{t('search.findLocation', 'Find')}</span>
        </button>

        {location && (
          <button
            type="button"
            onClick={handleClear}
            className="sm:hidden px-3 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {t('search.clear', 'Clear')}
          </button>
        )}
      </div>
    </form>
  )
}
