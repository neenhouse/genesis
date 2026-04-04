import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

function drawBranch(p: p5, x: number, y: number, angle: number, length: number, thickness: number, depth: number) {
  if (depth > 10 || length < 4) {
    // Draw leaf
    p.noStroke();
    const leafHue = p.noise(x * 0.01, y * 0.01) * 60;
    p.fill(50 + leafHue, 140 + leafHue * 0.5, 40, 180);
    p.ellipse(x, y, 6 + p.random(4), 8 + p.random(6));
    return;
  }

  const endX = x + Math.cos(angle) * length;
  const endY = y + Math.sin(angle) * length;

  // Draw branch
  const brown = 60 + depth * 8;
  p.stroke(brown + 40, brown + 20, brown, 220);
  p.strokeWeight(thickness);
  p.line(x, y, endX, endY);

  // Branching
  const branchAngle = 0.3 + p.noise(x * 0.02, y * 0.02) * 0.4;
  const lengthRatio = 0.65 + p.random(0.15);
  const thicknessRatio = 0.7;

  // Main branches
  drawBranch(p, endX, endY, angle - branchAngle, length * lengthRatio, thickness * thicknessRatio, depth + 1);
  drawBranch(p, endX, endY, angle + branchAngle, length * lengthRatio, thickness * thicknessRatio, depth + 1);

  // Occasional third branch
  if (p.random() > 0.6 && depth < 6) {
    const offset = p.random(-0.2, 0.2);
    drawBranch(p, endX, endY, angle + offset, length * lengthRatio * 0.8, thickness * thicknessRatio * 0.8, depth + 1);
  }
}

export const tendril: Algorithm = {
  name: 'Tendril',
  description: 'L-system branching — generative trees reaching toward light',
  palette: { background: '#0d1a0d', colors: ['#4ade80', '#166534', '#92400e'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(13, 26, 13);

    // Draw 2-4 trees at different positions
    const treeCount = 2 + Math.floor(p.random(3));
    for (let t = 0; t < treeCount; t++) {
      const tx = w * (0.2 + t * 0.6 / (treeCount - 1 || 1)) + p.random(-50, 50);
      const startLength = Math.min(w, h) * (0.12 + p.random(0.08));
      const startThickness = 6 + p.random(4);
      const baseAngle = -Math.PI / 2 + p.random(-0.15, 0.15);
      drawBranch(p, tx, h - 20, baseAngle, startLength, startThickness, 0);
    }

    // Ground
    p.noStroke();
    p.fill(20, 35, 20);
    p.rect(0, h - 20, w, 20);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    tendril.setup(p, currentSeed, width, height);
    p.loop();
    p.noLoop();
  },
};
