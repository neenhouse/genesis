import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;

interface Stalk {
  x: number;
  segments: number;
  segH: number;
  thickness: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  shade: number;
}

let stalks: Stalk[] = [];

export const bamboo: Algorithm = {
  name: 'Bamboo',
  description: 'Bamboo grove — swaying stalks with nodes and branching leaves in morning mist',
  palette: { background: '#d8e8d0', colors: ['#4a7a3a', '#2d5a1e', '#8ab870'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0;
    stalks = [];

    const count = 8 + Math.floor(p.random(8));
    for (let i = 0; i < count; i++) {
      stalks.push({
        x: p.random(w * 0.05, w * 0.95),
        segments: 5 + Math.floor(p.random(6)),
        segH: h * p.random(0.09, 0.14),
        thickness: 4 + p.random(10),
        sway: p.random(4, 12),
        swaySpeed: p.random(0.3, 0.7),
        phase: p.random(p.TWO_PI),
        shade: Math.floor(p.random(30)),
      });
    }
    // Sort by thickness for depth
    stalks.sort((a, b) => b.thickness - a.thickness);
  },

  draw(p: p5) {
    time += 0.015;

    // Misty background
    p.background(216, 232, 208);

    // Mist overlay
    p.noStroke();
    for (let i = 0; i < 3; i++) {
      p.fill(230, 238, 225, 30);
      p.ellipse(w * p.noise(time * 0.1 + i * 3), h * 0.4, w * 0.8, h * 0.3);
    }

    for (const stalk of stalks) {
      const wind = Math.sin(time * stalk.swaySpeed + stalk.phase) * stalk.sway;
      const totalH = stalk.segments * stalk.segH;
      const baseY = h + 20;
      const topY = baseY - totalH;

      p.push();
      p.translate(stalk.x, 0);

      // Draw each segment
      for (let seg = 0; seg < stalk.segments; seg++) {
        const t = seg / stalk.segments;
        const segTopY = baseY - (seg + 1) * stalk.segH;
        const segBotY = baseY - seg * stalk.segH;
        const offset = wind * t * t;
        const g = 80 + stalk.shade + Math.floor(t * 40);

        // Segment body
        p.noStroke();
        p.fill(60 + stalk.shade, g, 40 + stalk.shade);
        p.beginShape();
        p.vertex(offset - stalk.thickness / 2, segBotY);
        p.vertex(offset + stalk.thickness / 2, segBotY);
        p.vertex(offset + stalk.thickness * 0.4, segTopY);
        p.vertex(offset - stalk.thickness * 0.4, segTopY);
        p.endShape(p.CLOSE);

        // Node ring
        p.fill(40 + stalk.shade, 60 + stalk.shade, 30 + stalk.shade);
        p.rect(offset - stalk.thickness * 0.6, segTopY - 3, stalk.thickness * 1.2, 5, 2);

        // Leaves at node
        if (seg > 0 && seg % 2 === 0) {
          const leafSide = seg % 4 === 0 ? 1 : -1;
          const lx = offset;
          const ly = segTopY;
          p.fill(50 + stalk.shade, 90 + stalk.shade, 35 + stalk.shade, 200);
          p.noStroke();
          p.push();
          p.translate(lx, ly);
          p.rotate(leafSide * (0.4 + wind * 0.02));
          p.beginShape();
          p.vertex(0, 0);
          p.bezierVertex(leafSide * 20, -8, leafSide * 50, -5, leafSide * 60, 5);
          p.bezierVertex(leafSide * 50, 10, leafSide * 20, 8, 0, 0);
          p.endShape(p.CLOSE);
          p.pop();
        }
      }

      p.pop();
    }
  },

  resize(p: p5, width: number, height: number) {
    bamboo.setup(p, currentSeed, width, height);
    p.loop();
  },
};
