import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;
let portalOffsetX = 0, portalOffsetY = 0;
let layerPhases: number[] = [];
let layerSpeeds: number[] = [];
let layerColors: Array<[number, number, number]> = [];

const LAYERS = 22;

// Interpolate polygon between circle, square, and triangle
function morphShape(p: p5, cx: number, cy: number, r: number, morph: number, rotation: number) {
  const sides = morph < 0.5
    ? p.lerp(64, 4, morph * 2)          // circle -> square
    : p.lerp(4, 3, (morph - 0.5) * 2);  // square -> triangle
  const n = Math.max(3, Math.round(sides));

  p.beginShape();
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * p.TWO_PI + rotation;
    const polyX = cx + Math.cos(a) * r;
    const polyY = cy + Math.sin(a) * r;
    p.vertex(polyX, polyY);
  }
  p.endShape(p.CLOSE);
}

export const portal: Algorithm = {
  name: 'Portal',
  description: 'Rotating tunnel — move your mouse to warp the perspective',
  interactive: true,
  palette: { background: '#0a0015', colors: ['#7c3aed', '#3b82f6', '#ffffff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    time = 0;

    layerPhases = [];
    layerSpeeds = [];
    layerColors = [];
    for (let i = 0; i < LAYERS; i++) {
      layerPhases.push(p.random(p.TWO_PI));
      layerSpeeds.push((p.random() > 0.5 ? 1 : -1) * p.random(0.3, 1.1));
      const t = i / LAYERS;
      // Deep layers: dark purple; middle: blue-violet; center: bright white
      const r = Math.round(p.lerp(15, 255, Math.pow(t, 1.4)));
      const g = Math.round(p.lerp(5,  220, Math.pow(t, 2.0)));
      const b = Math.round(p.lerp(40, 255, Math.pow(t, 1.2)));
      layerColors.push([r, g, b]);
    }
  },

  draw(p: p5) {
    p.background(10, 0, 21);
    time += 0.018;

    const cx = w / 2 + portalOffsetX;
    const cy = h / 2 + portalOffsetY;
    const maxR = Math.min(w, h) * 0.5;

    // Draw from outermost to innermost so inner layers appear on top
    for (let i = 0; i < LAYERS; i++) {
      const t = i / (LAYERS - 1);
      const r = maxR * (1 - t * 0.95);
      const morph = (Math.sin(time * 0.4 + layerPhases[i]) + 1) * 0.5;
      const rotation = time * layerSpeeds[i] * 0.7 + layerPhases[i];

      const [cr, cg, cb] = layerColors[i];
      const strokeAlpha = 40 + t * 180;
      const fillAlpha = t > 0.85 ? (t - 0.85) / 0.15 * 30 : 0;

      if (fillAlpha > 0) {
        p.fill(cr, cg, cb, fillAlpha);
      } else {
        p.noFill();
      }
      p.stroke(cr, cg, cb, strokeAlpha);
      p.strokeWeight(0.8 + t * 2.5);

      morphShape(p, cx, cy, r, morph, rotation);
    }

    // Bright center glow
    p.noStroke();
    for (let g = 5; g > 0; g--) {
      const gr = g / 5;
      p.fill(200, 180, 255, gr * 40);
      p.circle(cx, cy, maxR * 0.06 * gr);
    }
    p.fill(255, 255, 255, 230);
    p.circle(cx, cy, maxR * 0.022);
  },

  mouseMoved(_p: p5, mx: number, my: number) {
    // Offset portal center toward mouse, with dampening
    portalOffsetX = (mx - w / 2) * 0.15;
    portalOffsetY = (my - h / 2) * 0.15;
  },

  resize(p: p5, width: number, height: number) {
    portal.setup(p, currentSeed, width, height);
    p.loop();
  },
};
