import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Trochoid {
  R: number;   // outer radius
  r: number;   // inner radius
  d: number;   // pen distance
  hue: number;
  t: number;
}

let curves: Trochoid[] = [];
let totalSteps: number;
let step: number;

const PASTEL_HUES = [0, 40, 80, 150, 200, 260, 300, 330];

export const spirograph: Algorithm = {
  name: 'Spirograph',
  description: 'Epitrochoid curves — interlocking gear paths in rainbow pastels',
  palette: { background: '#0d0d2b', colors: ['#ffccee', '#ccffee', '#eeccff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    step = 0;

    curves = [];
    const count = 3 + Math.floor(p.random(4));
    const maxR = Math.min(w, h) * 0.42;

    for (let i = 0; i < count; i++) {
      const hue = PASTEL_HUES[Math.floor(p.random(PASTEL_HUES.length))];
      // Gear ratios produce interesting patterns when R/r is rational
      const ratioNumer = Math.floor(p.random(2, 9));
      const ratioDenom = Math.floor(p.random(1, ratioNumer));
      const R = maxR * p.random(0.4, 0.9);
      const r = (R * ratioDenom) / ratioNumer;
      const d = r * p.random(0.3, 1.2);
      curves.push({ R, r, d, hue: (hue + i * 37) % 360, t: 0 });
    }

    // Steps needed to complete full cycle = LCM-ish heuristic
    totalSteps = 1200;
    p.background(240, 60, 11);
  },

  draw(p: p5) {
    if (step >= totalSteps) { p.noLoop(); return; }

    const cx = w / 2;
    const cy = h / 2;
    const batchSize = 8;

    for (let b = 0; b < batchSize && step < totalSteps; b++) {
      const tNorm = (step / totalSteps) * p.TWO_PI * 30;

      for (const curve of curves) {
        const t = tNorm;
        const gap = curve.R - curve.r;

        // Epitrochoid formula
        const x = cx + gap * Math.cos(t) + curve.d * Math.cos((gap / curve.r) * t);
        const y = cy + gap * Math.sin(t) - curve.d * Math.sin((gap / curve.r) * t);

        const alpha = 40 + 20 * Math.sin(step * 0.02);
        p.noStroke();
        p.fill(curve.hue, 55, 95, alpha);
        p.ellipse(x, y, 1.5, 1.5);

        curve.t = t;
      }
      step++;
    }
  },

  resize(p: p5, width: number, height: number) {
    spirograph.setup(p, currentSeed, width, height);
    p.loop();
  },
};
