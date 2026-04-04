import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

function kochSegment(
  p: p5,
  x1: number, y1: number,
  x2: number, y2: number,
  depth: number
) {
  if (depth === 0) {
    p.line(x1, y1, x2, y2);
    return;
  }
  const dx = x2 - x1, dy = y2 - y1;
  // One-third and two-thirds points
  const ax = x1 + dx / 3, ay = y1 + dy / 3;
  const bx = x1 + dx * 2 / 3, by = y1 + dy * 2 / 3;
  // Apex of equilateral triangle
  const px = ax + (bx - ax) * 0.5 - (by - ay) * Math.sqrt(3) / 2;
  const py = ay + (by - ay) * 0.5 + (bx - ax) * Math.sqrt(3) / 2;

  kochSegment(p, x1, y1, ax, ay, depth - 1);
  kochSegment(p, ax, ay, px, py, depth - 1);
  kochSegment(p, px, py, bx, by, depth - 1);
  kochSegment(p, bx, by, x2, y2, depth - 1);
}

function drawKochSnowflake(p: p5, cx: number, cy: number, radius: number, depth: number) {
  const angleOffset = -Math.PI / 2;
  for (let i = 0; i < 3; i++) {
    const a1 = angleOffset + (i / 3) * Math.PI * 2;
    const a2 = angleOffset + ((i + 1) / 3) * Math.PI * 2;
    const x1 = cx + Math.cos(a1) * radius;
    const y1 = cy + Math.sin(a1) * radius;
    const x2 = cx + Math.cos(a2) * radius;
    const y2 = cy + Math.sin(a2) * radius;
    kochSegment(p, x1, y1, x2, y2, depth);
  }
}

export const snowflake: Algorithm = {
  name: 'Snowflake',
  description: 'Koch snowflake fractals with 6-fold symmetry at multiple sizes on dark blue',
  palette: { background: '#0a1628', colors: ['#ffffff', '#a8d8f0', '#6bb8e8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.noLoop();

    p.background(10, 22, 40);

    // Distant star field
    p.noStroke();
    for (let i = 0; i < 120; i++) {
      const sx = p.random(w);
      const sy = p.random(h);
      const brightness = p.random(100, 220);
      p.fill(brightness, brightness, Math.min(255, brightness + 30), p.random(80, 180));
      p.ellipse(sx, sy, p.random(0.8, 2));
    }

    // Draw multiple snowflakes at different sizes/positions
    const flakeConfigs = [
      { cx: w * 0.5, cy: h * 0.5, r: Math.min(w, h) * 0.32, depth: 4, alpha: 220, strokeW: 1.5 },
      { cx: w * 0.18, cy: h * 0.2, r: Math.min(w, h) * 0.11, depth: 3, alpha: 170, strokeW: 1.0 },
      { cx: w * 0.82, cy: h * 0.78, r: Math.min(w, h) * 0.13, depth: 3, alpha: 160, strokeW: 1.0 },
      { cx: w * 0.78, cy: h * 0.18, r: Math.min(w, h) * 0.07, depth: 3, alpha: 130, strokeW: 0.8 },
      { cx: w * 0.12, cy: h * 0.75, r: Math.min(w, h) * 0.065, depth: 2, alpha: 110, strokeW: 0.7 },
      { cx: w * 0.9, cy: h * 0.42, r: Math.min(w, h) * 0.04, depth: 2, alpha: 90, strokeW: 0.6 },
    ];

    for (const flake of flakeConfigs) {
      // 6-fold symmetry: draw 6 rotated Koch snowflakes
      p.push();
      p.translate(flake.cx, flake.cy);
      p.noFill();

      for (let sym = 0; sym < 6; sym++) {
        p.push();
        p.rotate((sym / 6) * Math.PI * 2);

        // Outer glow
        p.stroke(168, 216, 240, flake.alpha * 0.25);
        p.strokeWeight(flake.strokeW * 3.5);
        drawKochSnowflake(p, 0, 0, flake.r, flake.depth);

        // Mid glow
        p.stroke(200, 230, 248, flake.alpha * 0.5);
        p.strokeWeight(flake.strokeW * 1.8);
        drawKochSnowflake(p, 0, 0, flake.r, flake.depth);

        // Core
        p.stroke(255, 255, 255, flake.alpha);
        p.strokeWeight(flake.strokeW);
        drawKochSnowflake(p, 0, 0, flake.r, flake.depth);

        p.pop();
      }
      p.pop();
    }
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    snowflake.setup(p, currentSeed, width, height);
    p.noLoop();
  },
};
