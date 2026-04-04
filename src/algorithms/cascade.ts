import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let cells: Uint8Array;
let rowY = 0;
const CELL_SIZE = 4;

export const cascade: Algorithm = {
  name: 'Cascade',
  description: 'Cellular automata — Wolfram rules cascading into emergent patterns',
  palette: { background: '#000000', colors: ['#3b82f6', '#60a5fa', '#ffffff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const cols = Math.floor(w / CELL_SIZE);
    cells = new Uint8Array(cols);
    // Start with single cell in middle
    cells[Math.floor(cols / 2)] = 1;
    // Sprinkle a few random cells too
    for (let i = 0; i < 5; i++) {
      cells[Math.floor(p.random(cols))] = 1;
    }
    rowY = 0;
    p.background(0);
  },

  draw(p: p5) {
    if (rowY >= h) { p.noLoop(); return; }

    const cols = cells.length;
    const rule = currentSeed % 256;

    // Draw current row
    for (let x = 0; x < cols; x++) {
      if (cells[x] === 1) {
        const brightness = p.noise(x * 0.05, rowY * 0.01) * 0.5 + 0.5;
        const r = 59 * brightness;
        const g = 130 + 125 * brightness;
        const b = 246;
        p.noStroke();
        p.fill(r, g, b);
        p.rect(x * CELL_SIZE, rowY, CELL_SIZE, CELL_SIZE);
      }
    }

    // Compute next generation
    const next = new Uint8Array(cols);
    for (let x = 0; x < cols; x++) {
      const left = x > 0 ? cells[x - 1] : 0;
      const center = cells[x];
      const right = x < cols - 1 ? cells[x + 1] : 0;
      const pattern = (left << 2) | (center << 1) | right;
      next[x] = (rule >> pattern) & 1;
    }
    cells = next;
    rowY += CELL_SIZE;
  },

  resize(p: p5, width: number, height: number) {
    cascade.setup(p, currentSeed, width, height);
    p.loop();
  },
};
