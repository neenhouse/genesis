import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Colony {
  x: number; y: number;
  r: number;
  maxR: number;
  growthRate: number;
  r_: number; g_: number; b_: number; // color fields
  noiseOffset: number;
}

let colonies: Colony[] = [];

const COLONY_COLORS: Array<[number, number, number]> = [
  [255, 200, 210], // blush
  [200, 240, 210], // mint
  [200, 220, 255], // periwinkle
  [255, 230, 190], // peach
  [230, 210, 255], // lavender
  [200, 245, 240], // aqua
  [255, 245, 200], // butter
];

function coloniesOverlap(a: Colony, b: Colony): boolean {
  const dx = a.x - b.x, dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) < a.r + b.r + 2;
}

export const petri: Algorithm = {
  name: 'Petri',
  description: 'Petri dish bacterial colonies — noisy growth radiating from multiple seeds',
  palette: { background: '#f0edd4', colors: ['#ffccd5', '#c8f0d2', '#c8dcff', '#ffe6be'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    colonies = [];
    p.background(240, 237, 212);

    // Agar dish circle
    p.noFill();
    p.stroke(200, 195, 170, 120);
    p.strokeWeight(6);
    const dishR = Math.min(w, h) * 0.46;
    p.ellipse(w / 2, h / 2, dishR * 2, dishR * 2);

    const colonyCount = 4 + Math.floor(p.random(5));
    const colorOrder = [...COLONY_COLORS].sort(() => p.random() - 0.5);

    for (let i = 0; i < colonyCount; i++) {
      let attempts = 0;
      let placed = false;
      while (attempts < 80 && !placed) {
        const angle = p.random(p.TWO_PI);
        const r = p.random(0, dishR * 0.7);
        const cx = w / 2 + Math.cos(angle) * r;
        const cy = h / 2 + Math.sin(angle) * r;
        const [cr, cg, cb] = colorOrder[i % colorOrder.length];
        const candidate: Colony = {
          x: cx, y: cy, r: 3,
          maxR: p.random(dishR * 0.12, dishR * 0.32),
          growthRate: p.random(0.3, 0.9),
          r_: cr, g_: cg, b_: cb,
          noiseOffset: p.random(1000),
        };
        const overlaps = colonies.some(c => coloniesOverlap(c, candidate));
        if (!overlaps) { colonies.push(candidate); placed = true; }
        attempts++;
      }
    }
  },

  draw(p: p5) {
    // Redraw background so colonies appear to grow
    p.background(240, 237, 212);

    // Agar texture
    p.noStroke();
    p.fill(232, 228, 200, 80);
    p.ellipse(w / 2, h / 2, Math.min(w, h) * 0.92, Math.min(w, h) * 0.92);

    let allDone = true;

    for (const col of colonies) {
      if (col.r < col.maxR) {
        col.r += col.growthRate * (1 - col.r / col.maxR);
        allDone = false;
      }

      // Noisy colony border
      const segments = 80;
      p.fill(col.r_, col.g_, col.b_, 200);
      p.stroke(col.r_ * 0.7, col.g_ * 0.7, col.b_ * 0.7, 160);
      p.strokeWeight(1);
      p.beginShape();
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * p.TWO_PI;
        const n = p.noise(
          col.noiseOffset + Math.cos(angle) * 1.5,
          col.noiseOffset + Math.sin(angle) * 1.5,
        );
        const rn = col.r * (0.82 + n * 0.38);
        p.vertex(col.x + Math.cos(angle) * rn, col.y + Math.sin(angle) * rn);
      }
      p.endShape(p.CLOSE);

      // Inner core highlight
      p.noStroke();
      p.fill(col.r_, col.g_, col.b_, 120);
      p.ellipse(col.x - col.r * 0.12, col.y - col.r * 0.12, col.r * 0.6, col.r * 0.5);
    }

    // Dish rim
    p.noFill();
    p.stroke(185, 180, 155, 140);
    p.strokeWeight(6);
    p.ellipse(w / 2, h / 2, Math.min(w, h) * 0.92, Math.min(w, h) * 0.92);

    if (allDone) p.noLoop();
  },

  resize(p: p5, width: number, height: number) {
    petri.setup(p, currentSeed, width, height);
    p.loop();
  },
};
