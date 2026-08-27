import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import { Link } from 'react-router-dom'
import VerificationBadge from './VerificationBadge'

// ─── Fix default Leaflet marker icons (common Vite/webpack issue) ─
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// Custom coloured icons for different facility types
const createFacilityIcon = (type) => {
  const colors = {
    PHC: '#2563eb',
    CHC: '#7c3aed',
    Hospital: '#dc2626',
    'Sub-Centre': '#0891b2',
  }
  const color = colors[type] || '#2563eb'

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px; height: 28px;
        background: ${color};
        border: 2px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 6px rgba(0,0,0,0.25);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 11px;
          font-weight: 700;
          font-family: Inter, sans-serif;
        ">+</div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 16px; height: 16px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 4px rgba(37,99,235,0.25), 0 2px 6px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
})

// Component to update map view when centre changes
function MapUpdater({ centre, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (centre) map.setView(centre, zoom)
  }, [centre, zoom, map])
  return null
}

/**
 * MapView — Leaflet + OpenStreetMap map component.
 */
export default function MapView({
  facilities = [],
  userLocation = null,
  centre = [18.9, 73.3],
  zoom = 11,
  height = '500px',
}) {
  return (
    <div style={{ height }} className="rounded-xl overflow-hidden border border-slate-200 shadow-card">
      <MapContainer
        center={centre}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapUpdater centre={centre} zoom={zoom} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="text-sm font-medium text-slate-800">📍 Your Location</div>
            </Popup>
          </Marker>
        )}

        {/* Facility markers */}
        {facilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.latitude, facility.longitude]}
            icon={createFacilityIcon(facility.type)}
          >
            <Popup minWidth={220}>
              <div style={{ fontFamily: 'Inter, sans-serif' }}>
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#64748b',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '4px',
                  }}
                >
                  {facility.type}
                </div>
                <div
                  style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginBottom: '6px' }}
                >
                  {facility.name}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>
                  📍 {facility.distance} km away
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                  {facility.services[0]}
                  {facility.services.length > 1 && ` +${facility.services.length - 1} more`}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      padding: '2px 8px',
                      borderRadius: '9999px',
                      background: facility.workingStatus === 'Open' ? '#dcfce7' : '#f1f5f9',
                      color: facility.workingStatus === 'Open' ? '#15803d' : '#64748b',
                    }}
                  >
                    {facility.workingStatus === 'Open' ? '● Open' : '● Closed'}
                  </span>
                </div>
                <a
                  href={`/facilities/${facility.id}`}
                  style={{
                    display: 'inline-block',
                    fontSize: '12px',
                    fontWeight: '600',
                    background: '#2563eb',
                    color: 'white',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                  }}
                >
                  View Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
