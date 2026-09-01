'use client'
import { useEffect, useRef } from 'react'

export default function MapView({ violations }: { violations: any[] }) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstance = useRef<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return

    const leafletCss = document.createElement('link')
    leafletCss.rel = 'stylesheet'
    leafletCss.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(leafletCss)

    const script = document.createElement('script')
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
    script.onload = () => {
      // @ts-ignore
      const L = window.L

      const map = L.map(mapRef.current).setView([-1.286, 36.817], 7)
      mapInstance.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map)

      const statusColor = (status: string) =>
        status === 'confirmed' ? 'green' : status === 'dismissed' ? 'gray' : 'orange'

      violations.forEach((v) => {
        const marker = L.circleMarker([v.latitude, v.longitude], {
          radius: 8,
          fillColor: statusColor(v.status),
          color: '#fff',
          weight: 2,
          fillOpacity: 0.9
        }).addTo(map)

        marker.bindPopup(
          `<strong>${v.violation_type?.replace('_', ' ')}</strong><br/>${v.location}<br/>Plate: ${v.plate_text || 'N/A'}<br/>Status: ${v.status}`
        )
      })
    }
    document.body.appendChild(script)

  }, [violations])

  return (
    <div
      ref={mapRef}
      style={{ height: '500px', width: '100%', borderRadius: '8px' }}
      className="border"
    />
  )
}
