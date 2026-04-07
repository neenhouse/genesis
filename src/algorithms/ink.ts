import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Drop {
  x: number; y: number;
  maxR: number; r: number;
  col: number[];
}

const INK_COLORS = [
  [10, 15, 40],   // near-black blue
  [20, 30, 80],   // deep navy
  [40, 20, 60],   // deep indigo
  [5, 10, 30],    // ink black
  [0, 40, 80],    // ocean
];

let drops: Drop[] = [];
let growing = true;

export const ink: Algorithm = {
  name: 'Ink',
  description: 'Ink drops in water — expanding turbulent circles on cream paper',
  palette: { background: '#f4f0e8', colors: ['#0a0f28', '#141e50', '#282018'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(244, 240, 232);
    drops = [];
    growing = true;

    const count = 4 + Math.floor(p.random(5));
    for (let i = 0; i < count; i++) {
      drops.push({
        x: p.random(w * 0.1, w * 0.9),
        y: p.random(h * 0.1, h * 0.9),
        maxR: p.random(Math.min(w, h) * 0.12, Math.min(w, h) * 0.28),
        r: 2,
        col: INK_COLORS[Math.floor(p.random(INK_COLORS.length))],
      });
    }
  },

  draw(p: p5) {
    if (!growing) return;

    let anyGrowing = false;

    for (const d of drops) {
      if (d.r >= d.maxR) continue;
      anyGrowing = true;
      const [ir, ig, ib] = d.col;
      const steps = 180;

      for (let ring = 0; ring < 3; ring++) {
        const radius = d.r - ring * 2;
        if (radius <= 0) continue;
        const alpha = p.map(ring, 0, 3, 180, 40);
        const opacity = p.map(d.r, 0, d.maxR, alpha, alpha * 0.3);
        p.noFill();
        p.stroke(ir, ig, ib, opacity);
        p.strokeWeight(1.2 - ring * 0.3);
        p.beginShape();
        for (let i = 0; i <= steps; i++) {
          const angle = (i / steps) * p.TWO_PI;
          const n = p.noise(
            d.x * 0.003 + Math.cos(angle) * 0.8,
            d.y * 0.003 + Math.sin(angle) * 0.8,
            radius * 0.012 + ring * 0.5
          );
          const disp = (n - 0.5) * radius * 0.35;
          p.curveVertex(d.x + Math.cos(angle) * (radius + disp), d.y + Math.sin(angle) * (radius + disp));
        }
        p.endShape(p.CLOSE);
      }

      d.r += p.random(0.8, 2.2);
    }

    if (!anyGrowing) { growing = false; p.noLoop(); }
  },

  resize(p: p5, width: number, height: number) {
    ink.setup(p, currentSeed, width, height);
    p.loop();
  },
};
