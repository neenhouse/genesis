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
          &#8592;
        </button>
        <span className="seed-number">#{seed}</span>
        <button onClick={onNextSeed} aria-label="Next seed">
          &#8594;
        </button>
        <button onClick={onRandomSeed} className="seed-random" aria-label="Random seed" title="Random seed (R)">
          &#8635;
        </button>
      </div>

      <div className="keyboard-hint">
        <div className="keyboard-hint-row">
          <span className="kbd">&#8592;</span>
          <span className="kbd">&#8594;</span>
          <span>switch algorithm</span>
        </div>
        <div className="keyboard-hint-row">
          <span className="kbd">&#8593;</span>
          <span className="kbd">&#8595;</span>
          <span>change seed</span>
        </div>
        <div className="keyboard-hint-row">
          <span className="kbd">R</span>
          <span>random seed</span>
        </div>
      </div>
    </div>
  );
}
