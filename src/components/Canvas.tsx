import { useEffect, useRef } from 'react';
import p5 from 'p5';
import type { Algorithm } from '../algorithms/types';

interface CanvasProps {
  algorithm: Algorithm;
  seed: number;
  transitioning: boolean;
}

export function Canvas({ algorithm, seed, transitioning }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5Ref = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (p5Ref.current) {
      p5Ref.current.remove();
      p5Ref.current = null;
    }

    const sketch = (p: p5) => {
      p.setup = () => {
        const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
        canvas.style('display', 'block');
        algorithm.setup(p, seed, window.innerWidth, window.innerHeight);
      };

      p.draw = () => {
        algorithm.draw(p);
      };

      p.mousePressed = () => {
        algorithm.mousePressed?.(p, p.mouseX, p.mouseY);
      };

      p.mouseDragged = () => {
        algorithm.mouseDragged?.(p, p.mouseX, p.mouseY);
      };

      p.mouseMoved = () => {
        algorithm.mouseMoved?.(p, p.mouseX, p.mouseY);
      };

      p.windowResized = () => {
        p.resizeCanvas(window.innerWidth, window.innerHeight);
        if (algorithm.resize) {
          algorithm.resize(p, window.innerWidth, window.innerHeight);
        } else {
          algorithm.setup(p, seed, window.innerWidth, window.innerHeight);
        }
      };
    };

    p5Ref.current = new p5(sketch, containerRef.current);

    return () => {
      if (p5Ref.current) {
        p5Ref.current.remove();
        p5Ref.current = null;
      }
    };
  }, [algorithm, seed]);

  return (
    <div
      ref={containerRef}
      className={`canvas-container ${transitioning ? 'fading' : ''}`}
    />
  );
}
