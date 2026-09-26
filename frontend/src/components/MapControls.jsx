import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export default function MapControls({ mapType, setMapType, overlays, setOverlays }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const toggleOverlay = (key) => {
    setOverlays((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="absolute top-4 right-4 z-[1000]" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white rounded-lg shadow-md p-2 hover:bg-gray-50 flex items-center justify-center border border-slate-200 focus:outline-none"
        title="Map Layers"
      >
        <svg className="w-5 h-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 w-64 bg-white rounded-xl shadow-lg border border-slate-200 p-4 text-sm">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 mb-2">Map type</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setMapType('default')}
                className={`flex-1 flex flex-col items-center p-2 rounded-lg border-2 ${
                  mapType === 'default' ? 'border-primary-600 bg-primary-50' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-md mb-1 bg-cover" style={{backgroundImage: 'url(https://a.tile.openstreetmap.org/13/5899/3860.png)'}}></div>
                <span className={`text-xs font-medium ${mapType === 'default' ? 'text-primary-700' : 'text-slate-600'}`}>Default</span>
              </button>
              <button
                onClick={() => setMapType('satellite')}
                className={`flex-1 flex flex-col items-center p-2 rounded-lg border-2 ${
                  mapType === 'satellite' ? 'border-primary-600 bg-primary-50' : 'border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-md mb-1 bg-cover" style={{backgroundImage: 'url(https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/13/3860/5899)'}}></div>
                <span className={`text-xs font-medium ${mapType === 'satellite' ? 'text-primary-700' : 'text-slate-600'}`}>Satellite</span>
              </button>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-3">
            <h3 className="font-semibold text-slate-800 mb-2">Map details</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlays.transit}
                  onChange={() => toggleOverlay('transit')}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <span className="flex-1 text-slate-700">Transit</span>
                <span className="text-xl">🚌</span>
              </label>
              <label className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overlays.traffic}
                  onChange={() => toggleOverlay('traffic')}
                  className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
                />
                <span className="flex-1 text-slate-700">Traffic</span>
                <span className="text-xl">🚥</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
