import type p5 from 'p5';
import type { Algorithm } from './types';

interface Node { x: number; y: number; }

let nodes: Node[] = [];
let w = 0, h = 0;
const MIN_DIST = 4;
const MAX_DIST = 12;
const REPEL_DIST = 20;
const REPEL_FORCE = 0.3;
let frameCount = 0;

export const erosion: Algorithm = {
  name: 'Erosion',
  description: 'Differential growth — organic curves that split and writhe',
  palette: { background: '#2a2a2a', colors: ['#c47a4a', '#d4a55a', '#f0e0c0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    p.randomSeed(seed); p.noiseSeed(seed);
    frameCount = 0;
    nodes = [];
    const cx = w / 2, cy = h / 2;
    const r = Math.min(w, h) * 0.15;
    const count = 60;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * p.TWO_PI;
      nodes.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
    }
    p.background(42, 42, 42);
  },

  draw(p: p5) {
    if (frameCount > 600) { p.noLoop(); return; }
    p.background(42, 42, 42, 8);

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 2; j < nodes.length; j++) {
        if (j === (i + nodes.length - 1) % nodes.length) continue;
        const dx = nodes[j].x - nodes[i].x, dy = nodes[j].y - nodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < REPEL_DIST && dist > 0) {
          const force = (REPEL_DIST - dist) / REPEL_DIST * REPEL_FORCE;
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          nodes[i].x -= fx; nodes[i].y -= fy;
          nodes[j].x += fx; nodes[j].y += fy;
        }
      }
    }

    for (let i = 0; i < nodes.length; i++) {
      const next = (i + 1) % nodes.length;
      const dx = nodes[next].x - nodes[i].x, dy = nodes[next].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MIN_DIST) {
        const force = (dist - MIN_DIST) * 0.05;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        nodes[i].x += fx; nodes[i].y += fy;
        nodes[next].x -= fx; nodes[next].y -= fy;
      }
    }

    const newNodes: Node[] = [];
    for (let i = 0; i < nodes.length; i++) {
      newNodes.push(nodes[i]);
      const next = (i + 1) % nodes.length;
      const dx = nodes[next].x - nodes[i].x, dy = nodes[next].y - nodes[i].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > MAX_DIST) {
        newNodes.push({ x: (nodes[i].x + nodes[next].x) / 2 + p.random(-1, 1), y: (nodes[i].y + nodes[next].y) / 2 + p.random(-1, 1) });
      }
    }
    nodes = newNodes;

    p.noFill(); p.stroke(196, 122, 74, 180); p.strokeWeight(1.5);
    p.beginShape();
    for (const node of nodes) p.curveVertex(node.x, node.y);
    p.curveVertex(nodes[0].x, nodes[0].y);
    p.curveVertex(nodes[1].x, nodes[1].y);
    p.curveVertex(nodes[2].x, nodes[2].y);
    p.endShape();
    frameCount++;
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
