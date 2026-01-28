# Post‑Void Experience Implementation Plan (V2)

> **For Codex:** REQUIRED SUB‑SKILL: Use `superpowers:executing-plans` to implement this plan task‑by‑task.

**Goal:** Build a scroll‑driven, full‑screen crowdfunding experience where the user “falls through the void” (shader tunnel) and emerges into a living particle swarm that hosts floating content cards, organically‑formed edge UI, and LemonSqueezy tier checkout.

**Architecture:** A layered render pipeline (Void shader → Post‑Void particles/text) controlled by a single scroll orchestrator. Particle rendering uses `THREE.Points`. Simulation is **stateful GPGPU (WebGL2 ping‑pong)** as the primary path, with **procedural fallback** for weaker devices. DOM is an accessible overlay; WebGL interacts with DOM via a thin “obstacle bridge” (screen‑space rectangles).

**Tech Stack:** Three.js (ESM importmap), troika-three-text, GLSL, `GPUComputationRenderer` (Three examples), vanilla HTML/CSS/JS, LemonSqueezy checkout embed.

---

## 0) Non‑Negotiables (Quality Bar)

- **Performance:** Stable 60fps on good desktops; graceful degradation on mid/low devices (no “maybe it’s fine”).
- **Deterministic state:** No “scroll desync” between layers. One source of truth: `ScrollOrchestrator`.
- **Clean lifecycle:** `init()` / `tick(dt)` / `resize()` / `destroy()` for every system. No leaked listeners, no orphaned GPU resources.
- **A11y is real:** All tier actions and content are reachable via keyboard + readable by screen readers; `prefers-reduced-motion` respected.
- **Business readiness:** Checkout flow is reliable and instrumented. “Unlocking” is either honest soft-gating or backed by verifiable entitlements.

---

## 1) Locked Decisions (Do Not Re‑debate Mid‑Build)

### 1.1 Page Architecture
- **Single page, continuous scroll**:
  - `#void-zone`: `150vh` (existing void experience)
  - `#post-void-zone`: `600vh` (post‑void experience)
- The canvas remains `position: fixed; inset: 0;` for the whole experience.
- **Transition policy:** reversible by scroll (scrolling back restores void state; no one-way gating).

### 1.2 Coordinate Model (Canonical “Stage Space”)
To avoid a DOM/WebGL coordinate war, we define one canonical space for the post‑void:

- **Stage Space**:
  - `x, y ∈ [-1, +1]` in **NDC** (screen normalized)
  - `z ∈ [0, 1]` where `0` = near/front, `1` = far/back
- Particles are simulated in Stage Space.
- DOM cards get a `data-stage` position and are projected to pixels by a shared helper:
  - `stageToPx({x,y}) → {left, top}` using viewport size.

This keeps:
- particle avoidance around DOM elements trivial (NDC rectangles)
- parallax/“depth” consistent between DOM and WebGL
- no need to inject camera matrices into compute shaders

### 1.3 Particle Simulation (Primary + Fallback)
- **Primary:** WebGL2 GPGPU ping‑pong simulation (position + velocity textures).
- **Fallback:** Procedural motion in the render vertex shader (no persistent velocity) with reduced interactivity.
- **Dynamic quality tiers:** particle count and effects scale with measured FPS + capability flags.

### 1.4 “Entourage” Definition (Avoid the N‑Closest Trap)
We explicitly **do not** implement “find N closest particles” (CPU spatial hash / GPU selection) as a requirement.

Entourage is implemented as a **local attraction field** near the cursor:
- looks like a “swarm following”
- stays cheap and stable across devices

---

## 2) Experience Timeline (Keyframes)

Post‑void scroll progress `p ∈ [0..1]` maps to 6 keyframes:

| `p` | Keyframe | Meaning |
|---:|---:|---|
| 0.00 | K1 | Entry line appears (“О. Ты дошёл.”) |
| 0.20 | K2 | Manifesto assembles and becomes readable |
| 0.40 | K3 | Words start “flying away” with blur; edge hints begin |
| 0.60 | K4 | Edges 50% formed; manifesto dissolving |
| 0.80 | K5 | Full edge UI (timeline + tiers) |
| 1.00 | K6 | Final state: CTA and tiers dominant |

**Rule:** all systems read the same snapshot `{voidProgress, postProgress, keyframe}` from `ScrollOrchestrator` each frame.

---

## 3) Target File Layout (within this repo)

We keep the prototype self‑contained under `prototypes/crowdfund-void/`, but refactor into modules:

```
prototypes/crowdfund-void/
  index.html
  styles.css
  main.js                         # NEW entry (void.js becomes a module or is replaced)
  systems/
    ScrollOrchestrator.js
    InputController.js
    QualityManager.js
    DebugHUD.js
  render/
    RendererRoot.js
    layers/
      VoidLayer.js                 # wraps current void shader
      PostVoidLayer.js             # particles + manifesto text
  particles/
    ParticleSystem.js              # public API (init/tick/resize/destroy)
    gpgpu/
      ParticleCompute.js           # GPUComputationRenderer wrapper
      position.frag
      velocity.frag
    shaders/
      render.vert
      render.frag
      noise.glsl
  manifesto/
    ManifestoText.js
    shaders/
      motionBlur.frag
  ui/
    cards/
      CardLayer.js
      ContentCard.js
      content.json
      schema.md
    edges/
      EdgeUI.js
      Timeline.js
      Tiers.js
    payments/
      lemon.js
  utils/
    stageSpace.js                  # stageToPx / pxToStage / rectToNdc
    deviceCaps.js                  # WebGL2/float/limits detection
```

---

## 4) Runtime Contracts (Interfaces)

### 4.1 System Lifecycle
Every system follows:

```js
export class System {
  init({ root, renderer, viewport, caps, quality }) {}
  tick({ dt, now, input, scroll, quality }) {}
  resize({ viewport }) {}
  destroy() {}
}
```

### 4.2 Update Order (Per Frame)
1. Read input (`InputController`): pointer position, velocity, idle.
2. Read scroll (`ScrollOrchestrator`): compute `voidProgress`, `postProgress`, `keyframe`.
3. Update quality (`QualityManager`): dynamic scaling, reduced motion, forced debug.
4. Update simulation (`ParticleSystem`): compute step (or procedural params).
5. Update text (`ManifestoText`): line timing + blur params.
6. Update DOM UI (`CardLayer`, `EdgeUI`): CSS vars / transforms; compute obstacle rectangles.
7. Render:
   - `VoidLayer` (if still visible)
   - `PostVoidLayer` (particles + troika text)
8. Debug HUD overlay.

---

## 5) Quality Tiers (Capabilities + Runtime FPS)

### 5.1 Capability Detection (Once on boot)
Detect:
- WebGL2 availability
- float/half‑float render targets (for GPGPU)
- `MAX_TEXTURE_SIZE`, `MAX_VERTEX_TEXTURE_IMAGE_UNITS`
- `MAX_POINT_SIZE` (driver dependent; read via shader or conservative clamp)
- `prefers-reduced-motion`
- device pixel ratio (cap to 2; lower on mobile)

### 5.2 Tiers
Define tiers as an object with explicit knobs:

- `tier = "ultra"`: WebGL2 + float RT, target 100k, GPGPU sim, blur enabled
- `tier = "high"`: target 50k, GPGPU sim, blur reduced
- `tier = "mid"`: target 25k, procedural sim, minimal blur
- `tier = "low"`: target 10k, procedural sim, no blur, edges simplified
- `tier = "static"`: no particles (still show void + DOM content)

### 5.3 Dynamic Scaling (Runtime)
- Maintain a rolling FPS estimate.
- If sustained FPS < 50 for N seconds → step down one tier.
- If sustained FPS > 58 for long enough → step up (only once; don’t oscillate).

---

## 6) Implementation Plan (Tasks)

### Task 1: Create a minimal dev harness + plan scaffolding

**Files:**
- Create: `prototypes/crowdfund-void/main.js`
- Modify: `prototypes/crowdfund-void/index.html`

**Step 1: Add `main.js` entry**
- In `prototypes/crowdfund-void/index.html`, replace `<script type="module" src="void.js"></script>` with `<script type="module" src="main.js"></script>`.

**Step 1.1: Extend importmap for Three “addons” (GPUComputationRenderer)**
- In the same importmap, add:

```html
<script type="importmap">
{
  "imports": {
    "three": "https://cdn.jsdelivr.net/npm/three@0.171.0/build/three.module.js",
    "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.171.0/examples/jsm/",
    "troika-three-text": "https://esm.sh/troika-three-text@0.52.3?external=three"
  }
}
</script>
```

**Step 2: Basic boot log**
- `prototypes/crowdfund-void/main.js`:
  - import current `void.js` temporarily (or just log) so you can iterate without breaking the page.

**Step 2.1: Reference `main.js` wiring skeleton**

```js
// prototypes/crowdfund-void/main.js
import * as THREE from 'three';
import { ScrollOrchestrator } from './systems/ScrollOrchestrator.js';
import { getDeviceCaps } from './utils/deviceCaps.js';
import { QualityManager } from './systems/QualityManager.js';
import { DebugHUD } from './systems/DebugHUD.js';
import { RendererRoot } from './render/RendererRoot.js';
import { VoidLayer } from './render/layers/VoidLayer.js';
import { PostVoidLayer } from './render/layers/PostVoidLayer.js';

function getQuery() {
  const p = new URLSearchParams(location.search);
  return {
    debug: p.get('debug') === '1',
    tier: p.get('tier'),
  };
}

const query = getQuery();
const viewport = { w: window.innerWidth, h: window.innerHeight };

const rendererRoot = new RendererRoot({ canvas: document.getElementById('void-canvas') });
const caps = getDeviceCaps(rendererRoot.renderer);

const quality = new QualityManager({ caps, initialTier: query.tier, debug: query.debug });
quality.initFromCaps();

const hud = new DebugHUD({ enabled: query.debug });
hud.init();

const scroll = new ScrollOrchestrator();
scroll.init();

const voidLayer = new VoidLayer();
await voidLayer.init({ renderer: rendererRoot.renderer, viewport });

const postVoidLayer = new PostVoidLayer();
await postVoidLayer.init({ renderer: rendererRoot.renderer, viewport, caps, quality });

rendererRoot.setLayers([voidLayer, postVoidLayer]);

let lastT = performance.now();
function tick(now) {
  const dt = Math.min(0.033, (now - lastT) / 1000);
  lastT = now;

  viewport.w = window.innerWidth;
  viewport.h = window.innerHeight;

  const s = scroll.getSnapshot();
  const fps = quality.tickFps();
  quality.maybeAutoScale();

  voidLayer.setProgress(s.voidProgress);
  postVoidLayer.setProgress(s.postProgress, s.keyframe, s.ramps);

  postVoidLayer.tick({ dt, now: now / 1000, scroll: s, quality });

  rendererRoot.render();

  hud.setText(`fps ${fps.toFixed(1)} | tier ${quality.tier} | kf ${s.keyframe} | void ${s.voidProgress.toFixed(3)} | post ${s.postProgress.toFixed(3)}`);
  requestAnimationFrame(tick);
}

window.addEventListener('resize', () => {
  rendererRoot.resize(window.innerWidth, window.innerHeight);
  voidLayer.resize({ viewport });
  postVoidLayer.resize({ viewport });
});

requestAnimationFrame(tick);
```

**Step 3: Local run**
- Run one of:
  - `cd prototypes/crowdfund-void && python3 -m http.server 8080`
  - `cd prototypes/crowdfund-void && npx serve .`
- Verify: the current void renders as before.

---

### Task 2: Refactor current void shader into `VoidLayer`

**Files:**
- Create: `prototypes/crowdfund-void/render/RendererRoot.js`
- Create: `prototypes/crowdfund-void/render/layers/VoidLayer.js`
- Modify: `prototypes/crowdfund-void/void.js` (extract shader code / reuse)
- Modify: `prototypes/crowdfund-void/main.js`

**Step 1: Introduce `RendererRoot`**
- Owns `THREE.WebGLRenderer`, common resize/pixelRatio policy, and a `render()` method that renders layers in order.

**Step 1.1: Reference `RendererRoot.js`**

```js
// prototypes/crowdfund-void/render/RendererRoot.js
import * as THREE from 'three';

export class RendererRoot {
  constructor({ canvas }) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.layers = [];
  }

  setLayers(layers) {
    this.layers = layers;
  }

  resize(w, h) {
    this.renderer.setSize(w, h);
  }

  render() {
    // Layers manage their own scenes/cameras.
    this.renderer.clear();
    for (const layer of this.layers) layer.render(this.renderer);
  }
}
```

**Step 2: Implement `VoidLayer`**
- Owns:
  - an internal `THREE.Scene()`
  - an `OrthographicCamera`
  - the fullscreen quad + existing shader uniforms
- Expose:
  - `setProgress(voidProgress)`
  - `setInput({ mouse, smoothMouse, velocity, trailIntensity })`
  - `render(renderer)`

**Step 2.1: `VoidLayer` rule**
- Don’t rewrite your void shader logic. Move the existing shader strings and uniform updates out of `prototypes/crowdfund-void/void.js` into `VoidLayer.js`, keep behavior identical, then iterate.

**Step 3: Keep parity**
- Verify: visuals and behavior match current `void.js` (same scroll tunnel, micro texts, emergence SDF text).

---

### Task 3: Add scroll zones + `ScrollOrchestrator` (single source of truth)

**Files:**
- Create: `prototypes/crowdfund-void/systems/ScrollOrchestrator.js`
- Modify: `prototypes/crowdfund-void/index.html`
- Modify: `prototypes/crowdfund-void/main.js`

**Step 1: Add `#post-void-zone`**
- In `prototypes/crowdfund-void/index.html`, add after `#void-zone`:
  - `<div id="post-void-zone" style="height: 600vh;"></div>`

**Step 2: Implement orchestrator**
- Contract:
  - reads DOM heights once + on resize
  - computes:
    - `voidProgress` = clamp(scrollY / (voidHeight - viewportH))
    - `postProgress` = clamp((scrollY - voidHeight) / (postHeight - viewportH))
    - `keyframe` based on postProgress thresholds `[0, .2, .4, .6, .8, 1]`
- Emits a snapshot object each frame (not from scroll event):
  - scroll event only updates `scrollY` (passive), rAF computes progress.

**Step 2.1: Use this reference implementation (copy as‑is first)**

```js
// prototypes/crowdfund-void/systems/ScrollOrchestrator.js
const KEYFRAMES = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function keyframeFor(p) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i] && p < KEYFRAMES[i + 1]) return i + 1; // 1..5
  }
  return 6; // final
}

export class ScrollOrchestrator {
  constructor({ voidZoneId = 'void-zone', postZoneId = 'post-void-zone' } = {}) {
    this.voidZoneId = voidZoneId;
    this.postZoneId = postZoneId;

    this.scrollY = 0;
    this.viewportH = 1;
    this.voidH = 1;
    this.postH = 1;

    this._onScroll = () => {
      this.scrollY = window.scrollY || window.pageYOffset || 0;
    };
    this._onResize = () => this.measure();
  }

  init() {
    this.measure();
    this._onScroll();
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize, { passive: true });
  }

  measure() {
    const voidZone = document.getElementById(this.voidZoneId);
    const postZone = document.getElementById(this.postZoneId);

    this.viewportH = Math.max(1, window.innerHeight);
    this.voidH = Math.max(this.viewportH, voidZone?.offsetHeight || this.viewportH);
    this.postH = Math.max(this.viewportH, postZone?.offsetHeight || this.viewportH);
  }

  getSnapshot() {
    const voidScrollable = Math.max(1, this.voidH - this.viewportH);
    const postScrollable = Math.max(1, this.postH - this.viewportH);

    const voidProgress = clamp01(this.scrollY / voidScrollable);
    const postScrollY = Math.max(0, this.scrollY - this.voidH);
    const postProgressRaw = clamp01(postScrollY / postScrollable);

    // Optional: apply a tiny smoothing for “organic” keyframe transitions.
    const postProgress = postProgressRaw;
    const keyframe = keyframeFor(postProgress);

    // One place to expose eased ramps for systems:
    const ramps = {
      enter: smoothstep(0.0, 0.08, postProgress),
      edges: smoothstep(0.4, 0.8, postProgress),
      manifestoFly: smoothstep(0.4, 0.6, postProgress),
      final: smoothstep(0.8, 1.0, postProgress),
    };

    return { voidProgress, postProgress, postProgressRaw, keyframe, ramps };
  }

  destroy() {
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
  }
}
```

**Step 3: Verification**
- Add temporary debug text in DOM showing `{voidProgress, postProgress, keyframe}`.
- Verify: void reaches 1.0 at end of void zone; post starts at 0.0 immediately after.

---

### Task 4: Add capability detection + `QualityManager` + Debug HUD

**Files:**
- Create: `prototypes/crowdfund-void/utils/deviceCaps.js`
- Create: `prototypes/crowdfund-void/systems/QualityManager.js`
- Create: `prototypes/crowdfund-void/systems/DebugHUD.js`
- Modify: `prototypes/crowdfund-void/main.js`
- Modify: `prototypes/crowdfund-void/styles.css` (HUD styles + debug flag)

**Step 1: Capability detect**
- `deviceCaps.js` exports `getDeviceCaps(renderer)` returning:
  - `webgl2`, `maxTextureSize`, `maxVtfUnits`, `floatRT`, `halfFloatRT`, `dpr`, `reducedMotion`

**Step 1.1: Reference `deviceCaps.js`**

```js
// prototypes/crowdfund-void/utils/deviceCaps.js
export function getDeviceCaps(renderer) {
  const gl = renderer.getContext();
  const isWebGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxVtfUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Render-target float support is messy; treat “works” as an empirical flag.
  // For this plan: we expose the extensions and leave final validation to a runtime probe.
  const extColorBufferFloat = gl.getExtension('EXT_color_buffer_float');
  const extColorBufferHalfFloat = gl.getExtension('EXT_color_buffer_half_float');

  return {
    webgl2: isWebGL2,
    maxTextureSize,
    maxVtfUnits,
    dpr,
    reducedMotion,
    extColorBufferFloat: !!extColorBufferFloat,
    extColorBufferHalfFloat: !!extColorBufferHalfFloat,
  };
}
```

**Step 2.1: Reference `QualityManager.js`**

```js
// prototypes/crowdfund-void/systems/QualityManager.js
const TIERS = ['ultra', 'high', 'mid', 'low', 'static'];

export class QualityManager {
  constructor({ caps, initialTier = null, debug = false } = {}) {
    this.caps = caps;
    this.debug = debug;
    this.forcedTier = initialTier;

    this.tier = 'high';
    this.particleCount = 50_000;
    this.useGpgpu = false;
    this.blurEnabled = false;

    this._fps = 60;
    this._lastFpsT = performance.now();
    this._frames = 0;
    this._cooldownMs = 5000;
    this._lastTierChangeAt = -Infinity;
  }

  initFromCaps() {
    if (this.caps.reducedMotion) return this.setTier('static');
    if (this.forcedTier) return this.setTier(this.forcedTier);

    if (this.caps.webgl2 && (this.caps.extColorBufferFloat || this.caps.extColorBufferHalfFloat)) {
      return this.setTier('high');
    }
    return this.setTier('mid');
  }

  setTier(tier) {
    this.tier = tier;
    const isGpgpuCapable = this.caps.webgl2 && (this.caps.extColorBufferFloat || this.caps.extColorBufferHalfFloat);

    if (tier === 'ultra') {
      this.particleCount = 100_000;
      this.useGpgpu = isGpgpuCapable;
      this.blurEnabled = true;
    } else if (tier === 'high') {
      this.particleCount = 50_000;
      this.useGpgpu = isGpgpuCapable;
      this.blurEnabled = true;
    } else if (tier === 'mid') {
      this.particleCount = 25_000;
      this.useGpgpu = false;
      this.blurEnabled = false;
    } else if (tier === 'low') {
      this.particleCount = 10_000;
      this.useGpgpu = false;
      this.blurEnabled = false;
    } else {
      this.particleCount = 0;
      this.useGpgpu = false;
      this.blurEnabled = false;
    }
  }

  tickFps() {
    this._frames += 1;
    const now = performance.now();
    const dt = now - this._lastFpsT;
    if (dt < 500) return this._fps;
    this._fps = (this._frames * 1000) / dt;
    this._frames = 0;
    this._lastFpsT = now;
    return this._fps;
  }

  maybeAutoScale() {
    if (this.forcedTier) return;
    const now = performance.now();
    if (now - this._lastTierChangeAt < this._cooldownMs) return;

    if (this._fps < 50 && this.tier !== 'static') {
      this._lastTierChangeAt = now;
      const idx = TIERS.indexOf(this.tier);
      this.setTier(TIERS[Math.min(TIERS.length - 1, idx + 1)]);
    } else if (this._fps > 58 && this.tier === 'mid') {
      this._lastTierChangeAt = now;
      this.setTier('high');
    }
  }
}
```

**Step 3.1: Reference `DebugHUD.js`**

```js
// prototypes/crowdfund-void/systems/DebugHUD.js
export class DebugHUD {
  constructor({ enabled = false } = {}) {
    this.enabled = enabled;
    this.el = null;
  }

  init() {
    if (!this.enabled) return;
    this.el = document.createElement('div');
    this.el.id = 'debug-hud';
    document.body.appendChild(this.el);
  }

  setText(text) {
    if (!this.el) return;
    this.el.textContent = text;
  }

  destroy() {
    this.el?.remove();
    this.el = null;
  }
}
```

**Step 2: Tier selection**
- `QualityManager`:
  - chooses initial tier from caps + viewport
  - exposes knobs: `particleCount`, `useGpgpu`, `blurEnabled`, `edgesMode`
  - supports query overrides: `?debug=1&tier=high`

**Step 3: Debug HUD**
- Shows: FPS, tier, particle count, keyframe, caps flags.
- Must be toggleable (default off).

**Step 4: Verification**
- Throttle CPU in DevTools and ensure tier steps down.
- `prefers-reduced-motion` should force `tier="static"` or `low`.

---

### Task 5: Implement `ParticleSystem` render path (no simulation yet)

**Files:**
- Create: `prototypes/crowdfund-void/particles/ParticleSystem.js`
- Create: `prototypes/crowdfund-void/particles/shaders/render.vert`
- Create: `prototypes/crowdfund-void/particles/shaders/render.frag`
- Create: `prototypes/crowdfund-void/particles/shaders/noise.glsl`
- Modify: `prototypes/crowdfund-void/render/layers/PostVoidLayer.js` (created in Task 6; placeholder ok)

**Step 1: Stage‑space points geometry**
- Create a `BufferGeometry` with attribute `aSeed` (random vec3) and `aUvRef` (vec2) **even before GPGPU**.
- Start with a simple deterministic position from seed + time (procedural).

**Step 2: Rendering shader requirements**
- `render.vert`:
  - compute `pos` in stage space
  - set `gl_Position = vec4(pos.xy, mix(0.2, 0.9, pos.z), 1.0)`
  - set `gl_PointSize` using `pos.z` and `viewport` (clamped)
- `render.frag`:
  - soft radial glow
  - additive blending, `depthWrite=false`, `depthTest=false` (stage illusion)
  - palette mapping: magenta/cyan/violet + rare gold sparks

**Step 3: Verification**
- In a blank scene, render 10k points first, then scale to 50k.
- Ensure no massive overdraw (keep point size small; avoid full‑screen blobs).

---

### Task 6: Add `PostVoidLayer` and crossfade transition (Void → Particles)

**Files:**
- Create: `prototypes/crowdfund-void/render/layers/PostVoidLayer.js`
- Modify: `prototypes/crowdfund-void/render/RendererRoot.js`
- Modify: `prototypes/crowdfund-void/main.js`

**Step 1: `PostVoidLayer` owns**
- a `THREE.Scene()`
- (optional) a simple `PerspectiveCamera` **only if needed**; otherwise stay in Stage Space
- `ParticleSystem` instance

**Step 2: Crossfade policy**
- Define `transition = smoothstep(0.98, 1.0, voidProgress)`.
- Void opacity = `1 - transition`
- Particles opacity = `transition`
- Ensure the void still draws behind particles during overlap.

**Step 3: Verification**
- No “pop”: particles must exist (hidden) before the fade starts.
- On reverse scroll: allow crossfade back (unless product wants one‑way).

---

### Task 7: Primary GPGPU simulation (WebGL2 ping‑pong)

**Files:**
- Create: `prototypes/crowdfund-void/particles/gpgpu/ParticleCompute.js`
- Create: `prototypes/crowdfund-void/particles/gpgpu/position.frag`
- Create: `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`
- Modify: `prototypes/crowdfund-void/particles/ParticleSystem.js`

**Step 1: Choose texture resolution**
- `side = ceil(sqrt(particleCount))`
- Particle count becomes `side*side` (document that we slightly round up).

**Step 2: Compute textures**
- `position` RGBA16F: xyz + (optional) seed
- `velocity` RGBA16F: xyz + (optional) age

**Step 3: Velocity update (`velocity.frag`)**
Forces (all in Stage Space):
- base flow: curl noise / rotating rivers
- cursor wave rings: ring buffer of up to `MAX_WAVES=8` events
- cursor repulsion / negative space
- edge attractors (strength driven by postProgress)
- damping (prevents explosion)

**Step 4: Position update (`position.frag`)**
- `pos += vel * dt`
- wrap/clamp:
  - softly push back into `[-1,1]` bounds (no hard clamp jitter)
  - keep `z` in `[0,1]` with gentle drift

**Step 5: Render sampling**
- In `render.vert`, sample `posTex` using `aUvRef`.

**Step 6: Fallback**
- If caps don’t allow float RT or WebGL2 → `ParticleSystem` switches to procedural mode automatically.

**Verification**
- Toggle `?tier=ultra` and confirm:
  - particles move even with time frozen scroll
  - GPU memory stable (no per‑frame allocations)

---

### Task 8: Cursor interactions (waves + entourage field)

**Files:**
- Create: `prototypes/crowdfund-void/systems/InputController.js`
- Modify: `prototypes/crowdfund-void/particles/ParticleSystem.js`
- Modify: `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`

**Step 1: Input controller**
- Produces:
  - `pointerStage` (x,y in NDC)
  - `pointerVelocity`
  - `isIdle`
  - `emitWave()` on meaningful movement (rate limit; ring buffer)

**Step 2: Wave ring buffer uniform**
- Uniform arrays:
  - `uWavesOrigin[MAX_WAVES]`
  - `uWavesTime[MAX_WAVES]`
  - `uWavesStrength[MAX_WAVES]`
- In shader: for each wave, compute ring distance and add radial impulse.

**Step 3: Entourage field**
- In shader: local attraction behind cursor along velocity direction:
  - “follow” looks like particles clustering/trailing
  - disabled when idle, eased out smoothly

**Verification**
- Continuous pointer motion doesn’t drop FPS.
- When pointer stops, swarm relaxes back within ~2s.

---

### Task 9: Manifesto text system (troika + blur)

**Files:**
- Create: `prototypes/crowdfund-void/manifesto/ManifestoText.js`
- Create: `prototypes/crowdfund-void/manifesto/shaders/motionBlur.frag`
- Modify: `prototypes/crowdfund-void/render/layers/PostVoidLayer.js`
- Modify: `prototypes/crowdfund-void/index.html` (fonts preload)

**Step 1: Text content is local**
- Store manifesto lines in `ManifestoText.js` (don’t depend on external file:// links).

**Step 2: Troika setup**
- Preload a local TTF (self‑host recommended) and fall back to CDN.
- Render lines as separate `Text` objects so timing is controllable.

**Step 3: Blur effect**
- Implement a cheap “directional multi‑sample blur” in fragment shader based on per‑line velocity.
- Gate by tier: blur off on low/mid.

**Step 4: Keyframe timing**
- K1/K2: sequential fade in
- K3/K4: accelerate outward + blur
- K5+: fully gone

**Verification**
- Text remains readable at rest (no constant blur).
- Reduced motion: skip fly‑away; replace with fade.

---

### Task 10: Content cards layer (DOM, accessible) + schema

**Files:**
- Create: `prototypes/crowdfund-void/ui/cards/schema.md`
- Create: `prototypes/crowdfund-void/ui/cards/content.json`
- Create: `prototypes/crowdfund-void/ui/cards/ContentCard.js`
- Create: `prototypes/crowdfund-void/ui/cards/CardLayer.js`
- Modify: `prototypes/crowdfund-void/index.html`
- Modify: `prototypes/crowdfund-void/styles.css`

**Step 1: DOM root**
- Add `<div id="ui-root"></div>` overlay above the canvas (z-index).
- Ensure:
  - semantic HTML
  - focus rings visible

**Step 2: Data schema**
- `content.json`: minimal real items + placeholders
- `schema.md`: describe fields and lock states

**Step 3: Stage placement**
- Each card has:
  - `stageX, stageY, stageZ`
  - `sizeVariant`
  - `lockState`
- `CardLayer` projects stage→px and applies transforms:
  - translate + scale + blur based on `stageZ`

**Step 4: Interaction**
- Hover/focus:
  - raise, intensify glow
  - emits “interest” signal for particles (next task)

**Verification**
- Tab navigation reaches every card and tier button.
- Screen reader sees meaningful labels even if visuals are abstract.

---

### Task 11: Particle ↔ DOM coupling via obstacle bridge (screen‑space rectangles)

**Files:**
- Create: `prototypes/crowdfund-void/utils/stageSpace.js`
- Modify: `prototypes/crowdfund-void/ui/cards/CardLayer.js`
- Modify: `prototypes/crowdfund-void/particles/ParticleSystem.js`
- Modify: `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`

**Step 1: Rect → NDC**
- `rectToNdc(rectPx, viewport)` returns `{x0,y0,x1,y1}` in NDC.

**Step 1.1: Reference `stageSpace.js`**

```js
// prototypes/crowdfund-void/utils/stageSpace.js
export function stageToPx(stage, viewport) {
  const x = (stage.x * 0.5 + 0.5) * viewport.w;
  const y = ((-stage.y) * 0.5 + 0.5) * viewport.h;
  return { x, y };
}

export function rectToNdc(rect, viewport) {
  const x0 = (rect.left / viewport.w) * 2 - 1;
  const x1 = ((rect.left + rect.width) / viewport.w) * 2 - 1;
  const y0 = -(((rect.top + rect.height) / viewport.h) * 2 - 1);
  const y1 = -((rect.top / viewport.h) * 2 - 1);
  return { x0, y0, x1, y1 };
}
```

**Step 2: Obstacle payload**
- Pack up to `MAX_RECTS=32` into:
  - either uniform arrays (simpler)
  - or a small `DataTexture` (more scalable)
- Start with uniform arrays for speed of implementation; switch if needed.

**Step 3: Avoidance force**
- In `velocity.frag`:
  - project particle `pos.xy` vs rect
  - compute signed distance to rect (SDF)
  - apply repulsion + tangential “flow around” bias

**Step 4: Hover intensification**
- For the hovered card, add a “color boost” region around its rect.

**Verification**
- Particles clearly avoid cards without jittering or “sticking” to edges.

---

### Task 12: Edge UI (timeline + tiers) + particle formation

**Files:**
- Create: `prototypes/crowdfund-void/ui/edges/EdgeUI.js`
- Create: `prototypes/crowdfund-void/ui/edges/Timeline.js`
- Create: `prototypes/crowdfund-void/ui/edges/Tiers.js`
- Create: `prototypes/crowdfund-void/ui/payments/lemon.js`
- Modify: `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`
- Modify: `prototypes/crowdfund-void/index.html`

**Step 1: Particle edge attractors**
- In shader, add attractors toward:
  - left strip `x = -0.92`
  - right strip `x = +0.92`
- Strength ramps with postProgress:
  - start at K3 (p≥0.4), full at K5 (p≥0.8)

**Step 2: DOM edges**
- `EdgeUI` mounts left timeline + right tiers.
- Visibility tied to orchestrator keyframes:
  - don’t show full DOM before particles hint the edges

**Step 3: LemonSqueezy**
- Implement “tier button → checkout overlay” using official embed script.
- Decide entitlement honesty:
  - **Soft‑gate (prototype):** show “locked/unlocked” locally after success callback.
  - **Hard entitlement (business):** add a real verification layer (webhook → signed token).
    - Document which backend you’ll use (Vercel function / Cloudflare Worker).

**Decision for this ship:** implement **minimal backend entitlement** (webhook → signed session/token) so “unlock” is verifiable and not cosmetic.

**Verification**
- Checkout opens reliably on desktop + mobile Safari.
- Cancel returns cleanly to experience with state intact.

---

## 7) Accessibility & Reduced Motion (Must Be Designed‑In)

Minimum rules:
- If `prefers-reduced-motion: reduce`:
  - disable GPGPU step (or set dt=0)
  - replace fly‑away with simple fades
  - keep content and tiers fully usable
- Keyboard:
  - all cards and tier buttons are focusable
  - focus ring visible on dark background
- Screen reader:
  - headings and landmarks exist under the canvas
  - avoid “div soup”; use buttons/links

---

## 8) Instrumentation (Art + Business)

Add a tiny analytics abstraction (even if it’s console‑only at first):
- `experience_enter`
- `void_complete`
- `tier_viewed`
- `tier_checkout_open`
- `tier_checkout_success`
- `content_open`

Rule: analytics calls must never block rendering; queue + fire async.

---

## 9) Definition of Done (Ship Checklist)

- Void experience unchanged in the first zone.
- Seamless transition: void → swarm (and reverse if enabled).
- Swarm feels alive: flow + cursor influence + negative space.
- Manifesto appears, reads, dissolves with intent.
- Content cards exist, are accessible, and feel spatial.
- Edge UI forms organically and exposes tiers.
- LemonSqueezy checkout works end‑to‑end on at least:
  - Chrome desktop
  - Safari iOS (modern)
- Reduced motion mode is respectful and beautiful.
- Debug HUD can prove tiering and performance decisions.
- Import for compute:

```js
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';
```

**Reference `ParticleCompute.js` skeleton**

```js
// prototypes/crowdfund-void/particles/gpgpu/ParticleCompute.js
import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

export class ParticleCompute {
  constructor({ renderer, side, shaders, initialPosition, initialVelocity }) {
    this.renderer = renderer;
    this.side = side;
    this.shaders = shaders;

    this.gpu = new GPUComputationRenderer(side, side, renderer);
    this.gpu.setDataType(THREE.HalfFloatType); // prefer HalfFloat; runtime probe decides if Float is safe

    const dtPosition = this.gpu.createTexture();
    const dtVelocity = this.gpu.createTexture();
    initialPosition(dtPosition.image.data, side);
    initialVelocity(dtVelocity.image.data, side);

    this.velVar = this.gpu.addVariable('textureVelocity', shaders.velocity, dtVelocity);
    this.posVar = this.gpu.addVariable('texturePosition', shaders.position, dtPosition);

    this.gpu.setVariableDependencies(this.velVar, [this.velVar, this.posVar]);
    this.gpu.setVariableDependencies(this.posVar, [this.velVar, this.posVar]);

    // Common uniforms
    this.velVar.material.uniforms.uDt = { value: 0.016 };
    this.velVar.material.uniforms.uTime = { value: 0 };
    this.velVar.material.uniforms.uPointer = { value: new THREE.Vector2(0, 0) };
    this.velVar.material.uniforms.uPointerVel = { value: new THREE.Vector2(0, 0) };
    this.velVar.material.uniforms.uEdges = { value: 0 };
    this.velVar.material.uniforms.uRectsCount = { value: 0 };
    this.velVar.material.uniforms.uRects = { value: Array.from({ length: 32 }, () => new THREE.Vector4(0, 0, 0, 0)) };

    this.posVar.material.uniforms.uDt = { value: 0.016 };
    this.posVar.material.uniforms.uTime = { value: 0 };

    const err = this.gpu.init();
    if (err) throw new Error(err);
  }

  setRects(rectsNdc) {
    const count = Math.min(32, rectsNdc.length);
    this.velVar.material.uniforms.uRectsCount.value = count;
    for (let i = 0; i < 32; i++) {
      const r = rectsNdc[i];
      this.velVar.material.uniforms.uRects.value[i].set(r?.x0 ?? 0, r?.y0 ?? 0, r?.x1 ?? 0, r?.y1 ?? 0);
    }
  }

  tick({ dt, now, pointer, pointerVel, edges }) {
    this.velVar.material.uniforms.uDt.value = dt;
    this.velVar.material.uniforms.uTime.value = now;
    this.velVar.material.uniforms.uPointer.value.copy(pointer);
    this.velVar.material.uniforms.uPointerVel.value.copy(pointerVel);
    this.velVar.material.uniforms.uEdges.value = edges;

    this.posVar.material.uniforms.uDt.value = dt;
    this.posVar.material.uniforms.uTime.value = now;

    this.gpu.compute();
  }

  get positionTexture() {
    return this.gpu.getCurrentRenderTarget(this.posVar).texture;
  }
}
```

**Reference `velocity.frag` template**

```glsl
// prototypes/crowdfund-void/particles/gpgpu/velocity.frag
uniform float uDt;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform float uEdges;
uniform int uRectsCount;
uniform vec4 uRects[32]; // x0,y0,x1,y1 in NDC

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec4 vel = texture2D(textureVelocity, uv);

  vec3 v = vel.xyz;
  vec2 p = pos.xy; // stage space

  // Damping
  v *= 0.985;

  // Cursor repulsion (negative space)
  vec2 toPointer = p - uPointer;
  float d = length(toPointer) + 1e-4;
  float repel = smoothstep(0.25, 0.0, d);
  v.xy += normalize(toPointer) * repel * 0.6 * uDt;

  // Edge attractors (left/right strips)
  float edgeX = mix(0.0, 0.92, uEdges);
  float pullL = smoothstep(0.6, 0.0, abs(p.x + edgeX));
  float pullR = smoothstep(0.6, 0.0, abs(p.x - edgeX));
  v.x += (-pullL + pullR) * 0.12 * uDt;

  // DOM rect avoidance
  for (int i = 0; i < 32; i++) {
    if (i >= uRectsCount) break;
    vec4 r = uRects[i];
    // signed distance to rect in NDC
    vec2 c = clamp(p, r.xy, r.zw);
    vec2 diff = p - c;
    float dist = length(diff) + 1e-4;
    float avoid = smoothstep(0.15, 0.0, dist);
    v.xy += normalize(diff) * avoid * 0.9 * uDt;
  }

  gl_FragColor = vec4(v, 1.0);
}
```

**Reference `position.frag` template**

```glsl
// prototypes/crowdfund-void/particles/gpgpu/position.frag
uniform float uDt;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec3 v = texture2D(textureVelocity, uv).xyz;

  pos.xyz += v * uDt;

  // Soft bounds in stage space [-1..1]
  float bx = smoothstep(0.95, 1.05, abs(pos.x));
  float by = smoothstep(0.95, 1.05, abs(pos.y));
  pos.x *= 1.0 - bx * 0.02;
  pos.y *= 1.0 - by * 0.02;

  // Keep z in [0..1] gently
  pos.z = clamp(pos.z, 0.0, 1.0);

  gl_FragColor = pos;
}
```
