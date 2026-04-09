import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from './components/Canvas';
import { Overlay } from './components/Overlay';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { algorithms } from './algorithms';

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
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const algorithm = algorithms[currentIndex];

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, switchAlgorithm, showUI]);

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
      <Overlay
        algorithm={algorithm}
        seed={seed}
        visible={uiVisible}
        onPrevSeed={() => { setSeed((s) => Math.max(1, s - 1)); showUI(); }}
        onNextSeed={() => { setSeed((s) => s + 1); showUI(); }}
        onRandomSeed={() => { setSeed(Math.floor(Math.random() * 999999) + 1); showUI(); }}
      />
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={currentIndex}
        visible={uiVisible}
        onSelect={(i) => switchAlgorithm(i)}
      />
    </>
  );
}
