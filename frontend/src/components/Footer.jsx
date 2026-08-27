import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-primary-500 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-white font-bold text-lg">RuralCare</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Connecting rural citizens to government healthcare facilities.
            </p>
            <p className="text-xs text-slate-500 mt-3">
              A project by the Department of Health &amp; Family Welfare
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/facilities', label: 'Find Healthcare' },
                { to: '/map', label: 'Healthcare Map' },
                { to: '/assistant', label: 'AI Assistant' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Help & Support</h4>
            <ul className="space-y-2">
              {[
                { to: '/report', label: 'Report an Issue' },
                { to: '/login', label: 'Healthcare Worker Login' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Emergency</h4>
            <div className="bg-red-900/30 border border-red-700/40 rounded-lg p-3">
              <p className="text-red-300 font-bold text-xl">108</p>
              <p className="text-slate-400 text-xs mt-1">National Ambulance Service</p>
              <p className="text-red-300 font-bold text-xl mt-2">102</p>
              <p className="text-slate-400 text-xs mt-1">Janani Express (Maternity)</p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-slate-500">
            © 2026 RuralCare. Information verified by authorised healthcare workers.
          </p>
          <p className="text-xs text-slate-600">
            Data on this platform is for guidance only. Always consult a qualified doctor.
          </p>
        </div>
      </div>
    </footer>
  )
}
