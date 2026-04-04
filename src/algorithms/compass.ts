import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const compass: Algorithm = {
  name: 'Compass',
  description: 'Generative compass rose — multi-pointed star with cardinal ornaments, seed varies proportions',
  palette: { background: '#f2e8d0', colors: ['#1a2a5a', '#c8a020', '#c83020'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    // Parchment background
    for (let y = 0; y < h; y += 2) {
      const t = y / h;
      const r = Math.floor(p.lerp(242, 228, t));
      const g = Math.floor(p.lerp(232, 218, t));
      const b = Math.floor(p.lerp(208, 192, t));
      p.stroke(r, g, b);
      p.line(0, y, w, y);
    }

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.42;

    // Outer decorative ring
    p.noFill();
    p.stroke(26, 42, 90, 80);
    p.strokeWeight(1);
    p.ellipse(cx, cy, maxR * 2.1, maxR * 2.1);
    p.stroke(200, 160, 32, 60);
    p.strokeWeight(0.5);
    p.ellipse(cx, cy, maxR * 2.25, maxR * 2.25);

    const points = 32; // 32-point rose
    const innerRatio = 0.35 + p.random(0.15);
    const midRatio = 0.65 + p.random(0.15);

    // Shadow
    p.fill(0, 0, 0, 20);
    p.noStroke();
    p.beginShape();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * p.TWO_PI - p.HALF_PI;
      const r2 = i % 2 === 0 ? maxR + 3 : maxR * innerRatio + 3;
      p.vertex(cx + 2 + Math.cos(angle) * r2, cy + 2 + Math.sin(angle) * r2);
    }
    p.endShape(p.CLOSE);

    // Main star — alternating navy/gold points
    for (let i = 0; i < points * 2; i++) {
      const angle = (i / (points * 2)) * p.TWO_PI - p.HALF_PI;
      const prevAngle = ((i - 1) / (points * 2)) * p.TWO_PI - p.HALF_PI;
      const nextAngle = ((i + 1) / (points * 2)) * p.TWO_PI - p.HALF_PI;
      if (i % 2 === 0) {
        const isCardinal = i % 16 === 0;
        const tipR = isCardinal ? maxR : maxR * midRatio;
        p.fill(isCardinal ? 200 : 26, isCardinal ? 160 : 42, isCardinal ? 32 : 90);
        p.noStroke();
        p.beginShape();
        p.vertex(cx + Math.cos(angle) * tipR, cy + Math.sin(angle) * tipR);
        p.vertex(cx + Math.cos(prevAngle) * maxR * innerRatio, cy + Math.sin(prevAngle) * maxR * innerRatio);
        p.vertex(cx, cy);
        p.vertex(cx + Math.cos(nextAngle) * maxR * innerRatio, cy + Math.sin(nextAngle) * maxR * innerRatio);
        p.endShape(p.CLOSE);
      }
    }

    // Gold fill for every other segment
    for (let i = 1; i < points * 2; i += 2) {
      const angle = (i / (points * 2)) * p.TWO_PI - p.HALF_PI;
      const prevAngle = ((i - 1) / (points * 2)) * p.TWO_PI - p.HALF_PI;
      const nextAngle = ((i + 1) / (points * 2)) * p.TWO_PI - p.HALF_PI;
      p.fill(200, 160, 32, 180);
      p.noStroke();
      p.beginShape();
      p.vertex(cx + Math.cos(prevAngle) * maxR, cy + Math.sin(prevAngle) * maxR * midRatio);
      p.vertex(cx + Math.cos(angle) * maxR * innerRatio, cy + Math.sin(angle) * maxR * innerRatio);
      p.vertex(cx + Math.cos(nextAngle) * maxR, cy + Math.sin(nextAngle) * maxR * midRatio);
      p.endShape(p.CLOSE);
    }

    // Cardinal labels N/S/E/W
    const cardinals = ['N', 'E', 'S', 'W'];
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(Math.max(10, maxR * 0.12));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * p.TWO_PI - p.HALF_PI;
      const lx = cx + Math.cos(a) * maxR * 1.18;
      const ly = cy + Math.sin(a) * maxR * 1.18;
      p.fill(26, 42, 90);
      p.noStroke();
      p.text(cardinals[i], lx, ly);
    }

    // Center medallion
    p.noFill();
    p.stroke(200, 160, 32, 200);
    p.strokeWeight(1.5);
    p.ellipse(cx, cy, maxR * 0.2, maxR * 0.2);
    p.fill(200, 160, 32);
    p.noStroke();
    p.ellipse(cx, cy, maxR * 0.08, maxR * 0.08);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    compass.setup(p, currentSeed, width, height);
  },
};
