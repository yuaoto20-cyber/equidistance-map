type PresetButtonsProps = {
  onPresetSelect: (radii: number[]) => void;
};

const PRESETS = [
  { label: "近場", radii: [1, 3, 5, 10] },
  { label: "街歩き", radii: [5, 10, 20, 30] },
  { label: "日帰り旅行", radii: [25, 50, 75, 100] },
  { label: "広域", radii: [50, 100, 200, 300] },
];

function PresetButtons({ onPresetSelect }: PresetButtonsProps) {
  return (
    <div className="preset-grid">
      {PRESETS.map((preset) => (
        <button
          className="preset-button"
          key={preset.label}
          onClick={() => onPresetSelect(preset.radii)}
          type="button"
        >
          <strong>{preset.label}</strong>
          <span>{preset.radii.join(" / ")} km</span>
        </button>
      ))}
    </div>
  );
}

export default PresetButtons;
