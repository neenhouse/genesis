import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Node {
  x: number; y: number;
  vx: number; vy: number;
  fx: number; fy: number;
}

const NODE_COUNT = 60;
const LINK_DIST = 120;
const REPULSE_DIST = 60;
const DAMPING = 0.88;
const ATTRACT_STRENGTH = 0.002;
const REPULSE_STRENGTH = 80;

let nodes: Node[] = [];

export const net: Algorithm = {
  name: 'Net',
  description: 'Force-directed network graph — nodes repel and edges pull, settling into an organic layout',
  palette: { background: '#0e0e18', colors: ['#ffffff', '#888899', '#4488cc'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: p.random(w * 0.1, w * 0.9),
        y: p.random(h * 0.1, h * 0.9),
        vx: 0, vy: 0,
        fx: 0, fy: 0,
      });
    }
    p.background(14, 14, 24);
  },

  draw(p: p5) {
    p.background(14, 14, 24, 40);

    // Reset forces
    for (const n of nodes) { n.fx = 0; n.fy = 0; }

    // Pairwise forces
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;

        if (dist < LINK_DIST) {
          // Spring attraction toward link distance
          const force = (dist - LINK_DIST * 0.7) * ATTRACT_STRENGTH;
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.fx += fx; a.fy += fy;
          b.fx -= fx; b.fy -= fy;
        }

        if (dist < REPULSE_DIST) {
          // Charge repulsion
          const force = REPULSE_STRENGTH / (dist * dist);
          const fx = -(dx / dist) * force, fy = -(dy / dist) * force;
          a.fx += fx; a.fy += fy;
          b.fx -= fx; b.fy -= fy;
        }
      }

      // Weak center gravity
      nodes[i].fx += (w / 2 - nodes[i].x) * 0.0002;
      nodes[i].fy += (h / 2 - nodes[i].y) * 0.0002;
    }

    // Integrate
    for (const n of nodes) {
      n.vx = (n.vx + n.fx) * DAMPING;
      n.vy = (n.vy + n.fy) * DAMPING;
      n.x += n.vx; n.y += n.vy;
      n.x = Math.max(20, Math.min(w - 20, n.x));
      n.y = Math.max(20, Math.min(h - 20, n.y));
    }

    // Draw edges
    p.noFill();
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = p.map(dist, 0, LINK_DIST, 140, 10);
          p.stroke(100, 120, 160, alpha);
          p.strokeWeight(0.8);
          p.line(a.x, a.y, b.x, b.y);
        }
      }
    }

    // Draw nodes
    p.noStroke();
    for (const n of nodes) {
      p.fill(68, 136, 204, 80);
      p.ellipse(n.x, n.y, 10, 10);
      p.fill(200, 210, 230, 220);
      p.ellipse(n.x, n.y, 5, 5);
    }
  },

  resize(p: p5, width: number, height: number) {
    net.setup(p, currentSeed, width, height);
    p.loop();
  },
};
