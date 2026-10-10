/**
 * A picture through a noisy matrix multiplier, for the honours-thesis visual.
 *
 * Photonic matrix multiplication is analog: every product w*x comes out with a
 * small relative error. Here a channel is cut into 8x8 blocks and put through
 * a 2-D DCT (two real matrix multiplies) in which every individual product
 * carries that error, then transformed back digitally. The error is therefore
 * signal-dependent and blocky, as it is in hardware, not plain pixel grain.
 *
 * To first order the error is linear in the noise strength, so the error image
 * for unit strength is computed once and then scaled: moving a slider costs one
 * multiply per pixel. Pure functions, no DOM.
 */
export const BLOCK = 8;
/** Share of the baseline error that is left after the thesis's best correction (95.5% reduction). */
export const RESIDUAL = 1 - 0.955;

export function dctMatrix(n = BLOCK) {
  return Array.from({ length: n }, (_, k) =>
    Array.from({ length: n }, (_, i) => Math.sqrt((k === 0 ? 1 : 2) / n) * Math.cos(((2 * i + 1) * k * Math.PI) / (2 * n))),
  );
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Standard normal sample from a uniform generator (Box-Muller). */
export function gaussian(random) {
  const u = Math.max(random(), 1e-12);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

const D = dctMatrix();

/**
 * Unit-strength error image for one channel (values 0..1, row-major,
 * width/height multiples of 8). Add `strength * error` to the channel to get
 * the noisy result.
 */
export function unitError(channel, width, height, seed = 1) {
  const random = mulberry32(seed);
  const error = new Float32Array(width * height);
  const X = new Float64Array(BLOCK * BLOCK);
  const T = new Float64Array(BLOCK * BLOCK);
  const dT = new Float64Array(BLOCK * BLOCK);
  const dY = new Float64Array(BLOCK * BLOCK);

  for (let by = 0; by < height; by += BLOCK) {
    for (let bx = 0; bx < width; bx += BLOCK) {
      for (let i = 0; i < BLOCK; i += 1) for (let j = 0; j < BLOCK; j += 1) X[i * BLOCK + j] = channel[(by + i) * width + bx + j];

      // Pass 1: T = D X, with an error on every product D[k][i] * X[i][j].
      for (let k = 0; k < BLOCK; k += 1) {
        for (let j = 0; j < BLOCK; j += 1) {
          let sum = 0;
          let noise = 0;
          for (let i = 0; i < BLOCK; i += 1) {
            const product = D[k][i] * X[i * BLOCK + j];
            sum += product;
            noise += product * gaussian(random);
          }
          T[k * BLOCK + j] = sum;
          dT[k * BLOCK + j] = noise;
        }
      }
      // Pass 2: Y = T D^T. Pass-1 error carries through; each product adds its own.
      for (let k = 0; k < BLOCK; k += 1) {
        for (let l = 0; l < BLOCK; l += 1) {
          let carried = 0;
          let fresh = 0;
          for (let j = 0; j < BLOCK; j += 1) {
            carried += dT[k * BLOCK + j] * D[l][j];
            fresh += T[k * BLOCK + j] * D[l][j] * gaussian(random);
          }
          dY[k * BLOCK + l] = carried + fresh;
        }
      }
      // Back to pixels (digital, exact): e = D^T dY D.
      for (let i = 0; i < BLOCK; i += 1) {
        for (let j = 0; j < BLOCK; j += 1) {
          let sum = 0;
          for (let k = 0; k < BLOCK; k += 1) for (let l = 0; l < BLOCK; l += 1) sum += D[k][i] * dY[k * BLOCK + l] * D[l][j];
          error[(by + i) * width + bx + j] = sum;
        }
      }
    }
  }
  return error;
}

/** Relative error per product at slider value `sigma` (the thesis compares at 22). */
export function strengthFor(sigma) {
  return sigma / 110;
}

/** Noisy channel value, clamped to 0..1. */
export function applyError(clean, error, strength, out = new Float32Array(clean.length)) {
  for (let i = 0; i < clean.length; i += 1) out[i] = Math.min(1, Math.max(0, clean[i] + strength * error[i]));
  return out;
}

/** Mean absolute difference between two same-length arrays. */
export function meanAbsoluteError(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += Math.abs(a[i] - b[i]);
  return sum / a.length;
}
