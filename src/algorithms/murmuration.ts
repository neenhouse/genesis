import type p5 from 'p5';
import type { Algorithm } from './types';

const BOID_COUNT = 300;
const MAX_SPEED = 3;
const MAX_FORCE = 0.05;
const PERCEPTION = 50;

interface Boid {
  x: number; y: number; vx: number; vy: number;
}

let boids: Boid[] = [];
let w = 0, h = 0;

function limit(vx: number, vy: number, max: number): [number, number] {
  const mag = Math.sqrt(vx * vx + vy * vy);
  if (mag > max) return [(vx / mag) * max, (vy / mag) * max];
  return [vx, vy];
}

export const murmuration: Algorithm = {
  name: 'Murmuration',
  description: 'Particle swarms with emergent flocking behavior',
  palette: { background: '#0a1628', colors: ['#d4a574', '#ffffff', '#6b8bb5'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    p.randomSeed(seed); p.noiseSeed(seed);
    boids = [];
    for (let i = 0; i < BOID_COUNT; i++) {
      boids.push({ x: p.random(w), y: p.random(h), vx: p.random(-2, 2), vy: p.random(-2, 2) });
    }
    p.background(10, 22, 40);
  },

  draw(p: p5) {
    p.background(10, 22, 40, 25);
    for (const boid of boids) {
      let sepX = 0, sepY = 0, sepCount = 0;
      let aliX = 0, aliY = 0, aliCount = 0;
      let cohX = 0, cohY = 0, cohCount = 0;

      for (const other of boids) {
        if (other === boid) continue;
        const dx = other.x - boid.x, dy = other.y - boid.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < PERCEPTION) {
          aliX += other.vx; aliY += other.vy; aliCount++;
          cohX += other.x; cohY += other.y; cohCount++;
          if (dist < PERCEPTION * 0.4 && dist > 0) {
            sepX -= dx / dist; sepY -= dy / dist; sepCount++;
          }
        }
      }

      let ax = 0, ay = 0;
      if (aliCount > 0) { const [tx, ty] = limit(aliX / aliCount - boid.vx, aliY / aliCount - boid.vy, MAX_FORCE); ax += tx; ay += ty; }
      if (cohCount > 0) { const cx = cohX / cohCount - boid.x, cy = cohY / cohCount - boid.y; const [tx, ty] = limit(cx * 0.01, cy * 0.01, MAX_FORCE); ax += tx; ay += ty; }
      if (sepCount > 0) { const [tx, ty] = limit(sepX / sepCount, sepY / sepCount, MAX_FORCE * 1.5); ax += tx; ay += ty; }

      boid.vx += ax; boid.vy += ay;
      [boid.vx, boid.vy] = limit(boid.vx, boid.vy, MAX_SPEED);
      boid.x += boid.vx; boid.y += boid.vy;
      if (boid.x < 0) boid.x += w; if (boid.x > w) boid.x -= w;
      if (boid.y < 0) boid.y += h; if (boid.y > h) boid.y -= h;

      const speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
      const alpha = p.map(speed, 0, MAX_SPEED, 80, 220);
      p.noStroke(); p.fill(212, 165, 116, alpha);
      p.ellipse(boid.x, boid.y, 3, 3);
    }
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
