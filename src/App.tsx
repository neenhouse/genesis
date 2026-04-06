import { useState, useEffect, useCallback, useRef } from 'react';
import { Canvas } from './components/Canvas';
import { Overlay } from './components/Overlay';
import { ThumbnailStrip } from './components/ThumbnailStrip';
import { algorithms } from './algorithms';

export function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [seed, setSeed] = useState(42);
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
