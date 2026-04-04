import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const CELL = 14; // grid cell size

export const dots: Algorithm = {
  name: 'Dots',
  description: 'Halftone pattern — variable-size circles encoding a noise grayscale field',
  palette: { background: '#ffffff', colors: ['#111111', '#444444', '#888888'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(255);

    const cols = Math.ceil(w / CELL) + 1;
    const rows = Math.ceil(h / CELL) + 1;

    // Offset origin slightly so dots aren't right on edge
    const offX = ((w % CELL) / 2) | 0;
    const offY = ((h % CELL) / 2) | 0;

    p.noStroke();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = offX + col * CELL;
        const cy = offY + row * CELL;

        // Multi-octave noise for interesting image
        const n1 = p.noise(cx * 0.004, cy * 0.004);
        const n2 = p.noise(cx * 0.012 + 50, cy * 0.012 + 50) * 0.4;
        const n3 = p.noise(cx * 0.035 + 100, cy * 0.035 + 100) * 0.15;
        const raw = (n1 + n2 + n3) / 1.55;

        // Darker areas → larger dots; remap so mid-range prints well
        const mapped = p.pow(raw, 0.8);
        const maxR = CELL * 0.55;
        const r = mapped * maxR;

        if (r < 0.6) continue;

        // Slight color variation: warm blacks
        const gray = p.map(mapped, 0, 1, 30, 5);
        p.fill(gray, gray, gray + 4);
        p.circle(cx, cy, r * 2);
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    dots.setup(p, currentSeed, width, height);
  },
};
