import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
let currentSeed = 0;
let offset = 0;

const RING_SPACING = 16;
const RING_WEIGHT = 1.2;
const DRIFT_SPEED = 0.004;

export const interference: Algorithm = {
  name: 'Interference',
  description: 'Moiré pattern — two offset concentric circle grids slowly drifting',
  palette: {
    background: '#ffffff',
    colors: ['#000000', '#ffffff'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    currentSeed = seed;
    offset = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(255);
  },

  draw(p: p5) {
    p.background(255);
    p.stroke(0);
    p.strokeWeight(RING_WEIGHT);
    p.noFill();

    // Center A — fixed
    const ax = w * 0.5, ay = h * 0.5;
    const maxR = Math.sqrt(w * w + h * h) * 0.6;
    for (let r = RING_SPACING; r < maxR; r += RING_SPACING) {
      p.ellipse(ax, ay, r * 2, r * 2);
    }

    // Center B — drifting offset
    const drift = Math.min(w, h) * 0.15;
    const bx = ax + Math.cos(offset) * drift;
    const by = ay + Math.sin(offset * 0.7) * drift * 0.7;

    for (let r = RING_SPACING; r < maxR; r += RING_SPACING) {
      p.ellipse(bx, by, r * 2, r * 2);
    }

    offset += DRIFT_SPEED;
  },

  resize(p: p5, width: number, height: number) {
    w = width; h = height;
    interference.setup(p, currentSeed, width, height);
  },
};
