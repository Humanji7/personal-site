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
// PostFX pipeline (Milestone 3)
import { RenderTargets } from './render/RenderTargets.js';
import { PostFXPipeline } from './render/PostFXPipeline.js';
import { LinearCompositePass } from './render/passes/LinearCompositePass.js';

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
    motion: p.get('motion') === '1',
    // PostFX pipeline controls (Milestone 0)
    fx: p.get('fx') !== '0', // default enabled, fx=0 disables
    exposure: parseFloat(p.get('exposure')) || 1.2,
    bloom: parseFloat(p.get('bloom')) || 1.2,
    threshold: parseFloat(p.get('threshold')) || 0.7,
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
  // Allow opting into motion even if OS has prefers-reduced-motion enabled.
  const motionOverride =
    query.motion || localStorage.getItem('pv-motion') === 'on' || false;
  if (motionOverride) caps.reducedMotion = false;
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

  // PostFX pipeline (fx=1 path)
  let renderTargets = null;
  let postfx = null;
  let compositePass = null;
  if (query.fx) {
    renderTargets = new RenderTargets({
      renderer: rendererRoot.renderer,
      caps,
      width: viewport.w,
      height: viewport.h,
    });
    // PostFX must be sized in drawing-buffer pixels to avoid blocky scaling artifacts.
    const pxW = renderTargets.rtComposite.width;
    const pxH = renderTargets.rtComposite.height;
    postfx = new PostFXPipeline({
      renderer: rendererRoot.renderer,
      width: pxW,
      height: pxH,
      config: {
        exposure: query.exposure,
        bloom: query.bloom,
        threshold: query.threshold,
      },
    });
    compositePass = new LinearCompositePass({ renderer: rendererRoot.renderer });
  }

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

  if (!motionOverride && caps.reducedMotion) {
    const motionBtn = document.createElement('button');
    motionBtn.type = 'button';
    motionBtn.className = 'pv-intensity-toggle';
    motionBtn.style.top = '52px';
    motionBtn.style.pointerEvents = 'auto';
    motionBtn.textContent = 'Motion: Off (click to enable)';
    motionBtn.addEventListener('click', () => {
      localStorage.setItem('pv-motion', 'on');
      const sp = new URLSearchParams(location.search);
      sp.set('motion', '1');
      location.search = sp.toString();
    });
    document.getElementById('ui-root')?.appendChild(motionBtn);
  }

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

  // Only use setLayers for legacy fx=0 path
  if (!query.fx) {
    rendererRoot.setLayers([voidLayer, postVoidLayer]);
  }

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

    // Render
    if (query.fx && renderTargets && postfx && compositePass) {
      // fx=1: full render graph
      const renderer = rendererRoot.renderer;
      rendererRoot.beginFrame();

      // 1) Void → rtVoid
      voidLayer.render(renderer, { target: renderTargets.rtVoid });

      // 2) Particles/trails → rtPost
      // Ensure rtPost starts clean each frame (TrailAccumulationPass uses alpha in blit).
      renderer.setRenderTarget(renderTargets.rtPost);
      renderer.clear(true, false, false);
      renderer.setRenderTarget(null);
      postVoidLayer.renderParticles(renderer, { target: renderTargets.rtPost });

      // 3) Composite void + post → rtComposite
      compositePass.render({
        voidTexture: renderTargets.rtVoid.texture,
        postTexture: renderTargets.rtPost.texture,
        mix: transition,
        outputTarget: renderTargets.rtComposite,
      });

      // 4) PostFX (bloom + tonemap) → screen
      postfx.setInput(renderTargets.rtComposite.texture);
      postfx.render(dt);

      // 5) Overlay (manifesto) — crisp, after postfx
      renderer.setRenderTarget(null);
      postVoidLayer.renderOverlay(renderer);
    } else {
      // fx=0: legacy path
      rendererRoot.render();
    }

    hud.setText(
      `fps ${fps.toFixed(1)} | tier ${quality.tier} | particles ${quality.particleCount} | fx ${query.fx ? 1 : 0} | kf ${s.keyframe} | void ${s.voidProgress.toFixed(3)} | post ${s.postProgress.toFixed(3)}`,
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
      // PostFX pipeline resize
      renderTargets?.resize(viewport.w, viewport.h);
      if (renderTargets && postfx) {
        postfx.resize(renderTargets.rtComposite.width, renderTargets.rtComposite.height);
      }
    },
    { passive: true },
  );

  requestAnimationFrame(tick);
}

boot();
