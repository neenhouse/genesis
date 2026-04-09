import { useEffect, useRef, useState } from 'react';
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
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (search) return; // don't auto-scroll while filtering
    const strip = stripRef.current;
    const btn = buttonRefs.current[currentIndex];
    if (!strip || !btn) return;
    const btnRect = btn.getBoundingClientRect();
    const scrollTarget = btn.offsetLeft - strip.offsetWidth / 2 + btnRect.width / 2;
    strip.scrollTo({ left: scrollTarget, behavior: 'smooth' });
  }, [currentIndex, search]);

  const filtered = search
    ? algorithms.map((algo, i) => ({ algo, i })).filter(({ algo }) =>
        algo.name.toLowerCase().includes(search.toLowerCase()),
      )
    : algorithms.map((algo, i) => ({ algo, i }));

  return (
    <div className={`thumbnail-strip-wrapper ${visible ? 'visible' : ''}`}>
      <div className="thumbnail-search">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search…"
          className="thumbnail-search-input"
          aria-label="Search algorithms"
        />
        {search && (
          <button
            className="thumbnail-search-clear"
            onClick={() => setSearch('')}
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>
      <div ref={stripRef} className="thumbnail-strip">
        {filtered.map(({ algo, i }) => (
          <button
            key={algo.name}
            ref={(el) => { buttonRefs.current[i] = el; }}
            className={`thumbnail ${i === currentIndex ? 'active' : ''}`}
            onClick={() => { onSelect(i); setSearch(''); }}
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
        {filtered.length === 0 && (
          <span className="thumbnail-no-results">No matches</span>
        )}
      </div>
    </div>
  );
}
