import type { CenterPoint, RadiusCircle } from "./App";
import { CIRCLE_COLORS } from "./MapView";
import PresetButtons from "./PresetButtons";
import RadiusInputList from "./RadiusInputList";

type ControlPanelProps = {
  center: CenterPoint | null;
  radii: RadiusCircle[];
  geoError: string;
  mapDescription: string;
  mapTitle: string;
  onAddRadius: () => void;
  onBackToModeSelect: () => void;
  onDeleteRadius: (id: string) => void;
  onLocateUser: () => void;
  onPresetSelect: (radii: number[]) => void;
  onRadiusChange: (id: string, radiusKm: number) => void;
  onReset: () => void;
};

const formatCoordinate = (value: number) => value.toFixed(6);

function ControlPanel({
  center,
  radii,
  geoError,
  mapDescription,
  mapTitle,
  onAddRadius,
  onBackToModeSelect,
  onDeleteRadius,
  onLocateUser,
  onPresetSelect,
  onRadiusChange,
  onReset,
}: ControlPanelProps) {
  const drawableRadii = radii.filter(
    (circle) =>
      Number.isFinite(circle.radiusKm) &&
      circle.radiusKm > 0 &&
      circle.radiusKm <= 1000,
  );

  return (
    <aside className="control-panel" aria-label="操作パネル">
      <div className="panel-header">
        <p className="eyebrow">Travel distance playground</p>
        <h1>等距離マップ</h1>
        <div className="map-mode-badge">
          <span>{mapTitle}</span>
          <button type="button" onClick={onBackToModeSelect}>
            選び直す
          </button>
        </div>
        <p className="mode-description">{mapDescription}</p>
      </div>

      <section className="panel-section">
        <h2>中心地点</h2>
        <div className="coordinate-box">
          <div>
            <span>緯度</span>
            <strong>{center ? formatCoordinate(center.lat) : "未設定"}</strong>
          </div>
          <div>
            <span>経度</span>
            <strong>{center ? formatCoordinate(center.lng) : "未設定"}</strong>
          </div>
        </div>
      </section>

      <section className="panel-section">
        <div className="section-heading">
          <h2>半径</h2>
          <button className="secondary-button compact" onClick={onAddRadius} type="button">
            追加
          </button>
        </div>
        <RadiusInputList
          colors={CIRCLE_COLORS}
          radii={radii}
          onDeleteRadius={onDeleteRadius}
          onRadiusChange={onRadiusChange}
        />
      </section>

      <section className="panel-section">
        <h2>プリセット</h2>
        <PresetButtons onPresetSelect={onPresetSelect} />
      </section>

      <section className="panel-section">
        <h2>凡例</h2>
        {drawableRadii.length > 0 ? (
          <ul className="legend-list">
            {drawableRadii.map((circle, index) => (
              <li key={circle.id}>
                <span
                  className="legend-color"
                  style={{ backgroundColor: CIRCLE_COLORS[index % CIRCLE_COLORS.length] }}
                />
                <span>{circle.radiusKm} km</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">有効な半径がありません。</p>
        )}
      </section>

      <div className="action-row">
        <button className="primary-button" onClick={onLocateUser} type="button">
          現在地を中心にする
        </button>
        <button className="secondary-button" onClick={onReset} type="button">
          リセット
        </button>
      </div>

      {geoError && <p className="error-message">{geoError}</p>}

      <p className="note">
        表示される円は直線距離の目安です。実際の道路距離や移動時間とは異なります。
      </p>
    </aside>
  );
}

export default ControlPanel;
