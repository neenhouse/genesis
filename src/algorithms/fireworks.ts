import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Spark {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  r: number; g: number; b: number;
}

interface Rocket {
  x: number; y: number;
  vy: number;
  r: number; g: number; b: number;
  exploded: boolean;
}

let sparks: Spark[] = [];
let rockets: Rocket[] = [];

const SPARK_COLORS = [
  [255, 220, 50],  // gold
  [255, 80, 80],   // red
  [80, 220, 255],  // cyan
  [255, 150, 50],  // orange
  [200, 100, 255], // violet
  [100, 255, 150], // green
  [255, 255, 255], // white
];

function launchRocket(p: p5) {
  const col = SPARK_COLORS[Math.floor(p.random(SPARK_COLORS.length))];
  rockets.push({
    x: p.random(w * 0.15, w * 0.85),
    y: h,
    vy: p.random(-14, -9),
    r: col[0], g: col[1], b: col[2],
    exploded: false,
  });
}

function explode(p: p5, rocket: Rocket) {
  const count = Math.floor(p.random(60, 120));
  for (let i = 0; i < count; i++) {
    const angle = p.random(p.TWO_PI);
    const speed = p.random(1, 7);
    const life = p.random(40, 90);
    sparks.push({
      x: rocket.x, y: rocket.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life, maxLife: life,
      r: rocket.r, g: rocket.g, b: rocket.b,
    });
  }
}

export const fireworks: Algorithm = {
  name: 'Fireworks',
  description: 'Particle fireworks — rockets burst into gravity-pulled sparks',
  palette: { background: '#000000', colors: ['#ffdc32', '#ff5050', '#50dcff'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    sparks = []; rockets = [];
    p.background(0);
  },

  draw(p: p5) {
    p.background(0, 0, 0, 30);

    // Launch rockets randomly
    if (p.random() < 0.04) launchRocket(p);

    // Update rockets
    for (let i = rockets.length - 1; i >= 0; i--) {
      const rkt = rockets[i];
      rkt.y += rkt.vy;
      rkt.vy += 0.15; // gravity

      // Trail
      p.noStroke();
      p.fill(rkt.r, rkt.g, rkt.b, 180);
      p.ellipse(rkt.x, rkt.y, 3, 3);

      // Explode at peak
      if (rkt.vy >= 0 && !rkt.exploded) {
        rkt.exploded = true;
        explode(p, rkt);
        rockets.splice(i, 1);
      }
    }

    // Update sparks
    p.noStroke();
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx;
      s.y += s.vy;
      s.vy += 0.18; // gravity
      s.vx *= 0.97; // drag
      s.life--;

      const alpha = (s.life / s.maxLife) * 200;
      p.fill(s.r, s.g, s.b, alpha);
      p.ellipse(s.x, s.y, 2, 2);

      if (s.life <= 0) sparks.splice(i, 1);
    }
  },

  resize(p: p5, width: number, height: number) {
    fireworks.setup(p, currentSeed, width, height);
    p.loop();
  },
};
