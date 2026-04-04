import type p5 from 'p5';
import type { Algorithm } from './types';

const PARTICLE_COUNT = 2000;
const NOISE_SCALE = 0.003;

interface FlowParticle {
  x: number; y: number; prevX: number; prevY: number;
  speed: number; colorIdx: number;
}

let particles: FlowParticle[] = [];
let w = 0, h = 0, time = 0;
const COLORS = [[0, 229, 255], [180, 80, 255], [255, 110, 199], [100, 200, 255]];

export const drift: Algorithm = {
  name: 'Drift',
  description: 'Flow fields — particles tracing through layered Perlin noise',
  palette: { background: '#0d0d1a', colors: ['#00e5ff', '#b450ff', '#ff6ec7'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; time = 0;
    p.randomSeed(seed); p.noiseSeed(seed);
    particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = p.random(w), y = p.random(h);
      particles.push({ x, y, prevX: x, prevY: y, speed: p.random(1, 3), colorIdx: Math.floor(p.random(COLORS.length)) });
    }
    p.background(13, 13, 26);
  },

  draw(p: p5) {
    time += 0.002;
    for (const particle of particles) {
      particle.prevX = particle.x; particle.prevY = particle.y;
      const angle = p.noise(particle.x * NOISE_SCALE, particle.y * NOISE_SCALE, time) * p.TWO_PI * 2;
      particle.x += Math.cos(angle) * particle.speed;
      particle.y += Math.sin(angle) * particle.speed;
      if (particle.x < 0) { particle.x += w; particle.prevX = particle.x; }
      if (particle.x > w) { particle.x -= w; particle.prevX = particle.x; }
      if (particle.y < 0) { particle.y += h; particle.prevY = particle.y; }
      if (particle.y > h) { particle.y -= h; particle.prevY = particle.y; }
      const [r, g, b] = COLORS[particle.colorIdx];
      p.stroke(r, g, b, 15); p.strokeWeight(1);
      p.line(particle.prevX, particle.prevY, particle.x, particle.y);
    }
  },

  resize(p: p5, width: number, height: number) { w = width; h = height; },
};
