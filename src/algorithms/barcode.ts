import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const barcode: Algorithm = {
  name: 'Barcode',
  description: 'Generative barcode art — noise-driven vertical bars with varying width and density bands',
  palette: { background: '#ffffff', colors: ['#000000', '#222222', '#111111'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(255);
    p.noStroke();

    // Define density zones via noise-derived sections
    const zoneCount = 6 + Math.floor(p.random(6));

    let x = 0;
    while (x < w) {
      const nx = x / w;
      const zone = Math.floor(nx * zoneCount);

      // Zone-level density from noise
      const zoneDensity = p.noise(zone * 0.4 + seed * 0.001);

      // Individual bar properties
      const barWidth = p.noise(nx * 8, 1.0) * 6 * (0.3 + zoneDensity) + 0.5;
      const gapWidth = p.noise(nx * 8, 2.0) * 8 * (1.0 - zoneDensity * 0.6) + 0.5;

      // Slight color variation — mostly black but some dark gray
      const darkness = Math.floor(p.noise(nx * 5, 3.0) * 40);
      p.fill(darkness, darkness, darkness);

      // Height variation — some bars shorter
      const heightFactor = 0.7 + p.noise(nx * 4, 4.0) * 0.3;
      const barH = h * heightFactor;
      const barY = (h - barH) * (p.noise(nx * 3, 5.0) > 0.5 ? 0 : 0.5);

      p.rect(x, barY, barWidth, barH);

      x += barWidth + gapWidth;
    }

    // Quiet zone markers (standard barcode style)
    p.fill(0);
    p.rect(0, 0, 3, h);
    p.rect(w - 3, 0, 3, h);

    // Faint horizontal scan line for aesthetic
    p.fill(0, 0, 0, 12);
    const scanY = h * (0.3 + p.random(0.4));
    p.rect(0, scanY, w, 1);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    barcode.setup(p, currentSeed, width, height);
  },
};
