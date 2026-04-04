import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
let currentSeed = 0;

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  best: { x: number; y: number };
  bestVal: number;
}

const COUNT = 260;
const INERTIA = 0.72;
const COGNITIVE = 1.4;
const SOCIAL = 1.4;
const MAX_SPEED = 3.5;
let particles: Particle[] = [];
let globalBest = { x: 0, y: 0 };
let globalBestVal = -Infinity;
let noiseOff = 0;

function fitnessAt(p: p5, x: number, y: number): number {
  return p.noise(x / w * 2.5 + noiseOff, y / h * 2.5);
}

export const swarm: Algorithm = {
  name: 'Swarm',
  description: 'PSO particles converge on noise attractors leaving luminous trails',
  palette: {
    background: '#060c1a',
    colors: ['#ffcc00', '#ff8800', '#ffee88', '#ff5500'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    currentSeed = seed;
    noiseOff = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    particles = [];
    globalBestVal = -Infinity;
    for (let i = 0; i < COUNT; i++) {
      const x = p.random(w), y = p.random(h);
      const val = fitnessAt(p, x, y);
      const pt: Particle = {
        x, y,
        vx: p.random(-2, 2), vy: p.random(-2, 2),
        best: { x, y }, bestVal: val,
      };
      if (val > globalBestVal) { globalBestVal = val; globalBest = { x, y }; }
      particles.push(pt);
    }
    p.background(6, 12, 26);
  },

  draw(p: p5) {
    // gentle fade trail
    p.fill(6, 12, 26, 18);
    p.noStroke();
    p.rect(0, 0, w, h);

    noiseOff += 0.003; // slowly shift landscape

    for (const pt of particles) {
      const r1x = p.random(), r1y = p.random();
      const r2x = p.random(), r2y = p.random();

      pt.vx = INERTIA * pt.vx
        + COGNITIVE * r1x * (pt.best.x - pt.x)
        + SOCIAL * r2x * (globalBest.x - pt.x);
      pt.vy = INERTIA * pt.vy
        + COGNITIVE * r1y * (pt.best.y - pt.y)
        + SOCIAL * r2y * (globalBest.y - pt.y);

      const speed = Math.sqrt(pt.vx * pt.vx + pt.vy * pt.vy);
      if (speed > MAX_SPEED) { pt.vx = (pt.vx / speed) * MAX_SPEED; pt.vy = (pt.vy / speed) * MAX_SPEED; }

      pt.x += pt.vx; pt.y += pt.vy;
      if (pt.x < 0) pt.x += w; if (pt.x > w) pt.x -= w;
      if (pt.y < 0) pt.y += h; if (pt.y > h) pt.y -= h;

      const val = fitnessAt(p, pt.x, pt.y);
      if (val > pt.bestVal) { pt.bestVal = val; pt.best = { x: pt.x, y: pt.y }; }
      if (val > globalBestVal) { globalBestVal = val; globalBest = { x: pt.x, y: pt.y }; }

      const intensity = p.map(val, 0, 1, 0.2, 1.0);
      const alpha = p.map(speed, 0, MAX_SPEED, 100, 220);
      p.noStroke();
      p.fill(255, p.lerp(100, 200, intensity), 0, alpha * 0.4);
      p.ellipse(pt.x, pt.y, 5, 5);
      p.fill(255, p.lerp(180, 240, intensity), 50, alpha);
      p.ellipse(pt.x, pt.y, 2, 2);
    }

    // global best glow
    p.noStroke();
    p.fill(255, 220, 80, 40); p.ellipse(globalBest.x, globalBest.y, 30, 30);
    p.fill(255, 240, 120, 100); p.ellipse(globalBest.x, globalBest.y, 10, 10);
  },

  resize(p: p5, width: number, height: number) {
    swarm.setup(p, currentSeed, width, height);
  },
};
