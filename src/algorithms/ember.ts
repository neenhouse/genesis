import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0;
let currentSeed = 0;

interface Ember {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number; heat: number;
}

let embers: Ember[] = [];
const POOL_SIZE = 350;

function spawnEmber(p: p5): Ember {
  const x = w * 0.5 + p.random(-w * 0.2, w * 0.2);
  const maxLife = 80 + p.random(80);
  return {
    x,
    y: h + p.random(10),
    vx: p.random(-1.0, 1.0),
    vy: p.random(-2.5, -0.8),
    life: maxLife,
    maxLife,
    size: p.random(2, 5.5),
    heat: p.random(0.3, 1.0),
  };
}

export const ember: Algorithm = {
  name: 'Ember',
  description: 'Fire particle system — embers rise with heat shimmer and glow',
  palette: {
    background: '#000000',
    colors: ['#ff2200', '#ff7700', '#ffcc00', '#ff4400'],
  },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height;
    currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    embers = [];
    for (let i = 0; i < POOL_SIZE; i++) {
      const e = spawnEmber(p);
      e.life = p.random(e.maxLife); // stagger initial positions
      e.y = h - (1 - e.life / e.maxLife) * h * 0.8;
      embers.push(e);
    }
    p.background(0);
  },

  draw(p: p5) {
    // dark fade
    p.fill(0, 0, 0, 40);
    p.noStroke();
    p.rect(0, 0, w, h);

    p.noStroke();
    const t = p.frameCount * 0.01;

    for (let i = 0; i < embers.length; i++) {
      const e = embers[i];

      // shimmer
      const shimmer = p.noise(e.x * 0.008, e.y * 0.008, t) - 0.5;
      e.vx += shimmer * 0.3;
      e.vx *= 0.96;
      e.x += e.vx;
      e.y += e.vy;
      e.vy -= 0.02; // accelerate upward slightly
      e.life--;

      if (e.life <= 0 || e.y < -20) {
        embers[i] = spawnEmber(p);
        continue;
      }

      const lt = e.life / e.maxLife; // 1=young, 0=dying
      const alpha = lt * 220;

      // color: hot=white-yellow, cooling=orange-red
      let r, g, b;
      if (lt > 0.7) {
        const s = (lt - 0.7) / 0.3;
        r = p.lerp(255, 255, s); g = p.lerp(180, 240, s); b = p.lerp(0, 80, s) * e.heat;
      } else if (lt > 0.4) {
        const s = (lt - 0.4) / 0.3;
        r = 255; g = p.lerp(80, 180, s); b = 0;
      } else {
        r = p.lerp(120, 255, lt / 0.4); g = 0; b = 0;
      }

      // glow passes
      const sz = e.size;
      p.fill(r, g, b, alpha * 0.15); p.ellipse(e.x, e.y, sz * 4, sz * 4);
      p.fill(r, g, b, alpha * 0.35); p.ellipse(e.x, e.y, sz * 2.2, sz * 2.2);
      p.fill(r, g, b, alpha);        p.ellipse(e.x, e.y, sz, sz);
      // bright core
      p.fill(255, 255, 255, alpha * 0.6); p.ellipse(e.x, e.y, sz * 0.35, sz * 0.35);
    }
  },

  resize(p: p5, width: number, height: number) {
    ember.setup(p, currentSeed, width, height);
  },
};
