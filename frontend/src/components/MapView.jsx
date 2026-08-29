import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import VerificationBadge from './VerificationBadge'


delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})


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
        width: 32px; height: 32px;
        background: ${color};
        border: 2.5px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 8px rgba(0,0,0,0.28);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 13px;
          font-weight: 800;
          font-family: Inter, sans-serif;
          line-height: 1;
        ">+</div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  })
}

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="
      width: 18px; height: 18px;
      background: #2563eb;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 0 0 5px rgba(37,99,235,0.22), 0 2px 8px rgba(0,0,0,0.2);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
})

function MapUpdater({ centre, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (centre) map.setView(centre, zoom)
  }, [centre, zoom, map])
  return null
}

/**
 * MapView — Leaflet + OpenStreetMap map component.
 *
 * @param {{
 *   facilities: object[],
 *   userLocation?: {lat: number, lng: number} | null,
 *   centre?: [number, number],
 *   zoom?: number,
 *   height?: string,
 *   onFacilitySelect?: (facility: object) => void
 * }} props
 */
export default function MapView({
  facilities = [],
  userLocation = null,
  centre = [18.9, 73.3],
  zoom = 11,
  height = '500px',
  onFacilitySelect = null,
}) {
  const statusColors = {
    Open: { bg: '#dcfce7', color: '#15803d' },
    Closed: { bg: '#f1f5f9', color: '#64748b' },
  }

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

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: '600', color: '#0f172a' }}>
                📍 Your Location
              </div>
            </Popup>
          </Marker>
        )}

        {facilities.map((facility) => {
          const statusStyle = statusColors[facility.workingStatus] || statusColors.Closed
          return (
            <Marker
              key={facility.id}
              position={[facility.latitude, facility.longitude]}
              icon={createFacilityIcon(facility.type)}
            >
              <Popup minWidth={230} maxWidth={280}>
                <div style={{ fontFamily: 'Inter, sans-serif', padding: '2px 0' }}>
               
                  <div style={{
                    fontSize: '10px', fontWeight: '700', color: '#64748b',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '5px',
                  }}>
                    {facility.type}
                  </div>

               
                  <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '5px', lineHeight: '1.3' }}>
                    {facility.name}
                  </div>


                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', lineHeight: '1.4' }}>
                    📍 {facility.distance} km away
                  </div>

                  <div style={{ marginBottom: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: '600',
                      padding: '3px 8px', borderRadius: '9999px',
                      background: statusStyle.bg, color: statusStyle.color,
                    }}>
                      {facility.workingStatus === 'Open' ? '● Open Now' : '● Closed'}
                    </span>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    {facility.services[0]}
                    {facility.services.length > 1 && ` +${facility.services.length - 1} more`}
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <a
                      href={`/facilities/${facility.id}`}
                      style={{
                        flex: 1, display: 'inline-block',
                        fontSize: '12px', fontWeight: '600',
                        background: '#2563eb', color: 'white',
                        padding: '6px 10px', borderRadius: '8px',
                        textDecoration: 'none', textAlign: 'center',
                      }}
                      onClick={(e) => {
                        if (onFacilitySelect) {
                          e.preventDefault()
                          onFacilitySelect(facility)
                        }
                      }}
                    >
                      View Details
                    </a>
                    {facility.phone && (
                      <a
                        href={`tel:${facility.phone}`}
                        style={{
                          display: 'inline-block',
                          fontSize: '12px', fontWeight: '600',
                          border: '1.5px solid #e2e8f0', color: '#475569',
                          padding: '6px 10px', borderRadius: '8px',
                          textDecoration: 'none', textAlign: 'center',
                        }}
                      >
                        📞
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
