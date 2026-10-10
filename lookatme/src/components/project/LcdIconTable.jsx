import { ICONS } from "@/lib/smartwatch";

const MEANING = {
  heart: "Heart rate",
  steps: "Step count",
  floors: "Floors climbed",
  o2: "Blood oxygen",
  battery: "Battery",
  dnd: "Do not disturb",
  flashlight: "Flashlight",
};

/** The seven custom 5×8 characters stored in the LCD's CGRAM, dot for dot. */
export function LcdIconTable() {
  return (
    <figure className="cs-figure" data-reveal>
      <div className="lit">
        {Object.entries(MEANING).map(([id, label]) => (
          <div key={id} className="lit-item">
            <svg viewBox="0 0 5 8" aria-hidden="true">
              {ICONS[id].flatMap((row, r) =>
                [...row].map((bit, c) => <rect key={`${r}-${c}`} className={bit === "1" ? "lit-on" : "lit-off"} x={c + 0.08} y={r + 0.08} width="0.84" height="0.84" />)
              )}
            </svg>
            <span>{label}</span>
          </div>
        ))}
      </div>
      <figcaption className="cs-figcaption">
        <span>The LCD stores up to eight user-defined characters in CGRAM; the watch uses seven. Sampled pixel by pixel from the user guide.</span>
        <span className="al-mono">5×8 CGRAM</span>
      </figcaption>
    </figure>
  );
}
