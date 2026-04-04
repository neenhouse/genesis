import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const field: Algorithm = {
  name: 'Field',
  description: 'Noise-based vector field — arrows show flow direction and magnitude across the canvas',
  palette: { background: '#0d2b2b', colors: ['#ffffff', '#80d4d4', '#4ab8b8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const STEP = 32;
    const ARROW_SCALE = 18;

    p.background(13, 43, 43);
    p.noiseDetail(2, 0.5);

    for (let x = STEP / 2; x < w; x += STEP) {
      for (let y = STEP / 2; y < h; y += STEP) {
        const nx = x / w;
        const ny = y / h;

        // Two noise samples offset to form a vector
        const angle = p.noise(nx * 3, ny * 3) * p.TWO_PI * 2;
        const mag = 0.4 + p.noise(nx * 3 + 100, ny * 3 + 100) * 0.6;

        const dx = Math.cos(angle) * mag * ARROW_SCALE;
        const dy = Math.sin(angle) * mag * ARROW_SCALE;

        const alpha = p.map(mag, 0, 1, 80, 220);
        const brightness = p.map(mag, 0, 1, 100, 255);

        p.stroke(brightness, 200, 200, alpha);
        p.strokeWeight(1.2);

        // Arrow shaft
        p.line(x - dx * 0.5, y - dy * 0.5, x + dx * 0.5, y + dy * 0.5);

        // Arrowhead
        const tipX = x + dx * 0.5;
        const tipY = y + dy * 0.5;
        const headAngle = Math.atan2(dy, dx);
        const headLen = 5 * mag;
        const spread = 0.45;
        p.line(tipX, tipY,
          tipX - Math.cos(headAngle - spread) * headLen,
          tipY - Math.sin(headAngle - spread) * headLen);
        p.line(tipX, tipY,
          tipX - Math.cos(headAngle + spread) * headLen,
          tipY - Math.sin(headAngle + spread) * headLen);
      }
    }
    p.noLoop();
  },

  draw(_p: p5) {
    // static — nothing to update
  },

  resize(p: p5, width: number, height: number) {
    field.setup(p, currentSeed, width, height);
    p.loop();
  },
};
