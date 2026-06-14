import type { RadiusCircle } from "./App";

type RadiusInputListProps = {
  colors: string[];
  radii: RadiusCircle[];
  onDeleteRadius: (id: string) => void;
  onRadiusChange: (id: string, radiusKm: number) => void;
};

function RadiusInputList({
  colors,
  radii,
  onDeleteRadius,
  onRadiusChange,
}: RadiusInputListProps) {
  return (
    <div className="radius-list">
      {radii.map((circle, index) => {
        const isInvalid =
          !Number.isFinite(circle.radiusKm) ||
          circle.radiusKm <= 0 ||
          circle.radiusKm > 1000;

        return (
          <label className="radius-item" key={circle.id}>
            <span
              className="radius-color"
              style={{ backgroundColor: colors[index % colors.length] }}
              aria-hidden="true"
            />
            <span className="sr-only">半径</span>
            <input
              aria-invalid={isInvalid}
              inputMode="decimal"
              min="0"
              max="1000"
              step="0.1"
              type="number"
              value={Number.isNaN(circle.radiusKm) ? "" : circle.radiusKm}
              onChange={(event) =>
                onRadiusChange(
                  circle.id,
                  event.target.value === "" ? Number.NaN : Number(event.target.value),
                )
              }
            />
            <span className="unit">km</span>
            <button
              aria-label="半径を削除"
              className="delete-button"
              onClick={() => onDeleteRadius(circle.id)}
              type="button"
            >
              削除
            </button>
          </label>
        );
      })}
    </div>
  );
}

export default RadiusInputList;
