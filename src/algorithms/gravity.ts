import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
const BODY_COUNT = 8;
const G = 0.5;

interface Body {
  x: number; y: number;
  vx: number; vy: number;
  mass: number;
  color: number[];
  prevX: number; prevY: number;
}

let bodies: Body[] = [];

const TRAIL_COLORS = [
  [255, 240, 200], // warm white
  [255, 215, 120], // gold
  [200, 180, 255], // pale lavender
  [255, 180, 140], // pale coral
];

export const gravity: Algorithm = {
  name: 'Gravity',
  description: 'N-body simulation — click to drop new masses into orbit',
  interactive: true,
  palette: { background: '#05050f', colors: ['#fff0c8', '#ffd778', '#c8b4ff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    p.randomSeed(seed); p.noiseSeed(seed);

    bodies = [];
    const cx = w / 2, cy = h / 2;
    for (let i = 0; i < BODY_COUNT; i++) {
      const angle = p.random(p.TWO_PI);
      const dist = p.random(100, Math.min(w, h) * 0.3);
      const x = cx + Math.cos(angle) * dist;
      const y = cy + Math.sin(angle) * dist;
      // Orbital velocity perpendicular to radius
      const speed = p.random(0.5, 2);
      const color = TRAIL_COLORS[i % TRAIL_COLORS.length];
      bodies.push({
        x, y,
        vx: -Math.sin(angle) * speed,
        vy: Math.cos(angle) * speed,
        mass: p.random(5, 20),
        color,
        prevX: x, prevY: y,
      });
    }

    p.background(5, 5, 15);
  },

  draw(p: p5) {
    // No background clear — trails accumulate

    // Gravitational forces
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const dx = bodies[j].x - bodies[i].x;
        const dy = bodies[j].y - bodies[i].y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq + 100); // softening
        const force = G * bodies[i].mass * bodies[j].mass / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        bodies[i].vx += fx / bodies[i].mass;
        bodies[i].vy += fy / bodies[i].mass;
        bodies[j].vx -= fx / bodies[j].mass;
        bodies[j].vy -= fy / bodies[j].mass;
      }
    }

    // Update positions and draw trails
    for (const body of bodies) {
      body.prevX = body.x;
      body.prevY = body.y;
      body.x += body.vx;
      body.y += body.vy;

      const [r, g, b] = body.color;
      p.stroke(r, g, b, 30);
      p.strokeWeight(1);
      p.line(body.prevX, body.prevY, body.x, body.y);

      // Bright dot at current position
      p.noStroke();
      p.fill(r, g, b, 150);
      p.ellipse(body.x, body.y, 2, 2);
    }
  },

  mousePressed(p: p5, mx: number, my: number) {
    const color = TRAIL_COLORS[bodies.length % TRAIL_COLORS.length];
    bodies.push({
      x: mx, y: my,
      vx: p.random(-1.5, 1.5),
      vy: p.random(-1.5, 1.5),
      mass: p.random(8, 25),
      color,
      prevX: mx, prevY: my,
    });
  },

  resize(p: p5, width: number, height: number) {
    w = width; h = height;
  },
};
