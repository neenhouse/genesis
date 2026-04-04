import type p5 from 'p5';
import type { Algorithm } from './types';

interface Triangle { type: 0 | 1; ax: number; ay: number; bx: number; by: number; cx: number; cy: number; }

let triangles: Triangle[] = [];
let w = 0, h = 0;
let currentSeed = 0;
const PHI = (1 + Math.sqrt(5)) / 2;

function subdivide(tris: Triangle[]): Triangle[] {
  const result: Triangle[] = [];
  for (const t of tris) {
    if (t.type === 0) {
      const px = t.ax + (t.bx - t.ax) / PHI, py = t.ay + (t.by - t.ay) / PHI;
      result.push({ type: 0, ax: t.cx, ay: t.cy, bx: px, by: py, cx: t.bx, cy: t.by });
      result.push({ type: 1, ax: px, ay: py, bx: t.cx, by: t.cy, cx: t.ax, cy: t.ay });
    } else {
      const qx = t.bx + (t.ax - t.bx) / PHI, qy = t.by + (t.ay - t.by) / PHI;
      const rx = t.bx + (t.cx - t.bx) / PHI, ry = t.by + (t.cy - t.by) / PHI;
      result.push({ type: 1, ax: qx, ay: qy, bx: t.ax, by: t.ay, cx: t.cx, cy: t.cy });
      result.push({ type: 1, ax: rx, ay: ry, bx: qx, by: qy, cx: t.bx, cy: t.by });
      result.push({ type: 0, ax: rx, ay: ry, bx: t.cx, by: t.cy, cx: qx, cy: qy });
    }
  }
  return result;
}

export const lattice: Algorithm = {
  name: 'Lattice',
  description: 'Penrose tiling — aperiodic patterns that never repeat',
  palette: { background: '#0f0f2e', colors: ['#d4a843', '#8b7025', '#f0d060'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    const cx = w / 2, cy = h / 2;
    const r = Math.max(w, h) * 0.8;
    triangles = [];
    for (let i = 0; i < 10; i++) {
      const a1 = (i * 2 * Math.PI) / 10 + (seed * 0.1);
      const a2 = ((i + 1) * 2 * Math.PI) / 10 + (seed * 0.1);
      const bx = cx + Math.cos(a1) * r, by = cy + Math.sin(a1) * r;
      const dx = cx + Math.cos(a2) * r, dy = cy + Math.sin(a2) * r;
      if (i % 2 === 0) triangles.push({ type: 1, ax: cx, ay: cy, bx, by, cx: dx, cy: dy });
      else triangles.push({ type: 1, ax: cx, ay: cy, bx: dx, by: dy, cx: bx, cy: by });
    }
    const subdivisions = 5 + Math.floor((seed % 3));
    for (let i = 0; i < Math.min(subdivisions, 6); i++) triangles = subdivide(triangles);

    p.background(15, 15, 46);
    p.strokeWeight(0.5);
    for (const t of triangles) {
      const n = p.noise((t.ax + t.bx + t.cx) / 3 * 0.002, (t.ay + t.by + t.cy) / 3 * 0.002, seed * 0.01);
      if (t.type === 1) {
        const bright = 140 + n * 115;
        p.fill(bright, bright * 0.65, bright * 0.2, 200);
        p.stroke(212, 168, 67, 100);
      } else {
        p.fill(30 + n * 40, 30 + n * 30, 60 + n * 40, 200);
        p.stroke(212, 168, 67, 50);
      }
      p.triangle(t.ax, t.ay, t.bx, t.by, t.cx, t.cy);
    }
    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    lattice.setup(p, currentSeed, width, height);
  },
};
