import type { Algorithm } from '../algorithms/types';

interface OverlayProps {
  algorithm: Algorithm;
  seed: number;
  visible: boolean;
  currentIndex: number;
  totalCount: number;
  autoplay: boolean;
  evolving: boolean;
  layerAlgorithm: Algorithm | null;
  copied: boolean;
  onPrevSeed: () => void;
  onNextSeed: () => void;
  onRandomSeed: () => void;
  onToggleAutoplay: () => void;
  onToggleEvolve: () => void;
  onShare: () => void;
  onSave: () => void;
  onToggleHelp: () => void;
}

export function Overlay({
  algorithm,
  seed,
  visible,
  currentIndex,
  totalCount,
  autoplay,
  evolving,
  layerAlgorithm,
  copied,
  onPrevSeed,
  onNextSeed,
  onRandomSeed,
  onToggleAutoplay,
  onToggleEvolve,
  onShare,
  onSave,
  onToggleHelp,
}: OverlayProps) {
  return (
    <div className={`overlay ${visible ? 'visible' : ''}`}>
      <div className="overlay-title">
        <div className="overlay-title-header">
          <h1>{algorithm.name}</h1>
          {algorithm.interactive && <span className="interactive-badge">interactive</span>}
          <span className="algorithm-counter">{currentIndex + 1} / {totalCount}</span>
        </div>
        <p>{algorithm.description}</p>
        {layerAlgorithm && (
          <p className="layer-indicator">+ {layerAlgorithm.name} layer (L to toggle, Esc to clear)</p>
        )}
      </div>

      <div className="overlay-controls">
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
        <div className="overlay-actions">
          <button
            onClick={onToggleAutoplay}
            className={`action-btn ${autoplay ? 'active' : ''}`}
            aria-label={autoplay ? 'Stop autoplay' : 'Start autoplay'}
            title="Autoplay (Space)"
          >
            {autoplay ? '\u23F8' : '\u25B6'}
          </button>
          <button
            onClick={onToggleEvolve}
            className={`action-btn ${evolving ? 'active' : ''}`}
            aria-label={evolving ? 'Stop evolution' : 'Start evolution'}
            title="Evolution mode (E)"
          >
            &#8734;
          </button>
          <button
            onClick={onShare}
            className="action-btn"
            aria-label="Copy link"
            title="Copy link"
          >
            {copied ? '\u2713' : '\u2197'}
          </button>
          <button
            onClick={onSave}
            className="action-btn"
            aria-label="Save artwork"
            title="Save as PNG (S)"
          >
            &#8681;
          </button>
          <button
            onClick={onToggleHelp}
            className="action-btn"
            aria-label="Show keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            ?
          </button>
        </div>
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
          <span>random</span>
          <span className="kbd">Space</span>
          <span>autoplay</span>
          <span className="kbd">F</span>
          <span>fullscreen</span>
        </div>
      </div>
    </div>
  );
}
