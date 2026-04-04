import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Drop {
  x: number;
  y: number;
  speed: number;
  len: number;
  alpha: number;
}

interface Splash {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

let drops: Drop[] = [];
let splashes: Splash[] = [];
const DROP_COUNT = 180;
const ANGLE = 0.25; // radians from vertical
const RAIN_COLOR = [160, 195, 220];
const SPLASH_COLOR = [180, 210, 235];

function makeDrop(p: p5, initialY?: number): Drop {
  return {
    x: p.random(-w * 0.2, w * 1.1),
    y: initialY !== undefined ? initialY : p.random(-h, 0),
    speed: p.random(8, 18),
    len: p.random(12, 28),
    alpha: p.random(100, 200),
  };
}

export const rain: Algorithm = {
  name: 'Rain',
  description: 'Diagonal rainfall with splash particles on impact',
  palette: { background: '#1e2a35', colors: ['#a0c3dc', '#b4d2e7', '#6a9ab5'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    drops = [];
    splashes = [];
    for (let i = 0; i < DROP_COUNT; i++) {
      drops.push(makeDrop(p, p.random(0, h)));
    }

    p.background(30, 42, 53);
    p.loop();
  },

  draw(p: p5) {
    // Dark semi-transparent overlay for trails
    p.fill(30, 42, 53, 55);
    p.noStroke();
    p.rect(0, 0, w, h);

    const sx = Math.sin(ANGLE);
    const sy = Math.cos(ANGLE);

    // Draw and update raindrops
    p.strokeCap(p.ROUND);
    for (const d of drops) {
      p.stroke(RAIN_COLOR[0], RAIN_COLOR[1], RAIN_COLOR[2], d.alpha);
      p.strokeWeight(Math.max(0.5, d.len * 0.04));
      p.line(d.x, d.y, d.x - sx * d.len, d.y - sy * d.len);

      d.x += sx * d.speed;
      d.y += sy * d.speed;

      // Hit bottom — spawn splash
      if (d.y > h) {
        const splashCount = 3 + Math.floor(p.random(5));
        for (let i = 0; i < splashCount; i++) {
          const angle = p.random(-p.PI * 0.8, -p.PI * 0.05);
          const spd = p.random(1.5, 5);
          splashes.push({
            x: d.x,
            y: h,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            life: 1,
            maxLife: p.random(12, 25),
          });
        }
        // Reset drop
        const nd = makeDrop(p);
        d.x = nd.x; d.y = nd.y;
        d.speed = nd.speed; d.len = nd.len; d.alpha = nd.alpha;
      }
    }

    // Draw and update splashes
    p.noStroke();
    for (let i = splashes.length - 1; i >= 0; i--) {
      const s = splashes[i];
      const alpha = (s.life / s.maxLife) * 160;
      p.fill(SPLASH_COLOR[0], SPLASH_COLOR[1], SPLASH_COLOR[2], alpha);
      p.ellipse(s.x, s.y, 2.5, 2.5);

      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.3; // gravity
      s.life++;

      if (s.life > s.maxLife || s.y > h) {
        splashes.splice(i, 1);
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    rain.setup(p, currentSeed, width, height);
    p.loop();
  },
};
