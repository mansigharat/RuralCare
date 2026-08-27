import { Link } from 'react-router-dom'

/**
 * NotFound — 404 page shown for any unmatched route.
 */
export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md w-full">
        {/* Big 404 visual */}
        <div className="relative mb-8">
          <p className="text-[8rem] font-black text-primary-100 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 bg-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          The page you are looking for doesn't exist or has been moved.
          Try searching for a healthcare facility instead.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors text-sm"
          >
            ← Back to Home
          </Link>
          <Link
            to="/facilities"
            className="border-2 border-slate-200 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:border-primary-300 hover:text-primary-600 transition-colors text-sm"
          >
            🔍 Find Healthcare
          </Link>
        </div>

        {/* Emergency note */}
        <div className="mt-10 bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-700 text-sm font-medium">
            <strong>Medical Emergency?</strong> Call{' '}
            <a href="tel:108" className="underline font-bold">108</a> (Ambulance) or{' '}
            <a href="tel:102" className="underline font-bold">102</a> (Maternity) immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
