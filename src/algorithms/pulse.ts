import type p5 from 'p5';
import type { Algorithm } from './types';

let gridA: Float32Array;
let gridB: Float32Array;
let nextA: Float32Array;
let nextB: Float32Array;
let cols = 0, rows = 0;
let currentSeed = 0;
const SCALE = 3;
const dA = 1.0, dB = 0.5, feed = 0.055, kill = 0.062;

export const pulse: Algorithm = {
  name: 'Pulse',
  description: 'Reaction-diffusion — Turing patterns that bloom and morph',
  palette: { background: '#3a3f4a', colors: ['#f08070', '#50b0b0', '#e8dcc8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    cols = Math.floor(width / SCALE); rows = Math.floor(height / SCALE);
    const size = cols * rows;
    gridA = new Float32Array(size).fill(1);
    gridB = new Float32Array(size).fill(0);
    nextA = new Float32Array(size);
    nextB = new Float32Array(size);

    const dropCount = 5 + Math.floor(p.random(10));
    for (let d = 0; d < dropCount; d++) {
      const cx = Math.floor(p.random(cols * 0.2, cols * 0.8));
      const cy = Math.floor(p.random(rows * 0.2, rows * 0.8));
      const r = Math.floor(p.random(3, 8));
      for (let dy = -r; dy <= r; dy++) {
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dy * dy <= r * r) {
            const x = cx + dx, y = cy + dy;
            if (x >= 0 && x < cols && y >= 0 && y < rows) gridB[y * cols + x] = 1;
          }
        }
      }
    }
    p.background(58, 63, 74);
    p.pixelDensity(1);
  },

  draw(p: p5) {
    for (let step = 0; step < 8; step++) {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const idx = y * cols + x;
          const a = gridA[idx], b = gridB[idx];
          const lapA = gridA[idx-1] + gridA[idx+1] + gridA[idx-cols] + gridA[idx+cols] - 4*a;
          const lapB = gridB[idx-1] + gridB[idx+1] + gridB[idx-cols] + gridB[idx+cols] - 4*b;
          const reaction = a * b * b;
          nextA[idx] = Math.max(0, Math.min(1, a + (dA * lapA - reaction + feed * (1 - a))));
          nextB[idx] = Math.max(0, Math.min(1, b + (dB * lapB + reaction - (kill + feed) * b)));
        }
      }
      [gridA, nextA] = [nextA, gridA];
      [gridB, nextB] = [nextB, gridB];
    }

    p.loadPixels();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const val = gridA[y * cols + x] - gridB[y * cols + x];
        let r: number, g: number, b: number;
        if (val > 0.5) {
          const t = (val - 0.5) * 2;
          r = 232*t + 80*(1-t); g = 220*t + 176*(1-t); b = 200*t + 176*(1-t);
        } else {
          const t = val * 2;
          r = 80*t + 240*(1-t); g = 176*t + 128*(1-t); b = 176*t + 112*(1-t);
        }
        for (let sy = 0; sy < SCALE; sy++) {
          for (let sx = 0; sx < SCALE; sx++) {
            const px = x*SCALE+sx, py = y*SCALE+sy;
            if (px < p.width && py < p.height) {
              const pi = 4*(py*p.width+px);
              p.pixels[pi] = r; p.pixels[pi+1] = g; p.pixels[pi+2] = b; p.pixels[pi+3] = 255;
            }
          }
        }
      }
    }
    p.updatePixels();
  },

  resize(p: p5, width: number, height: number) {
    pulse.setup(p, currentSeed, width, height);
  },
};
