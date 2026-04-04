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
  return (
    <div className={`thumbnail-strip ${visible ? 'visible' : ''}`}>
      {algorithms.map((algo, i) => (
        <button
          key={algo.name}
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
