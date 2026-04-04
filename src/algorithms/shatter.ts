import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Point { x: number; y: number; }
interface Tri { a: Point; b: Point; c: Point; }

// Simple Delaunay via incremental insertion (Bowyer-Watson)
function circumcircle(a: Point, b: Point, c: Point) {
  const ax = a.x, ay = a.y, bx = b.x, by = b.y, cx2 = c.x, cy2 = c.y;
  const D = 2 * (ax * (by - cy2) + bx * (cy2 - ay) + cx2 * (ay - by));
  if (Math.abs(D) < 1e-10) return { x: 0, y: 0, r: Infinity };
  const ux = ((ax * ax + ay * ay) * (by - cy2) + (bx * bx + by * by) * (cy2 - ay) + (cx2 * cx2 + cy2 * cy2) * (ay - by)) / D;
  const uy = ((ax * ax + ay * ay) * (cx2 - bx) + (bx * bx + by * by) * (ax - cx2) + (cx2 * cx2 + cy2 * cy2) * (bx - ax)) / D;
  const r = Math.sqrt((ax - ux) ** 2 + (ay - uy) ** 2);
  return { x: ux, y: uy, r };
}

function delaunay(points: Point[], w: number, h: number): Tri[] {
  // Super triangle
  const margin = Math.max(w, h) * 10;
  const st: Point[] = [
    { x: -margin, y: -margin },
    { x: w + margin * 2, y: -margin },
    { x: w / 2, y: h + margin * 2 },
  ];

  let triangles: { a: Point; b: Point; c: Point; cc: { x: number; y: number; r: number } }[] = [
    { a: st[0], b: st[1], c: st[2], cc: circumcircle(st[0], st[1], st[2]) },
  ];

  for (const p of points) {
    const bad: typeof triangles = [];
    const good: typeof triangles = [];

    for (const tri of triangles) {
      const dx = p.x - tri.cc.x;
      const dy = p.y - tri.cc.y;
      if (dx * dx + dy * dy < tri.cc.r * tri.cc.r) {
        bad.push(tri);
      } else {
        good.push(tri);
      }
    }

    // Find boundary edges
    const edges: [Point, Point][] = [];
    for (const tri of bad) {
      const triEdges: [Point, Point][] = [[tri.a, tri.b], [tri.b, tri.c], [tri.c, tri.a]];
      for (const edge of triEdges) {
        let shared = false;
        for (const other of bad) {
          if (other === tri) continue;
          const otherPts = [other.a, other.b, other.c];
          if (otherPts.includes(edge[0]) && otherPts.includes(edge[1])) {
            shared = true; break;
          }
        }
        if (!shared) edges.push(edge);
      }
    }

    triangles = good;
    for (const [e0, e1] of edges) {
      triangles.push({ a: e0, b: e1, c: p, cc: circumcircle(e0, e1, p) });
    }
  }

  // Remove super triangle vertices
  return triangles
    .filter(t => !st.includes(t.a) && !st.includes(t.b) && !st.includes(t.c))
    .map(t => ({ a: t.a, b: t.b, c: t.c }));
}

export const shatter: Algorithm = {
  name: 'Shatter',
  description: 'Delaunay triangulation — a fractured sunset in geometric shards',
  palette: { background: '#1a0a1a', colors: ['#f97316', '#ec4899', '#8b5cf6'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(26, 10, 26);

    // Generate random points
    const pointCount = 150 + Math.floor(p.random(100));
    const points: Point[] = [];
    for (let i = 0; i < pointCount; i++) {
      points.push({ x: p.random(-20, w + 20), y: p.random(-20, h + 20) });
    }

    const tris = delaunay(points, w, h);

    // Draw triangles with sunset gradient
    p.strokeWeight(0.5);
    p.stroke(255, 255, 255, 20);

    for (const tri of tris) {
      const cx = (tri.a.x + tri.b.x + tri.c.x) / 3;
      const cy = (tri.a.y + tri.b.y + tri.c.y) / 3;
      const t = cy / h; // 0 = top, 1 = bottom
      const n = p.noise(cx * 0.003, cy * 0.003, seed * 0.01);

      let r: number, g: number, b: number;
      if (t < 0.33) {
        // Top: purple
        const lt = t / 0.33;
        r = 139 * (1 - lt) + 236 * lt;
        g = 92 * (1 - lt) + 72 * lt;
        b = 246 * (1 - lt) + 153 * lt;
      } else if (t < 0.66) {
        // Middle: pink → orange
        const lt = (t - 0.33) / 0.33;
        r = 236 * (1 - lt) + 249 * lt;
        g = 72 * (1 - lt) + 115 * lt;
        b = 153 * (1 - lt) + 22 * lt;
      } else {
        // Bottom: orange → dark
        const lt = (t - 0.66) / 0.34;
        r = 249 * (1 - lt) + 80 * lt;
        g = 115 * (1 - lt) + 20 * lt;
        b = 22 * (1 - lt) + 40 * lt;
      }

      const bright = 0.7 + n * 0.3;
      p.fill(r * bright, g * bright, b * bright, 230);
      p.triangle(tri.a.x, tri.a.y, tri.b.x, tri.b.y, tri.c.x, tri.c.y);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    shatter.setup(p, currentSeed, width, height);
  },
};
