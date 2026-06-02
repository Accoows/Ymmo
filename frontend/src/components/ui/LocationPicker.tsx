import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number, lng: number) => void;
  height?: number | string;
}

const FRANCE_CENTER: [number, number] = [46.6, 2.5];

const goldMarker = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:50%;background:#b89a5e;border:2px solid #fafaf8;box-shadow:0 0 0 2px rgba(184,154,94,0.45)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Leaflet calcule mal sa taille s'il est monté dans un conteneur animé (modale).
function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function LocationPicker({
  latitude,
  longitude,
  onChange,
  height = 300,
}: LocationPickerProps) {
  const hasPoint = latitude != null && longitude != null;
  const center: [number, number] = hasPoint ? [latitude, longitude] : FRANCE_CENTER;

  return (
    <div
      style={{
        height,
        border: "1px solid var(--gold-border)",
        position: "relative",
        zIndex: 0,
        isolation: "isolate",
        cursor: "crosshair",
      }}
    >
      <MapContainer
        center={center}
        zoom={hasPoint ? 12 : 5}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        <InvalidateOnMount />
        {hasPoint && (
          <Marker
            position={[latitude, longitude]}
            icon={goldMarker}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                onChange(lat, lng);
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
