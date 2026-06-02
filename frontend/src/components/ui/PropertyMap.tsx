import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import L from "leaflet";

export interface MapPoint {
  id: string;
  title: string;
  location: string;
  latitude: number;
  longitude: number;
  priceLabel?: string;
  href?: string;
}

interface PropertyMapProps {
  points: MapPoint[];
  height?: number | string;
  /** Niveau de zoom utilisé lorsqu'il n'y a qu'un seul point. */
  singleZoom?: number;
  scrollWheelZoom?: boolean;
  className?: string;
}

const FRANCE_CENTER: [number, number] = [46.6, 2.5];

// Marqueur doré custom (évite le bug d'icône par défaut de Leaflet avec les bundlers).
const goldMarker = L.divIcon({
  className: "",
  html: `<span style="display:block;width:16px;height:16px;border-radius:50%;background:#b89a5e;border:2px solid #fafaf8;box-shadow:0 0 0 2px rgba(184,154,94,0.35)"></span>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -10],
});

function FitBounds({ points, singleZoom }: { points: MapPoint[]; singleZoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], singleZoom);
    } else {
      const bounds = L.latLngBounds(
        points.map((p) => [p.latitude, p.longitude] as [number, number])
      );
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map, singleZoom]);
  return null;
}

export default function PropertyMap({
  points,
  height = 400,
  singleZoom = 11,
  scrollWheelZoom = false,
  className = "",
}: PropertyMapProps) {
  if (points.length === 0) {
    return (
      <div
        className={`flex items-center justify-center border bg-stone/5 ${className}`}
        style={{ height, borderColor: "var(--gold-border)" }}
      >
        <p className="text-label text-stone">Localisation indisponible</p>
      </div>
    );
  }

  const center: [number, number] =
    points.length === 1
      ? [points[0].latitude, points[0].longitude]
      : FRANCE_CENTER;

  return (
    <div
      className={className}
      // position + z-index + isolation : confine les z-index internes de Leaflet
      // (panes/contrôles montent jusqu'à ~1000) sous la navbar et les modales (z-50).
      style={{
        height,
        border: "1px solid var(--gold-border)",
        position: "relative",
        zIndex: 0,
        isolation: "isolate",
      }}
    >
      <MapContainer
        center={center}
        zoom={points.length === 1 ? singleZoom : 6}
        scrollWheelZoom={scrollWheelZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} singleZoom={singleZoom} />
        {points.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={goldMarker}>
            <Popup>
              <div style={{ minWidth: 160 }}>
                <strong style={{ fontSize: 13 }}>{p.title}</strong>
                <div style={{ color: "#8c8680", fontSize: 12, margin: "2px 0 6px" }}>
                  {p.location}
                </div>
                {p.priceLabel && (
                  <div style={{ color: "#b89a5e", fontWeight: 600, fontSize: 13 }}>
                    {p.priceLabel}
                  </div>
                )}
                {p.href && (
                  <Link
                    to={p.href}
                    style={{ color: "#b89a5e", fontSize: 12, textDecoration: "underline" }}
                  >
                    Voir la fiche →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
