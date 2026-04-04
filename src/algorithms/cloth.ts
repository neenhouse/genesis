import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const COLS = 30;
const ROWS = 22;
const GRAVITY = 0.45;
const DAMPING = 0.985;
const CONSTRAINT_ITER = 5;
const REST_DIST_FACTOR = 1.0;

interface Point {
  x: number; y: number;
  px: number; py: number;
  pinned: boolean;
}

let pts: Point[][] = [];
let restDist = 0;

function initCloth(p: p5) {
  const marginX = w * 0.1;
  const marginY = h * 0.06;
  const clothW = w - marginX * 2;
  const clothH = h * 0.72;
  restDist = (clothW / (COLS - 1)) * REST_DIST_FACTOR;

  pts = [];
  for (let row = 0; row < ROWS; row++) {
    pts[row] = [];
    for (let col = 0; col < COLS; col++) {
      const x = marginX + col * (clothW / (COLS - 1));
      const y = marginY + row * (clothH / (ROWS - 1));
      pts[row][col] = { x, y, px: x + p.random(-0.4, 0.4), py: y, pinned: row === 0 };
    }
  }
}

function constrainPair(a: Point, b: Point, d: number) {
  const dx = b.x - a.x, dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const correction = (dist - d) / dist * 0.5;
  const cx = dx * correction, cy = dy * correction;
  if (!a.pinned) { a.x += cx; a.y += cy; }
  if (!b.pinned) { b.x -= cx; b.y -= cy; }
}

export const cloth: Algorithm = {
  name: 'Cloth',
  description: 'Cloth simulation — silk drooping under gravity with spring physics',
  palette: { background: '#0d0508', colors: ['#c8102e', '#8b0011', '#ff4060'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    initCloth(p);
    p.background(13, 5, 8);
  },

  draw(p: p5) {
    p.background(13, 5, 8);

    // Verlet integration
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const pt = pts[row][col];
        if (pt.pinned) continue;
        const vx = (pt.x - pt.px) * DAMPING;
        const vy = (pt.y - pt.py) * DAMPING;
        pt.px = pt.x; pt.py = pt.y;
        pt.x += vx; pt.y += vy + GRAVITY;
      }
    }

    // Constraints
    for (let iter = 0; iter < CONSTRAINT_ITER; iter++) {
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS - 1; col++) constrainPair(pts[row][col], pts[row][col + 1], restDist);
      }
      for (let row = 0; row < ROWS - 1; row++) {
        for (let col = 0; col < COLS; col++) constrainPair(pts[row][col], pts[row + 1][col], restDist);
      }
    }

    // Draw fabric quads with shading
    p.noStroke();
    for (let row = 0; row < ROWS - 1; row++) {
      for (let col = 0; col < COLS - 1; col++) {
        const a = pts[row][col], b = pts[row][col + 1];
        const c = pts[row + 1][col + 1], d = pts[row + 1][col];
        const shade = p.map(row + col, 0, ROWS + COLS, 0, 60);
        p.fill(200 - shade, 16 - shade * 0.1, 30);
        p.beginShape();
        p.vertex(a.x, a.y); p.vertex(b.x, b.y);
        p.vertex(c.x, c.y); p.vertex(d.x, d.y);
        p.endShape(p.CLOSE);
      }
    }

    // Draw warp threads for sheen
    p.noFill();
    p.strokeWeight(0.5);
    for (let col = 0; col < COLS; col += 3) {
      p.stroke(255, 80, 80, 60);
      p.beginShape();
      for (let row = 0; row < ROWS; row++) p.vertex(pts[row][col].x, pts[row][col].y);
      p.endShape();
    }
  },

  resize(p: p5, width: number, height: number) {
    cloth.setup(p, currentSeed, width, height);
    p.loop();
  },
};
