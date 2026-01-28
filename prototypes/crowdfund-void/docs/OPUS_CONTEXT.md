# Opus Context — Post‑Void Rendering & Swarm

This is a compact, Claude‑Code‑friendly briefing for implementing the next step of Post‑Void without relying on “skills” tooling.

## Where we are

- Prototype entry: `prototypes/crowdfund-void/index.html`
- Main loop: `prototypes/crowdfund-void/main.js`
- Rendering:
  - `prototypes/crowdfund-void/render/RendererRoot.js`
  - `prototypes/crowdfund-void/render/layers/VoidLayer.js`
  - `prototypes/crowdfund-void/render/layers/PostVoidLayer.js`
  - `prototypes/crowdfund-void/render/passes/TrailAccumulationPass.js`
- Particles:
  - `prototypes/crowdfund-void/particles/ParticleSystem.js`
  - `prototypes/crowdfund-void/particles/gpgpu/ParticleCompute.js`
  - `prototypes/crowdfund-void/particles/gpgpu/velocity.frag`
  - `prototypes/crowdfund-void/particles/shaders/render.vert`
  - `prototypes/crowdfund-void/particles/shaders/render.frag`
- Scroll orchestration: `prototypes/crowdfund-void/systems/ScrollOrchestrator.js`
- Quality tiering: `prototypes/crowdfund-void/systems/QualityManager.js`

Canonical implementation plan: `docs/plans/2026-01-28-post-void-rendering-v2.md`

## The problem we’re solving now (in one sentence)

Move from “ad‑hoc additive glow that can blow out” to a *controlled, filmic render pipeline* (linear buffers → composite → bloom → tonemap → sRGB) while keeping the swarm “wind+water + shepherd cursor” feel and reversible scroll.

## Non‑negotiable invariants (avoid the classic traps)

### 1) One place for output conversion

- All intermediate render targets store **linear** color.
- **Exactly one** place converts to display space (sRGB gamma) and performs tonemapping: the final output pass to screen.
- Do **not** apply gamma/tonemap inside accumulation passes *and again* at the end (that’s how we get white screens / crushed blacks).

### 2) Bloom ordering and signal

- Bloom should run on a buffer that still has headroom (HDR‑ish linear values).
- Tonemap comes **after** bloom (or you risk flattening highlights before the bloom threshold sees them).
- Avoid “bloom fog”: set a threshold that isolates the brightest energy and keep strength moderate.

### 3) Reversible scroll must not ghost

- When leaving post‑void (presence ~0), reset the trail buffers so they don’t imprint onto the void on scroll‑back.

### 4) Performance constraints

- Fill‑rate is the silent killer: big point sprites + additive blending can tank FPS.
- Keep trails/bloom at reduced resolution (tier‑dependent), upscale later.
- Prefer GPGPU sim when available (WebGL2 + float/half‑float renderable).

## Target render graph (what we’re building)

```
VoidLayer.scene  ──render──► RT_void (linear)
PostVoid particles ──accum lowres──► RT_trailsLow (linear)
RT_trailsLow ──upsample──► RT_post (linear)
RT_void + RT_post + transition ──composite──► RT_composite (linear)
RT_composite ──postfx (bloom + tonemap + gamma)──► Screen
Overlay (manifesto text) ──render after postfx──► Screen (crisp)
```

Key idea: particles/trails feed RT_post; the *only* screen‑space conversion happens once, at the very end.

## Swarm feel (art direction translated to mechanics)

We want: autonomous but “shepherded” by cursor; fluid between wind and water; negative space that feels warm/alive.

Implementation principles:
- Base advection: curl noise “rivers” (already present) with stable damping.
- Shepherding: not “pull everything to cursor”, but “follow the recent cursor path”.
  - Add a small ring buffer of recent pointer positions.
  - Attract particles toward points *slightly behind* the pointer direction.
  - Add a tangential component to make ribbon‑like flow instead of collapse.
- Negative space:
  - Maintain a repulsion pocket around cursor (no hard singularities).
  - Warm shimmer only where accumulated brightness is low (cap hard so it never becomes fog).

## Current knobs that must remain stable

- Intensity toggle (Calm/Intense): stored in `localStorage` key `pv-intensity`.
  - Calm: faster decay, less aggression.
  - Intense: longer trails, stronger flow.
- Tier hover/click tint hook:
  - `pv-tier-hover` / `pv-tier-click` events drive `uTier` tint in particle shader.
  - Keep this working; it’s the hook for later “tier pulls different colors” behavior.

## Minimal dev workflow

From `prototypes/crowdfund-void/`:

1) Serve:
- `python3 -m http.server 8080`

2) Open:
- `http://127.0.0.1:8080/?debug=1`

Recommended checks:
- `?tier=mid` (ensure it doesn’t collapse)
- Scroll to bottom, then scroll back up (ensure no trail ghosting on void)

## References (official docs only)

- Three.js docs: https://threejs.org/docs/
- EffectComposer: https://threejs.org/docs/#examples/en/postprocessing/EffectComposer
- UnrealBloomPass: https://threejs.org/docs/#examples/en/postprocessing/UnrealBloomPass
- GPUComputationRenderer: https://threejs.org/docs/#examples/en/misc/GPUComputationRenderer

## Reporting format (required)

At the end of each milestone:
- Changed files list
- 2 screenshots: mid‑scroll and bottom‑scroll with `?fx=1&debug=1`
- FPS from HUD
- Console warnings/errors (if any)
- What you plan to do next (next milestone)

