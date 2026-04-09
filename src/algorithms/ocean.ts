import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;

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

    p.loadPixels();
    const d = p.pixelDensity();
    const pw = w * d;
    const ph = h * d;

    for (let y = 0; y < ph; y++) {
      const ny = y / ph;
      for (let x = 0; x < pw; x++) {
        const nx = x / pw;

        // Caustic pattern: sum of sine/cosine distortions
        const a = Math.sin(nx * 8.0 + time) + Math.cos(ny * 6.0 + time * 0.7);
        const b = Math.cos(nx * 5.0 - time * 0.9) + Math.sin(ny * 9.0 + time * 1.1);
        const c = Math.sin((nx + ny) * 7.0 + time * 0.5);
        const d2 = p.noise(nx * 3 + time * 0.2, ny * 3 + time * 0.15) * 2 - 1;

        const caustic = (a + b + c + d2 * 1.5) / 5.5;
        const t = (caustic + 1) * 0.5;

        let r: number, g: number, bl: number;
        if (t < 0.3) {
          const s = t / 0.3;
          r = 0;
          g = 20 + s * 60 | 0;
          bl = 40 + s * 60 | 0;
        } else if (t < 0.65) {
          const s = (t - 0.3) / 0.35;
          r = 0;
          g = 80 + s * 80 | 0;
          bl = 100 + s * 80 | 0;
        } else if (t < 0.85) {
          const s = (t - 0.65) / 0.2;
          r = s * 30 | 0;
          g = 160 + s * 60 | 0;
          bl = 180 + s * 40 | 0;
        } else {
          const s = (t - 0.85) / 0.15;
          r = 30 + s * 150 | 0;
          g = 220 + s * 35 | 0;
          bl = 220 + s * 35 | 0;
        }

        const idx = (y * pw + x) * 4;
        p.pixels[idx] = r;
        p.pixels[idx + 1] = g;
        p.pixels[idx + 2] = bl;
        p.pixels[idx + 3] = 255;
      }
    }

    p.updatePixels();
  },

  resize(p: p5, width: number, height: number) {
    ocean.setup(p, currentSeed, width, height);
    p.loop();
  },
};
