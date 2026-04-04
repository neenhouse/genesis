import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface WarpStar {
  angle: number;
  speed: number;
  dist: number;
  maxDist: number;
  noiseOffset: number;
  brightness: number;
}

let stars: WarpStar[] = [];
const STAR_COUNT = 180;

function initStar(p: p5, forceCenter = false): WarpStar {
  return {
    angle: p.random(p.TWO_PI),
    dist: forceCenter ? p.random(2, 8) : p.random(2, Math.min(w, h) * 0.5),
    speed: p.random(1.5, 5.0),
    maxDist: Math.min(w, h) * 0.52,
    noiseOffset: p.random(1000),
    brightness: p.random(160, 255),
  };
}

export const warp: Algorithm = {
  name: 'Warp',
  description: 'Space warp tunnel — radial streaks zoom from center with noise distortion',
  palette: { background: '#000000', colors: ['#ffffff', '#c0d8ff', '#8090c0', '#404880'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push(initStar(p));
    }

    p.background(0);
  },

  draw(p: p5) {
    const cx = w / 2, cy = h / 2;

    // Fade trail
    p.background(0, 0, 0, 35);

    for (const s of stars) {
      // Noise distortion of angle
      const angleWobble = (p.noise(s.noiseOffset + s.dist * 0.004) - 0.5) * 0.4;
      const angle = s.angle + angleWobble;

      const x0 = cx + Math.cos(angle) * s.dist;
      const y0 = cy + Math.sin(angle) * s.dist;

      s.dist += s.speed * (s.dist * 0.015 + 0.5);

      const x1 = cx + Math.cos(angle) * s.dist;
      const y1 = cy + Math.sin(angle) * s.dist;

      // Streak color: near center blue, outer white
      const t = s.dist / s.maxDist;
      const r = p.lerp(100, s.brightness, t);
      const g = p.lerp(130, s.brightness, t);
      const b = p.lerp(220, s.brightness, t);
      const alpha = p.map(s.dist, 0, s.maxDist * 0.3, 0, 200);
      const weight = p.map(s.dist, 0, s.maxDist, 0.3, 2.2);

      p.stroke(r, g, b, Math.min(alpha, 200));
      p.strokeWeight(weight);
      p.line(x0, y0, x1, y1);

      // Reset star when it exits
      if (s.dist > s.maxDist) {
        const fresh = initStar(p, true);
        s.angle = fresh.angle;
        s.dist = fresh.dist;
        s.speed = fresh.speed;
        s.noiseOffset = fresh.noiseOffset;
        s.brightness = fresh.brightness;
      }
    }

    // Central lens flare glow
    p.noStroke();
    for (let i = 5; i >= 0; i--) {
      const r = i * 12;
      const alpha = p.map(i, 0, 5, 80, 5);
      p.fill(140, 160, 255, alpha);
      p.ellipse(cx, cy, r * 2, r * 2);
    }
    p.fill(255, 255, 255, 200);
    p.ellipse(cx, cy, 3, 3);
  },

  resize(p: p5, width: number, height: number) {
    warp.setup(p, currentSeed, width, height);
    p.loop();
  },
};
