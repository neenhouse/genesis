import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Ball {
  x: number; y: number;
  vx: number; vy: number;
  r: number; g: number; b: number;
  radius: number;
  trail: { x: number; y: number }[];
}

const BALL_COLORS: [number, number, number][] = [
  [255, 80, 120],   // hot pink
  [80, 220, 255],   // cyan
  [255, 200, 50],   // yellow
  [120, 255, 120],  // green
  [200, 100, 255],  // violet
  [255, 140, 50],   // orange
  [50, 200, 180],   // teal
];

const GRAVITY = 0.25;
const ELASTICITY = 0.82;
const TRAIL_LEN = 40;
const BALL_COUNT = 7;

let balls: Ball[] = [];

export const bounce: Algorithm = {
  name: 'Bounce',
  description: 'Bouncing ball traces — colored balls leave luminous trails as they ricochet with gravity',
  palette: { background: '#080808', colors: ['#ff5078', '#50dcff', '#ffc832'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    balls = [];
    for (let i = 0; i < BALL_COUNT; i++) {
      const [r, g, b] = BALL_COLORS[i % BALL_COLORS.length];
      balls.push({
        x: p.random(w * 0.2, w * 0.8),
        y: p.random(h * 0.1, h * 0.5),
        vx: p.random(-4, 4),
        vy: p.random(-3, 0),
        r, g, b,
        radius: p.random(8, 16),
        trail: [],
      });
    }
    p.background(8, 8, 8);
  },

  draw(p: p5) {
    p.background(8, 8, 8, 20);

    for (const ball of balls) {
      // Physics
      ball.vy += GRAVITY;
      ball.x += ball.vx;
      ball.y += ball.vy;

      // Wall bounces
      if (ball.x - ball.radius < 0) { ball.x = ball.radius; ball.vx *= -ELASTICITY; }
      if (ball.x + ball.radius > w) { ball.x = w - ball.radius; ball.vx *= -ELASTICITY; }
      if (ball.y - ball.radius < 0) { ball.y = ball.radius; ball.vy *= -ELASTICITY; }
      if (ball.y + ball.radius > h) { ball.y = h - ball.radius; ball.vy *= -ELASTICITY; ball.vx *= 0.99; }

      // Trail
      ball.trail.push({ x: ball.x, y: ball.y });
      if (ball.trail.length > TRAIL_LEN) ball.trail.shift();

      // Draw trail
      p.noFill();
      for (let i = 1; i < ball.trail.length; i++) {
        const t = i / ball.trail.length;
        const alpha = t * 180;
        const weight = t * ball.radius * 0.6;
        p.stroke(ball.r, ball.g, ball.b, alpha);
        p.strokeWeight(weight);
        p.line(ball.trail[i - 1].x, ball.trail[i - 1].y, ball.trail[i].x, ball.trail[i].y);
      }

      // Draw ball with glow
      p.noStroke();
      p.fill(ball.r, ball.g, ball.b, 40);
      p.ellipse(ball.x, ball.y, ball.radius * 3, ball.radius * 3);
      p.fill(ball.r, ball.g, ball.b, 180);
      p.ellipse(ball.x, ball.y, ball.radius * 2, ball.radius * 2);
      p.fill(255, 255, 255, 200);
      p.ellipse(ball.x - ball.radius * 0.3, ball.y - ball.radius * 0.3, ball.radius * 0.5, ball.radius * 0.5);
    }
  },

  resize(p: p5, width: number, height: number) {
    bounce.setup(p, currentSeed, width, height);
    p.loop();
  },
};
