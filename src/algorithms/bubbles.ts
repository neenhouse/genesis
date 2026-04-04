import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Bubble {
  x: number; y: number;
  r: number;
  vx: number; vy: number;
  wobbleOffset: number;
  wobbleSpeed: number;
  hue: number;
  life: number;
}

let bubbleList: Bubble[] = [];

function spawnBubble(p: p5): Bubble {
  return {
    x: p.random(w * 0.1, w * 0.9),
    y: h + p.random(20, 60),
    r: p.random(8, 40),
    vx: p.random(-0.4, 0.4),
    vy: p.random(-1.2, -0.5),
    wobbleOffset: p.random(p.TWO_PI),
    wobbleSpeed: p.random(0.02, 0.05),
    hue: p.random(160, 280),
    life: 1.0,
  };
}

export const bubbles: Algorithm = {
  name: 'Bubbles',
  description: 'Rising bubble simulation — iridescent spheres float upward and pop',
  palette: { background: '#030d1a', colors: ['#80ffea', '#a0c4ff', '#bdb2ff', '#ffc6ff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.colorMode(p.HSB, 360, 100, 100, 100);

    bubbleList = [];
    for (let i = 0; i < 20; i++) {
      const b = spawnBubble(p);
      b.y = p.random(h);
      bubbleList.push(b);
    }

    p.background(210, 90, 10);
  },

  draw(p: p5) {
    p.background(210, 90, 10, 18);

    // Spawn new bubbles
    if (p.random() < 0.08 && bubbleList.length < 60) {
      bubbleList.push(spawnBubble(p));
    }

    p.noStroke();

    for (let i = bubbleList.length - 1; i >= 0; i--) {
      const b = bubbleList[i];

      // Wobble sideways
      b.wobbleOffset += b.wobbleSpeed;
      b.x += Math.sin(b.wobbleOffset) * 0.6 + b.vx;
      b.y += b.vy;

      // Pop near top
      if (b.y < -b.r * 2 || b.life <= 0) {
        bubbleList.splice(i, 1);
        continue;
      }
      if (b.y < h * 0.08) b.life -= 0.04;

      const alpha = b.life * 70;

      // Iridescent body
      p.fill(b.hue, 40, 90, alpha * 0.5);
      p.ellipse(b.x, b.y, b.r * 2, b.r * 2);

      // Rim highlight — color shifted hue
      p.noFill();
      p.stroke((b.hue + 40) % 360, 60, 100, alpha);
      p.strokeWeight(1.5);
      p.ellipse(b.x, b.y, b.r * 2, b.r * 2);
      p.noStroke();

      // Specular highlight
      p.fill(0, 0, 100, alpha * 0.9);
      p.ellipse(b.x - b.r * 0.3, b.y - b.r * 0.35, b.r * 0.35, b.r * 0.2);

      // Small secondary highlight
      p.fill(0, 0, 100, alpha * 0.4);
      p.ellipse(b.x + b.r * 0.35, b.y + b.r * 0.3, b.r * 0.12, b.r * 0.09);
    }
  },

  resize(p: p5, width: number, height: number) {
    bubbles.setup(p, currentSeed, width, height);
    p.loop();
  },
};
