import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Prey {
  x: number; y: number; vx: number; vy: number;
  trail: { x: number; y: number }[];
}

interface Predator {
  x: number; y: number; vx: number; vy: number;
  trail: { x: number; y: number }[];
}

const PREY_COUNT = 120;
const PRED_COUNT = 3;
const TRAIL_LEN = 18;
const MAX_PREY_SPEED = 2.8;
const MAX_PRED_SPEED = 3.6;
const SCATTER_RADIUS = 90;

let prey: Prey[] = [];
let predators: Predator[] = [];

function clampSpeed(vx: number, vy: number, max: number): [number, number] {
  const m = Math.sqrt(vx * vx + vy * vy);
  if (m > max) return [(vx / m) * max, (vy / m) * max];
  return [vx, vy];
}

export const flock: Algorithm = {
  name: 'Flock',
  description: 'Predator-prey flocking — prey swarm together and scatter from hunters',
  palette: { background: '#080c18', colors: ['#4fa3e8', '#ef4444', '#a0c4f8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    prey = [];
    predators = [];
    for (let i = 0; i < PREY_COUNT; i++) {
      prey.push({ x: p.random(w), y: p.random(h), vx: p.random(-1.5, 1.5), vy: p.random(-1.5, 1.5), trail: [] });
    }
    for (let i = 0; i < PRED_COUNT; i++) {
      predators.push({ x: p.random(w), y: p.random(h), vx: p.random(-2, 2), vy: p.random(-2, 2), trail: [] });
    }
    p.background(8, 12, 24);
  },

  draw(p: p5) {
    p.background(8, 12, 24, 28);

    // Update predators — chase nearest prey cluster center
    for (const pred of predators) {
      let cx = 0, cy = 0;
      for (const b of prey) { cx += b.x; cy += b.y; }
      cx /= prey.length; cy /= prey.length;
      const dx = cx - pred.x, dy = cy - pred.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      pred.vx += (dx / d) * 0.12;
      pred.vy += (dy / d) * 0.12;
      [pred.vx, pred.vy] = clampSpeed(pred.vx, pred.vy, MAX_PRED_SPEED);
      pred.x = (pred.x + pred.vx + w) % w;
      pred.y = (pred.y + pred.vy + h) % h;
      pred.trail.push({ x: pred.x, y: pred.y });
      if (pred.trail.length > TRAIL_LEN) pred.trail.shift();
    }

    // Update prey — flock + scatter from predators
    for (const b of prey) {
      let sepX = 0, sepY = 0, sepN = 0;
      let aliX = 0, aliY = 0;
      let cohX = 0, cohY = 0, cohN = 0;
      let scatterX = 0, scatterY = 0;

      for (const other of prey) {
        if (other === b) continue;
        const dx = other.x - b.x, dy = other.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 60) {
          aliX += other.vx; aliY += other.vy;
          cohX += other.x; cohY += other.y; cohN++;
          if (dist < 24 && dist > 0) { sepX -= dx / dist; sepY -= dy / dist; sepN++; }
        }
      }

      for (const pred of predators) {
        const dx = b.x - pred.x, dy = b.y - pred.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < SCATTER_RADIUS && dist > 0) {
          scatterX += (dx / dist) * (SCATTER_RADIUS - dist) / SCATTER_RADIUS * 0.4;
          scatterY += (dy / dist) * (SCATTER_RADIUS - dist) / SCATTER_RADIUS * 0.4;
        }
      }

      let ax = scatterX * 2, ay = scatterY * 2;
      if (cohN > 0) { ax += (cohX / cohN - b.x) * 0.004; ay += (cohY / cohN - b.y) * 0.004; }
      if (sepN > 0) { const [sx, sy] = clampSpeed(sepX, sepY, 0.08); ax += sx; ay += sy; }
      const [tx, ty] = clampSpeed(aliX * 0.005, aliY * 0.005, 0.06); ax += tx; ay += ty;

      b.vx += ax; b.vy += ay;
      [b.vx, b.vy] = clampSpeed(b.vx, b.vy, MAX_PREY_SPEED);
      b.x = (b.x + b.vx + w) % w;
      b.y = (b.y + b.vy + h) % h;
      b.trail.push({ x: b.x, y: b.y });
      if (b.trail.length > TRAIL_LEN) b.trail.shift();
    }

    // Draw prey trails + dots
    p.noFill();
    for (const b of prey) {
      for (let i = 1; i < b.trail.length; i++) {
        const alpha = (i / b.trail.length) * 80;
        p.stroke(79, 163, 232, alpha);
        p.strokeWeight(1);
        p.line(b.trail[i - 1].x, b.trail[i - 1].y, b.trail[i].x, b.trail[i].y);
      }
      p.noStroke(); p.fill(160, 196, 248, 200);
      p.ellipse(b.x, b.y, 3, 3);
    }

    // Draw predator trails + dots
    for (const pred of predators) {
      for (let i = 1; i < pred.trail.length; i++) {
        const alpha = (i / pred.trail.length) * 100;
        p.stroke(239, 68, 68, alpha);
        p.strokeWeight(1.5);
        p.line(pred.trail[i - 1].x, pred.trail[i - 1].y, pred.trail[i].x, pred.trail[i].y);
      }
      p.noStroke(); p.fill(239, 68, 68, 230);
      p.ellipse(pred.x, pred.y, 7, 7);
    }
  },

  resize(p: p5, width: number, height: number) {
    flock.setup(p, currentSeed, width, height);
    p.loop();
  },
};
