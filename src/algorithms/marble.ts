import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
let currentSeed = 0;
let done = false;
let py = 0;
const STEP = 2;

export const marble: Algorithm = {
  name: 'Marble',
  description: 'Domain-warped noise creates flowing marble veins pixel by pixel',
  palette: {
    background: '#f2ede6',
    colors: ['#e8ddd0', '#c4b8a8', '#888070', '#ffffff'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    currentSeed = seed;
    done = false;
    py = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(242, 237, 230);
    p.noStroke();
    p.pixelDensity(1);
  },

  draw(p: p5) {
    if (done) { p.noLoop(); return; }

    const rowsPerFrame = 8;
    for (let row = 0; row < rowsPerFrame && py < h; row++, py += STEP) {
      for (let x = 0; x < w; x += STEP) {
        const nx = x / w;
        const ny = py / h;
        const scale = 3.0;

        // domain warp: first pass
        const wx = p.noise(nx * scale, ny * scale) * 2.0 - 1.0;
        const wy = p.noise(nx * scale + 5.2, ny * scale + 1.3) * 2.0 - 1.0;

        // second pass with warped coords
        const warp = 1.2;
        const fx = p.noise((nx + warp * wx) * scale, (ny + warp * wy) * scale);

        // vein pattern via sine
        const vein = Math.sin(nx * 8.0 + fx * 12.0);

        // map vein to marble colors
        const t = (vein + 1.0) * 0.5;
        let r, g, b;
        if (t < 0.3) {
          const s = t / 0.3;
          r = p.lerp(232, 196, s); g = p.lerp(221, 184, s); b = p.lerp(208, 168, s);
        } else if (t < 0.6) {
          const s = (t - 0.3) / 0.3;
          r = p.lerp(196, 136, s); g = p.lerp(184, 128, s); b = p.lerp(168, 112, s);
        } else if (t < 0.85) {
          const s = (t - 0.6) / 0.25;
          r = p.lerp(248, 255, s); g = p.lerp(244, 255, s); b = p.lerp(240, 255, s);
        } else {
          r = 255; g = 255; b = 255;
        }

        p.fill(r, g, b);
        p.rect(x, py, STEP, STEP);
      }
    }

    if (py >= h) done = true;
  },

  resize(p: p5, width: number, height: number) {
    marble.setup(p, currentSeed, width, height);
    p.loop();
  },
};
