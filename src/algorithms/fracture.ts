import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const COLORS = [
  [245, 235, 220], // cream
  [180, 80, 50],   // rust
  [160, 150, 140], // warm gray
  [120, 100, 85],  // dark warm
  [220, 200, 180], // sand
];
const PHI = 1.618033988749895;
const MIN_SIZE = 20;

function subdivide(p: p5, x: number, y: number, w: number, h: number, depth: number, horizontal: boolean) {
  if (w < MIN_SIZE || h < MIN_SIZE || depth > 12) {
    // Fill leaf
    const n = p.noise(x * 0.005, y * 0.005, depth * 0.1);
    const colorIdx = Math.floor(n * COLORS.length) % COLORS.length;
    const [r, g, b] = COLORS[colorIdx];
    const bright = 0.7 + n * 0.3;
    p.fill(r * bright, g * bright, b * bright);
    p.stroke(80, 70, 60, 60);
    p.strokeWeight(1);
    p.rect(x, y, w, h);
    return;
  }

  const ratio = 1 / PHI;
  const shouldSplit = p.random() > 0.15; // 85% chance to split

  if (!shouldSplit) {
    const n = p.noise(x * 0.005, y * 0.005, depth * 0.1);
    const colorIdx = Math.floor(n * COLORS.length) % COLORS.length;
    const [r, g, b] = COLORS[colorIdx];
    p.fill(r, g, b);
    p.stroke(80, 70, 60, 60);
    p.strokeWeight(1);
    p.rect(x, y, w, h);
    return;
  }

  if (horizontal) {
    const split = w * ratio;
    subdivide(p, x, y, split, h, depth + 1, !horizontal);
    subdivide(p, x + split, y, w - split, h, depth + 1, !horizontal);
  } else {
    const split = h * ratio;
    subdivide(p, x, y, w, split, depth + 1, !horizontal);
    subdivide(p, x, y + split, w, h - split, depth + 1, !horizontal);
  }
}

export const fracture: Algorithm = {
  name: 'Fracture',
  description: 'Recursive subdivision — golden ratio geometry in warm earth tones',
  palette: { background: '#2a2520', colors: ['#f5ebdc', '#b45032', '#a0968c'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(42, 37, 32);

    // Add slight margin
    const margin = 20;
    subdivide(p, margin, margin, w - margin * 2, h - margin * 2, 0, true);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    fracture.setup(p, currentSeed, width, height);
  },
};
