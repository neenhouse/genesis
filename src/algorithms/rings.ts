import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Ring {
  x: number; y: number; r: number;
  red: number; green: number; blue: number;
}

let ringList: Ring[] = [];

const RING_COLORS = [
  [30, 120, 220],   // blue
  [220, 220, 0],    // yellow
  [30, 170, 60],    // green
  [220, 30, 50],    // red
  [0, 0, 0],        // black
  [220, 130, 30],   // orange
  [140, 50, 200],   // purple
];

export const rings: Algorithm = {
  name: 'Rings',
  description: 'Interlocking Olympic-style rings at random positions and sizes with overlapping transparency',
  palette: { background: '#2a2a2a', colors: ['#1e78dc', '#dcdc00', '#1eaa3c', '#dc1e32', '#000000'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    ringList = [];
    const count = 8 + Math.floor(p.random(10));
    for (let i = 0; i < count; i++) {
      const col = RING_COLORS[i % RING_COLORS.length];
      ringList.push({
        x: p.random(w * 0.1, w * 0.9),
        y: p.random(h * 0.15, h * 0.85),
        r: p.random(Math.min(w, h) * 0.05, Math.min(w, h) * 0.2),
        red: col[0], green: col[1], blue: col[2],
      });
    }

    p.background(42);
    p.noFill();

    for (const ring of ringList) {
      // Transparent filled circle for overlap blending
      p.fill(ring.red, ring.green, ring.blue, 45);
      p.stroke(ring.red, ring.green, ring.blue, 220);
      p.strokeWeight(Math.max(3, ring.r * 0.09));
      p.ellipse(ring.x, ring.y, ring.r * 2, ring.r * 2);
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // Static — all drawn in setup
  },

  resize(p: p5, width: number, height: number) {
    rings.setup(p, currentSeed, width, height);
    p.loop();
  },

};
