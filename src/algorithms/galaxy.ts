import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Star {
  x: number; y: number;
  brightness: number;
  size: number;
  r: number; g: number; b: number;
}

export const galaxy: Algorithm = {
  name: 'Galaxy',
  description: 'Spiral galaxy — particles along logarithmic arms with noise scatter and bright core',
  palette: { background: '#000005', colors: ['#b0c8ff', '#ffffff', '#ffe8c0', '#ffd0a0'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    p.background(0, 0, 5);

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.46;
    const armCount = 2 + Math.floor(p.random(3));
    const armTightness = p.random(0.25, 0.5);
    const totalStars = 6000 + Math.floor(p.random(3000));
    const stars: Star[] = [];

    // Generate spiral arm stars
    for (let i = 0; i < totalStars; i++) {
      const arm = Math.floor(p.random(armCount));
      const t = Math.pow(p.random(), 0.6); // bias toward outer arms
      const radius = t * maxR;
      const armAngle = (arm / armCount) * p.TWO_PI;
      const spiralAngle = armAngle + radius * armTightness * (Math.PI / maxR);
      const scatter = p.noise(i * 0.03, arm * 10) * radius * 0.35;
      const scatterAngle = p.random(p.TWO_PI);

      const x = cx + Math.cos(spiralAngle) * radius + Math.cos(scatterAngle) * scatter;
      const y = cy + Math.sin(spiralAngle) * radius + Math.sin(scatterAngle) * scatter;

      // Color: core stars warm, outer stars blue-white
      const warmth = 1 - t;
      const r = p.lerp(176, 255, warmth);
      const g = p.lerp(200, 240, warmth * 0.5);
      const b = p.lerp(255, 180, warmth);
      const brightness = (0.4 + p.random(0.6)) * (1 - t * 0.5);

      stars.push({ x, y, brightness, size: p.random(0.5, 2.2), r, g, b });
    }

    // Scatter background field stars
    for (let i = 0; i < 800; i++) {
      stars.push({
        x: p.random(w), y: p.random(h),
        brightness: p.random(0.1, 0.4),
        size: p.random(0.3, 1.0),
        r: 150, g: 170, b: 220,
      });
    }

    // Draw stars
    p.noStroke();
    for (const s of stars) {
      const alpha = s.brightness * 255;
      p.fill(s.r, s.g, s.b, alpha);
      p.ellipse(s.x, s.y, s.size, s.size);
    }

    // Core glow (multiple layered ellipses)
    for (let i = 10; i >= 0; i--) {
      const cr = maxR * 0.015 * (i + 1);
      const warmAlpha = p.map(i, 0, 10, 180, 6);
      p.fill(255, 220, 160, warmAlpha);
      p.noStroke();
      p.ellipse(cx, cy, cr * 2.5, cr * 1.8);
    }
    p.fill(255, 255, 255, 240);
    p.ellipse(cx, cy, maxR * 0.012, maxR * 0.012);

    p.noLoop();
  },

  draw(_p: p5) {
    // Static
  },

  resize(p: p5, width: number, height: number) {
    galaxy.setup(p, currentSeed, width, height);
    p.loop();
  },
};
