import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let t = 0;
const MAX_T = 5000;

interface Curve {
  ax: number; ay: number;
  fx: number; fy: number;
  px: number; py: number;
  decay: number;
  color: number[];
}

let curves: Curve[] = [];

const METALS = [
  [205, 150, 100], // copper
  [192, 192, 210], // silver
  [180, 160, 90],  // brass
  [220, 180, 130], // rose gold
];

export const weave: Algorithm = {
  name: 'Weave',
  description: 'Lissajous curves — harmonograph patterns in metallic threads',
  palette: { background: '#1a1a1a', colors: ['#cd9664', '#c0c0d2', '#b4a05a'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    t = 0;

    curves = [];
    const count = 3 + Math.floor(p.random(3));
    for (let i = 0; i < count; i++) {
      curves.push({
        ax: p.random(0.3, 0.45) * Math.min(w, h),
        ay: p.random(0.3, 0.45) * Math.min(w, h),
        fx: Math.floor(p.random(1, 6)),
        fy: Math.floor(p.random(1, 6)),
        px: p.random(p.TWO_PI),
        py: p.random(p.TWO_PI),
        decay: p.random(0.0001, 0.0005),
        color: METALS[i % METALS.length],
      });
    }

    p.background(26, 26, 26);
  },

  draw(p: p5) {
    if (t >= MAX_T) { p.noLoop(); return; }

    const cx = w / 2, cy = h / 2;
    const batchSize = 20;

    for (let b = 0; b < batchSize && t < MAX_T; b++) {
      const tNorm = t * 0.01;

      for (const curve of curves) {
        const damping = Math.exp(-curve.decay * t);
        const x = cx + curve.ax * Math.sin(curve.fx * tNorm + curve.px) * damping;
        const y = cy + curve.ay * Math.sin(curve.fy * tNorm + curve.py) * damping;

        const [r, g, b2] = curve.color;
        const alpha = 40 * damping;
        p.noStroke();
        p.fill(r, g, b2, alpha);
        p.ellipse(x, y, 2, 2);
      }
      t++;
    }
  },

  resize(p: p5, width: number, height: number) {
    weave.setup(p, currentSeed, width, height);
    p.loop();
  },
};
