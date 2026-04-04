import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const GOLD_COLORS = [
  [255, 200, 30],
  [255, 170, 20],
  [240, 140, 15],
  [255, 220, 80],
  [230, 120, 10],
];

export const radial: Algorithm = {
  name: 'Radial',
  description: 'Noise-driven radial burst — sun/dandelion lines of varying length and thickness from center',
  palette: { background: '#120a00', colors: ['#ffc81e', '#ffaa14', '#f08c0f'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    p.background(18, 10, 0);

    const cx = w / 2;
    const cy = h / 2;
    const maxRadius = Math.min(w, h) * 0.48;
    const rayCount = 280 + Math.floor(p.random(80));
    const innerRadius = maxRadius * 0.04;

    // Subtle radial gradient background glow
    for (let r = maxRadius * 0.8; r > 0; r -= 6) {
      const alpha = p.map(r, 0, maxRadius * 0.8, 25, 0);
      p.noStroke();
      p.fill(120, 60, 0, alpha);
      p.ellipse(cx, cy, r * 2);
    }

    // Draw rays
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * p.TWO_PI;

      // Multiple noise octaves for varied length
      const n1 = p.noise(Math.cos(angle) * 1.5 + 2, Math.sin(angle) * 1.5 + 2);
      const n2 = p.noise(Math.cos(angle) * 3.5 + 10, Math.sin(angle) * 3.5 + 10);
      const n3 = p.noise(Math.cos(angle) * 7 + 20, Math.sin(angle) * 7 + 20);

      const lengthRatio = n1 * 0.55 + n2 * 0.3 + n3 * 0.15;
      const rayLen = innerRadius + lengthRatio * (maxRadius - innerRadius);

      // Thickness also driven by noise
      const thickNoise = p.noise(Math.cos(angle) * 2 + 50, Math.sin(angle) * 2 + 50);
      const strokeW = 0.4 + thickNoise * 3.0;

      // Color selection
      const colorIdx = Math.floor(thickNoise * GOLD_COLORS.length);
      const [r, g, b] = GOLD_COLORS[colorIdx % GOLD_COLORS.length];

      const x1 = cx + Math.cos(angle) * innerRadius;
      const y1 = cy + Math.sin(angle) * innerRadius;
      const x2 = cx + Math.cos(angle) * rayLen;
      const y2 = cy + Math.sin(angle) * rayLen;

      // Glow
      p.stroke(r, g, b, 30);
      p.strokeWeight(strokeW * 3);
      p.line(x1, y1, x2, y2);

      // Core
      p.stroke(r, g, b, 200 + thickNoise * 55);
      p.strokeWeight(strokeW);
      p.line(x1, y1, x2, y2);
    }

    // Center disc
    for (let ring = 6; ring > 0; ring--) {
      p.noStroke();
      p.fill(255, 220, 60, 35 * ring);
      p.ellipse(cx, cy, innerRadius * 2 * ring * 0.5);
    }
    p.fill(255, 240, 120, 255);
    p.noStroke();
    p.ellipse(cx, cy, innerRadius * 1.4);

    // Scattered seed dots (dandelion seeds)
    const seedCount = 60 + Math.floor(p.random(40));
    for (let i = 0; i < seedCount; i++) {
      const angle = p.random(p.TWO_PI);
      const dist = p.random(maxRadius * 0.1, maxRadius * 0.92);
      const sx = cx + Math.cos(angle) * dist;
      const sy = cy + Math.sin(angle) * dist;
      const nv = p.noise(sx * 0.008, sy * 0.008);
      if (nv > 0.55) {
        const [r, g, b] = GOLD_COLORS[Math.floor(nv * GOLD_COLORS.length) % GOLD_COLORS.length];
        p.fill(r, g, b, 180);
        p.ellipse(sx, sy, 2.5, 2.5);
      }
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    radial.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
