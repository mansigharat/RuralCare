import { VERIFICATION_STATUS } from '../data/mockFacilities'

/**
 * Displays the verification status badge for a facility.
 * @param {{ status: string, size?: 'sm' | 'md' }} props
 */
export default function VerificationBadge({ status, size = 'sm' }) {
  const isVerified = status === VERIFICATION_STATUS.VERIFIED
  const isOutdated = status === VERIFICATION_STATUS.OUTDATED
  const isNeedsVerification = status === VERIFICATION_STATUS.NEEDS_VERIFICATION

  const sizeClass = size === 'md' ? 'text-sm px-3 py-1.5' : 'text-xs px-2 py-1'

  if (isVerified) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-success-100 text-success-700 ${sizeClass}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {status}
      </span>
    )
  }

  if (isOutdated) {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-danger-100 text-danger-600 ${sizeClass}`}>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        {status}
      </span>
    )
  }

  // Needs Verification
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-warning-100 text-warning-600 ${sizeClass}`}>
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      {status}
    </span>
  )
}
