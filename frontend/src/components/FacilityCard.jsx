import { Link } from 'react-router-dom'
import VerificationBadge from './VerificationBadge'

/**
 * FacilityCard — displays a summary card for a healthcare facility.
 * Used in the Facilities list page and elsewhere.
 */
export default function FacilityCard({ facility }) {
  const {
    id,
    name,
    type,
    address,
    distance,
    phone,
    workingStatus,
    services,
    doctorsAvailable,
    medicinesAvailable,
    lastVerified,
    verificationStatus,
  } = facility

  const isOpen = workingStatus === 'Open'

  const typeColors = {
    PHC: 'bg-blue-100 text-blue-700',
    CHC: 'bg-indigo-100 text-indigo-700',
    Hospital: 'bg-purple-100 text-purple-700',
    'Sub-Centre': 'bg-cyan-100 text-cyan-700',
  }

  // Format date
  const formattedDate = lastVerified
    ? new Date(lastVerified).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover transition-shadow duration-200 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[type] || 'bg-slate-100 text-slate-700'}`}>
              {type}
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isOpen ? 'bg-success-100 text-success-700' : 'bg-slate-100 text-slate-500'}`}>
              {isOpen ? '● Open' : '● Closed'}
            </span>
          </div>
          <h3 className="text-base font-semibold text-slate-900 leading-snug">{name}</h3>
          <p className="text-xs text-slate-500 mt-0.5 flex items-start gap-1">
            <svg className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-2">{address}</span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-lg font-bold text-primary-600">{distance} km</p>
          <p className="text-xs text-slate-400">away</p>
        </div>
      </div>

      {/* Availability indicators */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className={`flex items-center gap-1 text-xs font-medium ${doctorsAvailable ? 'text-success-700' : 'text-slate-400'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          {doctorsAvailable ? 'Doctor Available' : 'No Doctor Today'}
        </span>
        <span className={`flex items-center gap-1 text-xs font-medium ${medicinesAvailable ? 'text-success-700' : 'text-slate-400'}`}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3H5a2 2 0 00-2 2v4m0 0h18M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M3 9l9-9m0 0l9 9" />
          </svg>
          {medicinesAvailable ? 'Medicines Available' : 'Limited Medicines'}
        </span>
      </div>

      {/* Services */}
      <div className="flex flex-wrap gap-1.5">
        {services.slice(0, 4).map((s) => (
          <span key={s} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            {s}
          </span>
        ))}
        {services.length > 4 && (
          <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">
            +{services.length - 4} more
          </span>
        )}
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex flex-col gap-1">
          <VerificationBadge status={verificationStatus} />
          <p className="text-xs text-slate-400">Last verified: {formattedDate}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-primary-600 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call
            </a>
          )}
          <Link
            to={`/facilities/${id}`}
            className="text-xs font-medium bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}
