# Prompt: Finish Stage 6 (Mobile & Sound)

## Context
SPHERE prototype is in **Stage 6 (Deep Interaction)**.
- **Done**: Gesture recognition (stroke/poke/orbit/tremble), dynamic uSize (density based on tension), cursor proximity effects, HSL temporal transitions.
- **Remaining**: Mobile touch adaptation and Sound feedback.

## Objective
Complete Phase 4 of the current stage by implementing mobile support and audio feedback.

## Tasks

### 1. Mobile Touch Adaptation
- **InputManager.js**: Add `touchstart`, `touchmove`, `touchend` listeners.
- Ensure `isIdle` and `velocity` work correctly with touch (prevent default context menu/scrolling on the canvas).
- Map touch pressure (if available) or touch area change to potential emotional signals.

### 2. Sound Integration
- Implement a `SoundManager.js` (using Web Audio API).
- **Peace Phase**: Procedurally generated low-frequency ambient "breathing" or "hum".
- **Gesture Feedback**:
    - `stroke`: Soft, high-frequency "glass chime" or "rustle".
    - `poke`: Sharp "click" or "thump" followed by a decaying resonant tail.
    - `tension`: Rising pitch or increasing volume of the ambient hum.
    - `bleeding`: Grainy, "evaporating" static sound.

### 3. Polish & Meta-Brain Update
- Update `SPHERE_STATUS.md` to reflect full Stage 6 completion.
- Final performance check on mobile (target ≥30 FPS, desktop ≥60 FPS).

## Verification
- Test in browser using "Mobile mode" in DevTools.
- Verify sound triggers correctly with gestures.
- Check `traumaLevel` influence on sound pitch/texture.

---

**Style**: Maintain the interdisciplinary approach (biologist/artist/informatician). Sound should feel like it's coming from inside the sphere's "body", not like a UI button click.
