import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

let gridW: number, gridH: number;
let grid: Uint8Array;   // 0=empty, 1..N=color index
let colorTable: [number, number, number][];
let frameCount = 0;

const EMPTY = 0;
const SAND_COLORS: [number, number, number][] = [
  [220, 180, 80],   // gold
  [200, 140, 60],   // amber
  [180, 100, 40],   // brown
  [230, 160, 70],   // light gold
  [160, 80, 30],    // dark rust
  [240, 200, 100],  // pale sand
  [190, 120, 55],   // mid-brown
];

const SCALE = 3; // pixels per sand cell

function cellIdx(cx: number, cy: number): number { return cy * gridW + cx; }

function isEmpty(cx: number, cy: number): boolean {
  if (cx < 0 || cx >= gridW || cy < 0 || cy >= gridH) return false;
  return grid[cellIdx(cx, cy)] === EMPTY;
}

function swap(ax: number, ay: number, bx: number, by: number) {
  const ai = cellIdx(ax, ay), bi = cellIdx(bx, by);
  const tmp = grid[ai]; grid[ai] = grid[bi]; grid[bi] = tmp;
}

export const sand: Algorithm = {
  name: 'Sand',
  description: 'Falling sand — grains pile up and slide in desert hues',
  palette: { background: '#1a1008', colors: ['#dcb450', '#c88c3c', '#a05028'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.pixelDensity(1);

    gridW = Math.floor(w / SCALE);
    gridH = Math.floor(h / SCALE);
    grid = new Uint8Array(gridW * gridH);
    colorTable = SAND_COLORS;
    frameCount = 0;

    p.background(26, 16, 8);
  },

  draw(p: p5) {
    frameCount++;

    // Drop new sand grains from random top positions
    const drops = 3 + Math.floor(p.random(5));
    for (let d = 0; d < drops; d++) {
      const cx = Math.floor(p.random(gridW));
      if (isEmpty(cx, 0)) {
        const colorIdx = 1 + Math.floor(p.random(colorTable.length));
        grid[cellIdx(cx, 0)] = colorIdx;
      }
    }

    // Update sand — iterate bottom-to-top, alternating horizontal direction
    const leftToRight = frameCount % 2 === 0;
    for (let cy = gridH - 2; cy >= 0; cy--) {
      const startX = leftToRight ? 0 : gridW - 1;
      const endX = leftToRight ? gridW : -1;
      const dx = leftToRight ? 1 : -1;

      for (let cx = startX; cx !== endX; cx += dx) {
        if (grid[cellIdx(cx, cy)] === EMPTY) continue;

        // Fall straight down
        if (isEmpty(cx, cy + 1)) {
          swap(cx, cy, cx, cy + 1);
        } else {
          // Slide diagonally
          const goLeft = p.random() > 0.5;
          const d1 = goLeft ? -1 : 1;
          const d2 = goLeft ? 1 : -1;
          if (isEmpty(cx + d1, cy + 1)) {
            swap(cx, cy, cx + d1, cy + 1);
          } else if (isEmpty(cx + d2, cy + 1)) {
            swap(cx, cy, cx + d2, cy + 1);
          }
        }
      }
    }

    // Render grid to pixels
    p.loadPixels();
    for (let cy = 0; cy < gridH; cy++) {
      for (let cx = 0; cx < gridW; cx++) {
        const v = grid[cellIdx(cx, cy)];
        let r = 26, g = 16, b = 8;
        if (v > 0) {
          const col = colorTable[(v - 1) % colorTable.length];
          r = col[0]; g = col[1]; b = col[2];
        }
        for (let py = 0; py < SCALE && cy * SCALE + py < h; py++) {
          for (let px = 0; px < SCALE && cx * SCALE + px < w; px++) {
            const i = 4 * ((cy * SCALE + py) * w + (cx * SCALE + px));
            p.pixels[i] = r;
            p.pixels[i + 1] = g;
            p.pixels[i + 2] = b;
            p.pixels[i + 3] = 255;
          }
        }
      }
    }
    p.updatePixels();
  },

  resize(p: p5, width: number, height: number) {
    sand.setup(p, currentSeed, width, height);
    p.loop();
  },
};
