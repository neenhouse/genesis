import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, count = 0;
const MAX_COUNT = 2000;
const GOLDEN_ANGLE = 137.5077640500378;
const PASTELS = [
  [255, 182, 193], [200, 170, 240], [170, 230, 200],
  [255, 218, 185], [180, 210, 255],
];

export const bloom: Algorithm = {
  name: 'Bloom',
  description: 'Phyllotaxis — golden-angle spirals with petal geometry',
  palette: { background: '#faf5f0', colors: ['#ffb6c1', '#c8aaf0', '#aae6c8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; count = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(250, 245, 240);
  },

  draw(p: p5) {
    if (count >= MAX_COUNT) { p.noLoop(); return; }
    const cx = w / 2, cy = h / 2;
    const batchSize = 8;

    for (let b = 0; b < batchSize && count < MAX_COUNT; b++) {
      const angle = count * GOLDEN_ANGLE * (Math.PI / 180);
      const r = Math.sqrt(count) * (Math.min(w, h) * 0.022);
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      const colorIdx = Math.floor(p.noise(count * 0.02) * PASTELS.length);
      const [cr, cg, cb] = PASTELS[colorIdx % PASTELS.length];
      const size = p.map(count, 0, MAX_COUNT, 18, 4);
      const petalCount = 5 + Math.floor(p.noise(count * 0.05) * 4);

      p.push();
      p.translate(x, y);
      p.rotate(angle);
      p.noStroke();
      for (let i = 0; i < petalCount; i++) {
        const pa = (i / petalCount) * p.TWO_PI;
        p.push(); p.rotate(pa);
        p.fill(cr, cg, cb, 160);
        p.ellipse(size * 0.3, 0, size, size * 0.5);
        p.pop();
      }
      p.fill(cr * 0.8, cg * 0.8, cb * 0.8, 200);
      p.ellipse(0, 0, size * 0.3, size * 0.3);
      p.pop();
      count++;
    }
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
