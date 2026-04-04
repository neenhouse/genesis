import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

function luminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export const glitch: Algorithm = {
  name: 'Glitch',
  description: 'Pixel sorting — luminance-ordered streaks through noise fields',
  palette: { background: '#1a1a1a', colors: ['#ff0080', '#00ff80', '#8000ff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.pixelDensity(1);

    // Step 1: Generate colorful noise image
    p.loadPixels();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const n1 = p.noise(x * 0.008, y * 0.008, seed * 0.1);
        const n2 = p.noise(x * 0.015 + 100, y * 0.015 + 100, seed * 0.1);
        const n3 = p.noise(x * 0.003 + 200, y * 0.003 + 200, seed * 0.1);

        const hue = (n1 * 360 + seed * 37) % 360;
        const sat = 0.6 + n2 * 0.4;
        const val = 0.3 + n3 * 0.7;

        // HSV to RGB
        const c = val * sat;
        const x2 = c * (1 - Math.abs(((hue / 60) % 2) - 1));
        const m = val - c;
        let r = 0, g = 0, b = 0;
        if (hue < 60) { r = c; g = x2; }
        else if (hue < 120) { r = x2; g = c; }
        else if (hue < 180) { g = c; b = x2; }
        else if (hue < 240) { g = x2; b = c; }
        else if (hue < 300) { r = x2; b = c; }
        else { r = c; b = x2; }

        const idx = 4 * (y * w + x);
        p.pixels[idx] = (r + m) * 255;
        p.pixels[idx + 1] = (g + m) * 255;
        p.pixels[idx + 2] = (b + m) * 255;
        p.pixels[idx + 3] = 255;
      }
    }
    p.updatePixels();

    // Step 2: Sort pixel rows by luminance (partial sort for glitch effect)
    p.loadPixels();
    for (let y = 0; y < h; y++) {
      // Determine sort threshold from noise — some rows get sorted, some don't
      const sortThreshold = p.noise(y * 0.01, seed * 0.1);
      if (sortThreshold < 0.3) continue; // Leave some rows unsorted

      // Find contiguous runs of pixels above luminance threshold
      const rowStart = y * w;
      let runStart = -1;

      for (let x = 0; x <= w; x++) {
        const idx = 4 * (rowStart + x);
        const lum = x < w ? luminance(p.pixels[idx], p.pixels[idx + 1], p.pixels[idx + 2]) : 0;
        const threshold = 50 + sortThreshold * 100;

        if (lum > threshold && x < w) {
          if (runStart === -1) runStart = x;
        } else if (runStart !== -1) {
          // Sort this run by luminance
          const run: { r: number; g: number; b: number; l: number }[] = [];
          for (let rx = runStart; rx < x; rx++) {
            const ri = 4 * (rowStart + rx);
            run.push({
              r: p.pixels[ri], g: p.pixels[ri + 1], b: p.pixels[ri + 2],
              l: luminance(p.pixels[ri], p.pixels[ri + 1], p.pixels[ri + 2]),
            });
          }
          run.sort((a, b) => a.l - b.l);

          for (let ri = 0; ri < run.length; ri++) {
            const pi = 4 * (rowStart + runStart + ri);
            p.pixels[pi] = run[ri].r;
            p.pixels[pi + 1] = run[ri].g;
            p.pixels[pi + 2] = run[ri].b;
          }
          runStart = -1;
        }
      }
    }
    p.updatePixels();

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    glitch.setup(p, currentSeed, width, height);
  },
};
