import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const geode: Algorithm = {
  name: 'Geode',
  description: 'Crystal geode cross-section — concentric rock bands with inner amethyst crystal formations',
  palette: { background: '#2a1a3a', colors: ['#9b59b6', '#7d3c98', '#e8d5f0', '#6c3483'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(20, 12, 28);

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.44;

    // Outer rock bands (gray/brown)
    const bandColors = [
      [80, 72, 68], [100, 90, 84], [70, 64, 60],
      [90, 82, 76], [110, 100, 94], [60, 56, 52],
    ];
    const bands = 5 + Math.floor(p.random(4));
    for (let b = 0; b < bands; b++) {
      const t = b / bands;
      const r = maxR * (1.0 - t * 0.45);
      const noisePoints = 60;
      const col = bandColors[b % bandColors.length];
      p.fill(col[0], col[1], col[2]);
      p.noStroke();
      p.beginShape();
      for (let i = 0; i <= noisePoints; i++) {
        const angle = (i / noisePoints) * p.TWO_PI;
        const n = p.noise(Math.cos(angle) * 1.5 + b * 3, Math.sin(angle) * 1.5 + b * 3);
        const rr = r * (0.95 + n * 0.1);
        p.vertex(cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr);
      }
      p.endShape(p.CLOSE);
    }

    // Amethyst band
    const innerR = maxR * 0.52;
    const crystalBandR = maxR * 0.58;
    p.fill(90, 40, 120);
    p.noStroke();
    p.ellipse(cx, cy, crystalBandR * 2, crystalBandR * 2);

    // Dark cavity
    p.fill(14, 8, 22);
    p.ellipse(cx, cy, innerR * 2, innerR * 2);

    // Crystal formations pointing inward
    const crystalCount = 28 + Math.floor(p.random(20));
    for (let i = 0; i < crystalCount; i++) {
      const angle = (i / crystalCount) * p.TWO_PI + p.random(-0.08, 0.08);
      const baseR = crystalBandR * 0.96;
      const crystalLen = innerR * p.random(0.3, 0.8);
      const crystalW = 3 + p.random(6);

      // Crystal color — amethyst range
      const bright = p.random();
      const cr = Math.floor(100 + bright * 80);
      const cg = Math.floor(30 + bright * 40);
      const cb = Math.floor(140 + bright * 100);
      const alpha = 180 + Math.floor(p.random(75));

      const bx = cx + Math.cos(angle) * baseR;
      const by = cy + Math.sin(angle) * baseR;
      const tipR = baseR - crystalLen;
      const tx = cx + Math.cos(angle) * tipR;
      const ty = cy + Math.sin(angle) * tipR;
      const perp = angle + p.HALF_PI;
      const hw = crystalW / 2;

      p.fill(cr, cg, cb, alpha);
      p.noStroke();
      p.beginShape();
      p.vertex(bx + Math.cos(perp) * hw, by + Math.sin(perp) * hw);
      p.vertex(bx - Math.cos(perp) * hw, by - Math.sin(perp) * hw);
      p.vertex(tx, ty);
      p.endShape(p.CLOSE);

      // Crystal highlight
      p.stroke(220, 190, 255, 60);
      p.strokeWeight(0.5);
      p.line(bx + Math.cos(perp) * hw * 0.5, by + Math.sin(perp) * hw * 0.5, tx, ty);
    }

    // Center cavity sheen
    p.noFill();
    for (let i = 3; i >= 1; i--) {
      p.stroke(160, 100, 220, 15 * i);
      p.strokeWeight(i * 2);
      p.ellipse(cx, cy, (innerR - 10) * 2 * (i / 3), (innerR - 10) * 2 * (i / 3));
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    geode.setup(p, currentSeed, width, height);
  },
};
