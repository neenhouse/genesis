import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let stemProgress = 0;
let stemPoints: { x: number; y: number }[] = [];
let totalStemPoints = 0;

const LEAF_COLOR = [34, 90, 34];
const STEM_COLOR = [55, 110, 30];
const BG_COLOR = [200, 185, 155];

export const vine: Algorithm = {
  name: 'Vine',
  description: 'Growing vine with noise-curved stem, leaf sprouts, and fibonacci tendril curls',
  palette: { background: '#c8b99b', colors: ['#22662a', '#376e1e', '#1a4a10'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    stemProgress = 0;
    stemPoints = [];

    // Pre-compute full stem path via noise
    const steps = Math.floor(h * 0.9);
    totalStemPoints = steps;
    let sx = w * 0.5;
    const startY = h * 0.95;

    for (let i = 0; i < steps; i++) {
      const nx = p.noise(i * 0.018, seed * 0.001) - 0.5;
      sx = p.constrain(sx + nx * 3.5, w * 0.15, w * 0.85);
      stemPoints.push({ x: sx, y: startY - i });
    }

    p.background(...BG_COLOR as [number, number, number]);
    p.loop();
  },

  draw(p: p5) {
    if (stemProgress >= totalStemPoints) { p.noLoop(); return; }

    const growRate = 4;
    const prevProgress = stemProgress;
    stemProgress = Math.min(stemProgress + growRate, totalStemPoints);

    // Draw new stem segments
    p.stroke(...STEM_COLOR as [number, number, number]);
    p.strokeWeight(Math.max(1.5, (1 - stemProgress / totalStemPoints) * 5 + 1.5));
    for (let i = prevProgress; i < stemProgress - 1 && i < stemPoints.length - 1; i++) {
      p.line(stemPoints[i].x, stemPoints[i].y, stemPoints[i + 1].x, stemPoints[i + 1].y);
    }

    // Draw leaves at intervals
    const leafInterval = Math.floor(totalStemPoints / 14);
    for (let i = prevProgress; i < stemProgress; i++) {
      if (i > 5 && i % leafInterval === 0 && i < stemPoints.length) {
        const pt = stemPoints[i];
        const side = i % (leafInterval * 2) === 0 ? 1 : -1;
        const leafLen = Math.min(w, h) * 0.07 * p.random(0.7, 1.3);
        const leafAngle = side * p.random(0.4, 0.9);

        // Leaf shape
        p.push();
        p.translate(pt.x, pt.y);
        p.rotate(-Math.PI / 2 + leafAngle);
        p.fill(LEAF_COLOR[0] + p.random(-15, 15), LEAF_COLOR[1] + p.random(-15, 15), LEAF_COLOR[2]);
        p.stroke(30, 70, 20);
        p.strokeWeight(0.8);
        p.beginShape();
        p.vertex(0, 0);
        p.bezierVertex(leafLen * 0.4, -leafLen * 0.35, leafLen * 0.9, -leafLen * 0.3, leafLen, 0);
        p.bezierVertex(leafLen * 0.9, leafLen * 0.3, leafLen * 0.4, leafLen * 0.35, 0, 0);
        p.endShape(p.CLOSE);
        p.pop();

        // Fibonacci tendril curl near leaf
        if (i % (leafInterval * 2) === 0 && i < stemPoints.length) {
          p.push();
          p.translate(pt.x + side * leafLen * 0.5, pt.y);
          p.noFill();
          p.stroke(STEM_COLOR[0], STEM_COLOR[1], STEM_COLOR[2], 160);
          p.strokeWeight(1);
          // Spiral: r = a * e^(b*theta)
          p.beginShape();
          const maxAngle = p.TWO_PI * 2;
          const a = 1.5, b = 0.22;
          for (let theta = 0; theta < maxAngle; theta += 0.12) {
            const r = a * Math.exp(b * theta);
            p.vertex(side * Math.cos(theta) * r, Math.sin(theta) * r);
          }
          p.endShape();
          p.pop();
        }
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    vine.setup(p, currentSeed, width, height);
    p.loop();
  },
};
