import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

interface Star {
  x: number; y: number;
  radius: number;
  brightness: number;
}

export const constellation: Algorithm = {
  name: 'Constellation',
  description: 'Star field proximity graph — nearby stars linked by pale blue threads',
  palette: { background: '#020408', colors: ['#ffffff', '#aaccff', '#334466'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(2, 4, 8);

    const starCount = Math.floor(p.random(180, 280));
    const connectDist = Math.min(w, h) * p.random(0.12, 0.18);
    const nebulaeCount = 4 + Math.floor(p.random(4));

    // Faint nebula blobs
    p.noStroke();
    for (let n = 0; n < nebulaeCount; n++) {
      const nx = p.random(w);
      const ny = p.random(h);
      const nr = p.random(60, 180);
      for (let ring = 0; ring < 8; ring++) {
        const t = ring / 8;
        const rAlpha = (1 - t) * 12;
        const hue = p.random(200, 240);
        p.fill(
          hue === 200 ? 30 : 20,
          hue === 200 ? 50 : 40,
          80 + Math.floor(p.random(40)),
          rAlpha
        );
        p.ellipse(nx, ny, nr * (1 - t * 0.5) * 2, nr * (1 - t * 0.7) * 2);
      }
    }

    // Generate stars
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: p.random(w),
        y: p.random(h),
        radius: p.random(0.5, 2.8),
        brightness: p.random(140, 255),
      });
    }

    // Draw connection lines first (behind stars)
    p.strokeWeight(0.5);
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectDist) {
          const alpha = (1 - dist / connectDist) * 55;
          p.stroke(170, 200, 255, alpha);
          p.line(stars[i].x, stars[i].y, stars[j].x, stars[j].y);
        }
      }
    }

    // Draw stars
    p.noStroke();
    for (const star of stars) {
      const br = star.brightness;

      // Glow halo for bright stars
      if (star.radius > 1.8) {
        p.fill(200, 220, 255, 15);
        p.ellipse(star.x, star.y, star.radius * 6, star.radius * 6);
        p.fill(210, 230, 255, 30);
        p.ellipse(star.x, star.y, star.radius * 3.5, star.radius * 3.5);
      }

      // Core
      p.fill(br, br, Math.min(255, br + 20));
      p.ellipse(star.x, star.y, star.radius * 2, star.radius * 2);
    }

    p.noLoop();
  },

  draw(_p: p5) {},

  resize(p: p5, width: number, height: number) {
    constellation.setup(p, currentSeed, width, height);
  },
};
