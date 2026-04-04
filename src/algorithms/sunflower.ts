import type p5 from 'p5';
import type { Algorithm } from './types';

let currentSeed = 0;
let w = 0, h = 0;
let idx = 0;
let done = false;
const GOLDEN_ANGLE = 137.50776405003785;
const MAX_DOTS = 1600;

export const sunflower: Algorithm = {
  name: 'Sunflower',
  description: "Fermat's spiral — dots at the golden angle, colored by ring",
  palette: {
    background: '#0f1a0a',
    colors: ['#5c3a1e', '#b8860b', '#ffd700', '#fff8dc'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    currentSeed = seed;
    idx = 0; done = false;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(15, 26, 10);
    p.noStroke();
  },

  draw(p: p5) {
    if (done) { p.noLoop(); return; }

    const cx = w / 2, cy = h / 2;
    const maxR = Math.min(w, h) * 0.46;
    const batch = 30;

    for (let b = 0; b < batch && idx < MAX_DOTS; b++, idx++) {
      const angle = idx * GOLDEN_ANGLE * (Math.PI / 180);
      const r = Math.sqrt(idx) * (maxR / Math.sqrt(MAX_DOTS));
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      const t = r / maxR; // 0 = center, 1 = edge
      const dotSize = p.map(t, 0, 1, 3, 7);

      let red, grn, blu;
      if (t < 0.25) {
        // dark brown center
        const s = t / 0.25;
        red = p.lerp(60, 92, s); grn = p.lerp(30, 58, s); blu = p.lerp(10, 20, s);
      } else if (t < 0.55) {
        // dark gold mid-ring
        const s = (t - 0.25) / 0.30;
        red = p.lerp(92, 184, s); grn = p.lerp(58, 134, s); blu = p.lerp(20, 11, s);
      } else if (t < 0.82) {
        // gold outer
        const s = (t - 0.55) / 0.27;
        red = p.lerp(184, 255, s); grn = p.lerp(134, 215, s); blu = p.lerp(11, 0, s);
      } else {
        // pale yellow rim
        const s = (t - 0.82) / 0.18;
        red = p.lerp(255, 255, s); grn = p.lerp(215, 248, s); blu = p.lerp(0, 220, s);
      }

      p.fill(red, grn, blu, 230);
      p.ellipse(x, y, dotSize, dotSize);
    }

    if (idx >= MAX_DOTS) done = true;
  },

  resize(p: p5, width: number, height: number) {
    sunflower.setup(p, currentSeed, width, height);
    p.loop();
  },
};
