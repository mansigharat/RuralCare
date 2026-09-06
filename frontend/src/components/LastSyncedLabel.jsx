import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * LastSyncedLabel
 * ──────────────────────────────────────────────────────────────
 * Displays relative sync timestamp for offline caching indicator.
 *
 * @param {{
 *   lastSyncedAt?: Date | string | number | null,
 *   isOffline?: boolean,
 *   className?: string
 * }} props
 */
export default function LastSyncedLabel({
  lastSyncedAt,
  isOffline = false,
  className = '',
}) {
  const { t } = useTranslation()
  const [, setTick] = useState(0)

  // Re-render every 30 seconds so relative time stays accurate
  useEffect(() => {
    const timer = setInterval(() => setTick((v) => v + 1), 30000)
    return () => clearInterval(timer)
  }, [])

  if (!lastSyncedAt) {
    return null
  }

  const formatRelativeTime = (timeInput) => {
    try {
      const date = new Date(timeInput)
      if (isNaN(date.getTime())) return null

      const diffMs = Date.now() - date.getTime()
      const diffMinutes = Math.max(0, Math.floor(diffMs / (1000 * 60)))

      if (diffMinutes < 1) {
        return t('offline.justNow', 'Just now')
      }
      if (diffMinutes < 60) {
        return t('offline.minutesAgo', '{{count}} minutes ago', { count: diffMinutes })
      }
      const diffHours = Math.floor(diffMinutes / 60)
      if (diffHours < 24) {
        return t('offline.hoursAgo', '{{count}} hours ago', { count: diffHours })
      }
      return date.toLocaleDateString()
    } catch {
      return null
    }
  }

  const relativeText = formatRelativeTime(lastSyncedAt)
  if (!relativeText) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-slate-500 ${className}`}
      title={new Date(lastSyncedAt).toLocaleString()}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isOffline ? 'bg-amber-500' : 'bg-success-500'
        }`}
        aria-hidden="true"
      />
      <span>
        {t('offline.lastSynced', 'Last synced: {{time}}', { time: relativeText })}
      </span>
    </span>
  )
}
