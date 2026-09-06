import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * OfflineBanner
 * ──────────────────────────────────────────────────────────────
 * Offline UI indicator component.
 * Displays when viewing cached data or when network connection is lost.
 *
 * @param {{
 *   isOffline?: boolean,
 *   message?: string,
 *   className?: string
 * }} props
 */
export default function OfflineBanner({
  isOffline,
  message,
  className = '',
}) {
  const { t } = useTranslation()
  const [offlineState, setOfflineState] = useState(
    typeof isOffline === 'boolean'
      ? isOffline
      : typeof navigator !== 'undefined'
      ? !navigator.onLine
      : false
  )

  useEffect(() => {
    if (typeof isOffline === 'boolean') {
      setOfflineState(isOffline)
      return
    }

    const handleOnline = () => setOfflineState(false)
    const handleOffline = () => setOfflineState(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [isOffline])

  if (!offlineState) return null

  return (
    <aside
      role="status"
      aria-live="polite"
      className={`bg-amber-500 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-center gap-2.5 shadow-sm transition-all duration-200 ${className}`}
    >
      <svg className="w-4 h-4 flex-shrink-0 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L3 3m15.364 2.636L9.879 9.879M3 3l18 18M3 12a9 9 0 0115.364-6.364M9.879 9.879A3 3 0 0012 15a3 3 0 002.121-.879"
        />
      </svg>
      <span>{message || t('offline.banner', 'Showing offline data')}</span>
      <span className="hidden sm:inline text-amber-100 text-xs font-normal">
        — {t('offline.offlineNotice', 'Cached information is available')}
      </span>
    </aside>
  )
}
