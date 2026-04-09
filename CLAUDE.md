# Genesis — Algorithmic Art Gallery

Fullscreen generative art gallery with 99 p5.js algorithms and seed-based exploration.

## Tech Stack

- React 19, TypeScript, Vite 7
- p5.js (instance mode) for generative rendering
- Cloudflare Pages deployment

## Commands

- `pnpm dev` — Dev server on port 3000
- `pnpm build` — Type-check + production build
- `pnpm deploy` — Build + deploy to Cloudflare Pages

## Structure

- `src/algorithms/` — Each algorithm exports an `Algorithm` object (see `types.ts`)
- `src/components/` — Canvas wrapper, Overlay, ThumbnailStrip
- `src/App.tsx` — Gallery state management and keyboard navigation

