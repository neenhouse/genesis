import type p5 from 'p5';

export interface AlgorithmPalette {
  background: string;
  colors: string[];
}

export interface Algorithm {
  name: string;
  description: string;
  interactive?: boolean;
  palette: AlgorithmPalette;
  setup(p: p5, seed: number, width: number, height: number): void;
  draw(p: p5): void;
  resize?(p: p5, width: number, height: number): void;
  mousePressed?(p: p5, mx: number, my: number): void;
  mouseDragged?(p: p5, mx: number, my: number): void;
  mouseMoved?(p: p5, mx: number, my: number): void;
}
