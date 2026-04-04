import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

export const eclipse: Algorithm = {
  name: 'Eclipse',
  description: 'Solar eclipse — dark moon disc with wispy corona filaments and prominences',
  palette: { background: '#000000', colors: ['#ffffff', '#ffd700', '#ff8c00'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(0);

    const cx = w / 2;
    const cy = h / 2;
    const moonR = Math.min(w, h) * 0.22;

    // Corona glow layers
    for (let layer = 12; layer >= 1; layer--) {
      const r = moonR + layer * moonR * 0.18;
      const alpha = (13 - layer) * 3.5;
      p.noStroke();
      p.fill(255, 240, 180, alpha);
      p.ellipse(cx, cy, r * 2, r * 2);
    }

    // Wispy corona filaments
    const filamentCount = 180 + Math.floor(p.random(60));
    for (let i = 0; i < filamentCount; i++) {
      const angle = (i / filamentCount) * p.TWO_PI;
      const noiseVal = p.noise(Math.cos(angle) * 2 + 10, Math.sin(angle) * 2 + 10);
      const len = moonR * (0.3 + noiseVal * 1.4);
      const startR = moonR * 1.01;
      const endR = moonR + len;
      const spread = p.random(-0.015, 0.015);
      const alpha = 40 + noiseVal * 120;
      const warmth = p.random();
      const rr = warmth > 0.5 ? 255 : 255;
      const gg = warmth > 0.5 ? Math.floor(200 + p.random(55)) : Math.floor(160 + p.random(80));
      const bb = warmth > 0.5 ? Math.floor(p.random(80)) : Math.floor(p.random(60));
      p.stroke(rr, gg, bb, alpha);
      p.strokeWeight(0.5 + noiseVal * 0.8);
      p.line(
        cx + Math.cos(angle) * startR,
        cy + Math.sin(angle) * startR,
        cx + Math.cos(angle + spread) * endR,
        cy + Math.sin(angle + spread) * endR
      );
    }

    // Prominences — curved arcs along edge
    const prominenceCount = 4 + Math.floor(p.random(5));
    for (let i = 0; i < prominenceCount; i++) {
      const baseAngle = p.random(p.TWO_PI);
      const arcSpan = p.random(0.2, 0.6);
      const height = moonR * p.random(0.2, 0.7);
      p.noFill();
      p.stroke(255, 80, 20, 180);
      p.strokeWeight(1.5);
      p.beginShape();
      const steps = 20;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const a = baseAngle + arcSpan * (t - 0.5);
        const lift = Math.sin(t * p.PI) * height;
        const rx = cx + Math.cos(a) * (moonR + lift);
        const ry = cy + Math.sin(a) * (moonR + lift);
        p.curveVertex(rx, ry);
      }
      p.endShape();
    }

    // Moon disc — solid black
    p.noStroke();
    p.fill(0);
    p.ellipse(cx, cy, moonR * 2, moonR * 2);

    // Diamond ring effect — single bright point
    const diamondAngle = p.random(p.TWO_PI);
    p.fill(255, 255, 240, 240);
    p.ellipse(cx + Math.cos(diamondAngle) * moonR, cy + Math.sin(diamondAngle) * moonR, 6, 6);

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    eclipse.setup(p, currentSeed, width, height);
  },
};
