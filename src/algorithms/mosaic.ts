import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const TILE_COLORS = [
  [196, 98, 60],   // terracotta
  [210, 130, 70],  // warm orange
  [180, 70, 50],   // deep red
  [60, 100, 160],  // cobalt blue
  [80, 130, 190],  // medium blue
  [40, 70, 130],   // deep blue
  [210, 175, 60],  // gold
  [230, 195, 80],  // light gold
  [235, 220, 180], // cream
  [220, 205, 165], // warm cream
];

export const mosaic: Algorithm = {
  name: 'Mosaic',
  description: 'Roman-style mosaic with irregular polygonal tiles colored by noise regions with grout lines',
  palette: { background: '#8a8070', colors: ['#c4623c', '#3c64a0', '#d2af3c', '#ebdcb4'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    // Grout color background
    p.background(130, 120, 110);

    const tileSize = Math.max(8, Math.min(w, h) * 0.028);
    const grout = Math.max(1, tileSize * 0.12);
    const cols = Math.ceil(w / tileSize) + 1;
    const rows = Math.ceil(h / tileSize) + 1;

    p.noStroke();

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const bx = col * tileSize;
        const by = row * tileSize;

        // Jitter tile position slightly for irregular feel
        const jx = p.random(-tileSize * 0.18, tileSize * 0.18);
        const jy = p.random(-tileSize * 0.18, tileSize * 0.18);
        const tx = bx + jx;
        const ty = by + jy;
        const tw = tileSize - grout + p.random(-1, 1);
        const th = tileSize - grout + p.random(-1, 1);

        // Choose color region via noise
        const nv = p.noise(col * 0.12, row * 0.12);
        const colorIdx = Math.floor(nv * TILE_COLORS.length) % TILE_COLORS.length;
        const [r, g, b] = TILE_COLORS[colorIdx];

        // Slight per-tile brightness variation
        const bright = p.random(0.85, 1.12);
        p.fill(
          Math.min(255, r * bright),
          Math.min(255, g * bright),
          Math.min(255, b * bright)
        );

        // Draw slightly irregular polygon (5-6 sided) instead of perfect rectangle
        const sides = p.random() < 0.3 ? 5 : 4;
        if (sides === 4) {
          // Slightly irregular quad
          const ox = tw * 0.08;
          const oy = th * 0.08;
          p.beginShape();
          p.vertex(tx + p.random(-ox, ox), ty + p.random(-oy, oy));
          p.vertex(tx + tw + p.random(-ox, ox), ty + p.random(-oy, oy));
          p.vertex(tx + tw + p.random(-ox, ox), ty + th + p.random(-oy, oy));
          p.vertex(tx + p.random(-ox, ox), ty + th + p.random(-oy, oy));
          p.endShape(p.CLOSE);
        } else {
          // Pentagon
          p.beginShape();
          for (let v = 0; v < 5; v++) {
            const a = (v / 5) * p.TWO_PI - p.PI / 2;
            const rx = (tw * 0.52) + p.random(-tw * 0.05, tw * 0.05);
            const ry = (th * 0.52) + p.random(-th * 0.05, th * 0.05);
            p.vertex(tx + tw / 2 + Math.cos(a) * rx, ty + th / 2 + Math.sin(a) * ry);
          }
          p.endShape(p.CLOSE);
        }

        // Subtle highlight edge
        p.fill(255, 255, 255, 25);
        p.rect(tx, ty, tw * 0.25, th);
        p.rect(tx, ty, tw, th * 0.2);
      }
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    mosaic.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
