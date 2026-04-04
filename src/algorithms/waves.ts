import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const WAVE_LAYERS = 9;

interface WaveLayer {
  baseY: number;
  amplitude: number;
  period: number;
  phase: number;
  phaseStep: number;
  deepColor: number[];
  midColor: number[];
}

interface FoamParticle {
  x: number; y: number;
  size: number; alpha: number;
}

let layers: WaveLayer[] = [];
let foam: FoamParticle[] = [];

function buildLayers(p: p5) {
  layers = [];
  const skyH = h * 0.28;
  const seaH = h - skyH;

  for (let i = 0; i < WAVE_LAYERS; i++) {
    const t = i / (WAVE_LAYERS - 1);
    const deep = [8 + t * 20, 40 + t * 70, 120 + t * 80];
    const mid  = [20 + t * 30, 70 + t * 60, 160 + t * 60];
    layers.push({
      baseY: skyH + seaH * (0.1 + t * 0.88),
      amplitude: p.random(18, 55) * (1 - t * 0.5),
      period: p.random(w * 0.25, w * 0.7),
      phase: p.random(p.TWO_PI),
      phaseStep: p.random(0.008, 0.025) * (i % 2 === 0 ? 1 : -1),
      deepColor: deep,
      midColor: mid,
    });
  }
}

function buildFoam(p: p5) {
  foam = [];
  for (const layer of layers) {
    // Sample crest positions
    const steps = Math.floor(w / 12);
    for (let i = 0; i < steps; i++) {
      const x = (i / steps) * w;
      const y = layer.baseY - Math.sin((x / layer.period) * p.TWO_PI + layer.phase) * layer.amplitude;
      // Only spawn foam near crests (sin ≈ 1)
      const sin = Math.sin((x / layer.period) * p.TWO_PI + layer.phase);
      if (sin > 0.7 && p.random() < 0.55) {
        const count = 2 + Math.floor(p.random(5));
        for (let k = 0; k < count; k++) {
          foam.push({
            x: x + p.random(-18, 18),
            y: y + p.random(-10, 4),
            size: p.random(2, 8),
            alpha: p.random(160, 240),
          });
        }
      }
    }
  }
}

export const waves: Algorithm = {
  name: 'Waves',
  description: 'Japanese wave pattern — Hokusai-inspired layered swells with foam at the crests',
  palette: { background: '#c8dce8', colors: ['#0a2870', '#1444a0', '#f0f4f8'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(200, 220, 232);

    // Sky gradient
    p.noStroke();
    const skyH = h * 0.28;
    for (let y = 0; y < skyH; y++) {
      const t = y / skyH;
      const r = p.lerp(200, 140, t);
      const g = p.lerp(220, 180, t);
      const b = p.lerp(232, 210, t);
      p.stroke(r, g, b);
      p.line(0, y, w, y);
    }

    buildLayers(p);
    buildFoam(p);

    // Draw each wave layer back-to-front
    p.noStroke();
    for (let i = WAVE_LAYERS - 1; i >= 0; i--) {
      const layer = layers[i];
      const [dr, dg, db] = layer.deepColor;
      const [mr, mg, mb] = layer.midColor;

      // Wave fill using gradient strip
      const steps = Math.ceil(w / 3);
      p.beginShape();
      p.vertex(0, h);
      for (let s = 0; s <= steps; s++) {
        const x = (s / steps) * w;
        const y = layer.baseY - Math.sin((x / layer.period) * p.TWO_PI + layer.phase) * layer.amplitude;
        p.vertex(x, y);
      }
      p.vertex(w, h);
      p.endShape(p.CLOSE);

      // Fill pass with color
      p.fill(dr, dg, db, 220);
      p.beginShape();
      p.vertex(0, h);
      for (let s = 0; s <= steps; s++) {
        const x = (s / steps) * w;
        const y = layer.baseY - Math.sin((x / layer.period) * p.TWO_PI + layer.phase) * layer.amplitude;
        p.vertex(x, y);
      }
      p.vertex(w, h);
      p.endShape(p.CLOSE);

      // Dark outline at wave crest
      p.stroke(Math.max(dr - 30, 0), Math.max(dg - 30, 0), Math.max(db - 20, 0), 180);
      p.strokeWeight(1.5);
      p.noFill();
      p.beginShape();
      for (let s = 0; s <= steps; s++) {
        const x = (s / steps) * w;
        const y = layer.baseY - Math.sin((x / layer.period) * p.TWO_PI + layer.phase) * layer.amplitude;
        p.vertex(x, y);
      }
      p.endShape();
      p.noStroke();

      // Highlight band just below crest
      p.fill(mr, mg, mb, 60);
      p.beginShape();
      for (let s = 0; s <= steps; s++) {
        const x = (s / steps) * w;
        const base = layer.baseY - Math.sin((x / layer.period) * p.TWO_PI + layer.phase) * layer.amplitude;
        p.vertex(x, base);
      }
      for (let s = steps; s >= 0; s--) {
        const x = (s / steps) * w;
        const base = layer.baseY - Math.sin((x / layer.period) * p.TWO_PI + layer.phase) * layer.amplitude;
        p.vertex(x, base + 12);
      }
      p.endShape(p.CLOSE);
    }

    // Foam particles
    p.noStroke();
    for (const f of foam) {
      p.fill(255, 255, 255, f.alpha * 0.5);
      p.circle(f.x, f.y, f.size * 2.2);
      p.fill(255, 255, 255, f.alpha);
      p.circle(f.x, f.y, f.size);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    waves.setup(p, currentSeed, width, height);
  },
};
