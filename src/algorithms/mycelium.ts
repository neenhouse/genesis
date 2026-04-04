import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Tip {
  x: number; y: number;
  angle: number;
  speed: number;
  life: number;
  generation: number;
}

let tips: Tip[] = [];
let done = false;

function spawnTip(p: p5, x: number, y: number, angle: number, gen: number): Tip {
  return { x, y, angle, speed: p.random(0.8, 2.0), life: p.random(60, 180), generation: gen };
}

export const mycelium: Algorithm = {
  name: 'Mycelium',
  description: 'Fungal network growth — branching filaments spreading through dark earth',
  palette: { background: '#1a1208', colors: ['#f5f0d8', '#d4c89a', '#8a7a50'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(26, 18, 8);
    tips = [];
    done = false;

    // Start from several seed points near the center
    const origins = 6 + Math.floor(p.random(5));
    for (let i = 0; i < origins; i++) {
      const cx = w * p.random(0.3, 0.7);
      const cy = h * p.random(0.3, 0.7);
      const arms = 3 + Math.floor(p.random(4));
      for (let j = 0; j < arms; j++) {
        tips.push(spawnTip(p, cx, cy, (j / arms) * p.TWO_PI, 0));
      }
    }
  },

  draw(p: p5) {
    if (done) return;
    const stillAlive: Tip[] = [];

    for (const tip of tips) {
      const noiseAngle = p.noise(tip.x * 0.006, tip.y * 0.006) * p.TWO_PI * 2;
      tip.angle += (noiseAngle - tip.angle) * 0.04 + p.random(-0.12, 0.12);

      const nx = tip.x + Math.cos(tip.angle) * tip.speed;
      const ny = tip.y + Math.sin(tip.angle) * tip.speed;

      const alpha = p.map(tip.generation, 0, 5, 220, 60);
      const bright = p.map(tip.generation, 0, 5, 240, 140);
      p.stroke(bright, bright * 0.96, bright * 0.84, alpha);
      p.strokeWeight(p.map(tip.generation, 0, 5, 1.4, 0.5));
      p.line(tip.x, tip.y, nx, ny);

      tip.x = nx; tip.y = ny; tip.life--;

      if (tip.life > 0 && tip.x > 0 && tip.x < w && tip.y > 0 && tip.y < h) {
        stillAlive.push(tip);
        // Occasional branching
        if (tip.generation < 5 && p.random() < 0.012) {
          stillAlive.push(spawnTip(p, tip.x, tip.y, tip.angle + p.random(-0.8, 0.8), tip.generation + 1));
        }
      }
    }

    tips = stillAlive;
    if (tips.length === 0) { p.noLoop(); done = true; }
  },

  resize(p: p5, width: number, height: number) {
    mycelium.setup(p, currentSeed, width, height);
    p.loop();
  },
};
