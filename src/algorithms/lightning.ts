import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let alpha = 0;
let boltPoints: Array<[number, number]> = [];
let branches: Array<Array<[number, number]>> = [];
let flashTimer = 0;

function buildBolt(p: p5, x1: number, y1: number, x2: number, y2: number, roughness: number): Array<[number, number]> {
  const pts: Array<[number, number]> = [[x1, y1]];
  function subdivide(ax: number, ay: number, bx: number, by: number, depth: number) {
    if (depth <= 0) { pts.push([bx, by]); return; }
    const mx = (ax + bx) / 2 + (p.random() - 0.5) * roughness;
    const my = (ay + by) / 2 + (p.random() - 0.5) * roughness;
    subdivide(ax, ay, mx, my, depth - 1);
    subdivide(mx, my, bx, by, depth - 1);
  }
  subdivide(x1, y1, x2, y2, 7);
  return pts;
}

function newBolt(p: p5) {
  const sx = p.random(w * 0.2, w * 0.8);
  boltPoints = buildBolt(p, sx, 0, sx + p.random(-120, 120), h, 80);
  branches = [];
  // Add 2–4 branches off random points
  const branchCount = 2 + Math.floor(p.random(3));
  for (let i = 0; i < branchCount; i++) {
    const start = Math.floor(p.random(boltPoints.length * 0.15, boltPoints.length * 0.7));
    const [bx, by] = boltPoints[start];
    const endX = bx + p.random(-200, 200);
    const endY = by + p.random(80, 280);
    branches.push(buildBolt(p, bx, by, endX, endY, 50));
  }
  alpha = 255;
  flashTimer = 0;
}

export const lightning: Algorithm = {
  name: 'Lightning',
  description: 'Recursive fractal lightning — main bolt with branching arcs that flash and fade',
  palette: { background: '#0d0820', colors: ['#e8f0ff', '#8090ff', '#4050c0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(13, 8, 32);
    newBolt(p);
  },

  draw(p: p5) {
    p.background(13, 8, 32, alpha > 60 ? 0 : 12);
    flashTimer++;

    if (alpha > 0) {
      // Background flash
      p.noStroke();
      p.fill(100, 120, 255, alpha * 0.08);
      p.rect(0, 0, w, h);

      // Glow pass
      p.noFill();
      p.stroke(140, 160, 255, alpha * 0.25);
      p.strokeWeight(6);
      p.beginShape();
      for (const [x, y] of boltPoints) p.vertex(x, y);
      p.endShape();

      // Core bolt
      p.stroke(230, 240, 255, alpha);
      p.strokeWeight(1.5);
      p.beginShape();
      for (const [x, y] of boltPoints) p.vertex(x, y);
      p.endShape();

      // Branches
      for (const branch of branches) {
        p.stroke(180, 200, 255, alpha * 0.6);
        p.strokeWeight(0.8);
        p.beginShape();
        for (const [x, y] of branch) p.vertex(x, y);
        p.endShape();
      }

      alpha -= 6;
    } else if (flashTimer > 80) {
      newBolt(p);
    }
  },

  resize(p: p5, width: number, height: number) {
    lightning.setup(p, currentSeed, width, height);
    p.loop();
  },
};
