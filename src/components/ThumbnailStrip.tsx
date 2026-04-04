import { useEffect, useRef } from 'react';
import type { Algorithm } from '../algorithms/types';

interface ThumbnailStripProps {
  algorithms: Algorithm[];
  currentIndex: number;
  visible: boolean;
  onSelect: (index: number) => void;
}

export function ThumbnailStrip({
  algorithms,
  currentIndex,
  visible,
  onSelect,
}: ThumbnailStripProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const strip = stripRef.current;
    const btn = buttonRefs.current[currentIndex];
    if (!strip || !btn) return;
    const stripRect = strip.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const scrollTarget = btn.offsetLeft - strip.offsetWidth / 2 + btnRect.width / 2;
    strip.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [currentIndex]);

  return (
    <div ref={stripRef} className={`thumbnail-strip ${visible ? 'visible' : ''}`}>
      {algorithms.map((algo, i) => (
        <button
          key={algo.name}
          ref={(el) => { buttonRefs.current[i] = el; }}
          className={`thumbnail ${i === currentIndex ? 'active' : ''}`}
          onClick={() => onSelect(i)}
          aria-label={`Switch to ${algo.name}`}
          style={{
            background: algo.palette.background,
            borderColor: i === currentIndex ? algo.palette.colors[0] : 'transparent',
          }}
        >
          <span className="thumbnail-label">{algo.name}</span>
          <div className="thumbnail-swatch">
            {algo.palette.colors.slice(0, 3).map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
