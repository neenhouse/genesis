import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const GRID = 24;
const COPPER = [184, 115, 51];
const SHADOW = [140, 85, 30];

function drawTrace(p: p5, x1: number, y1: number, x2: number, y2: number) {
  p.stroke(SHADOW[0], SHADOW[1], SHADOW[2], 120);
  p.strokeWeight(5);
  p.line(x1 + 1, y1 + 1, x2 + 1, y2 + 1);
  p.stroke(COPPER[0], COPPER[1], COPPER[2]);
  p.strokeWeight(4);
  p.line(x1, y1, x2, y2);
}

function drawPad(p: p5, x: number, y: number, r: number) {
  p.noStroke();
  p.fill(SHADOW[0], SHADOW[1], SHADOW[2], 100);
  p.circle(x + 1, y + 1, r * 2 + 4);
  p.fill(COPPER[0], COPPER[1], COPPER[2]);
  p.circle(x, y, r * 2 + 4);
  p.fill(50, 80, 50);
  p.circle(x, y, r);
}

export const circuit: Algorithm = {
  name: 'Circuit',
  description: 'Circuit board trace generation — copper paths on a green solder mask',
  palette: { background: '#1a3320', colors: ['#b87333', '#2d6040', '#8c5522'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(26, 51, 32);

    // Subtle PCB texture
    p.noStroke();
    for (let i = 0; i < 2000; i++) {
      p.fill(20, 45, 28, p.random(20, 50));
      p.circle(p.random(w), p.random(h), p.random(2, 8));
    }

    const cols = Math.floor(w / GRID);
    const rows = Math.floor(h / GRID);
    const pads: Array<[number, number]> = [];

    // Generate random pad locations on grid
    const padCount = 30 + Math.floor(p.random(30));
    for (let i = 0; i < padCount; i++) {
      const gx = 1 + Math.floor(p.random(cols - 2));
      const gy = 1 + Math.floor(p.random(rows - 2));
      pads.push([gx * GRID + GRID / 2, gy * GRID + GRID / 2]);
    }

    // Route L-shaped traces between nearby pads
    const routed = new Set<number>();
    for (let i = 0; i < pads.length; i++) {
      if (p.random() < 0.3) continue;
      const [x1, y1] = pads[i];
      // Connect to nearest unconnected pad
      let best = -1, bestDist = Infinity;
      for (let j = i + 1; j < pads.length; j++) {
        if (routed.has(j)) continue;
        const d = Math.hypot(pads[j][0] - x1, pads[j][1] - y1);
        if (d < bestDist && d < GRID * 8) { bestDist = d; best = j; }
      }
      if (best < 0) continue;
      routed.add(best);
      const [x2, y2] = pads[best];
      // Route as elbow: go horizontal then vertical
      const mx = p.random() > 0.5 ? x2 : x1;
      const my = mx === x2 ? y1 : y2;
      drawTrace(p, x1, y1, mx, my);
      drawTrace(p, mx, my, x2, y2);
    }

    // Draw via holes on bends and pads
    for (let i = 0; i < pads.length; i++) {
      drawPad(p, pads[i][0], pads[i][1], routed.has(i) ? 7 : 5);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    circuit.setup(p, currentSeed, width, height);
  },
};
