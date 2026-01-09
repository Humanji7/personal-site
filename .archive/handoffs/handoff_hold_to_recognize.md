# Handoff: Hold-to-Recognize (Stage 7, Internal Logic Complete)

## Current Status
We have successfully implemented the core "patient presence" mechanic. The Sphere now recognizes a long-press (Hold) as an intentional gesture of connection, distinct from a Poke (pain).

### ✅ Accomplishments
- **`InputManager.js`**: Now detects `isHolding` and `holdDuration`. Handles drift (reset if finger moves too much).
- **`Sphere.js`**: 
    - Added `PHASE.RECOGNITION`.
    - **Calming Hold**: Holding the Sphere now actively reduces `traumaLevel` and `tensionTime` across any phase.
    - **Logic gating**: Once `holdDuration > 0.5s` and `trauma < 0.5`, the Sphere enters RECOGNITION.
    - **Sequence**: Orchestrates `PAUSE` (freezing everything) and `RECOGNITION` (pulsating, glowing).
- **`ParticleSystem.js`**: 
    - New uniforms: `uTouchGlowPos`, `uTouchGlowIntensity`, `uPulse`.
    - Shaders: Implemented focused warm-white glow at the touch point and size pulsation for the "heartbeat" effect.
- **`Eye.js`**: 
    - Added `lockGaze(worldPos)` and `unlockGaze()`. During Hold, the Eye stares directly at the user's finger.

- **`SoundManager.js`**: 
    - New methods: `playRecognitionHum()`, `setRecognitionIntensity()`, `stopRecognitionHum()`.
    - Recognition hum: Low dark drone (40Hz dual oscillators with LFO) that rises in frequency (40→80Hz), volume (0.2→0.4), and LFO speed (0.5→2Hz) during RECOGNITION phase.
    - Ambient fade: Uses `setAmbientIntensity()` to fade ambient sound during PAUSE phase.

### ❌ Incomplete / Next Steps
- **Transition**: The final "unfolding" (Phase 3) and transition to KLYAP room (Phase 4) are not yet started.

## Files Modified
- `src/InputManager.js`
- `src/Sphere.js`
- `src/ParticleSystem.js`
- `src/Eye.js`
- `src/SoundManager.js`

## Implementation Plan for Next Session
1. **Threshold Transition**: Implement the final shrink/unfold animation leading to the black screen and KLYAP.
