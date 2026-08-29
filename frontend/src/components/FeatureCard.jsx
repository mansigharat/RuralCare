export default function FeatureCard({ icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-slate-200 shadow-card hover:shadow-card-hover hover:border-primary-200 transition-all duration-200 p-5 text-left w-full group"
    >
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 text-sm mb-1">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
    </button>
  )
}
