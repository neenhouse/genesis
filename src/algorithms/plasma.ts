import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;
// Seeded offset values
let ox1 = 0, oy1 = 0, ox2 = 0, oy2 = 0, ox3 = 0;

export const plasma: Algorithm = {
  name: 'Plasma',
  description: 'Classic plasma — layered sine waves cycling through vivid rainbow hues',
  palette: { background: '#000000', colors: ['#ff0080', '#00ffcc', '#ffff00'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.pixelDensity(1);
    p.colorMode(p.HSB, 360, 100, 100, 100);
    time = 0;

    // Seeded offsets so each seed looks different
    ox1 = p.random(100);
    oy1 = p.random(100);
    ox2 = p.random(100);
    oy2 = p.random(100);
    ox3 = p.random(p.TWO_PI);

    p.background(0);
  },

  draw(p: p5) {
    p.loadPixels();
    const step = 2;
    const iw = w, ih = h;

    for (let py = 0; py < ih; py += step) {
      const yn = py / ih;
      for (let px = 0; px < iw; px += step) {
        const xn = px / iw;

        // Three overlapping sine waves
        const v1 = Math.sin(xn * 8 + ox1 + time);
        const v2 = Math.sin(yn * 6 + oy1 + time * 0.7);
        const v3 = Math.sin((xn + yn) * 5 + ox2 + time * 0.5);
        const v4 = Math.sin(Math.sqrt(
          (xn - 0.5 + 0.3 * Math.sin(time * 0.3 + ox3)) ** 2 +
          (yn - 0.5 + 0.3 * Math.cos(time * 0.4 + oy2)) ** 2
        ) * 12);

        const combined = (v1 + v2 + v3 + v4) / 4; // -1..1
        const hue = ((combined * 180 + time * 40) % 360 + 360) % 360;
        const sat = 80 + combined * 20;
        const bri = 75 + combined * 25;

        // Convert HSB to RGB inline for pixel writing
        const c = p.color(hue, sat, bri, 100);
        const r = p.red(c);
        const g = p.green(c);
        const b = p.blue(c);

        for (let dy = 0; dy < step && py + dy < ih; dy++) {
          for (let dx = 0; dx < step && px + dx < iw; dx++) {
            const i = 4 * ((py + dy) * iw + (px + dx));
            p.pixels[i] = r;
            p.pixels[i + 1] = g;
            p.pixels[i + 2] = b;
            p.pixels[i + 3] = 255;
          }
        }
      }
    }

    p.updatePixels();
    time += 0.022;
  },

  resize(p: p5, width: number, height: number) {
    plasma.setup(p, currentSeed, width, height);
    p.loop();
  },
};
