import { Fragment, useEffect, useMemo, useRef } from "react";
import {
  Circle,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { type LeafletMouseEvent, type Marker as LeafletMarker } from "leaflet";
import type { CenterPoint, RadiusCircle } from "./App";

const CIRCLE_COLORS = ["#4dabf7", "#38d9a9", "#ffd43b", "#b197fc"];
const EARTH_RADIUS_KM = 6371;

type MapViewProps = {
  center: CenterPoint | null;
  attribution: string;
  initialCenter: CenterPoint;
  initialZoom: number;
  mapKey: string;
  radii: RadiusCircle[];
  resetKey: number;
  tileSize?: number;
  tileUrl: string;
  zoomOffset?: number;
  onCenterChange: (center: CenterPoint) => void;
};

type MapEventsProps = {
  onCenterChange: (center: CenterPoint) => void;
};

type ResetViewProps = {
  initialCenter: CenterPoint;
  initialZoom: number;
  resetKey: number;
};

const toRadians = (degree: number) => (degree * Math.PI) / 180;
const toDegrees = (radian: number) => (radian * 180) / Math.PI;
const formatRadiusLabel = (radiusKm: number) =>
  Number.isInteger(radiusKm) ? radiusKm.toString() : radiusKm.toFixed(1);

const getCircleLabelPosition = (center: CenterPoint, radiusKm: number) => {
  const angularDistance = radiusKm / EARTH_RADIUS_KM;
  const bearing = toRadians(75);
  const lat = toRadians(center.lat);
  const lng = toRadians(center.lng);

  const labelLat = Math.asin(
    Math.sin(lat) * Math.cos(angularDistance) +
      Math.cos(lat) * Math.sin(angularDistance) * Math.cos(bearing),
  );
  const labelLng =
    lng +
    Math.atan2(
      Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat),
      Math.cos(angularDistance) - Math.sin(lat) * Math.sin(labelLat),
    );

  return {
    lat: toDegrees(labelLat),
    lng: toDegrees(labelLng),
  };
};

function SyncCenter({ center }: { center: CenterPoint | null }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.panTo([center.lat, center.lng]);
    }
  }, [center, map]);

  return null;
}

function MapEvents({ onCenterChange }: MapEventsProps) {
  useMapEvents({
    click(event: LeafletMouseEvent) {
      onCenterChange({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

function ResetView({ initialCenter, initialZoom, resetKey }: ResetViewProps) {
  const map = useMap();
  const previousResetKey = useRef(resetKey);

  useEffect(() => {
    if (previousResetKey.current === resetKey) {
      return;
    }

    previousResetKey.current = resetKey;
    map.setView([initialCenter.lat, initialCenter.lng], initialZoom);
  }, [initialCenter.lat, initialCenter.lng, initialZoom, map, resetKey]);

  return null;
}

function CenterMarker({
  center,
  onCenterChange,
}: {
  center: CenterPoint;
  onCenterChange: (center: CenterPoint) => void;
}) {
  const markerRef = useRef<LeafletMarker>(null);
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "center-pin-wrapper",
        html: '<span class="center-pin"></span>',
        iconSize: [30, 42],
        iconAnchor: [15, 38],
      }),
    [],
  );

  return (
    <Marker
      draggable
      eventHandlers={{
        dragend: () => {
          const marker = markerRef.current;
          if (!marker) {
            return;
          }
          const position = marker.getLatLng();
          onCenterChange({ lat: position.lat, lng: position.lng });
        },
      }}
      icon={icon}
      position={[center.lat, center.lng]}
      ref={markerRef}
    />
  );
}

function RadiusLabel({
  center,
  color,
  radiusKm,
}: {
  center: CenterPoint;
  color: string;
  radiusKm: number;
}) {
  const position = getCircleLabelPosition(center, radiusKm);
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "radius-label-wrapper",
        html: `<span class="radius-label" style="--radius-color: ${color}">${formatRadiusLabel(
          radiusKm,
        )} km</span>`,
        iconAnchor: [28, 14],
      }),
    [color, radiusKm],
  );

  return (
    <Marker
      interactive={false}
      icon={icon}
      position={[position.lat, position.lng]}
    />
  );
}

function MapView({
  center,
  attribution,
  initialCenter,
  initialZoom,
  mapKey,
  radii,
  resetKey,
  tileSize,
  tileUrl,
  zoomOffset,
  onCenterChange,
}: MapViewProps) {
  return (
    <section className="map-section" aria-label="等距離マップ">
      <MapContainer
        center={[center?.lat ?? initialCenter.lat, center?.lng ?? initialCenter.lng]}
        className="map"
        key={mapKey}
        scrollWheelZoom
        zoom={initialZoom}
      >
        <TileLayer
          attribution={attribution}
          tileSize={tileSize}
          url={tileUrl}
          zoomOffset={zoomOffset}
        />
        <MapEvents onCenterChange={onCenterChange} />
        <SyncCenter center={center} />
        <ResetView
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          resetKey={resetKey}
        />
        {center && (
          <>
            <CenterMarker center={center} onCenterChange={onCenterChange} />
            {radii.map((circle, index) => {
              const color = CIRCLE_COLORS[index % CIRCLE_COLORS.length];
              return (
                <Fragment key={circle.id}>
                  <Circle
                    center={[center.lat, center.lng]}
                    pathOptions={{
                      color: "#ffffff",
                      fillOpacity: 0,
                      opacity: 0.95,
                      weight: 8,
                    }}
                    radius={circle.radiusKm * 1000}
                  />
                  <Circle
                    center={[center.lat, center.lng]}
                    pathOptions={{
                      color,
                      fillColor: color,
                      fillOpacity: 0.035,
                      opacity: 1,
                      weight: 4,
                    }}
                    radius={circle.radiusKm * 1000}
                  />
                  <RadiusLabel
                    center={center}
                    color={color}
                    radiusKm={circle.radiusKm}
                  />
                </Fragment>
              );
            })}
          </>
        )}
      </MapContainer>
    </section>
  );
}

export { CIRCLE_COLORS };
export default MapView;
