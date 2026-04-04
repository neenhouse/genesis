import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Midpoint displacement to generate a mountain ridge
function generateRidge(p: p5, numPoints: number, baseY: number, roughness: number): number[] {
  const pts = new Array(numPoints).fill(0);
  pts[0] = baseY + p.random(-20, 20);
  pts[numPoints - 1] = baseY + p.random(-20, 20);

  function subdivide(lo: number, hi: number, scale: number) {
    if (hi - lo <= 1) return;
    const mid = Math.floor((lo + hi) / 2);
    pts[mid] = (pts[lo] + pts[hi]) / 2 + p.random(-scale, scale);
    subdivide(lo, mid, scale * roughness);
    subdivide(mid, hi, scale * roughness);
  }

  subdivide(0, numPoints - 1, (h * 0.18));
  return pts;
}

export const mountain: Algorithm = {
  name: 'Mountain',
  description: 'Layered mountain silhouettes — midpoint displacement ridges recede with atmospheric perspective',
  palette: { background: '#d0d8f0', colors: ['#7080b8', '#9090c8', '#c0c8e8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    const LAYERS = 6;
    const PTS = 128;

    // Sky gradient — light dusty blue at top to pale near horizon
    p.noStroke();
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const r = p.lerp(160, 220, t);
      const g = p.lerp(172, 228, t);
      const bl = p.lerp(210, 245, t);
      p.stroke(r, g, bl);
      p.line(0, y, w, y);
    }

    // Sun/moon glow near horizon
    p.noStroke();
    const sunX = w * 0.72;
    const sunY = h * 0.28;
    for (let i = 6; i >= 0; i--) {
      p.fill(255, 240, 200, 18 - i * 2);
      p.ellipse(sunX, sunY, 60 + i * 22, 60 + i * 22);
    }
    p.fill(255, 245, 210, 200);
    p.ellipse(sunX, sunY, 38, 38);

    // Mountain layers: farthest = lightest, closest = darkest
    for (let layer = 0; layer < LAYERS; layer++) {
      const t = layer / (LAYERS - 1);
      // Base altitude rises as layers come forward
      const baseY = h * p.lerp(0.30, 0.70, t);
      const roughness = p.lerp(0.7, 0.58, t);

      // Color: far = light lavender-blue, near = deep blue-purple
      const r = Math.round(p.lerp(190, 45, t));
      const g = Math.round(p.lerp(195, 52, t));
      const bl = Math.round(p.lerp(225, 95, t));
      const alpha = p.lerp(180, 255, t);

      const ridge = generateRidge(p, PTS, baseY, roughness);

      p.fill(r, g, bl, alpha);
      p.noStroke();
      p.beginShape();
      p.vertex(0, h);
      for (let i = 0; i < PTS; i++) {
        const x = (i / (PTS - 1)) * w;
        p.vertex(x, ridge[i]);
      }
      p.vertex(w, h);
      p.endShape(p.CLOSE);

      // Snow caps on closer ranges
      if (layer > LAYERS * 0.5) {
        p.fill(240, 240, 248, p.lerp(0, 160, (layer - LAYERS * 0.5) / (LAYERS * 0.5)));
        p.beginShape();
        p.vertex(0, h);
        for (let i = 0; i < PTS; i++) {
          const x = (i / (PTS - 1)) * w;
          const snowLine = ridge[i] + (h - ridge[i]) * 0.08;
          p.vertex(x, Math.min(ridge[i] + 20, snowLine));
        }
        p.vertex(w, h);
        p.endShape(p.CLOSE);
      }
    }

    // Foreground ground strip
    p.fill(30, 40, 70, 255);
    p.rect(0, h * 0.88, w, h * 0.12);

    p.noLoop();
  },

  draw(_p: p5) {
    // static
  },

  resize(p: p5, width: number, height: number) {
    mountain.setup(p, currentSeed, width, height);
    p.loop();
  },
};
