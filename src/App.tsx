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

type MapMode = "japan" | "world";

type MapConfig = {
  title: string;
  description: string;
  initialCenter: CenterPoint;
  initialZoom: number;
  tileSize?: number;
  tileUrl: string;
  zoomOffset?: number;
  attribution: string;
};

const JAPAN_CENTER: CenterPoint = { lat: 36.2048, lng: 138.2529 };
const WORLD_CENTER: CenterPoint = { lat: 20, lng: 0 };
const INITIAL_RADII = [10, 25, 50, 100];

const MAP_CONFIGS: Record<MapMode, MapConfig> = {
  japan: {
    title: "日本版",
    description: "国土地理院の標準地図で、日本周辺の距離感を詳しく見ます。",
    initialCenter: JAPAN_CENTER,
    initialZoom: 5,
    tileUrl: "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png",
    attribution:
      '地図出典：<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noreferrer">国土地理院</a>',
  },
  world: {
    title: "世界版",
    description:
      "日本語ラベルの世界地図で、都市間や国をまたぐ直線距離をざっくり比べます。",
    initialCenter: WORLD_CENTER,
    initialZoom: 2,
    tileSize: 512,
    tileUrl: "https://tile.openstreetmap.jp/styles/maptiler-basic-ja/512/{z}/{x}/{y}.png",
    zoomOffset: -1,
    attribution:
      '&copy; <a href="https://openmaptiles.org/" target="_blank" rel="noreferrer">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
  },
};

const createId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `radius-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const createRadius = (radiusKm: number): RadiusCircle => ({
  id: createId(),
  radiusKm,
});

const isValidRadius = (radiusKm: number) =>
  Number.isFinite(radiusKm) && radiusKm > 0 && radiusKm <= 1000;

const parseQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const mapParam = params.get("map");
  const mapMode =
    mapParam === "japan" || mapParam === "world" ? mapParam : null;
  const lat = Number(params.get("lat"));
  const lng = Number(params.get("lng"));
  const center =
    Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;

  const radiusParam = params.get("r");
  const radii = radiusParam
    ?.split(",")
    .map((value) => Number(value.trim()))
    .filter(isValidRadius);
  const inferredMapMode: MapMode | null =
    mapMode ?? (center || radiusParam ? "japan" : null);

  return {
    center,
    mapMode: inferredMapMode,
    radii: radii && radii.length > 0 ? radii.map(createRadius) : null,
  };
};

const formatNumber = (value: number) =>
  Number.parseFloat(value.toFixed(6)).toString();

function App() {
  const initialQuery = useMemo(parseQuery, []);
  const [selectedMode, setSelectedMode] = useState<MapMode | null>(
    initialQuery.mapMode,
  );
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

    if (selectedMode) {
      params.set("map", selectedMode);
    }

    if (selectedMode && center) {
      params.set("lat", formatNumber(center.lat));
      params.set("lng", formatNumber(center.lng));
    }

    if (selectedMode && drawableRadii.length > 0) {
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
  }, [center, drawableRadii, selectedMode]);

  const selectMode = (mode: MapMode) => {
    setSelectedMode(mode);
    setCenter(null);
    setRadii(INITIAL_RADII.map(createRadius));
    setGeoError("");
    setMapResetKey((key) => key + 1);
  };

  const backToModeSelect = () => {
    setSelectedMode(null);
    setCenter(null);
    setGeoError("");
  };

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

  if (!selectedMode) {
    return (
      <div className="app-shell mode-shell">
        <main className="mode-picker" aria-labelledby="mode-picker-title">
          <p className="eyebrow">Choose your map</p>
          <h1 id="mode-picker-title">等距離マップ</h1>
          <p className="mode-lead">
            中心地点を選んで、指定半径の同心円を地図上に表示します。
          </p>
          <div className="mode-card-grid">
            {(Object.entries(MAP_CONFIGS) as [MapMode, MapConfig][]).map(
              ([mode, config]) => (
                <button
                  className="mode-card"
                  key={mode}
                  onClick={() => selectMode(mode)}
                  type="button"
                >
                  <span>{config.title}</span>
                  <strong>
                    {mode === "japan" ? "日本地図で見る" : "世界地図で見る"}
                  </strong>
                  <small>{config.description}</small>
                </button>
              ),
            )}
          </div>
        </main>
      </div>
    );
  }

  const mapConfig = MAP_CONFIGS[selectedMode];

  return (
    <div className="app-shell">
      <main className="app-layout">
        <MapView
          center={center}
          attribution={mapConfig.attribution}
          initialCenter={mapConfig.initialCenter}
          initialZoom={mapConfig.initialZoom}
          mapKey={selectedMode}
          radii={drawableRadii}
          resetKey={mapResetKey}
          tileSize={mapConfig.tileSize}
          tileUrl={mapConfig.tileUrl}
          zoomOffset={mapConfig.zoomOffset}
          onCenterChange={setCenter}
        />
        <ControlPanel
          center={center}
          radii={radii}
          geoError={geoError}
          mapDescription={mapConfig.description}
          mapTitle={mapConfig.title}
          onAddRadius={addRadius}
          onBackToModeSelect={backToModeSelect}
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
