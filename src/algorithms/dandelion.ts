import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface FloatingSeed {
  x: number; y: number;
  angle: number;
  stemLen: number;
  pappusCount: number;
  drift: number;
}

export const dandelion: Algorithm = {
  name: 'Dandelion',
  description: 'Dandelion seed head — radial pappus seeds on thin stems, some drifting away',
  palette: { background: '#c8d8e8', colors: ['#ffffff', '#f5f0e0', '#d0c8a0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    // Sky gradient
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const r = Math.floor(p.lerp(180, 210, t));
      const g = Math.floor(p.lerp(200, 225, t));
      const b = Math.floor(p.lerp(220, 235, t));
      p.stroke(r, g, b);
      p.line(0, y, w, y);
    }

    const cx = w / 2 + p.random(-w * 0.1, w * 0.1);
    const cy = h * 0.5 + p.random(-h * 0.05, h * 0.05);
    const seedCount = 50 + Math.floor(p.random(40));
    const stemLen = Math.min(w, h) * p.random(0.15, 0.28);
    const sphereR = stemLen * 0.08;

    // Draw floating seeds (background)
    const floatingCount = 6 + Math.floor(p.random(10));
    const floaters: FloatingSeed[] = [];
    for (let i = 0; i < floatingCount; i++) {
      floaters.push({
        x: p.random(w * 0.1, w * 0.9),
        y: p.random(h * 0.1, h * 0.8),
        angle: p.random(-0.3, 0.3),
        stemLen: stemLen * p.random(0.4, 0.7),
        pappusCount: 6 + Math.floor(p.random(6)),
        drift: p.random(-0.15, 0.15),
      });
    }

    function drawSeed(sx: number, sy: number, angle: number, sl: number, pCount: number) {
      p.push();
      p.translate(sx, sy);
      p.rotate(angle - p.HALF_PI);
      // Stem
      p.stroke(200, 195, 170, 180);
      p.strokeWeight(0.8);
      p.line(0, 0, 0, -sl);
      // Central ball
      p.noStroke();
      p.fill(230, 220, 190, 180);
      p.ellipse(0, -sl, 4, 4);
      // Pappus filaments
      for (let k = 0; k < pCount; k++) {
        const fa = (k / pCount) * p.TWO_PI;
        const fl = sl * 0.3 + p.random(sl * 0.1);
        p.stroke(255, 252, 245, 160);
        p.strokeWeight(0.5);
        p.line(0, -sl, Math.cos(fa) * fl, -sl + Math.sin(fa) * fl * 0.5);
      }
      p.pop();
    }

    for (const f of floaters) {
      drawSeed(f.x, f.y, f.drift, f.stemLen, f.pappusCount);
    }

    // Main stalk
    p.stroke(140, 130, 90);
    p.strokeWeight(2.5);
    p.line(cx, h, cx, cy + sphereR);

    // Central sphere
    p.noStroke();
    for (let r = sphereR; r > 0; r -= 1) {
      const t = r / sphereR;
      p.fill(210 - t * 30, 200 - t * 30, 170 - t * 30);
      p.ellipse(cx, cy, r * 2, r * 2);
    }

    // Seed rays
    for (let i = 0; i < seedCount; i++) {
      const angle = (i / seedCount) * p.TWO_PI;
      const sl = stemLen * (0.8 + p.noise(i * 0.3) * 0.4);
      const ex = cx + Math.cos(angle) * (sphereR + sl);
      const ey = cy + Math.sin(angle) * (sphereR + sl);
      const sx = cx + Math.cos(angle) * sphereR;
      const sy = cy + Math.sin(angle) * sphereR;

      // Thin stem
      p.stroke(220, 215, 195, 180);
      p.strokeWeight(0.6);
      p.line(sx, sy, ex, ey);

      // Pappus tuft
      const tuftCount = 8;
      for (let t = 0; t < tuftCount; t++) {
        const ta = angle + (t / tuftCount) * p.TWO_PI;
        const tl = sl * 0.22;
        p.stroke(255, 253, 248, 150);
        p.strokeWeight(0.5);
        p.line(ex, ey, ex + Math.cos(ta) * tl, ey + Math.sin(ta) * tl * 0.5);
      }
      // Tip dot
      p.noStroke();
      p.fill(255, 250, 240, 200);
      p.ellipse(ex, ey, 3, 3);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    dandelion.setup(p, currentSeed, width, height);
  },
};
