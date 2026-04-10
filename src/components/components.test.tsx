import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Algorithm } from '../algorithms/types';

// jsdom does not implement scrollTo — stub it globally for these tests
beforeAll(() => {
  HTMLElement.prototype.scrollTo = vi.fn() as unknown as typeof HTMLElement.prototype.scrollTo;
});

// Mock p5 — it accesses browser canvas APIs not available in jsdom
vi.mock('p5', () => {
  class MockP5 {
    remove = vi.fn();
    setup = vi.fn();
    draw = vi.fn();
    resizeCanvas = vi.fn();
    windowResized = vi.fn();
    width = 800;
    height = 600;
    createCanvas = vi.fn(() => ({ style: vi.fn() }));
  }
  return { default: MockP5 };
});

import { Overlay } from './Overlay';
import { ThumbnailStrip } from './ThumbnailStrip';
import { Canvas } from './Canvas';

const mockAlgo: Algorithm = {
  name: 'Test Algo',
  description: 'A test algorithm',
  palette: { background: '#111111', colors: ['#ff0000', '#00ff00', '#0000ff'] },
  setup: vi.fn(),
  draw: vi.fn(),
};

const mockAlgo2: Algorithm = {
  name: 'Second Algo',
  description: 'Another test algorithm',
  palette: { background: '#222222', colors: ['#ffffff'] },
  setup: vi.fn(),
  draw: vi.fn(),
};

// ---- Overlay ----

describe('Overlay', () => {
  it('renders algorithm name and description', () => {
    render(
      <Overlay
        algorithm={mockAlgo}
        seed={42}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={vi.fn()}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    expect(screen.getByText('Test Algo')).toBeInTheDocument();
    expect(screen.getByText('A test algorithm')).toBeInTheDocument();
  });

  it('renders the seed number', () => {
    render(
      <Overlay
        algorithm={mockAlgo}
        seed={123}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={vi.fn()}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    expect(screen.getByText('#123')).toBeInTheDocument();
  });

  it('applies visible class when visible=true', () => {
    const { container } = render(
      <Overlay
        algorithm={mockAlgo}
        seed={1}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={vi.fn()}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    expect(container.querySelector('.overlay.visible')).toBeTruthy();
  });

  it('does not apply visible class when visible=false', () => {
    const { container } = render(
      <Overlay
        algorithm={mockAlgo}
        seed={1}
        visible={false}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={vi.fn()}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    expect(container.querySelector('.overlay.visible')).toBeNull();
  });

  it('calls onPrevSeed when prev button clicked', () => {
    const onPrev = vi.fn();
    render(
      <Overlay
        algorithm={mockAlgo}
        seed={5}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={onPrev}
        onNextSeed={vi.fn()}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /previous seed/i }));
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('calls onNextSeed when next button clicked', () => {
    const onNext = vi.fn();
    render(
      <Overlay
        algorithm={mockAlgo}
        seed={5}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={onNext}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /next seed/i }));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('calls onRandomSeed when random button clicked', () => {
    const onRandom = vi.fn();
    render(
      <Overlay
        algorithm={mockAlgo}
        seed={5}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={vi.fn()}
        onRandomSeed={onRandom}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /random seed/i }));
    expect(onRandom).toHaveBeenCalledOnce();
  });

  it('renders keyboard hint section', () => {
    render(
      <Overlay
        algorithm={mockAlgo}
        seed={1}
        visible={true}
        currentIndex={0}
        totalCount={99}
        autoplay={false}
        evolving={false}
        layerAlgorithm={null}
        copied={false}
        onPrevSeed={vi.fn()}
        onNextSeed={vi.fn()}
        onRandomSeed={vi.fn()}
        onToggleAutoplay={vi.fn()}
        onToggleEvolve={vi.fn()}
        onShare={vi.fn()}
        onSave={vi.fn()}
        onToggleHelp={vi.fn()}
      />,
    );
    expect(screen.getByText('switch algorithm')).toBeInTheDocument();
    expect(screen.getByText('change seed')).toBeInTheDocument();
    expect(screen.getByText('random')).toBeInTheDocument();
  });
});

// ---- ThumbnailStrip ----

describe('ThumbnailStrip', () => {
  const algorithms = [mockAlgo, mockAlgo2];

  it('renders a button for each algorithm', () => {
    render(
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={0}
        visible={true}
        onSelect={vi.fn()}
      />,
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
  });

  it('renders algorithm names as labels', () => {
    render(
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={0}
        visible={true}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Test Algo')).toBeInTheDocument();
    expect(screen.getByText('Second Algo')).toBeInTheDocument();
  });

  it('marks the current algorithm button as active', () => {
    const { container } = render(
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={1}
        visible={true}
        onSelect={vi.fn()}
      />,
    );
    const activeButtons = container.querySelectorAll('.thumbnail.active');
    expect(activeButtons).toHaveLength(1);
    expect(activeButtons[0]).toHaveTextContent('Second Algo');
  });

  it('calls onSelect with the correct index on click', () => {
    const onSelect = vi.fn();
    render(
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={0}
        visible={true}
        onSelect={onSelect}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /switch to second algo/i }));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('applies visible class when visible=true', () => {
    const { container } = render(
      <ThumbnailStrip
        algorithms={algorithms}
        currentIndex={0}
        visible={true}
        onSelect={vi.fn()}
      />,
    );
    expect(container.querySelector('.thumbnail-strip-wrapper.visible')).toBeTruthy();
  });

  it('renders color swatches for each algorithm palette', () => {
    const { container } = render(
      <ThumbnailStrip
        algorithms={[mockAlgo]}
        currentIndex={0}
        visible={true}
        onSelect={vi.fn()}
      />,
    );
    const swatches = container.querySelectorAll('.thumbnail-swatch span');
    expect(swatches.length).toBeGreaterThan(0);
  });
});

// ---- Canvas (smoke) ----

describe('Canvas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // jsdom doesn't implement scrollTo — stub it
    HTMLElement.prototype.scrollTo = vi.fn() as unknown as typeof HTMLElement.prototype.scrollTo;
    Object.defineProperty(HTMLElement.prototype, 'offsetLeft', { value: 0, configurable: true });
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', { value: 800, configurable: true });
  });

  it('renders a container div', () => {
    const { container } = render(
      <Canvas algorithm={mockAlgo} seed={1} transitioning={false} />,
    );
    expect(container.querySelector('.canvas-container')).toBeTruthy();
  });

  it('applies fading class when transitioning', () => {
    const { container } = render(
      <Canvas algorithm={mockAlgo} seed={1} transitioning={true} />,
    );
    expect(container.querySelector('.canvas-container.fading')).toBeTruthy();
  });

  it('does not apply fading class when not transitioning', () => {
    const { container } = render(
      <Canvas algorithm={mockAlgo} seed={1} transitioning={false} />,
    );
    expect(container.querySelector('.canvas-container.fading')).toBeNull();
  });
});
