import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import SearchBar from '../components/SearchBar'
import FeatureCard from '../components/FeatureCard'

const features = [
  {
    icon: '📍',
    title: 'Nearby Facilities',
    description: 'Find PHCs, CHCs, and hospitals near your location instantly.',
    to: '/facilities',
  },
  {
    icon: '🏥',
    title: 'Service Availability',
    description: 'Check whether doctors, services, and medicines are available.',
    to: '/facilities',
  },
  {
    icon: '🗺️',
    title: 'Healthcare Map',
    description: 'View all government health facilities on an interactive map.',
    to: '/map',
  },
  {
    icon: '🤖',
    title: 'AI Assistant',
    description: 'Get general healthcare guidance and facility recommendations.',
    to: '/assistant',
  },
]

const stats = [
  { value: '6+', label: 'Healthcare Facilities' },
  { value: '3', label: 'Facility Types' },
  { value: '15+', label: 'Services Listed' },
  { value: 'Free', label: 'Government Services' },
]

export default function Home() {
  const navigate = useNavigate()
  const [locating, setLocating] = useState(false)

  const handleSearch = (query) => {
    if (query) navigate(`/facilities?q=${encodeURIComponent(query)}`)
  }

  const handleUseLocation = () => {
    setLocating(true)
    navigator.geolocation?.getCurrentPosition(
      () => {
        setLocating(false)
        navigate('/map')
      },
      () => {
        setLocating(false)
        navigate('/map')
      }
    )
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="bg-gradient-to-b from-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="max-w-3xl mx-auto text-center">
            {/* Tag */}
            <div className="inline-flex items-center gap-2 bg-primary-600/60 text-primary-100 text-sm font-medium px-4 py-1.5 rounded-full mb-6 border border-primary-500/50">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Government of India — Public Healthcare Platform
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
              Healthcare Near You,{' '}
              <span className="text-blue-200">When You Need It</span>
            </h1>

            <p className="text-primary-100 text-base sm:text-lg leading-relaxed mb-10 max-w-xl mx-auto">
              Find nearby government healthcare facilities, check available services, and get reliable information before you travel.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
              <Link
                to="/facilities"
                className="bg-white text-primary-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-md text-sm"
              >
                🔍 Find Healthcare
              </Link>
              <Link
                to="/map"
                className="border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
              >
                🗺️ Open Healthcare Map
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label} className="bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-primary-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Search Section ── */}
      <section className="bg-primary-50 border-b border-primary-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-xl font-semibold text-slate-800 text-center mb-2">
            What healthcare service do you need?
          </h2>
          <p className="text-slate-500 text-sm text-center mb-6">
            Search for a hospital, PHC, CHC, doctor, medicine, or service.
          </p>

          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for hospital, PHC, CHC, doctor, medicine..."
          />

          <div className="mt-4 flex justify-center">
            <button
              onClick={handleUseLocation}
              disabled={locating}
              className="flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 border border-primary-300 bg-white px-5 py-2.5 rounded-xl hover:bg-primary-50 transition-colors disabled:opacity-60"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {locating ? 'Locating...' : 'Use My Location'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-xl font-semibold text-slate-800 mb-6">What can RuralCare do for you?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f) => (
            <FeatureCard
              key={f.title}
              icon={f.icon}
              title={f.title}
              description={f.description}
              onClick={() => navigate(f.to)}
            />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <h2 className="text-xl font-semibold text-slate-800 mb-8 text-center">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '🔍', title: 'Search', desc: 'Search for a facility or service near you.' },
              { step: '2', icon: '✓', title: 'Verify', desc: 'Check freshness — see when info was last verified.' },
              { step: '3', icon: '📋', title: 'Review', desc: 'Check available doctors, services, and medicines.' },
              { step: '4', icon: '🗺️', title: 'Navigate', desc: 'Get directions to the facility on the map.' },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 font-bold text-lg flex items-center justify-center mb-3">
                  {item.step}
                </div>
                <div className="text-2xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Information Freshness Banner ── */}
      <section className="bg-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-1">Always up-to-date facility information</h2>
            <p className="text-primary-100 text-sm">
              Every facility shows a "Last Verified" date. Information is updated by authorised healthcare workers.
              You can also report incorrect information.
            </p>
          </div>
          <Link
            to="/report"
            className="flex-shrink-0 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm"
          >
            Report an Issue
          </Link>
        </div>
      </section>

      {/* ── Emergency Banner ── */}
      <section className="bg-red-50 border border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <div className="text-red-500 flex-shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.072 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-red-700 text-sm font-medium">
            <strong>Medical Emergency?</strong> Call{' '}
            <a href="tel:108" className="underline font-bold">108</a> (Ambulance) or{' '}
            <a href="tel:102" className="underline font-bold">102</a> (Maternity) immediately.
          </p>
        </div>
      </section>
    </div>
  )
}
