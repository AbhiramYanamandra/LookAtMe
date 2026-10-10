/**
 * The COMP3601 clap sensor's real parameters, from the team's VHDL
 * (i2s_master.vhd, audio_pipeline.vhd) and PYNQ notebook (clap_sensor.ipynb),
 * plus a synthetic test signal for the visuals: the project kept no recording.
 */
export const CLOCK_HZ = 100e6;
export const BCLK_DIV = 25; // BCLK toggles every 25 clocks: 100 MHz / 50 = 2 MHz
export const BCLK_HZ = CLOCK_HZ / (2 * BCLK_DIV);
export const BITS_PER_CHANNEL = 32;
export const SAMPLE_HZ = BCLK_HZ / (2 * BITS_PER_CHANNEL); // 31,250
export const PCM_BITS = 18;
export const PACKET = 4096; // TLAST every 4,096 samples (was 1,024 before the fix)
export const PACKET_MS = (PACKET / SAMPLE_HZ) * 1000; // ≈ 131 ms
export const THRESHOLD = 10000; // |sample| in the notebook's 16-bit view
export const FULL_SCALE = 32768;

/** Small deterministic PRNG so the server and client draw the same signal. */
function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * A synthetic room recording, `windows` packets long, as `pointsPerWindow`
 * amplitude samples per packet (int16 scale). Events: [window, kind, peak].
 * Background noise, a few loud non-clap sounds (talking, music, a knock),
 * and claps — sharp attack, fast ringing decay.
 */
export function makeSignal({ windows, pointsPerWindow, events, seed = 7, noise = 900 }) {
  const rand = rng(seed);
  const n = windows * pointsPerWindow;
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = (rand() * 2 - 1) * noise * (0.6 + 0.4 * Math.sin(i * 0.013));
  for (const [w, kind, peak] of events) {
    const start = Math.round((w + 0.25 + rand() * 0.4) * pointsPerWindow);
    if (kind === "clap") {
      for (let k = 0; k < pointsPerWindow * 0.45; k++) {
        const env = peak * Math.exp(-k / (pointsPerWindow * 0.06));
        out[start + k] += env * Math.sin(k * 1.9 + rand() * 0.6) * (k === 0 ? 1 : 0.85 + rand() * 0.3);
      }
    } else {
      // A swell: talking, music or a knock — loud, but rounded rather than sharp.
      const len = kind === "knock" ? pointsPerWindow * 0.25 : pointsPerWindow * 1.4;
      for (let k = 0; k < len; k++) {
        const env = peak * Math.sin((Math.PI * k) / len) ** (kind === "knock" ? 0.5 : 2);
        out[start + k] += env * Math.sin(k * 0.9 + rand()) * (0.7 + rand() * 0.3);
      }
    }
  }
  for (let i = 0; i < n; i++) out[i] = Math.max(-FULL_SCALE, Math.min(FULL_SCALE - 1, out[i]));
  return out;
}

/** Peak |sample| per packet: exactly what np.any(np.abs(pcm16) > T) tests. */
export function windowPeaks(signal, pointsPerWindow) {
  const peaks = [];
  for (let i = 0; i < signal.length; i += pointsPerWindow) {
    let m = 0;
    for (let k = i; k < i + pointsPerWindow && k < signal.length; k++) m = Math.max(m, Math.abs(signal[k]));
    peaks.push(m);
  }
  return peaks;
}

/** The figure's signal: 24 packets (~3.1 s) of a noisy room. */
export const DETECTOR_EVENTS = [
  [2, "talk", 4200],
  [4, "clap", 30000],
  [7, "music", 7800],
  [9, "knock", 8800],
  [12, "clap", 27000],
  [15, "talk", 5600],
  [17, "clap", 20500],
  [20, "music", 9300],
  [22, "clap", 32000],
];
