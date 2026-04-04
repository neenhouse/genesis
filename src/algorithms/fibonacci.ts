import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Warm spectrum palette for rectangles
const RECT_COLORS = [
  '#c0392b', '#e67e22', '#f39c12', '#f1c40f',
  '#27ae60', '#16a085', '#2980b9', '#8e44ad',
  '#d35400', '#e74c3c',
];

export const fibonacci: Algorithm = {
  name: 'Fibonacci',
  description: 'Fibonacci spiral — golden rectangles subdivide with quarter-circle arcs tracing the growth spiral',
  palette: { background: '#f8f2e4', colors: ['#c0392b', '#e67e22', '#f1c40f'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    p.background(248, 242, 228);
    p.strokeWeight(1.5);

    // Determine initial square size from canvas
    const size = Math.min(w, h) * 0.9;
    const startX = (w - size) / 2;
    const startY = (h - size) / 2;

    // Each step: direction = right, up, left, down cycling
    // rect = { x, y, s } — top-left corner and side length
    let x = startX;
    let y = startY;
    let s = size;
    const dirs = ['right', 'up', 'left', 'down'] as const;
    let dir = 0;

    const rects: { x: number; y: number; s: number; color: string }[] = [];
    const arcs: { cx: number; cy: number; r: number; startA: number; endA: number }[] = [];

    const STEPS = 10;
    for (let i = 0; i < STEPS; i++) {
      rects.push({ x, y, s, color: RECT_COLORS[i % RECT_COLORS.length] });

      // Determine arc corner based on direction
      let arcCX = 0, arcCY = 0, startA = 0, endA = 0;
      if (dirs[dir % 4] === 'right') {
        arcCX = x; arcCY = y + s; startA = -Math.PI / 2; endA = 0;
        x = x + s; s = s / 1.6180339887;
        y = y + s;
      } else if (dirs[dir % 4] === 'up') {
        arcCX = x + s; arcCY = y + s; startA = Math.PI; endA = -Math.PI / 2;
        const ns = s / 1.6180339887;
        y = y - ns; s = ns;
      } else if (dirs[dir % 4] === 'left') {
        arcCX = x + s; arcCY = y; startA = Math.PI / 2; endA = Math.PI;
        const ns = s / 1.6180339887;
        x = x - ns; y = y; s = ns;
      } else {
        arcCX = x; arcCY = y; startA = 0; endA = Math.PI / 2;
        s = s / 1.6180339887;
        x = x; y = y + s;
      }

      arcs.push({ cx: arcCX, cy: arcCY, r: s * 1.6180339887, startA, endA });
      dir++;
    }

    // Draw rectangles
    for (const rect of rects) {
      p.fill(rect.color + '55');
      p.stroke(rect.color);
      p.rect(rect.x, rect.y, rect.s, rect.s);
    }

    // Draw arcs
    p.noFill();
    p.stroke(60, 40, 20, 200);
    p.strokeWeight(2.5);
    for (const arc of arcs) {
      p.arc(arc.cx, arc.cy, arc.r * 2, arc.r * 2, arc.startA, arc.endA);
    }

    // Center dot
    p.noStroke();
    p.fill(60, 40, 20, 200);
    p.ellipse(arcs[arcs.length - 1].cx, arcs[arcs.length - 1].cy, 6, 6);

    p.noLoop();
  },

  draw(_p: p5) {
    // static
  },

  resize(p: p5, width: number, height: number) {
    fibonacci.setup(p, currentSeed, width, height);
    p.loop();
  },
};
