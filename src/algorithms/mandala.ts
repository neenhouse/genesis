import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const mandala: Algorithm = {
  name: 'Mandala',
  description: 'Radial symmetry — intricate geometric petals in gold and white',
  palette: { background: '#1a0a2e', colors: ['#ffd700', '#ffffff', '#e8c060'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(26, 10, 46);

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.46;
    const symmetry = 8 + Math.floor(p.random(5)) * 2; // 8, 10, 12, 14, 16
    const layers = 5 + Math.floor(p.random(5));
    const angleStep = p.TWO_PI / symmetry;

    p.translate(cx, cy);

    for (let layer = 0; layer < layers; layer++) {
      const t = layer / layers;
      const r = maxR * (0.15 + t * 0.85);
      const inner = r * 0.7;
      const petals = symmetry * (1 + Math.floor(p.random(3)));
      const petalStep = p.TWO_PI / petals;

      // Alternate gold / pale-white per layer
      const gold = layer % 2 === 0;
      const alpha = 120 + Math.floor(p.random(100));

      p.noFill();
      p.strokeWeight(0.8);

      // Draw concentric ring detail
      p.stroke(gold ? 210 : 255, gold ? 170 : 240, gold ? 30 : 200, 60);
      p.ellipse(0, 0, r * 2, r * 2);

      for (let k = 0; k < symmetry; k++) {
        p.push();
        p.rotate(angleStep * k);

        // Petal arc
        p.stroke(gold ? 255 : 240, gold ? 215 : 230, gold ? 0 : 180, alpha);
        p.strokeWeight(1);
        p.noFill();
        for (let m = 0; m < petals / symmetry; m++) {
          const a = petalStep * m;
          const x1 = r * Math.cos(a);
          const y1 = r * Math.sin(a);
          const x2 = inner * Math.cos(a + petalStep * 0.5);
          const y2 = inner * Math.sin(a + petalStep * 0.5);
          const x3 = r * Math.cos(a + petalStep);
          const y3 = r * Math.sin(a + petalStep);
          p.beginShape();
          p.curveVertex(x2, y2);
          p.curveVertex(x1, y1);
          p.curveVertex(x2, y2);
          p.curveVertex(x3, y3);
          p.curveVertex(x2, y2);
          p.endShape();
        }

        // Spoke line
        p.stroke(gold ? 255 : 200, gold ? 215 : 210, gold ? 0 : 160, 80);
        p.strokeWeight(0.6);
        p.line(0, 0, r, 0);

        // Dot at ring junction
        p.noStroke();
        p.fill(255, 240, 180, 180);
        p.ellipse(r, 0, 4, 4);

        p.pop();
      }
    }

    // Center rosette
    p.noFill();
    p.stroke(255, 230, 100, 200);
    p.strokeWeight(1.5);
    for (let k = 0; k < symmetry; k++) {
      p.push();
      p.rotate(angleStep * k);
      p.ellipse(maxR * 0.06, 0, maxR * 0.12, maxR * 0.05);
      p.pop();
    }
    p.noStroke();
    p.fill(255, 240, 180, 240);
    p.ellipse(0, 0, maxR * 0.05, maxR * 0.05);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    mandala.setup(p, currentSeed, width, height);
  },
};
