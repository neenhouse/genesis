import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, time = 0;
let sources: { x: number; y: number; freq: number; phase: number }[] = [];

export const signal: Algorithm = {
  name: 'Signal',
  description: 'Wave interference — overlapping fields creating moire patterns',
  palette: { background: '#000000', colors: ['#ffffff', '#4488cc', '#88aadd'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; time = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    const count = 3 + Math.floor(p.random(4));
    sources = [];
    for (let i = 0; i < count; i++) {
      sources.push({
        x: p.random(w * 0.1, w * 0.9), y: p.random(h * 0.1, h * 0.9),
        freq: p.random(0.01, 0.04), phase: p.random(p.TWO_PI),
      });
    }
    p.background(0);
    p.pixelDensity(1);
  },

  draw(p: p5) {
    p.loadPixels();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let val = 0;
        for (const src of sources) {
          const dx = x - src.x, dy = y - src.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          val += Math.sin(dist * src.freq + time + src.phase);
        }
        val = (val / sources.length + 1) / 2;
        const bright = val * 255;
        const idx = 4 * (y * w + x);
        p.pixels[idx] = bright * 0.95;
        p.pixels[idx+1] = bright * 0.97;
        p.pixels[idx+2] = Math.min(255, bright * 1.05);
        p.pixels[idx+3] = 255;
      }
    }
    p.updatePixels();
    time += 0.05;
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
