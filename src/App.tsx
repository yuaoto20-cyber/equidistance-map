import { useEffect, useMemo, useRef, useState } from "react";
import ControlPanel from "./ControlPanel";
import MapView from "./MapView";

export type CenterPoint = {
  lat: number;
  lng: number;
};

export type RadiusCircle = {
  id: string;
  radiusKm: number;
};

const JAPAN_CENTER: CenterPoint = { lat: 36.2048, lng: 138.2529 };
const INITIAL_ZOOM = 5;
const INITIAL_RADII = [10, 25, 50, 100];

const createRadius = (radiusKm: number): RadiusCircle => ({
  id: crypto.randomUUID(),
  radiusKm,
});

const isValidRadius = (radiusKm: number) =>
  Number.isFinite(radiusKm) && radiusKm > 0 && radiusKm <= 1000;

const parseQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const center =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;

  const radiusParam = params.get("r");
  const radii = radiusParam
    ?.split(",")
    .map((value) => Number(value.trim()))
    .filter(isValidRadius);

  return {
    center,
    radii: radii && radii.length > 0 ? radii.map(createRadius) : null,
  };
};

const formatNumber = (value: number) =>
  Number.parseFloat(value.toFixed(6)).toString();

function App() {
  const initialQuery = useMemo(parseQuery, []);
  const [center, setCenter] = useState<CenterPoint | null>(initialQuery.center);
  const [radii, setRadii] = useState<RadiusCircle[]>(
    initialQuery.radii ?? INITIAL_RADII.map(createRadius),
  );
  const [mapResetKey, setMapResetKey] = useState(0);
  const [geoError, setGeoError] = useState("");
  const hasInitializedUrl = useRef(false);

  const drawableRadii = useMemo(
    () => radii.filter((circle) => isValidRadius(circle.radiusKm)),
    [radii],
  );

  useEffect(() => {
    const params = new URLSearchParams();

    if (center) {
      params.set("lat", formatNumber(center.lat));
      params.set("lng", formatNumber(center.lng));
    }

    if (drawableRadii.length > 0) {
      params.set(
        "r",
        drawableRadii.map((circle) => formatNumber(circle.radiusKm)).join(","),
      );
    }

    const nextUrl = `${window.location.pathname}${
      params.toString() ? `?${params}` : ""
    }`;

    if (hasInitializedUrl.current || window.location.search) {
      window.history.replaceState(null, "", nextUrl);
    }
    hasInitializedUrl.current = true;
  }, [center, drawableRadii]);

  const updateRadius = (id: string, radiusKm: number) => {
    setRadii((current) =>
      current.map((circle) =>
        circle.id === id ? { ...circle, radiusKm } : circle,
      ),
    );
  };

  const addRadius = () => {
    setRadii((current) => [...current, createRadius(10)]);
  };

  const deleteRadius = (id: string) => {
    setRadii((current) => current.filter((circle) => circle.id !== id));
  };

  const applyPreset = (presetRadii: number[]) => {
    setRadii(presetRadii.map(createRadius));
  };

  const locateUser = () => {
    setGeoError("");

    if (!navigator.geolocation) {
      setGeoError("このブラウザでは現在地を取得できません。");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setGeoError(
          "現在地を取得できませんでした。ブラウザや端末の位置情報設定を確認してください。",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  const reset = () => {
    setCenter(null);
    setRadii(INITIAL_RADII.map(createRadius));
    setGeoError("");
    setMapResetKey((key) => key + 1);
  };

  return (
    <div className="app-shell">
      <main className="app-layout">
        <MapView
          center={center}
          initialCenter={JAPAN_CENTER}
          initialZoom={INITIAL_ZOOM}
          radii={drawableRadii}
          resetKey={mapResetKey}
          onCenterChange={setCenter}
        />
        <ControlPanel
          center={center}
          radii={radii}
          geoError={geoError}
          onAddRadius={addRadius}
          onDeleteRadius={deleteRadius}
          onLocateUser={locateUser}
          onPresetSelect={applyPreset}
          onRadiusChange={updateRadius}
          onReset={reset}
        />
      </main>
    </div>
  );
}

export default App;
