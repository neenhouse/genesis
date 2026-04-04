import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

type PatternFn = (p: p5, x: number, y: number, bw: number, bh: number) => void;

function patternCircles(p: p5, x: number, y: number, bw: number, bh: number) {
  const spacing = Math.max(bw, bh) * 0.12;
  p.noFill();
  p.stroke(20, 15, 10);
  p.strokeWeight(0.9);
  for (let cy = y + spacing; cy < y + bh; cy += spacing) {
    for (let cx = x + spacing; cx < x + bw; cx += spacing) {
      const r = spacing * 0.4;
      p.circle(cx, cy, r * 2);
      p.circle(cx, cy, r * 1.3);
    }
  }
}

function patternLines(p: p5, x: number, y: number, bw: number, bh: number) {
  const spacing = Math.max(bw, bh) * 0.07;
  p.stroke(20, 15, 10);
  p.strokeWeight(1.0);
  for (let i = 0; i * spacing < bw + bh; i++) {
    const d = i * spacing;
    p.line(x + d, y, x, y + d);
    p.line(x + bw - d, y, x + bw, y + d);
  }
}

function patternWaves(p: p5, x: number, y: number, bw: number, bh: number) {
  const rows = 8;
  const spacing = bh / rows;
  p.noFill();
  p.stroke(20, 15, 10);
  p.strokeWeight(1.0);
  for (let row = 0; row < rows; row++) {
    const cy = y + (row + 0.5) * spacing;
    p.beginShape();
    for (let xi = x; xi <= x + bw; xi += 3) {
      const phase = (xi - x) / bw * Math.PI * 6;
      p.vertex(xi, cy + Math.sin(phase) * spacing * 0.35);
    }
    p.endShape();
  }
}

function patternDots(p: p5, x: number, y: number, bw: number, bh: number) {
  const spacing = Math.max(bw, bh) * 0.1;
  p.noStroke();
  p.fill(20, 15, 10);
  for (let cy = y + spacing * 0.5; cy < y + bh; cy += spacing) {
    const rowOff = ((cy - y) / spacing) % 2 < 1 ? 0 : spacing * 0.5;
    for (let cx = x + rowOff; cx < x + bw; cx += spacing) {
      p.circle(cx, cy, spacing * 0.28);
    }
  }
}

function patternGrid(p: p5, x: number, y: number, bw: number, bh: number) {
  const spacing = Math.max(bw, bh) * 0.09;
  p.stroke(20, 15, 10);
  p.strokeWeight(0.8);
  for (let xi = x; xi <= x + bw; xi += spacing) p.line(xi, y, xi, y + bh);
  for (let yi = y; yi <= y + bh; yi += spacing) p.line(x, yi, x + bw, yi);
  p.noFill();
  p.strokeWeight(1.2);
  for (let cy = y + spacing; cy < y + bh; cy += spacing * 2) {
    for (let cx = x + spacing; cx < x + bw; cx += spacing * 2) {
      p.circle(cx, cy, spacing * 0.5);
    }
  }
}

const PATTERNS: PatternFn[] = [patternCircles, patternLines, patternWaves, patternDots, patternGrid];

export const tangle: Algorithm = {
  name: 'Tangle',
  description: 'Zentangle — canvas divided into cells, each filled with a unique pattern',
  palette: { background: '#faf8f4', colors: ['#14100a', '#3d3530', '#faf8f4'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(250, 248, 244);

    const cols = 3 + Math.floor(p.random(3));
    const rows = 3 + Math.floor(p.random(3));
    const cellW = w / cols;
    const cellH = h / rows;
    const padding = 6;

    const assignments: number[] = [];
    for (let i = 0; i < cols * rows; i++) {
      assignments.push(Math.floor(p.random(PATTERNS.length)));
    }

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cellW + padding;
        const y = row * cellH + padding;
        const bw = cellW - padding * 2;
        const bh = cellH - padding * 2;

        // Cell border
        p.noFill();
        p.stroke(20, 15, 10, 100);
        p.strokeWeight(1.5);
        p.rect(x, y, bw, bh, 3);

        // Apply clipping via drawing inside bounds
        PATTERNS[assignments[row * cols + col]](p, x + 2, y + 2, bw - 4, bh - 4);
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    tangle.setup(p, currentSeed, width, height);
  },
};
