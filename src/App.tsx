import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from './components/Canvas';
import { Overlay } from './components/Overlay';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { algorithms } from './algorithms';
import { plasmaAudio } from './algorithms/plasma';

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function parseHash(): { index: number; seed: number } {
  const hash = window.location.hash.slice(1); // remove #
  if (!hash) return { index: 0, seed: 42 };
  const [nameSlug, seedStr] = hash.split('/');
  const index = algorithms.findIndex((a) => slugify(a.name) === nameSlug);
  const seed = seedStr ? parseInt(seedStr, 10) : 42;
  return { index: index >= 0 ? index : 0, seed: isNaN(seed) ? 42 : seed };
}

function updateHash(index: number, seed: number) {
  const slug = slugify(algorithms[index].name);
  const hash = seed === 42 ? `#${slug}` : `#${slug}/${seed}`;
  if (window.location.hash !== hash) {
    history.replaceState(null, '', hash);
  }
}

export function App() {
  const initial = useRef(parseHash());
  const [currentIndex, setCurrentIndex] = useState(initial.current.index);
  const [seed, setSeed] = useState(initial.current.seed);
  const [uiVisible, setUiVisible] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [evolving, setEvolving] = useState(false);
  const [layerIndex, setLayerIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const autoplayTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const evolveTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioRafRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const algorithm = algorithms[currentIndex];
  const layerAlgorithm = layerIndex !== null ? algorithms[layerIndex] : null;

  const showUI = useCallback(() => {
    setUiVisible(true);
    clearTimeout(fadeTimer.current);
    fadeTimer.current = setTimeout(() => setUiVisible(false), 3000);
  }, []);

  const switchAlgorithm = useCallback(
    (index: number) => {
      if (index === currentIndex || transitioning) return;
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reducedMotion) {
        setCurrentIndex(index);
        setSeed(42);
        showUI();
        return;
      }
      setTransitioning(true);
      setTimeout(() => {
        setCurrentIndex(index);
        setSeed(42);
        setTransitioning(false);
        showUI();
      }, 400);
    },
    [currentIndex, transitioning, showUI],
  );

  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    showUI();
  }, [showUI]);

  const handleSave = useCallback(() => {
    const canvas = document.querySelector('.canvas-container canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${slugify(algorithm.name)}-seed-${seed}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showUI();
  }, [algorithm.name, seed, showUI]);

  // Autoplay: cycle to next algorithm every 8s, reset timer on manual index change
  useEffect(() => {
    if (autoplay) {
      autoplayTimer.current = setInterval(() => {
        setTransitioning(true);
        setTimeout(() => {
          setCurrentIndex((prev) => (prev + 1) % algorithms.length);
          setSeed(42);
          setTransitioning(false);
        }, 400);
      }, 8000);
    } else {
      clearInterval(autoplayTimer.current);
    }
    return () => clearInterval(autoplayTimer.current);
  }, [autoplay, currentIndex]);

  // Microphone audio reactivity
  const toggleMic = useCallback(async () => {
    if (micActive) {
      // Stop
      cancelAnimationFrame(audioRafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      analyserRef.current = null;
      streamRef.current = null;
      plasmaAudio.active = false;
      plasmaAudio.bass = 0;
      plasmaAudio.mid = 0;
      plasmaAudio.treble = 0;
      plasmaAudio.volume = 0;
      setMicActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        streamRef.current = stream;
        plasmaAudio.active = true;
        setMicActive(true);

        const freqData = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
          analyser.getByteFrequencyData(freqData);
          const len = freqData.length;
          let bassSum = 0, midSum = 0, trebleSum = 0;
          const third = Math.floor(len / 3);
          for (let i = 0; i < third; i++) bassSum += freqData[i];
          for (let i = third; i < third * 2; i++) midSum += freqData[i];
          for (let i = third * 2; i < len; i++) trebleSum += freqData[i];
          plasmaAudio.bass = bassSum / (third * 255);
          plasmaAudio.mid = midSum / (third * 255);
          plasmaAudio.treble = trebleSum / ((len - third * 2) * 255);
          plasmaAudio.volume = (plasmaAudio.bass + plasmaAudio.mid + plasmaAudio.treble) / 3;
          audioRafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // Permission denied or no mic
      }
    }
    showUI();
  }, [micActive, showUI]);

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(audioRafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioCtxRef.current?.close();
    };
  }, []);

  // Evolution mode: change seed every 15s with fade, stay on same algorithm
  useEffect(() => {
    if (evolving) {
      evolveTimer.current = setInterval(() => {
        setTransitioning(true);
        setTimeout(() => {
          setSeed(Math.floor(Math.random() * 999999) + 1);
          setTransitioning(false);
        }, 400);
      }, 15000);
    } else {
      clearInterval(evolveTimer.current);
    }
    return () => clearInterval(evolveTimer.current);
  }, [evolving]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      // Don't capture keys when typing in search
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;
      showUI();
      switch (e.key) {
        case 'ArrowLeft':
          switchAlgorithm((currentIndex - 1 + algorithms.length) % algorithms.length);
          break;
        case 'ArrowRight':
          switchAlgorithm((currentIndex + 1) % algorithms.length);
          break;
        case 'ArrowUp':
          setSeed((s) => s + 1);
          break;
        case 'ArrowDown':
          setSeed((s) => Math.max(1, s - 1));
          break;
        case 'r':
        case 'R':
          setSeed(Math.floor(Math.random() * 999999) + 1);
          break;
        case ' ':
          e.preventDefault();
          setAutoplay((a) => !a);
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
          break;
        case 's':
        case 'S':
          handleSave();
          break;
        case 'e':
        case 'E':
          setEvolving((ev) => !ev);
          break;
        case 'l':
        case 'L':
          setLayerIndex((prev) => prev !== null ? null : (currentIndex + 1) % algorithms.length);
          break;
        case 'm':
        case 'M':
          toggleMic();
          break;
        case '?':
          setShowHelp((h) => !h);
          break;
        case 'Escape':
          setShowHelp(false);
          setLayerIndex(null);
          break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, switchAlgorithm, showUI, handleSave, toggleMic]);

  useEffect(() => {
    const handleMove = () => showUI();
    window.addEventListener('mousemove', handleMove);
    return () => window.removeEventListener('mousemove', handleMove);
  }, [showUI]);

  // Sync state → URL hash
  useEffect(() => {
    updateHash(currentIndex, seed);
  }, [currentIndex, seed]);

  // Listen for browser back/forward hash changes
  useEffect(() => {
    const onHashChange = () => {
      const parsed = parseHash();
      setCurrentIndex(parsed.index);
      setSeed(parsed.seed);
      showUI();
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [showUI]);

  // Touch swipe navigation
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      const dy = e.changedTouches[0].clientY - startY;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) {
          switchAlgorithm((currentIndex + 1) % algorithms.length);
        } else {
          switchAlgorithm((currentIndex - 1 + algorithms.length) % algorithms.length);
        }
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentIndex, switchAlgorithm]);

  useEffect(() => {
    fadeTimer.current = setTimeout(() => setUiVisible(false), 3000);
    return () => clearTimeout(fadeTimer.current);
  }, []);

  return (
    <>
      <Canvas algorithm={algorithm} seed={seed} transitioning={transitioning} />
      {layerAlgorithm && (
        <Canvas algorithm={layerAlgorithm} seed={seed} transitioning={transitioning} isLayer />
      )}
      <Overlay
        algorithm={algorithm}
        seed={seed}
        visible={uiVisible}
        currentIndex={currentIndex}
        totalCount={algorithms.length}
        autoplay={autoplay}
        evolving={evolving}
        layerAlgorithm={layerAlgorithm}
        copied={copied}
        onPrevSeed={() => { setSeed((s) => Math.max(1, s - 1)); showUI(); }}
        onNextSeed={() => { setSeed((s) => s + 1); showUI(); }}
        onRandomSeed={() => { setSeed(Math.floor(Math.random() * 999999) + 1); showUI(); }}
        onToggleAutoplay={() => { setAutoplay((a) => !a); showUI(); }}
        onToggleEvolve={() => { setEvolving((ev) => !ev); showUI(); }}
        onShare={handleShare}
        onSave={handleSave}
        onToggleHelp={() => setShowHelp((h) => !h)}
      />
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={currentIndex}
        visible={uiVisible}
        onSelect={(i) => switchAlgorithm(i)}
      />
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Keyboard Shortcuts</h2>
            <div className="help-grid">
              <kbd>&larr;</kbd><span>Previous algorithm</span>
              <kbd>&rarr;</kbd><span>Next algorithm</span>
              <kbd>&uarr;</kbd><span>Next seed</span>
              <kbd>&darr;</kbd><span>Previous seed</span>
              <kbd>R</kbd><span>Random seed</span>
              <kbd>Space</kbd><span>Toggle autoplay</span>
              <kbd>F</kbd><span>Toggle fullscreen</span>
              <kbd>S</kbd><span>Save artwork as PNG</span>
              <kbd>E</kbd><span>Toggle evolution mode</span>
              <kbd>L</kbd><span>Toggle layer blend</span>
              <kbd>M</kbd><span>Toggle mic (Plasma audio)</span>
              <kbd>?</kbd><span>Toggle this help</span>
            </div>
            <p className="help-hint">Swipe left/right on mobile to browse</p>
            <button className="help-close" onClick={() => setShowHelp(false)}>Got it</button>
          </div>
        </div>
      )}
    </>
  );
}
