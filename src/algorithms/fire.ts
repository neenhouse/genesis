import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let buf: number[] = [];
let cols = 0, rows = 0;

// Map 0-255 fire value to RGB
function fireColor(val: number): [number, number, number] {
  if (val < 64) {
    return [val * 4, 0, 0];
  } else if (val < 128) {
    const t = (val - 64) / 64;
    return [255, Math.round(t * 165), 0];
  } else if (val < 200) {
    const t = (val - 128) / 72;
    return [255, 165 + Math.round(t * 90), 0];
  } else {
    const t = (val - 200) / 55;
    return [255, 255, Math.round(t * 255)];
  }
}

export const fire: Algorithm = {
  name: 'Fire',
  description: 'Classic fire effect — bottom-up heat propagation with decay creates living flame columns',
  palette: { background: '#000000', colors: ['#ff2200', '#ff8800', '#ffff00'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const SCALE = 3;
    cols = Math.ceil(w / SCALE);
    rows = Math.ceil(h / SCALE);
    buf = new Array(cols * rows).fill(0);
    p.background(0);
    p.pixelDensity(1);
  },

  draw(p: p5) {
    const SCALE = 3;

    // Seed the bottom row with random heat
    for (let x = 0; x < cols; x++) {
      const heat = Math.random() < 0.6 ? Math.floor(Math.random() * 80) + 175 : 0;
      buf[(rows - 1) * cols + x] = heat;
    }

    // Propagate upward: each cell = average of cells below with decay
    for (let y = 0; y < rows - 1; y++) {
      for (let x = 0; x < cols; x++) {
        const below = buf[(y + 1) * cols + x];
        const belowL = buf[(y + 1) * cols + ((x - 1 + cols) % cols)];
        const belowR = buf[(y + 1) * cols + ((x + 1) % cols)];
        const belowSelf = buf[y * cols + x];
        const avg = (below + belowL + belowR + belowSelf) / 4;
        buf[y * cols + x] = Math.max(0, avg - 0.85);
      }
    }

    // Render
    p.loadPixels();
    const pd = p.pixelDensity();
    const pw = p.width * pd;
    const ph = p.height * pd;

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const val = Math.min(255, Math.max(0, buf[y * cols + x]));
        const [r, g, b] = fireColor(Math.round(val));
        const px = x * SCALE;
        const py = y * SCALE;
        for (let sx = 0; sx < SCALE && px + sx < pw; sx++) {
          for (let sy = 0; sy < SCALE && py + sy < ph; sy++) {
            const idx = ((py + sy) * pw + (px + sx)) * 4;
            p.pixels[idx] = r;
            p.pixels[idx + 1] = g;
            p.pixels[idx + 2] = b;
            p.pixels[idx + 3] = 255;
          }
        }
      }
    }
    p.updatePixels();
  },

  resize(p: p5, width: number, height: number) {
    fire.setup(p, currentSeed, width, height);
    p.loop();
  },
};
