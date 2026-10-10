import { EVENT, GUESTS } from "@/lib/wya";

/**
 * Library card for wya: a tiny event page in its After dark theme. Guests join
 * one by one, the count ticks up, then "I'm in" is pressed and confetti pops,
 * which is what the app does when you RSVP yes. Loops every few seconds.
 */
const PERIOD = 7;
const JOIN = [0.1, 0.22, 0.34]; // when each guest's avatar lands
const PRESS = 0.5; // when "I'm in" is pressed
const OUT = 0.9; // everything resets

const pct = (f) => `${(f * 100).toFixed(1)}%`;
const show = (on, off = OUT) => `0%,${pct(on - 0.001)}{opacity:0}${pct(on)},${pct(off)}{opacity:1}${pct(off + 0.04)},100%{opacity:0}`;

const PEOPLE = [...GUESTS.slice(0, 3), { name: "You", color: "#3ce08a" }];
const STARTS = [...JOIN, PRESS];

export function WyaCard() {
  const t = EVENT.theme;
  const css =
    PEOPLE.map((_, i) => `@keyframes wy-a${i}{0%,${pct(STARTS[i] - 0.001)}{opacity:0;transform:translateY(-6px) scale(.6)}${pct(STARTS[i] + 0.05)},${pct(OUT)}{opacity:1;transform:none}${pct(OUT + 0.04)},100%{opacity:0;transform:none}}`).join("") +
    PEOPLE.map((_, i) => `@keyframes wy-n${i}{${show(STARTS[i], i < 3 ? STARTS[i + 1] - 0.001 : OUT)}}`).join("") +
    `@keyframes wy-press{0%,${pct(PRESS - 0.02)}{transform:none}${pct(PRESS)}{transform:translate(1.5px,1.5px)}${pct(PRESS + 0.03)},100%{transform:none}}` +
    `@keyframes wy-fill{0%,${pct(PRESS - 0.001)}{opacity:0}${pct(PRESS)},${pct(OUT)}{opacity:1}${pct(OUT + 0.04)},100%{opacity:0}}` +
    `@keyframes wy-pop{0%,${pct(PRESS)}{opacity:0;transform:translate(0,0)}${pct(PRESS + 0.01)}{opacity:1}${pct(PRESS + 0.16)}{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(160deg)}100%{opacity:0}}` +
    PEOPLE.map((_, i) => `.pv-wya .wy-a${i}{animation:wy-a${i} ${PERIOD}s var(--ease-out) infinite;transform-box:fill-box;transform-origin:center}.pv-wya .wy-n${i}{animation:wy-n${i} ${PERIOD}s steps(1) infinite}`).join("") +
    `.pv-wya .wy-btn{animation:wy-press ${PERIOD}s linear infinite}` +
    `.pv-wya .wy-fill{animation:wy-fill ${PERIOD}s steps(1) infinite}` +
    `.pv-wya .wy-bit{animation:wy-pop ${PERIOD}s var(--ease-out) infinite;transform-box:fill-box;transform-origin:center}`;

  const bits = Array.from({ length: 10 }, (_, i) => {
    const a = (i / 10) * Math.PI * 2;
    return { dx: (Math.cos(a) * 30).toFixed(1), dy: (Math.sin(a) * 18 - 8).toFixed(1), c: ["#d4ff3f", "#ff3cac", "#8b5cff", "#3cc8ff", "#ffb13c"][i % 5] };
  });

  return (
    <svg viewBox="0 0 240 150" className="pv pv-wya">
      <style>{css}</style>
      <defs>
        <clipPath id="wy-cover">
          <rect x="66" y="8" width="108" height="48" rx="10" />
        </clipPath>
      </defs>

      {/* card */}
            <rect x="66" y="8" width="108" height="132" rx="12" fill="#15151c" stroke="#2a2a36" strokeWidth="1" />
      <g clipPath="url(#wy-cover)">
        <rect x="66" y="8" width="108" height="48" fill={t.base} />
        <circle cx="160" cy="6" r="34" fill={t.shape} />
        <circle cx="84" cy="56" r="12" fill={t.shape} />
        <text x="120" y="47" textAnchor="middle" className="wy-initial" fill={t.ink} transform="rotate(-6 120 36)">
          R
        </text>
      </g>
            <g transform="rotate(-4 88 52)">
        <rect x="72" y="46" width="38" height="11" rx="5.5" fill="#d4ff3f" />
        <text x="91" y="54" textAnchor="middle" className="wy-sticker">
          SAT · 8 PM
        </text>
      </g>

      <text x="74" y="70" className="wy-kicker">
        HANNAH IS HOSTING
      </text>
      <text x="74" y="83" className="wy-title">
        Rooftop Night
      </text>

      {/* who's going */}
      {PEOPLE.map((p, i) => (
        <g key={p.name} className={`wy-a${i}`}>
          <circle cx={81 + i * 11} cy="96" r="6.5" fill={p.color} stroke="#15151c" strokeWidth="1.4" />
          <text x={81 + i * 11} y="98.6" textAnchor="middle" className="wy-av">
            {p.name[0]}
          </text>
        </g>
      ))}
      {PEOPLE.map((_, i) => (
        <text key={i} x="126" y="99" className={`wy-count wy-n${i}`}>
          {i + 1} going
        </text>
      ))}

      {/* RSVP */}
      <g className="wy-btn">
        <rect x="74" y="110" width="92" height="20" rx="10" fill="#1f1f29" stroke="#2a2a36" strokeWidth="1" />
        <rect className="wy-fill" x="74" y="110" width="92" height="20" rx="10" fill="#3ce08a" />
        <text x="120" y="123.5" textAnchor="middle" className="wy-cta">
          I’m in
        </text>
        <text x="120" y="123.5" textAnchor="middle" className="wy-cta wy-cta-on wy-fill">
          I’m in
        </text>
      </g>
      {bits.map((b, i) => (
        <rect key={i} className="wy-bit" x="118" y="116" width="3.5" height="5.5" rx="1" fill={b.c} style={{ "--dx": `${b.dx}px`, "--dy": `${b.dy}px` }} />
      ))}

      {/* floating stickers, as on the site */}
      <g transform="rotate(-10 34 42)">
        <rect x="12" y="34" width="44" height="15" rx="7.5" fill="#d4ff3f" />
        <text x="34" y="44.5" textAnchor="middle" className="wy-tag">
          I’m in!
        </text>
      </g>
      <g transform="rotate(8 206 100)">
        <rect x="182" y="92" width="50" height="15" rx="7.5" fill="#ff3cac" />
        <text x="207" y="102.5" textAnchor="middle" className="wy-tag">
          No flakes
        </text>
      </g>
    </svg>
  );
}
