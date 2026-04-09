import type { Algorithm } from './types';
import { archipelago } from './archipelago';
import { aurora } from './aurora';
import { aurora2 } from './aurora2';
import { bamboo } from './bamboo';
import { barcode } from './barcode';
import { bloom } from './bloom';
import { bounce } from './bounce';
import { bubbles } from './bubbles';
import { cascade } from './cascade';
import { cells } from './cells';
import { chain } from './chain';
import { circuit } from './circuit';
import { circuits2 } from './circuits2';
import { cityscape } from './cityscape';
import { cloth } from './cloth';
import { compass } from './compass';
import { constellation } from './constellation';
import { contour } from './contour';
import { coral } from './coral';
import { crosshatch } from './crosshatch';
import { current } from './current';
import { dandelion } from './dandelion';
import { dots } from './dots';
import { drift } from './drift';
import { dunes } from './dunes';
import { eclipse } from './eclipse';
import { ember } from './ember';
import { erosion } from './erosion';
import { eye } from './eye';
import { feather } from './feather';
import { fibonacci } from './fibonacci';
import { field } from './field';
import { fire } from './fire';
import { fireworks } from './fireworks';
import { flock } from './flock';
import { fluid } from './fluid';
import { fracture } from './fracture';
import { frost } from './frost';
import { galaxy } from './galaxy';
import { gem } from './gem';
import { geode } from './geode';
import { glitch } from './glitch';
import { gravity } from './gravity';
import { grid } from './grid';
import { heartbeat } from './heartbeat';
import { hex } from './hex';
import { ink } from './ink';
import { interference } from './interference';
import { kaleidoscope } from './kaleidoscope';
import { lattice } from './lattice';
import { lightning } from './lightning';
import { mandala } from './mandala';
import { marble } from './marble';
import { matrix } from './matrix';
import { maze } from './maze';
import { mosaic } from './mosaic';
import { mountain } from './mountain';
import { murmuration } from './murmuration';
import { mycelium } from './mycelium';
import { neon } from './neon';
import { net } from './net';
import { ocean } from './ocean';
import { orbit } from './orbit';
import { origami } from './origami';
import { paper } from './paper';
import { pendulum } from './pendulum';
import { petri } from './petri';
import { plasma } from './plasma';
import { portal } from './portal';
import { prism } from './prism';
import { pulse } from './pulse';
import { quilt } from './quilt';
import { radial } from './radial';
import { rain } from './rain';
import { rings } from './rings';
import { ripple } from './ripple';
import { river } from './river';
import { sand } from './sand';
import { shatter } from './shatter';
import { signal } from './signal';
import { smoke } from './smoke';
import { snowflake } from './snowflake';
import { spider } from './spider';
import { spirograph } from './spirograph';
import { strata } from './strata';
import { sunflower } from './sunflower';
import { supernova } from './supernova';
import { swarm } from './swarm';
import { tangle } from './tangle';
import { tendril } from './tendril';
import { terrain } from './terrain';
import { tessera } from './tessera';
import { tile } from './tile';
import { truchet } from './truchet';
import { typographic } from './typographic';
import { vine } from './vine';
import { warp } from './warp';
import { waves } from './waves';
import { weave } from './weave';

// Curated order: animated showstoppers → impressive statics → rest alphabetically
export const algorithms: Algorithm[] = [
  // ── Animated showstoppers ──
  aurora,
  plasma,
  galaxy,
  fireworks,
  murmuration,
  drift,
  portal,
  gravity,
  fluid,
  tessera,
  ocean,
  fire,
  erosion,
  pulse,
  supernova,
  // ── Impressive statics ──
  eclipse,
  kaleidoscope,
  mandala,
  geode,
  marble,
  neon,
  spirograph,
  coral,
  constellation,
  glitch,
  // ── Everything else (alphabetical) ──
  archipelago,
  aurora2,
  bamboo,
  barcode,
  bloom,
  bounce,
  bubbles,
  cascade,
  cells,
  chain,
  circuit,
  circuits2,
  cityscape,
  cloth,
  compass,
  contour,
  crosshatch,
  current,
  dandelion,
  dots,
  dunes,
  ember,
  eye,
  feather,
  fibonacci,
  field,
  flock,
  fracture,
  frost,
  gem,
  grid,
  heartbeat,
  hex,
  ink,
  interference,
  lattice,
  lightning,
  matrix,
  maze,
  mosaic,
  mountain,
  mycelium,
  net,
  orbit,
  origami,
  paper,
  pendulum,
  petri,
  prism,
  quilt,
  radial,
  rain,
  rings,
  ripple,
  river,
  sand,
  shatter,
  signal,
  smoke,
  snowflake,
  spider,
  strata,
  sunflower,
  swarm,
  tangle,
  tendril,
  terrain,
  tile,
  truchet,
  typographic,
  vine,
  warp,
  waves,
  weave,
];

export type { Algorithm } from './types';
