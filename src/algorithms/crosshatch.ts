import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const crosshatch: Algorithm = {
  name: 'Crosshatch',
  description: 'Generative crosshatching — ink lines vary in density by noise-based darkness',
  palette: { background: '#f5f0e0', colors: ['#1a1209', '#2c2010', '#3d3018'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    p.background(245, 240, 224);

    const cellSize = 10;
    const lineLen = cellSize * 1.2;
    const noiseScale = p.random(0.003, 0.007);
    const noiseOctave2 = p.random(0.015, 0.03);

    p.strokeWeight(0.7);
    p.stroke(26, 18, 9, 200);

    // Pass 1: horizontal hatching (0°)
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        const darkness = p.noise(x * noiseScale, y * noiseScale);
        if (darkness > 0.3) {
          const jx = x + p.random(-1, 1);
          const jy = y + p.random(-1, 1);
          p.line(jx - lineLen / 2, jy, jx + lineLen / 2, jy);
        }
      }
    }

    // Pass 2: 45° hatching for darker areas
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        const darkness = p.noise(x * noiseScale, y * noiseScale);
        if (darkness > 0.52) {
          const jx = x + p.random(-1, 1);
          const jy = y + p.random(-1, 1);
          const dx = Math.cos(Math.PI / 4) * lineLen / 2;
          const dy = Math.sin(Math.PI / 4) * lineLen / 2;
          p.line(jx - dx, jy - dy, jx + dx, jy + dy);
        }
      }
    }

    // Pass 3: 135° cross-hatch for darkest areas
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        const darkness = p.noise(x * noiseScale + 500, y * noiseScale + 500);
        const d2 = p.noise(x * noiseOctave2, y * noiseOctave2 + 300);
        if (darkness > 0.55 && d2 > 0.48) {
          const jx = x + p.random(-1, 1);
          const jy = y + p.random(-1, 1);
          const dx = Math.cos(-Math.PI / 4) * lineLen / 2;
          const dy = Math.sin(-Math.PI / 4) * lineLen / 2;
          p.line(jx - dx, jy - dy, jx + dx, jy + dy);
        }
      }
    }

    // Pass 4: vertical hatching for very dark areas
    for (let y = 0; y < h; y += cellSize) {
      for (let x = 0; x < w; x += cellSize) {
        const darkness = p.noise(x * noiseScale, y * noiseScale);
        const d2 = p.noise(x * noiseOctave2 + 200, y * noiseOctave2 + 100);
        if (darkness > 0.68 && d2 > 0.5) {
          const jx = x + p.random(-1, 1);
          const jy = y + p.random(-1, 1);
          p.line(jx, jy - lineLen / 2, jx, jy + lineLen / 2);
        }
      }
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // Static
  },

  resize(p: p5, width: number, height: number) {
    crosshatch.setup(p, currentSeed, width, height);
    p.loop();
  },
};
