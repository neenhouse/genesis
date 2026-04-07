import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

// Hexagonal DLA with 6-fold symmetry
interface Particle { x: number; y: number; }

let frozen: Particle[] = [];
let frozenSet: Set<string> = new Set();
let walkers: Particle[] = [];
let growing = true;
let maxFrozen = 0;

function key(x: number, y: number) { return `${Math.round(x)},${Math.round(y)}`; }

function reflect6(particles: Particle[], cx: number, cy: number): Particle[] {
  const result: Particle[] = [];
  for (const pt of particles) {
    const dx = pt.x - cx, dy = pt.y - cy;
    for (let k = 0; k < 6; k++) {
      const angle = (k * Math.PI) / 3;
      const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
      const ry = dx * Math.sin(angle) + dy * Math.cos(angle);
      result.push({ x: cx + rx, y: cy + ry });
    }
  }
  return result;
}

function isAdjacentToFrozen(x: number, y: number, step: number): boolean {
  const neighbors = [
    [step, 0], [-step, 0], [0, step], [0, -step],
    [step, step], [-step, -step],
  ];
  for (const [dx, dy] of neighbors) {
    if (frozenSet.has(key(x + dx, y + dy))) return true;
  }
  return false;
}

export const frost: Algorithm = {
  name: 'Frost',
  description: 'Frost crystal growth — DLA with 6-fold symmetry, growing from center outward',
  palette: { background: '#03080f', colors: ['#e8f4ff', '#b0d8ff', '#80c0f8', '#4090d0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    frozen = [];
    frozenSet = new Set();
    walkers = [];
    growing = true;
    maxFrozen = Math.min(w, h) * 1.2;

    const cx = w / 2, cy = h / 2;

    // Seed particle at center
    frozen.push({ x: cx, y: cy });
    frozenSet.add(key(cx, cy));

    // Spawn initial walkers
    for (let i = 0; i < 60; i++) {
      const angle = p.random(p.TWO_PI);
      const r = Math.min(w, h) * 0.4;
      walkers.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }

    p.background(3, 8, 15);
    p.noStroke();
  },

  draw(p: p5) {
    if (!growing) return;

    const cx = w / 2, cy = h / 2;
    const step = Math.max(2, Math.floor(Math.min(w, h) / 120));
    const stepsPerFrame = 80;

    for (let iter = 0; iter < stepsPerFrame; iter++) {
      if (walkers.length < 40) {
        const angle = p.random(p.TWO_PI);
        const r = Math.min(w, h) * 0.42;
        walkers.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
      }

      for (let wi = walkers.length - 1; wi >= 0; wi--) {
        const wk = walkers[wi];
        // Random walk step
        const dir = Math.floor(p.random(6));
        const angles = [0, Math.PI / 3, 2 * Math.PI / 3, Math.PI, 4 * Math.PI / 3, 5 * Math.PI / 3];
        wk.x += Math.cos(angles[dir]) * step;
        wk.y += Math.sin(angles[dir]) * step;

        if (isAdjacentToFrozen(wk.x, wk.y, step)) {
          // Freeze with 6-fold symmetry
          const newPts = reflect6([{ x: wk.x, y: wk.y }], cx, cy);
          for (const pt of newPts) {
            const k = key(pt.x, pt.y);
            if (!frozenSet.has(k)) {
              frozen.push(pt);
              frozenSet.add(k);

              // Draw the new crystal point
              const dist = Math.sqrt((pt.x - cx) ** 2 + (pt.y - cy) ** 2);
              const maxDist = Math.min(w, h) * 0.48;
              const bright = p.map(dist, 0, maxDist, 255, 160);
              const blue = p.map(dist, 0, maxDist, 255, 220);
              p.fill(bright, bright, blue, 220);
              p.ellipse(pt.x, pt.y, step * 1.4, step * 1.4);
            }
          }
          walkers.splice(wi, 1);
        }

        // Reset walkers that wander too far
        const dist = Math.sqrt((wk.x - cx) ** 2 + (wk.y - cy) ** 2);
        if (dist > Math.min(w, h) * 0.48) {
          const angle = p.random(p.TWO_PI);
          wk.x = cx + Math.cos(angle) * Math.min(w, h) * 0.44;
          wk.y = cy + Math.sin(angle) * Math.min(w, h) * 0.44;
        }
      }
    }

    if (frozen.length > maxFrozen) {
      growing = false;
    }
  },

  resize(p: p5, width: number, height: number) {
    frost.setup(p, currentSeed, width, height);
    p.loop();
  },
};
