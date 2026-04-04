import type p5 from 'p5';
import type { Algorithm } from './types';

let w = 0, h = 0, currentSeed = 0;

const FONT_SIZE = 14;
const CHARS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFZ@#%&';

interface Column {
  x: number;
  y: number;
  speed: number;
  length: number;
  chars: string[];
  mutateTimer: number;
}

let columns: Column[] = [];

function randomChar(p: p5): string {
  return CHARS[Math.floor(p.random(CHARS.length))];
}

function initColumns(p: p5) {
  columns = [];
  const cols = Math.floor(w / FONT_SIZE);
  for (let i = 0; i < cols; i++) {
    const len = 6 + Math.floor(p.random(20));
    const chars: string[] = [];
    for (let j = 0; j < len + 4; j++) chars.push(randomChar(p));
    columns.push({
      x: i * FONT_SIZE,
      y: p.random(-h, 0),
      speed: p.random(1.5, 5),
      length: len,
      chars,
      mutateTimer: Math.floor(p.random(4)),
    });
  }
}

export const matrix: Algorithm = {
  name: 'Matrix',
  description: 'Falling code rain — columns of mutating katakana cascading in green',
  palette: { background: '#000000', colors: ['#00ff41', '#003b00', '#39ff14'] },

  setup(p: p5, seed: number, width: number, height: number) {
    w = width; h = height; currentSeed = seed;
    p.randomSeed(seed); p.noiseSeed(seed);
    p.background(0);
    p.textSize(FONT_SIZE);
    p.textFont('monospace');
    initColumns(p);
  },

  draw(p: p5) {
    // Dim background
    p.fill(0, 0, 0, 40);
    p.noStroke();
    p.rect(0, 0, w, h);

    p.textSize(FONT_SIZE);
    p.noStroke();

    for (const col of columns) {
      col.mutateTimer--;
      if (col.mutateTimer <= 0) {
        const idx = Math.floor(p.random(col.chars.length));
        col.chars[idx] = randomChar(p);
        col.mutateTimer = 2 + Math.floor(p.random(6));
      }

      // Draw each character in the column trail
      for (let j = 0; j < col.length; j++) {
        const cy = col.y - j * FONT_SIZE;
        if (cy < -FONT_SIZE || cy > h + FONT_SIZE) continue;
        const charIdx = (col.chars.length - 1 - j) % col.chars.length;

        if (j === 0) {
          // Head: bright white-green
          p.fill(200, 255, 200, 255);
        } else {
          const fade = p.map(j, 0, col.length, 255, 30);
          const green = p.map(j, 0, col.length, 200, 60);
          p.fill(0, green, 0, fade);
        }
        p.text(col.chars[charIdx], col.x, cy);
      }

      col.y += col.speed;
      if (col.y - col.length * FONT_SIZE > h) {
        col.y = p.random(-h * 0.5, 0);
        col.speed = p.random(1.5, 5);
      }
    }
  },

  resize(p: p5, width: number, height: number) {
    matrix.setup(p, currentSeed, width, height);
    p.loop();
  },
};
