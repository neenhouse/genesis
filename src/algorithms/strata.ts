import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const EARTH_TONES: Array<[number, number, number]> = [
  [195, 164, 128], // sandstone
  [168, 120, 86],  // clay
  [140, 105, 75],  // terracotta
  [110, 105, 100], // slate
  [205, 190, 160], // limestone
  [155, 130, 95],  // loam
  [125, 100, 70],  // sienna
  [90, 80, 75],    // shale
  [215, 200, 170], // chalk
  [100, 90, 80],   // basalt
];

export const strata: Algorithm = {
  name: 'Strata',
  description: 'Geological strata — noise-deformed horizontal bands of earth tones',
  palette: { background: '#1a1510', colors: ['#c3a480', '#a87856', '#8c694b', '#6e6964'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);

    p.background(26, 21, 16);

    const layerCount = 10 + Math.floor(p.random(8));
    const layerHeights: number[] = [];
    let total = 0;

    for (let i = 0; i < layerCount; i++) {
      const thick = p.random(0.04, 0.18);
      layerHeights.push(thick);
      total += thick;
    }

    // Normalize so layers fill canvas
    const scale = 1.1 / total;
    let y = -h * 0.05;

    const colorOrder = [...EARTH_TONES].sort(() => p.random() - 0.5);

    for (let i = 0; i < layerCount; i++) {
      const layerH = layerHeights[i] * scale * h;
      const [r, g, b] = colorOrder[i % colorOrder.length];
      const noiseScale = p.random(0.004, 0.012);
      const warpAmp = p.random(8, 35);
      const noiseSeed2 = p.random(1000);

      // Top boundary deformed by noise
      p.noStroke();
      p.fill(r, g, b, 230);
      p.beginShape();
      p.vertex(0, h + 10);
      p.vertex(w, h + 10);

      // Walk right→left across bottom of this layer
      for (let x = w; x >= 0; x -= 3) {
        const ny = p.noise(x * noiseScale + noiseSeed2, i * 4.7) * warpAmp;
        p.vertex(x, y + layerH + ny);
      }
      // Walk left→right across top of this layer
      for (let x = 0; x <= w; x += 3) {
        const ny = p.noise(x * noiseScale + noiseSeed2 + 100, i * 4.7 + 1) * warpAmp;
        p.vertex(x, y + ny);
      }
      p.endShape(p.CLOSE);

      // Texture: faint scratches
      p.stroke(r * 0.7, g * 0.7, b * 0.7, 35);
      p.strokeWeight(0.5);
      const scratchCount = Math.floor(w / 6);
      for (let s = 0; s < scratchCount; s++) {
        const sx = p.random(w);
        const sy = y + p.random(layerH * 0.2, layerH * 0.8);
        p.line(sx, sy, sx + p.random(-20, 20), sy + p.random(-2, 2));
      }

      y += layerH;
    }

    p.noLoop();
  },

  draw(_p: p5) {
    // Static
  },

  resize(p: p5, width: number, height: number) {
    strata.setup(p, currentSeed, width, height);
    p.loop();
  },
};
