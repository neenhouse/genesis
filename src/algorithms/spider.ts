import type p5 from 'p5';
import type { Algorithm } from './types';

let currentSeed = 0;
const THREAD_COUNT = 18;

function drawWeb(p: p5, cx: number, cy: number, maxR: number) {
  const rings = 10;

  // radial threads from center
  p.stroke(210, 220, 215, 160);
  p.strokeWeight(0.8);
  for (let i = 0; i < THREAD_COUNT; i++) {
    const angle = (i / THREAD_COUNT) * p.TWO_PI;
    const rx = cx + Math.cos(angle) * maxR;
    const ry = cy + Math.sin(angle) * maxR;
    p.line(cx, cy, rx, ry);
  }

  // spiral capture thread — connect radials at each ring
  for (let ring = 1; ring <= rings; ring++) {
    const r = (ring / rings) * maxR;
    const wobble = maxR * 0.012;
    p.beginShape();
    p.noFill();
    p.stroke(200, 215, 210, ring < 4 ? 80 : 140);
    p.strokeWeight(ring < 4 ? 0.5 : 0.9);
    for (let i = 0; i <= THREAD_COUNT; i++) {
      const angle = (i / THREAD_COUNT) * p.TWO_PI;
      const jitter = p.noise(ring * 3.1, i * 0.7) * wobble - wobble * 0.5;
      const rr = r + jitter;
      p.vertex(cx + Math.cos(angle) * rr, cy + Math.sin(angle) * rr);
    }
    p.endShape();
  }

  // dew drops at intersections
  p.noStroke();
  for (let ring = 1; ring <= rings; ring++) {
    const r = (ring / rings) * maxR;
    for (let i = 0; i < THREAD_COUNT; i++) {
      if (p.noise(ring * 2.3, i * 1.7) < 0.45) continue; // sparse
      const angle = (i / THREAD_COUNT) * p.TWO_PI;
      const dx = cx + Math.cos(angle) * r;
      const dy = cy + Math.sin(angle) * r;
      const dropSize = p.random(2, 5);
      p.fill(200, 230, 225, 80);
      p.ellipse(dx, dy, dropSize * 2.2, dropSize * 2.2);
      p.fill(230, 250, 255, 180);
      p.ellipse(dx, dy, dropSize, dropSize);
      p.fill(255, 255, 255, 220);
      p.ellipse(dx - dropSize * 0.2, dy - dropSize * 0.2, dropSize * 0.35, dropSize * 0.35);
    }
  }
}

export const spider: Algorithm = {
  name: 'Spider',
  description: 'Radial spider web with spiral capture thread and dew drops',
  palette: {
    background: '#0e1a14',
    colors: ['#c8dcd5', '#aac4b8', '#ffffff', '#7a9e94'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(14, 26, 20);

    // misty background gradient suggestion
    p.noStroke();
    for (let i = 0; i < 6; i++) {
      const alpha = p.map(i, 0, 5, 12, 2);
      p.fill(30, 60, 45, alpha);
      const r = p.map(i, 0, 5, Math.min(width, height) * 0.8, 0);
      p.ellipse(width * 0.5, height * 0.5, r * 2, r * 2);
    }

    const cx = width * 0.5;
    const cy = height * 0.48;
    const maxR = Math.min(width, height) * 0.43;
    drawWeb(p, cx, cy, maxR);
  },

  draw(p: p5) {
    p.noLoop();
  },

  resize(p: p5, width: number, height: number) {
    spider.setup(p, currentSeed, width, height);
    p.loop();
  },
};
