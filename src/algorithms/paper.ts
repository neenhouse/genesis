import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const paper: Algorithm = {
  name: 'Paper',
  description: 'Crumpled paper texture — noise-based shading simulates folds, shadows, and highlights',
  palette: { background: '#f4f0e8', colors: ['#f4f0e8', '#c8bfaa', '#8a7f70'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const STEP = 2;
    p.noiseDetail(6, 0.55);
    p.background(244, 240, 232);
    p.noStroke();

    // Build crumpled paper via layered noise
    for (let x = 0; x < w; x += STEP) {
      for (let y = 0; y < h; y += STEP) {
        const nx = x / w;
        const ny = y / h;

        // Coarse folds
        const fold = p.noise(nx * 4, ny * 4);
        // Fine grain
        const grain = p.noise(nx * 20, ny * 20) * 0.15;
        // Sharp crease ridges — pick ridges near 0.5
        const crease = Math.abs(p.noise(nx * 8 + 50, ny * 6 + 50) - 0.5);
        const creaseSharp = Math.exp(-crease * crease * 80) * 0.35;

        // Normal-ish lighting: use gradient of noise as fake normal
        const dxN = p.noise(nx * 4 + 0.01, ny * 4) - p.noise(nx * 4 - 0.01, ny * 4);
        const dyN = p.noise(nx * 4, ny * 4 + 0.01) - p.noise(nx * 4, ny * 4 - 0.01);
        // Light from top-left
        const lightDir = { x: 0.6, y: 0.8 };
        const diffuse = dxN * lightDir.x + dyN * lightDir.y;

        const base = 240;
        const shadow = p.map(fold, 0, 1, -60, 30);
        const diff = diffuse * 80;
        const grainVal = grain * 40;

        const lightness = base + shadow + diff + grainVal - creaseSharp * 90;
        const clamped = Math.min(255, Math.max(160, lightness));

        // Slight warm tint: reduce blue in shadows
        const warmR = clamped;
        const warmG = clamped * 0.97;
        const warmB = clamped * 0.90;

        p.fill(warmR, warmG, warmB);
        p.rect(x, y, STEP, STEP);
      }
    }

    // Subtle vignette
    for (let i = 0; i < 80; i++) {
      const t = i / 80;
      p.noFill();
      p.stroke(180, 170, 150, t * 8);
      p.strokeWeight(1);
      p.rect(i, i, w - i * 2, h - i * 2);
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // static
  },

  resize(p: p5, width: number, height: number) {
    paper.setup(p, currentSeed, width, height);
    p.loop();
  },
};
