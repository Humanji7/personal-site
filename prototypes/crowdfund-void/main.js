import { RendererRoot } from './render/RendererRoot.js';
import { ScrollOrchestrator } from './systems/ScrollOrchestrator.js';
import { VoidLayer } from './render/layers/VoidLayer.js';
import { PostVoidLayer } from './render/layers/PostVoidLayer.js';
import { getDeviceCaps } from './utils/deviceCaps.js';
import { QualityManager } from './systems/QualityManager.js';
import { DebugHUD } from './systems/DebugHUD.js';
import { InputController } from './systems/InputController.js';
import { CardLayer } from './ui/cards/CardLayer.js';
import { EdgeUI } from './ui/edges/EdgeUI.js';
import { openCheckout } from './ui/payments/lemon.js';

async function fetchEntitlements() {
  // Only hit API when explicitly enabled (static dev server has no /api routes).
  if (!query.api) return { entitlements: [], tier: null };

  try {
    const res = await fetch('/api/session', { credentials: 'include' });
    if (!res.ok) return { entitlements: [], tier: null };
    const json = await res.json();
    return { entitlements: json.entitlements || [], tier: json.tier ?? null };
  } catch {
    return { entitlements: [], tier: null };
  }
}

function getQuery() {
  const p = new URLSearchParams(location.search);
  return {
    debug: p.get('debug') === '1',
    tier: p.get('tier'),
    api: p.get('api') === '1',
    intensity: p.get('intensity'),
  };
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

const query = getQuery();
const viewport = { w: window.innerWidth, h: window.innerHeight };

async function boot() {
  const canvas = document.getElementById('void-canvas');
  const rendererRoot = new RendererRoot({ canvas });

  const caps = getDeviceCaps(rendererRoot.renderer);
  const quality = new QualityManager({ caps, initialTier: query.tier });
  quality.initFromCaps();

  const hud = new DebugHUD({ enabled: query.debug });
  hud.init();

  const scroll = new ScrollOrchestrator();
  scroll.init();

  const input = new InputController();
  input.init({ viewport });

  const voidLayer = new VoidLayer();
  await voidLayer.init({ renderer: rendererRoot.renderer, viewport });

  const postVoidLayer = new PostVoidLayer();
  await postVoidLayer.init({ renderer: rendererRoot.renderer, viewport, quality });

  const cards = new CardLayer();
  await cards.init({ viewport });

  const edges = new EdgeUI();
  edges.init();

  const ent = await fetchEntitlements();
  cards.setEntitlements?.(ent);

  let intensity = (() => {
    const stored = localStorage.getItem('pv-intensity');
    const initial = query.intensity || stored || 'intense';
    return initial === 'calm' ? 'calm' : 'intense';
  })();

  const intensityBtn = document.createElement('button');
  intensityBtn.type = 'button';
  intensityBtn.className = 'pv-intensity-toggle';
  intensityBtn.style.pointerEvents = 'auto';
  function renderIntensityLabel() {
    intensityBtn.textContent = `Intensity: ${intensity === 'intense' ? 'Intense' : 'Calm'}`;
  }
  renderIntensityLabel();
  intensityBtn.addEventListener('click', () => {
    intensity = intensity === 'intense' ? 'calm' : 'intense';
    localStorage.setItem('pv-intensity', intensity);
    renderIntensityLabel();
  });
  document.getElementById('ui-root')?.appendChild(intensityBtn);

  // TODO: Fill with real LemonSqueezy checkout URLs per tier.
  // Minimal integration is "open hosted checkout in new tab" until embed+backend lands.
  const CHECKOUT_URLS = {
    '0': '',
    '1': '',
    '2': '',
    '3': '',
  };

  let selectedTier = null;

  document.addEventListener('pv-tier-hover', (e) => {
    const btn = e.target?.closest?.('button[data-tier]');
    const tier = Number(btn?.dataset?.tier);
    if (!Number.isFinite(tier)) return;
    postVoidLayer.setThemeTier?.(tier);
  });
  document.addEventListener('pv-tier-unhover', () => {
    postVoidLayer.setThemeTier?.(Number.isFinite(selectedTier) ? selectedTier : -1);
  });

  document.addEventListener('pv-tier-click', (e) => {
    const btn = e.target?.closest?.('button[data-tier]');
    const tier = btn?.dataset?.tier;
    if (!tier) return;
    selectedTier = Number(tier);
    postVoidLayer.setThemeTier?.(selectedTier);
    openCheckout(CHECKOUT_URLS[tier]);
  });

  rendererRoot.setLayers([voidLayer, postVoidLayer]);

  let lastT = performance.now();
  function tick(nowMs) {
    const dt = Math.min(0.033, (nowMs - lastT) / 1000);
    lastT = nowMs;

    const s = scroll.getSnapshot();
    input.tick({ nowMs });

    const fps = quality.tickFps();
    quality.maybeAutoScale();

    const transition = smoothstep(0.98, 1.0, s.voidProgress);
    const cardsVis = smoothstep(0.12, 0.28, s.postProgress);
    const edgesVis = s.ramps.edges;

    voidLayer.setProgress(s.voidProgress);
    voidLayer.setFade(1 - transition);
    voidLayer.tick({ dt, now: nowMs / 1000 });

    postVoidLayer.setProgress({
      postProgress: s.postProgress,
      transition,
      edges: s.ramps.edges,
      ramps: s.ramps,
    });
    cards.setVisible(cardsVis);
    cards.tick({ input, scroll: s });

    edges.setVisible(edgesVis);
    edges.tick({ scroll: s });

    const rects = cards.getObstacleRectsNdc({ max: 16 });
    postVoidLayer.setIntensity(intensity === 'intense' ? 1 : 0);
    postVoidLayer.tick({ dt, now: nowMs / 1000, quality, input, rects });

    rendererRoot.render();

    hud.setText(
      `fps ${fps.toFixed(1)} | tier ${quality.tier} | particles ${quality.particleCount} | kf ${s.keyframe} | void ${s.voidProgress.toFixed(3)} | post ${s.postProgress.toFixed(3)}`,
    );

    requestAnimationFrame(tick);
  }

    window.addEventListener(
      'resize',
      () => {
        viewport.w = window.innerWidth;
        viewport.h = window.innerHeight;
        rendererRoot.resize(viewport.w, viewport.h);
        voidLayer.resize({ viewport });
        postVoidLayer.resize({ viewport });
        input.resize({ viewport });
        cards.resize({ viewport });
      },
      { passive: true },
    );

  requestAnimationFrame(tick);
}

boot();
