import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface DoublePendulum {
  a1: number; a2: number;   // angles
  v1: number; v2: number;   // angular velocities
  l1: number; l2: number;   // lengths
  m1: number; m2: number;   // masses
  r: number; g: number; b: number;
  prevX2: number; prevY2: number;
}

const G = 9.8;
let pendulums: DoublePendulum[] = [];

const COLORS = [
  [255, 100, 60],  // orange-red
  [255, 200, 80],  // amber
  [255, 60, 120],  // rose
  [230, 130, 50],  // warm orange
  [200, 80, 30],   // deep rust
];

function stepPendulum(pd: DoublePendulum, dt: number) {
  const { a1, a2, v1, v2, l1, l2, m1, m2 } = pd;
  const da = a1 - a2;
  const denom1 = (2 * m1 + m2 - m2 * Math.cos(2 * da));
  const num1 = -G * (2 * m1 + m2) * Math.sin(a1)
    - m2 * G * Math.sin(a1 - 2 * a2)
    - 2 * Math.sin(da) * m2 * (v2 * v2 * l2 + v1 * v1 * l1 * Math.cos(da));
  const num2 = 2 * Math.sin(da) * (v1 * v1 * l1 * (m1 + m2)
    + G * (m1 + m2) * Math.cos(a1)
    + v2 * v2 * l2 * m2 * Math.cos(da));
  const a1acc = num1 / (l1 * denom1);
  const a2acc = num2 / (l2 * (2 * m1 + m2 - m2 * Math.cos(2 * da)));
  pd.v1 += a1acc * dt;
  pd.v2 += a2acc * dt;
  pd.v1 *= 0.9995;
  pd.v2 *= 0.9995;
  pd.a1 += pd.v1 * dt;
  pd.a2 += pd.v2 * dt;
}

export const pendulum: Algorithm = {
  name: 'Pendulum',
  description: 'Double pendulum chaos — sensitive initial conditions trace wild paths',
  palette: { background: '#120808', colors: ['#ff643c', '#ffc850', '#ff3c78'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    pendulums = [];

    const count = 3 + Math.floor(p.random(3));
    const baseLen = Math.min(w, h) * 0.18;
    for (let i = 0; i < count; i++) {
      const col = COLORS[i % COLORS.length];
      const a1 = p.random(1.0, 2.5);
      const a2 = p.random(0.5, 2.0);
      const len1 = baseLen * p.random(0.7, 1.0);
      const len2 = baseLen * p.random(0.7, 1.0);
      const x2 = w / 2 + len1 * Math.sin(a1) + len2 * Math.sin(a2);
      const y2 = h * 0.35 + len1 * Math.cos(a1) + len2 * Math.cos(a2);
      pendulums.push({
        a1, a2, v1: 0, v2: 0,
        l1: len1, l2: len2,
        m1: p.random(8, 15), m2: p.random(5, 12),
        r: col[0], g: col[1], b: col[2],
        prevX2: x2, prevY2: y2,
      });
    }

    p.background(18, 8, 8);
  },

  draw(p: p5) {
    p.background(18, 8, 8, 12);

    const ox = w / 2;
    const oy = h * 0.35;
    const steps = 4;

    for (const pd of pendulums) {
      for (let s = 0; s < steps; s++) stepPendulum(pd, 0.04);

      const x1 = ox + pd.l1 * Math.sin(pd.a1);
      const y1 = oy + pd.l1 * Math.cos(pd.a1);
      const x2 = x1 + pd.l2 * Math.sin(pd.a2);
      const y2 = y1 + pd.l2 * Math.cos(pd.a2);

      // Trace tip path
      p.stroke(pd.r, pd.g, pd.b, 60);
      p.strokeWeight(1);
      p.line(pd.prevX2, pd.prevY2, x2, y2);

      pd.prevX2 = x2;
      pd.prevY2 = y2;
    }
  },

  resize(p: p5, width: number, height: number) {
    pendulum.setup(p, currentSeed, width, height);
    p.loop();
  },
};
