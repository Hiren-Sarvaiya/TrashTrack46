"use client"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/assets/images/leaflet images/marker-icon-2x.png",
  iconUrl: "/assets/images/leaflet images/marker-icon.png",
  shadowUrl: "/assets/images/leaflet images/marker-shadow.png"
})

export default function LeafletMap({ position, setPosition, onLocationSelect }) {
  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng])
        onLocationSelect && onLocationSelect(e.latlng)
      }
    })
    return position ? <Marker position={position} /> : null
  }

  return (
    <MapContainer center={position || [22.895362, 72.680152]} zoom={16} style={{ height: "320px", width: "100%" }}>
      <TileLayer
        // this lyrs=m means normal map and s for satellite
        url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
        subdomains={["mt0", "mt1", "mt2", "mt3"]}
      />
      <LocationMarker />
    </MapContainer>
  )
}