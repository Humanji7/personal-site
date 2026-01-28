# Post‑Void Rendering V2 (Serious Pipeline) — Implementation Plan

> **For Opus:** follow this plan task‑by‑task, report results + screenshots at the end of each milestone.  
> **Required skills referenced:** `threejs`, `particles-gpu`, `shader-fundamentals`, `shader-noise`, `postfx-composer`, `postfx-bloom`, `gsap-scrolltrigger` (optional).  
> **Do not scope-creep:** ship foundation first, then tune.

**Goal:** Replace the current “ad‑hoc” particle/trail look with a *controlled, filmic, stable* render pipeline: correct color management, HDR‑ish headroom, bloom, and predictable exposure—while keeping the swarm “wind+water + shepherd cursor” feel and reversible scroll.

**Architecture (render graph):**

```
VoidLayer.scene  ──render──► RT_void (linear)
PostVoidLayer.particles ──accum lowres──► RT_trailsLow (linear)
RT_trailsLow ──upsample──► RT_post (linear)
RT_void + RT_post + transition ──composite──► RT_composite (linear)
RT_composite ──postfx (bloom + grade + tonemap + gamma)──► Screen
Overlay (manifesto text) ──render after postfx──► Screen (crisp, no bloom)
```

**Tech stack:** Three.js r171 via CDN importmap, custom GLSL shaders, `GPUComputationRenderer` for sim, `EffectComposer` + `UnrealBloomPass` from `three/addons/`.

**Acceptance criteria (non‑negotiable):**
- No full‑screen white blowouts; exposure is stable across scroll + cursor motion.
- Bloom is visible but controlled (neon aura, not fog).
- Trails are long + hypnotic in *Intense*, shorter in *Calm*, without “burnt” whites.
- UI (DOM) stays crisp; manifesto (WebGL) stays crisp (not bloomed).
- Reversible scroll: scrolling up restores void without artifacts (trail buffers reset when leaving post zone).
- Performance tiers still work; mobile doesn’t instantly collapse.

---

## Milestone 0 — Baseline + guardrails (10–15 min)

### Task 0.1: Create a “render debug preset” switch

**Files:**
- Modify: `prototypes/crowdfund-void/main.js`

**Steps:**
1. Add query parsing for:
   - `?fx=0/1` (enable new postfx pipeline)
   - `?exposure=...` `?bloom=...` `?threshold=...`
2. Default `fx=1` for local dev, but allow forcing `fx=0` to compare.

**Verify:**
- Load `http://127.0.0.1:8080/?debug=1&fx=0` and `...&fx=1` and confirm both run.

---

## Milestone 1 — Refactor layers to render into targets (core plumbing)

### Task 1.1: Add a “RenderTargets” allocator (full‑res + scaled)

**Files:**
- Create: `prototypes/crowdfund-void/render/RenderTargets.js`
- Modify: `prototypes/crowdfund-void/utils/deviceCaps.js` (if needed for texture type decisions)

**Implementation:**
- Export a class that allocates/disposes:
  - `rtVoid` (full)
  - `rtPost` (full)
  - `rtComposite` (full)
- Choose texture `type`:
  - Prefer `HalfFloatType` when WebGL2 + `EXT_color_buffer_half_float` or `EXT_color_buffer_float`
  - Else `UnsignedByteType`
- Set:
  - `min/mag = LinearFilter`, `generateMipmaps = false`, `depthBuffer=false`

**Verify:**
- No WebGL errors in console; resizing window recreates targets without leaks (watch Chrome “GPU memory” roughly stable).

### Task 1.2: Update `RendererRoot` to support a render‑graph “frame”

**Files:**
- Modify: `prototypes/crowdfund-void/render/RendererRoot.js`

**Implementation:**
- Add a `beginFrame()` that `renderer.setRenderTarget(null); renderer.clear(true,true,true);`
- Add a `setSize(w,h)` wrapper that also updates pixel ratio if needed.
- Keep backwards compatibility with `setLayers()` until pipeline lands.

**Verify:**
- Existing `fx=0` path still works.

### Task 1.3: Make VoidLayer able to render to a given RT

**Files:**
- Modify: `prototypes/crowdfund-void/render/layers/VoidLayer.js`

**Implementation:**
- Change `render(renderer)` to accept optional `{ target }`.
- When `target` is provided: `renderer.setRenderTarget(target); renderer.render(scene,camera);`
- When not provided: render to screen (current behavior).

**Verify:**
- With `fx=0` nothing changes visually.

### Task 1.4: Make PostVoidLayer able to render **only particles** into RT, and overlay separately

**Files:**
- Modify: `prototypes/crowdfund-void/render/layers/PostVoidLayer.js`

**Implementation:**
- Split render into:
  - `renderParticles(renderer, { target })` (writes the particle/trail output)
  - `renderOverlay(renderer)` (manifesto)
- Keep existing `render(renderer)` calling these for `fx=0`.

**Verify:**
- With `fx=0` still works, no missing manifesto.

---

## Milestone 2 — Trails become strictly linear (no gamma/tonemap inside)

### Task 2.1: Remove display‑space transforms from `TrailAccumulationPass`

**Files:**
- Modify: `prototypes/crowdfund-void/render/passes/TrailAccumulationPass.js`

**Implementation rules (shader‑fundamentals):**
- Accumulation targets store **linear** values.
- NO gamma in `BLIT_FRAG`.
- NO tonemap in `COMPOSITE_FRAG`.
- Keep `uCurrGain` and `uDecay` but treat them as linear multipliers.

**API change:**
- Add `outputTarget` param to `render(...)` so it can write to `rtPost` instead of screen.

**Verify:**
- `fx=0` path still shows particles.
- `fx=1` path (once wired) will not blow out due to double‑gamma.

---

## Milestone 3 — New PostFX pipeline (composer + bloom + final tonemap)

### Task 3.1: Create a minimal EffectComposer wrapper (vanilla Three.js)

**Files:**
- Create: `prototypes/crowdfund-void/render/PostFXPipeline.js`

**Implementation (postfx-composer + postfx-bloom):**
- Import from addons:
  - `EffectComposer`
  - `RenderPass`
  - `ShaderPass`
  - `UnrealBloomPass`
- Create an internal fullscreen “input scene”:
  - `scene` with a quad material sampling `uInputTex` (linear).
  - This scene is rendered by `RenderPass`.
- Add `UnrealBloomPass`:
  - Expose controls: `strength`, `radius`, `threshold`, `smoothing` (if supported in version).
  - Use low‑res bloom if possible (composer settings, or lower pass resolution).
- Add a final `ShaderPass` implementing:
  - Exposure
  - ACES filmic tonemap (or Reinhard as fallback)
  - Gamma to sRGB
  - Optional vignette + subtle film grain (very low)

**Suggested defaults (tune later):**
- Exposure: `1.0–1.4`
- Bloom threshold: `0.65` (linear) or `0.75` depending on tonemap
- Bloom strength: `0.8–1.8`
- Bloom radius: `0.35–0.65`

**Verify:**
- Create a temporary test harness inside `PostFXPipeline` (dev only):
  - If `window.location.search` contains `fxTest=1`, render a simple gradient + bright dot and confirm bloom triggers only around the dot.

### Task 3.2: Wire the render graph in `main.js`

**Files:**
- Modify: `prototypes/crowdfund-void/main.js`
- Modify: `prototypes/crowdfund-void/render/RendererRoot.js` (if needed)

**Implementation:**
1. Instantiate `RenderTargets` and `PostFXPipeline` after renderer init.
2. Per frame when `fx=1`:
   - `voidLayer.render(renderer, { target: rtVoid })`
   - `postVoidLayer.renderParticles(renderer, { target: rtPost })`
   - Composite void+post into `rtComposite` using a new pass (Task 3.3).
   - `postfx.setInput(rtComposite.texture)` then `postfx.render(dt)`
   - `postVoidLayer.renderOverlay(renderer)` (after postfx; `renderer.clearDepth()` first)
3. When `fx=0`: keep old `rendererRoot.setLayers([...])` path.

**Verify:**
- `fx=1` produces image; no black screen; no console errors.
- `fx=0` still works.

### Task 3.3: Add a linear composite pass (void ↔ post crossfade)

**Files:**
- Create: `prototypes/crowdfund-void/render/passes/LinearCompositePass.js`

**Shader:**
- Inputs:
  - `sampler2D uVoidTex`
  - `sampler2D uPostTex`
  - `float uMix` (0=void, 1=post)
- Output (linear):
  - `mix(void, post, uMix)`
- Optional: apply a gentle vignette mask in linear (very subtle) to match ref “dark edges”.

**Verify:**
- Transition is smooth and reversible.

---

## Milestone 4 — Make the swarm behave “wind+water + shepherd”

### Task 4.1: Add “shepherd path” buffer (CPU) for richer guidance

**Files:**
- Modify: `prototypes/crowdfund-void/systems/InputController.js`

**Implementation:**
- Maintain a fixed ring buffer of last N pointer positions in stage space:
  - e.g. `N=32`, store `{x,y,t}` in a `Float32Array(N*3)`
- Expose:
  - `input.pointerHistory` (array view) + `input.pointerHistoryCount`

**Verify:**
- DebugHUD can print the newest sample; buffer updates on move.

### Task 4.2: Feed history into the velocity compute shader

**Files:**
- Modify: `prototypes/crowdfund-void/particles/gpgpu/ParticleCompute.js`
- Modify: `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`

**Implementation (particles-gpu + shader-fundamentals):**
- Add uniforms:
  - `int uHistoryCount`
  - `vec4 uHistory[32]` where `.xy = pos`, `.z = time`, `.w = strength`
- In compute:
  - Write the most recent samples (pad unused with far‑away sentinel time)

**Shader behavior (wind+water):**
- Keep curl noise advection, but add *path attraction*:
  - For each particle, find 1–2 closest recent history points (cheap: sample 4–8 evenly spaced points from history, not all 32).
  - Apply attraction toward a point *slightly behind the cursor* to create “pastor” behavior (shepherd leads, flock follows).
  - Add tangential component around the path direction to create “water ribbon”.

**Verify:**
- When cursor moves in a circle, swarm forms a circulating ribbon rather than collapsing to the cursor.

### Task 4.3: Negative space + warmth (art direction)

**Files:**
- Modify: `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`
- Modify: `prototypes/crowdfund-void/render/passes/TrailAccumulationPass.js` (shimmer only)

**Implementation:**
- Ensure there is always a “dark pocket” around cursor:
  - repulsion near cursor stays, but doesn’t explode velocities.
- Warm shimmer should be *visible only in emptiness*:
  - drive shimmer from “darkness” computed from accumulated brightness (already in pass) but cap it hard so it never creates haze.

**Verify:**
- When swarm moves away, background subtly lives (warm micro flicker), but text/UI remain readable.

---

## Milestone 5 — Tiered quality: bloom + trails + particle count

### Task 5.1: Extend `QualityManager` for postfx quality knobs

**Files:**
- Modify: `prototypes/crowdfund-void/systems/QualityManager.js`

**Add fields:**
- `postScale` (e.g. 1.0 full res, 0.75, 0.5)
- `bloomEnabled`
- `bloomScale` (0.5–0.25)
- `trailScale` (already exists in practice; unify)

**Verify:**
- Switching tier updates those values; no exceptions.

### Task 5.2: Hook quality values into `RenderTargets` + `PostFXPipeline`

**Files:**
- Modify: `prototypes/crowdfund-void/main.js`
- Modify: `prototypes/crowdfund-void/render/RenderTargets.js`
- Modify: `prototypes/crowdfund-void/render/PostFXPipeline.js`

**Verify:**
- On mid/low tiers bloom is reduced or disabled; FPS improves.

---

## Milestone 6 — Verification checklist (every PR)

### Task 6.1: Add a manual QA script in `docs/plans` (short)

**Files:**
- Create: `prototypes/crowdfund-void/docs/QA_RENDERING_V2.md`

**Include steps:**
- `?fx=1&debug=1` on desktop: confirm stable exposure, bloom, trails.
- `?tier=mid`: confirm still looks alive, no hard regressions.
- Scroll down/up: confirm reversible; no stale trails overlay on void.
- Hover tiers: color shifts apply and revert.

---

## Notes / decisions (keep consistent)

1. **Do not gamma‑correct inside multiple passes.** One place only (final output pass).
2. **Particles should output HDR-ish values** (e.g. `>1.0` in linear) so bloom has signal; tonemap clamps later.
3. **Manifesto text should be tone-mapped but not bloomed**: render it after bloom, in the same final color space.
4. **Scroll system:** keep current `ScrollOrchestrator` for now. GSAP ScrollTrigger is optional later for nicer pinned sections, but don’t block rendering v2 on it.

---

## Expected report format from Opus (per milestone)

For each milestone, report:
- What changed (files)
- 1 screenshot `fx=1` at mid-scroll + bottom-scroll
- FPS readout from HUD
- Any console warnings/errors

