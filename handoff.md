# Session Handoff: SPHERE Prototype
**Date:** 2026-01-07 19:30 MSK

## Current State
The Sphere prototype is in **Stage 4 - Life & Depth**, with all four features implemented. User changed the color palette from Purple→Ember to **Cosmic Blue→Nova Gold** (240°→45°). The **Goosebumps effect feels too jerky** and needs creative rethinking.

## Last Completed (This Session)
- ✅ **Aura**: Breath-synchronized glow (70-100% alpha)
- ✅ **Bokeh**: Depth-based fade (65-100% alpha, near→far)
- ✅ **Heartbeat**: Subtle 80 bpm pulsation layered on breathing
- ⚠️ **Goosebumps**: Implemented but feels "дёрганая" (jerky) — **NEEDS RETHINK**

## Color Palette Update
User changed baseline from Purple to **Deep Blue (HSL 0.66, 0.60, 0.50)** with a new 6-stop gradient journey:
```
Deep Blue (240°) → Purple (275°) → Magenta (310°) → Pink (345°) → Coral (15°) → Nova Gold (45°)
```

## Problem: Goosebumps
Current implementation modulates Perlin Noise uniforms:
- `uNoiseAmount`: 0.08 → 0.15
- `uNoiseSpeed`: 0.3 → 0.9

This creates a **choppy, jittery** surface instead of organic tension. See `prompt_goosebumps_brainstorm.md` for ideas.

## Key Files
- `prototype-sphere/src/ParticleSystem.js` — Shaders with Aura, Bokeh, Heartbeat, Noise
- `prototype-sphere/src/Sphere.js` — Emotional state machine + Goosebumps modulation
- `prototype-sphere/src/InputManager.js` — Mouse/touch, velocity, idle detection

## Dev Server
```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run dev
# Currently running on http://localhost:5178
```

## Knowledge Items
- `personal_site_as_journey` — Project philosophy, BMAD methodology
- `high_performance_web_graphics_patterns` — Three.js patterns, shader tricks
