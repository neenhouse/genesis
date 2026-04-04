import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;
let time = 0;

interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  noiseOffset: number;
}

let particles: SmokeParticle[] = [];
const MAX_PARTICLES = 200;
const SPAWN_RATE = 3;

function makeParticle(p: p5): SmokeParticle {
  const sourceX = w * (0.3 + p.random(0.4));
  return {
    x: sourceX + p.random(-8, 8),
    y: h,
    vx: p.random(-0.4, 0.4),
    vy: p.random(-1.2, -0.6),
    size: p.random(15, 45) * (Math.min(w, h) / 600),
    alpha: p.random(60, 120),
    life: 0,
    maxLife: p.random(120, 240),
    noiseOffset: p.random(1000),
  };
}

export const smoke: Algorithm = {
  name: 'Smoke',
  description: 'Rising smoke plumes with noise turbulence, spreading and fading with altitude',
  palette: { background: '#111418', colors: ['#c0c8d0', '#e8eaec', '#606870'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    particles = [];
    time = 0;

    // Pre-seed some particles at various ages
    for (let i = 0; i < MAX_PARTICLES * 0.6; i++) {
      const part = makeParticle(p);
      const age = Math.floor(p.random(part.maxLife));
      part.life = age;
      part.y = h - (age * 1.2);
      part.x += (p.noise(part.noiseOffset + age * 0.012) - 0.5) * 120;
    }

    p.background(17, 20, 24);
    p.loop();
  },

  draw(p: p5) {
    p.background(17, 20, 24, 30);
    time += 0.01;

    // Spawn new particles
    for (let s = 0; s < SPAWN_RATE; s++) {
      if (particles.length < MAX_PARTICLES) {
        particles.push(makeParticle(p));
      }
    }

    // Sort by size descending (larger particles behind)
    particles.sort((a, b) => b.size - a.size);

    p.noStroke();
    for (let i = particles.length - 1; i >= 0; i--) {
      const part = particles[i];
      const lifeRatio = part.life / part.maxLife;

      // Noise-driven horizontal drift
      const nx = p.noise(part.noiseOffset + time, part.y * 0.004) - 0.5;
      part.vx += nx * 0.08;
      part.vx *= 0.97;
      part.x += part.vx;

      // Vertical rise, slower as it ages
      const riseSpeed = part.vy * (1 - lifeRatio * 0.5);
      part.y += riseSpeed;

      // Expand as rises
      const currentSize = part.size * (1 + lifeRatio * 2.5);

      // Fade in then fade out
      const fadeIn = Math.min(1, part.life / 20);
      const fadeOut = 1 - lifeRatio;
      const alpha = part.alpha * fadeIn * fadeOut;

      // Color: dark gray at bottom → light gray/white as rises
      const grayValue = p.lerp(80, 210, lifeRatio);
      p.fill(grayValue, grayValue + 5, grayValue + 10, alpha);
      p.ellipse(part.x, part.y, currentSize);

      part.life++;
      if (part.life >= part.maxLife || part.y < -currentSize) {
        particles.splice(i, 1);
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    smoke.setup(p, currentSeed, width, height);
    p.loop();
  },
};
