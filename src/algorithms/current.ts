import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let frameCount = 0;
let regenerateAt = 0;

interface Arc {
  points: { x: number; y: number }[];
  alpha: number;
  maxAlpha: number;
  life: number;
  maxLife: number;
  width: number;
  isGlow: boolean;
}

let arcs: Arc[] = [];
let p1x = 0, p1y = 0, p2x = 0, p2y = 0;

function buildArc(p: p5, fromX: number, fromY: number, toX: number, toY: number, roughness: number, isGlow: boolean): Arc {
  const points: { x: number; y: number }[] = [];
  const steps = 18 + Math.floor(p.random(12));
  points.push({ x: fromX, y: fromY });
  let cx = fromX, cy = fromY;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const targetX = p.lerp(fromX, toX, t);
    const targetY = p.lerp(fromY, toY, t);
    cx = targetX + p.random(-roughness, roughness);
    cy = targetY + p.random(-roughness, roughness);
    points.push({ x: cx, y: cy });
    // Occasional branch
    if (!isGlow && p.random() < 0.15 && i < steps - 2) {
      const branchLen = 2 + Math.floor(p.random(4));
      const bx = cx, by = cy;
      for (let b = 1; b <= branchLen; b++) {
        points.push({ x: bx + p.random(-roughness * 0.7, roughness * 0.7), y: by + p.random(-roughness * 0.7, roughness * 0.7) });
      }
      points.push({ x: cx, y: cy });
    }
  }
  points.push({ x: toX, y: toY });
  const life = 12 + Math.floor(p.random(20));
  return { points, alpha: 0, maxAlpha: isGlow ? 30 : 180, life, maxLife: life, width: isGlow ? 8 + p.random(6) : 0.8 + p.random(1.2), isGlow };
}

function regenerate(p: p5) {
  arcs = [];
  p1x = w * p.random(0.1, 0.4);
  p1y = h * p.random(0.2, 0.8);
  p2x = w * p.random(0.6, 0.9);
  p2y = h * p.random(0.2, 0.8);
  // Glow halos
  for (let i = 0; i < 3; i++) arcs.push(buildArc(p, p1x, p1y, p2x, p2y, 18, true));
  // Sharp arcs
  for (let i = 0; i < 4; i++) arcs.push(buildArc(p, p1x, p1y, p2x, p2y, 12, false));
  regenerateAt = frameCount + 40 + Math.floor(p.random(30));
}

export const current: Algorithm = {
  name: 'Current',
  description: 'Electric plasma arc — jagged branching bolt between two points with glow, regenerates periodically',
  palette: { background: '#020408', colors: ['#4fc8ff', '#a0e8ff', '#ffffff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    frameCount = 0;
    regenerateAt = 0;
    arcs = [];
    p.background(2, 4, 8);
  },

  draw(p: p5) {
    frameCount++;
    p.background(2, 4, 8, 60);

    if (frameCount >= regenerateAt) regenerate(p);

    // Draw electrode dots
    p.noStroke();
    p.fill(200, 240, 255, 180);
    p.ellipse(p1x, p1y, 8, 8);
    p.ellipse(p2x, p2y, 8, 8);

    for (const arc of arcs) {
      const progress = 1 - arc.life / arc.maxLife;
      arc.alpha = arc.maxAlpha * Math.sin(progress * p.PI);
      if (arc.life > 0) arc.life--;

      if (arc.points.length < 2) continue;

      p.noFill();
      if (arc.isGlow) {
        p.stroke(60, 160, 255, arc.alpha);
        p.strokeWeight(arc.width);
      } else {
        const white = arc.alpha > 100 ? 255 : 160;
        p.stroke(white, 220, 255, arc.alpha);
        p.strokeWeight(arc.width);
      }

      p.beginShape();
      for (const pt of arc.points) p.vertex(pt.x, pt.y);
      p.endShape();
    }
  },

  resize(p: p5, width: number, height: number) {
    current.setup(p, currentSeed, width, height);
    p.loop();
  },
};
