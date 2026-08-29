import { useState } from 'react'

/**
 * @param {{ onSearch: (query: string) => void, placeholder?: string, className?: string }} props
 */
export default function SearchBar({ onSearch, placeholder = 'Search...', className = '', initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)

  const handleSubmit = (e) => {
    e.preventDefault()
    onSearch(query.trim())
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
 
    onSearch(e.target.value.trim())
  }

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <input
          type="search"
          value={query}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent shadow-sm"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onSearch('') }}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      <button
        type="submit"
        className="bg-primary-600 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors shadow-sm flex-shrink-0"
      >
        Search
      </button>
    </form>
  )
}
