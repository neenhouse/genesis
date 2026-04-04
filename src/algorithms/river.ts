import type p5 from 'p5';
import type { Algorithm } from './types';

let currentSeed = 0;
let done = false;

interface RiverPt { x: number; y: number; width: number; }

function buildRiver(p: p5, w: number, h: number): RiverPt[] {
  const pts: RiverPt[] = [];
  let x = w * 0.5 + p.random(-w * 0.1, w * 0.1);
  let angle = p.HALF_PI; // flowing downward
  const stepLen = h / 100;

  for (let i = 0; i < 110; i++) {
    const ny = i / 110;
    const curvature = (p.noise(ny * 2.5, 0.5) - 0.5) * 1.8;
    angle += curvature * 0.18;
    x += Math.cos(angle) * stepLen;
    const y = i * stepLen - stepLen * 5;
    x = p.constrain(x, w * 0.1, w * 0.9);
    const width = p.map(p.noise(ny * 3, 1.5), 0, 1, w * 0.03, w * 0.08);
    pts.push({ x, y, width });
  }
  return pts;
}

function drawOxbow(p: p5, pts: RiverPt[], w: number, h: number) {
  // find tight bends and draw detached oxbow lakes
  for (let i = 10; i < pts.length - 10; i += 18) {
    const prev = pts[i - 8], cur = pts[i], next = pts[i + 8];
    const bend = Math.abs(
      Math.atan2(next.y - cur.y, next.x - cur.x) - Math.atan2(cur.y - prev.y, cur.x - prev.x)
    );
    if (bend > 0.5 && p.noise(i * 0.3) > 0.55) {
      const ox = cur.x + p.random(-cur.width * 3, cur.width * 3);
      const oy = cur.y + p.random(-h * 0.04, h * 0.04);
      const ow = cur.width * p.random(1.8, 3.2);
      const oh = cur.width * p.random(0.5, 1.2);
      p.fill(90, 155, 190, 160);
      p.noStroke();
      p.ellipse(ox, oy, ow, oh);
    }
  }
}

export const river: Algorithm = {
  name: 'River',
  description: 'Meandering river with noise-driven curves, oxbow lakes, and bank vegetation',
  palette: {
    background: '#c8b87a',
    colors: ['#4a90c8', '#2a6496', '#5a8a3c', '#8ab04a'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    currentSeed = seed;
    done = false;
    p.randomSeed(seed); p.noiseSeed(seed);

    // tan ground
    p.background(200, 184, 122);

    const pts = buildRiver(p, width, height);

    // wide bank (green)
    p.noStroke();
    for (let pass = 3; pass >= 1; pass--) {
      const bw = pass;
      p.fill(90 + pass * 12, 140 + pass * 8, 60 + pass * 6, 180);
      p.beginShape();
      for (const pt of pts) p.vertex(pt.x - pt.width * (2 + pass), pt.y);
      for (let i = pts.length - 1; i >= 0; i--) p.vertex(pts[i].x + pts[i].width * (2 + bw), pts[i].y);
      p.endShape(p.CLOSE);
    }

    // water body
    p.fill(60, 130, 190, 220);
    p.beginShape();
    for (const pt of pts) p.vertex(pt.x - pt.width, pt.y);
    for (let i = pts.length - 1; i >= 0; i--) p.vertex(pts[i].x + pts[i].width, pts[i].y);
    p.endShape(p.CLOSE);

    // water sheen
    p.stroke(120, 190, 230, 60);
    p.strokeWeight(1.5);
    for (let i = 2; i < pts.length - 2; i += 4) {
      const pt = pts[i];
      p.line(pt.x - pt.width * 0.5, pt.y, pt.x + pt.width * 0.5, pt.y);
    }

    // oxbow lakes
    drawOxbow(p, pts, width, height);

    // vegetation dots on banks
    p.noStroke();
    for (let i = 0; i < pts.length; i++) {
      const pt = pts[i];
      for (let side = -1; side <= 1; side += 2) {
        const vegCount = Math.floor(p.noise(i * 0.4, side * 2) * 5);
        for (let v = 0; v < vegCount; v++) {
          const vx = pt.x + side * (pt.width * (2.2 + p.random(0.5, 2.5)));
          const vy = pt.y + p.random(-8, 8);
          const vr = p.noise(vx * 0.03, vy * 0.03);
          const g = Math.floor(p.lerp(100, 180, vr));
          p.fill(50 + Math.floor(vr * 40), g, 40, 200);
          p.ellipse(vx, vy, p.random(3, 7), p.random(3, 7));
        }
      }
    }

    done = true;
  },

  draw(p: p5) {
    p.noLoop();
  },

  resize(p: p5, width: number, height: number) {
    river.setup(p, currentSeed, width, height);
    p.loop();
  },
};
