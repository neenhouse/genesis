import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;
const STEP = 2;

export const ocean: Algorithm = {
  name: 'Ocean',
  description: 'Ocean surface from above — animated caustic light patterns from overlapping sine/cosine waves',
  palette: { background: '#0a2a3a', colors: ['#00c8c8', '#007a8c', '#003d5c'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0;
    p.pixelDensity(1);
    p.noStroke();
    p.background(10, 30, 50);
  },

  draw(p: p5) {
    time += 0.018;

    for (let y = 0; y < h; y += STEP) {
      for (let x = 0; x < w; x += STEP) {
        const nx = x / w;
        const ny = y / h;

        // Caustic pattern: sum of sine/cosine distortions
        const a = Math.sin(nx * 8.0 + time) + Math.cos(ny * 6.0 + time * 0.7);
        const b = Math.cos(nx * 5.0 - time * 0.9) + Math.sin(ny * 9.0 + time * 1.1);
        const c = Math.sin((nx + ny) * 7.0 + time * 0.5);
        const d = p.noise(nx * 3 + time * 0.2, ny * 3 + time * 0.15) * 2 - 1;

        const caustic = (a + b + c + d * 1.5) / 5.5; // -1 to 1
        const t = (caustic + 1) * 0.5;                // 0 to 1

        let r, g, b2;
        if (t < 0.3) {
          const s = t / 0.3;
          r = Math.floor(p.lerp(0, 0, s));
          g = Math.floor(p.lerp(20, 80, s));
          b2 = Math.floor(p.lerp(40, 100, s));
        } else if (t < 0.65) {
          const s = (t - 0.3) / 0.35;
          r = Math.floor(p.lerp(0, 0, s));
          g = Math.floor(p.lerp(80, 160, s));
          b2 = Math.floor(p.lerp(100, 180, s));
        } else if (t < 0.85) {
          const s = (t - 0.65) / 0.2;
          r = Math.floor(p.lerp(0, 30, s));
          g = Math.floor(p.lerp(160, 220, s));
          b2 = Math.floor(p.lerp(180, 220, s));
        } else {
          const s = (t - 0.85) / 0.15;
          r = Math.floor(p.lerp(30, 180, s));
          g = Math.floor(p.lerp(220, 255, s));
          b2 = Math.floor(p.lerp(220, 255, s));
        }

        p.fill(r, g, b2);
        p.rect(x, y, STEP, STEP);
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    ocean.setup(p, currentSeed, width, height);
    p.loop();
  },
};
