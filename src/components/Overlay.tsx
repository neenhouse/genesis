import type { Algorithm } from '../algorithms/types';

interface OverlayProps {
  algorithm: Algorithm;
  seed: number;
  visible: boolean;
  onPrevSeed: () => void;
  onNextSeed: () => void;
  onRandomSeed: () => void;
}

export function Overlay({
  algorithm,
  seed,
  visible,
  onPrevSeed,
  onNextSeed,
  onRandomSeed,
}: OverlayProps) {
  return (
    <div className={`overlay ${visible ? 'visible' : ''}`}>
      <div className="overlay-title">
        <h1>{algorithm.name}</h1>
        <p>{algorithm.description}</p>
      </div>

      <div className="overlay-seed">
        <button onClick={onPrevSeed} aria-label="Previous seed">
          &larr;
        </button>
        <span className="seed-number">#{seed}</span>
        <button onClick={onNextSeed} aria-label="Next seed">
          &rarr;
        </button>
        <button onClick={onRandomSeed} className="seed-random" aria-label="Random seed">
          &crarr;
        </button>
      </div>
    </div>
  );
}
