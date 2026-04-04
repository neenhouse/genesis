import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let grid: Uint8Array;
let cols = 0, rows = 0;
const SCALE = 2;
let walkerCount = 0;
const MAX_WALKERS = 15000;
let spawnRadius = 10;
let maxRadius = 0;

export const coral: Algorithm = {
  name: 'Coral',
  description: 'Diffusion-limited aggregation — crystal growth from a single seed',
  palette: { background: '#0a0a20', colors: ['#88ccff', '#ffffff', '#4488aa'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    cols = Math.floor(w / SCALE);
    rows = Math.floor(h / SCALE);
    grid = new Uint8Array(cols * rows);

    // Seed point at center
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    grid[cy * cols + cx] = 1;

    walkerCount = 0;
    spawnRadius = 10;
    maxRadius = 0;

    p.background(10, 10, 32);
    p.pixelDensity(1);

    // Draw seed
    p.noStroke();
    p.fill(255);
    p.rect(cx * SCALE, cy * SCALE, SCALE, SCALE);
  },

  draw(p: p5) {
    if (walkerCount >= MAX_WALKERS || spawnRadius >= Math.min(cols, rows) / 2 - 5) {
      p.noLoop();
      return;
    }

    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);

    // Process multiple walkers per frame
    for (let w2 = 0; w2 < 50; w2++) {
      // Spawn walker on circle around structure
      const angle = p.random(p.TWO_PI);
      let wx = cx + Math.floor(Math.cos(angle) * (spawnRadius + 5));
      let wy = cy + Math.floor(Math.sin(angle) * (spawnRadius + 5));

      let stuck = false;
      let steps = 0;
      const maxSteps = 5000;

      while (!stuck && steps < maxSteps) {
        // Random walk
        const dir = Math.floor(p.random(4));
        if (dir === 0) wx++;
        else if (dir === 1) wx--;
        else if (dir === 2) wy++;
        else wy--;

        // Kill if too far
        const dx = wx - cx, dy = wy - cy;
        if (dx * dx + dy * dy > (spawnRadius + 20) * (spawnRadius + 20)) break;
        if (wx < 1 || wx >= cols - 1 || wy < 1 || wy >= rows - 1) break;

        // Check neighbors
        if (grid[(wy - 1) * cols + wx] || grid[(wy + 1) * cols + wx] ||
            grid[wy * cols + wx - 1] || grid[wy * cols + wx + 1]) {
          grid[wy * cols + wx] = 1;
          stuck = true;
          walkerCount++;

          // Update max radius
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > maxRadius) {
            maxRadius = dist;
            spawnRadius = maxRadius + 5;
          }

          // Draw
          const brightness = 0.5 + p.noise(wx * 0.03, wy * 0.03) * 0.5;
          const distNorm = dist / (Math.min(cols, rows) / 2);
          p.noStroke();
          p.fill(
            136 * brightness + 120 * distNorm,
            204 * brightness,
            255 * brightness,
            200
          );
          p.rect(wx * SCALE, wy * SCALE, SCALE, SCALE);
        }
        steps++;
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    coral.setup(p, currentSeed, width, height);
    p.loop();
  },
};
