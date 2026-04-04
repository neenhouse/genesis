import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Brilliant cut facet colors for prismatic effect
const FACET_COLORS: Array<[number, number, number, number]> = [
  [255, 255, 255, 240], // white
  [180, 220, 255, 200], // light blue
  [255, 200, 180, 200], // light pink
  [200, 255, 200, 200], // light green
  [255, 255, 160, 200], // yellow
  [230, 180, 255, 200], // violet
  [160, 230, 255, 200], // cyan
  [255, 210, 100, 180], // amber
];

export const gem: Algorithm = {
  name: 'Gem',
  description: 'Brilliant-cut diamond from above — calculated facet angles, prismatic light',
  palette: { background: '#0d0d1a', colors: ['#ffffff', '#b4d8ff', '#ffd6cc'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(13, 13, 26);

    const cx = w / 2;
    const cy = h / 2;
    const gemR = Math.min(w, h) * 0.40;
    const innerR = gemR * 0.62;
    const tableR = gemR * 0.38;

    // Dark velvet background glow
    for (let i = 6; i > 0; i--) {
      const t = i / 6;
      p.noFill();
      p.stroke(60, 40, 120, t * 15);
      p.strokeWeight(gemR * 0.12 * t);
      p.circle(cx, cy, gemR * 2 + gemR * 0.3 * t);
    }

    const facetCount = 8; // main kite facets
    const lightDir = p.random(p.TWO_PI);

    p.strokeWeight(0.6);

    // Outer girdle facets (bezel facets)
    for (let i = 0; i < facetCount; i++) {
      const a1 = (i / facetCount) * p.TWO_PI + lightDir;
      const a2 = ((i + 1) / facetCount) * p.TWO_PI + lightDir;
      const aMid = (a1 + a2) * 0.5;

      // Kite facet: outer edge to table edge
      const x1 = cx + Math.cos(a1) * gemR;
      const y1 = cy + Math.sin(a1) * gemR;
      const x2 = cx + Math.cos(a2) * gemR;
      const y2 = cy + Math.sin(a2) * gemR;
      const x3 = cx + Math.cos(a2) * innerR;
      const y3 = cy + Math.sin(a2) * innerR;
      const x4 = cx + Math.cos(a1) * innerR;
      const y4 = cy + Math.sin(a1) * innerR;

      // Facet brightness based on angle to light
      const dot = (Math.cos(aMid) + Math.sin(aMid)) * 0.707;
      const colorIdx = (i + Math.floor(dot * 3) + 8) % FACET_COLORS.length;
      const [r, g, b, a] = FACET_COLORS[colorIdx];
      const brightness = 0.5 + 0.5 * dot;
      p.fill(r * brightness, g * brightness, b * brightness, a);
      p.stroke(255, 255, 255, 40);
      p.beginShape();
      p.vertex(x1, y1); p.vertex(x2, y2);
      p.vertex(x3, y3); p.vertex(x4, y4);
      p.endShape(p.CLOSE);
    }

    // Upper girdle half-facets
    for (let i = 0; i < facetCount * 2; i++) {
      const a1 = (i / (facetCount * 2)) * p.TWO_PI + lightDir;
      const a2 = ((i + 0.5) / (facetCount * 2)) * p.TWO_PI + lightDir;
      const aMid = (a1 + a2) * 0.5;
      const x1 = cx + Math.cos(a1) * gemR;
      const y1 = cy + Math.sin(a1) * gemR;
      const x2 = cx + Math.cos(a2) * gemR;
      const y2 = cy + Math.sin(a2) * gemR;
      const x3 = cx + Math.cos(aMid) * innerR * 0.82;
      const y3 = cy + Math.sin(aMid) * innerR * 0.82;

      const dot = Math.sin(aMid + lightDir);
      const bright = 0.4 + 0.6 * Math.abs(dot);
      const colorIdx = (i * 3 + 2) % FACET_COLORS.length;
      const [r, g, b, a] = FACET_COLORS[colorIdx];
      p.fill(r * bright, g * bright, b * bright, a * 0.8);
      p.stroke(255, 255, 255, 25);
      p.triangle(x1, y1, x2, y2, x3, y3);
    }

    // Table (flat top octagon)
    p.noStroke();
    p.fill(220, 235, 255, 200);
    p.beginShape();
    for (let i = 0; i < facetCount; i++) {
      const a = (i / facetCount) * p.TWO_PI + lightDir;
      p.vertex(cx + Math.cos(a) * tableR, cy + Math.sin(a) * tableR);
    }
    p.endShape(p.CLOSE);

    // Table highlight
    p.fill(255, 255, 255, 120);
    p.circle(cx - tableR * 0.2, cy - tableR * 0.2, tableR * 0.4);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    gem.setup(p, currentSeed, width, height);
  },
};
