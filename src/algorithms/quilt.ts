import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const TEXTILE_COLORS = [
  [180, 50, 60],   // crimson
  [210, 120, 40],  // burnt orange
  [55, 105, 175],  // deep blue
  [70, 140, 80],   // forest green
  [140, 60, 155],  // purple
  [210, 185, 50],  // mustard
  [190, 90, 110],  // dusty rose
  [60, 130, 150],  // teal
];
const CREAM = [240, 230, 210];

type PatternFn = (p: p5, cx: number, cy: number, size: number, color: number[]) => void;

const PATTERNS: PatternFn[] = [
  // Diagonal stripes
  (p, cx, cy, size, color) => {
    const [r, g, b] = color;
    const stripeW = size / 5;
    p.fill(r, g, b); p.noStroke();
    p.rect(cx - size / 2, cy - size / 2, size, size);
    p.fill(CREAM[0], CREAM[1], CREAM[2]);
    for (let i = -size; i < size * 2; i += stripeW * 2) {
      p.beginShape();
      p.vertex(cx - size / 2 + i, cy - size / 2);
      p.vertex(cx - size / 2 + i + stripeW, cy - size / 2);
      p.vertex(cx - size / 2 + i + stripeW + size, cy + size / 2);
      p.vertex(cx - size / 2 + i + size, cy + size / 2);
      p.endShape(p.CLOSE);
    }
  },
  // Checkerboard
  (p, cx, cy, size, color) => {
    const [r, g, b] = color;
    const cells = 4;
    const cs = size / cells;
    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < cells; col++) {
        if ((row + col) % 2 === 0) p.fill(r, g, b);
        else p.fill(CREAM[0], CREAM[1], CREAM[2]);
        p.noStroke();
        p.rect(cx - size / 2 + col * cs, cy - size / 2 + row * cs, cs, cs);
      }
    }
  },
  // X cross pattern
  (p, cx, cy, size, color) => {
    const [r, g, b] = color;
    p.fill(CREAM[0], CREAM[1], CREAM[2]); p.noStroke();
    p.rect(cx - size / 2, cy - size / 2, size, size);
    p.fill(r, g, b);
    const thick = size * 0.18;
    p.push(); p.translate(cx, cy); p.rotate(p.PI / 4);
    p.rect(-thick / 2, -size * 0.52, thick, size * 1.04);
    p.rect(-size * 0.52, -thick / 2, size * 1.04, thick);
    p.pop();
  },
  // Circles
  (p, cx, cy, size, color) => {
    const [r, g, b] = color;
    p.fill(CREAM[0], CREAM[1], CREAM[2]); p.noStroke();
    p.rect(cx - size / 2, cy - size / 2, size, size);
    p.noFill(); p.stroke(r, g, b); p.strokeWeight(size * 0.08);
    p.ellipse(cx, cy, size * 0.7); p.ellipse(cx, cy, size * 0.4);
    p.fill(r, g, b); p.noStroke();
    p.ellipse(cx, cy, size * 0.18);
  },
  // Triangle pinwheel
  (p, cx, cy, size, color) => {
    const [r, g, b] = color;
    p.fill(CREAM[0], CREAM[1], CREAM[2]); p.noStroke();
    p.rect(cx - size / 2, cy - size / 2, size, size);
    p.fill(r, g, b); p.noStroke();
    for (let i = 0; i < 4; i++) {
      p.push(); p.translate(cx, cy); p.rotate((i / 4) * p.TWO_PI);
      p.triangle(0, 0, size * 0.45, -size * 0.45, size * 0.45, 0);
      p.pop();
    }
  },
];

export const quilt: Algorithm = {
  name: 'Quilt',
  description: 'Patchwork quilt with grid squares each containing a unique geometric pattern',
  palette: { background: '#f0e6d2', colors: ['#b4323c', '#d27828', '#374faf'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    p.background(CREAM[0], CREAM[1], CREAM[2]);

    const cellSize = Math.max(40, Math.min(w, h) * 0.1);
    const cols = Math.ceil(w / cellSize) + 1;
    const rows = Math.ceil(h / cellSize) + 1;
    const seamW = Math.max(2, cellSize * 0.04);

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cx = col * cellSize + cellSize / 2;
        const cy = row * cellSize + cellSize / 2;

        // Clip to canvas
        p.push();
        const colorIdx = Math.floor(p.noise(col * 0.4, row * 0.4) * TEXTILE_COLORS.length);
        const color = TEXTILE_COLORS[colorIdx % TEXTILE_COLORS.length];
        const patternIdx = Math.floor(p.noise(col * 0.7 + 100, row * 0.7 + 100) * PATTERNS.length);
        PATTERNS[patternIdx % PATTERNS.length](p, cx, cy, cellSize - seamW, color);
        p.pop();

        // Seam / grout lines
        p.noFill();
        p.stroke(175, 165, 145);
        p.strokeWeight(seamW);
        p.rect(cx - cellSize / 2, cy - cellSize / 2, cellSize, cellSize);
      }
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    quilt.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
