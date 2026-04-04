import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const LEVELS = 28;
const RESOLUTION = 6; // pixels per sample

function sampleHeight(p: p5, x: number, y: number): number {
  return p.noise(x * 0.004, y * 0.004) +
    p.noise(x * 0.012, y * 0.012) * 0.4 +
    p.noise(x * 0.03, y * 0.03) * 0.15;
}

// Marching-squares single-edge interpolation
function lerp1d(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export const contour: Algorithm = {
  name: 'Contour',
  description: 'Topographic contour map — isolines traced from a noise height field',
  palette: { background: '#f2e8d0', colors: ['#8b6040', '#6b4828', '#c8a870'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(242, 232, 208);

    // Subtle paper grain
    p.noStroke();
    for (let i = 0; i < 3000; i++) {
      p.fill(180, 160, 120, p.random(8, 20));
      p.rect(p.random(w), p.random(h), p.random(1, 3), p.random(1, 2));
    }

    const cols = Math.ceil(w / RESOLUTION) + 1;
    const rows = Math.ceil(h / RESOLUTION) + 1;

    // Build height grid
    const grid: number[][] = [];
    for (let row = 0; row < rows; row++) {
      grid[row] = [];
      for (let col = 0; col < cols; col++) {
        grid[row][col] = sampleHeight(p, col * RESOLUTION, row * RESOLUTION);
      }
    }

    const maxH = 1.55; // max possible from sums above

    for (let level = 1; level <= LEVELS; level++) {
      const t = level / (LEVELS + 1);
      const threshold = t * maxH;
      const isMajor = level % 5 === 0;

      const br = isMajor ? 100 : 140;
      const bg = isMajor ? 72 : 100;
      const bb = isMajor ? 40 : 64;
      p.stroke(br, bg, bb, isMajor ? 200 : 130);
      p.strokeWeight(isMajor ? 1.6 : 0.8);
      p.noFill();

      for (let row = 0; row < rows - 1; row++) {
        for (let col = 0; col < cols - 1; col++) {
          const x = col * RESOLUTION;
          const y = row * RESOLUTION;
          const tl = grid[row][col];
          const tr = grid[row][col + 1];
          const bl = grid[row + 1][col];
          const br2 = grid[row + 1][col + 1];

          const bits = (+(tl > threshold)) | ((+(tr > threshold)) << 1) | ((+(br2 > threshold)) << 2) | ((+(bl > threshold)) << 3);
          if (bits === 0 || bits === 15) continue;

          const top    = { x: x + lerp1d(0, RESOLUTION, (threshold - tl) / (tr - tl || 0.0001)), y };
          const bottom = { x: x + lerp1d(0, RESOLUTION, (threshold - bl) / (br2 - bl || 0.0001)), y: y + RESOLUTION };
          const left   = { x, y: y + lerp1d(0, RESOLUTION, (threshold - tl) / (bl - tl || 0.0001)) };
          const right  = { x: x + RESOLUTION, y: y + lerp1d(0, RESOLUTION, (threshold - tr) / (br2 - tr || 0.0001)) };

          const segs: Array<[typeof top, typeof top]> = [];
          switch (bits) {
            case 1: case 14: segs.push([top, left]); break;
            case 2: case 13: segs.push([top, right]); break;
            case 3: case 12: segs.push([left, right]); break;
            case 4: case 11: segs.push([bottom, right]); break;
            case 6: case 9:  segs.push([top, bottom]); break;
            case 7: case 8:  segs.push([bottom, left]); break;
            case 5:  segs.push([top, left]); segs.push([bottom, right]); break;
            case 10: segs.push([top, right]); segs.push([bottom, left]); break;
          }
          for (const [a, b] of segs) p.line(a.x, a.y, b.x, b.y);
        }
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    contour.setup(p, currentSeed, width, height);
  },
};
