import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Node {
  x: number;
  y: number;
  radius: number;
}

interface Trace {
  x1: number; y1: number;
  cx1: number; cy1: number;
  cx2: number; cy2: number;
  x2: number; y2: number;
}

let nodes: Node[] = [];
let traces: Trace[] = [];

const PCB_BG = [8, 28, 15];
const TRACE_COLOR = [0, 220, 200];
const NODE_COLOR = [0, 255, 230];

export const circuits2: Algorithm = {
  name: 'Circuits II',
  description: 'Organic circuit board with curved Bezier traces and glowing nodes on dark PCB',
  palette: { background: '#081c0f', colors: ['#00dccc', '#00ffe6', '#00aa88'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    nodes = [];
    traces = [];

    const nodeCount = 22 + Math.floor(p.random(12));
    const margin = Math.min(w, h) * 0.07;

    // Generate nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: margin + p.random(w - margin * 2),
        y: margin + p.random(h - margin * 2),
        radius: p.random(4, 10) * (Math.min(w, h) / 600),
      });
    }

    // Connect each node to 1-3 nearest neighbors with Bezier traces
    for (let i = 0; i < nodes.length; i++) {
      const connections = 1 + Math.floor(p.random(3));
      // Sort others by distance
      const others = nodes
        .map((n, j) => ({ n, j, d: Math.hypot(n.x - nodes[i].x, n.y - nodes[i].y) }))
        .filter(e => e.j !== i)
        .sort((a, b) => a.d - b.d);

      for (let c = 0; c < Math.min(connections, others.length); c++) {
        const target = others[c].n;
        const dx = target.x - nodes[i].x;
        const dy = target.y - nodes[i].y;
        const bend = p.random(-0.4, 0.4);
        traces.push({
          x1: nodes[i].x, y1: nodes[i].y,
          cx1: nodes[i].x + dx * 0.25 + dy * bend,
          cy1: nodes[i].y + dy * 0.25 - dx * bend,
          cx2: nodes[i].x + dx * 0.75 + dy * bend,
          cy2: nodes[i].y + dy * 0.75 - dx * bend,
          x2: target.x, y2: target.y,
        });
      }
    }

    p.background(...PCB_BG as [number, number, number]);

    // Subtle grid lines (PCB substrate texture)
    p.stroke(20, 50, 30, 80);
    p.strokeWeight(0.5);
    const gridStep = Math.max(20, Math.min(w, h) * 0.04);
    for (let x = 0; x < w; x += gridStep) p.line(x, 0, x, h);
    for (let y = 0; y < h; y += gridStep) p.line(0, y, w, y);

    // Draw traces with glow
    p.noFill();
    for (const t of traces) {
      // Outer glow
      for (let gl = 3; gl > 0; gl--) {
        p.stroke(TRACE_COLOR[0], TRACE_COLOR[1], TRACE_COLOR[2], 15 * gl);
        p.strokeWeight(gl * 2.5 + 0.5);
        p.bezier(t.x1, t.y1, t.cx1, t.cy1, t.cx2, t.cy2, t.x2, t.y2);
      }
      // Core trace
      p.stroke(TRACE_COLOR[0], TRACE_COLOR[1], TRACE_COLOR[2], 200);
      p.strokeWeight(1.2);
      p.bezier(t.x1, t.y1, t.cx1, t.cy1, t.cx2, t.cy2, t.x2, t.y2);
    }

    // Draw nodes with glow rings
    for (const n of nodes) {
      for (let gl = 4; gl > 0; gl--) {
        p.noStroke();
        p.fill(NODE_COLOR[0], NODE_COLOR[1], NODE_COLOR[2], 20 * gl);
        p.ellipse(n.x, n.y, (n.radius + gl * 3) * 2);
      }
      // Core node
      p.fill(NODE_COLOR[0], NODE_COLOR[1], NODE_COLOR[2]);
      p.noStroke();
      p.ellipse(n.x, n.y, n.radius * 2);
      // Center hole
      p.fill(...PCB_BG as [number, number, number]);
      p.ellipse(n.x, n.y, n.radius * 0.7);
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    circuits2.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
