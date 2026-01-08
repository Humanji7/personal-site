# Prompt 1: Recognition Sound & Visual Tuning

> [!NOTE]
> **STATUS: COMPLETED** ✅  
> Recognition sound has been implemented and verified (2026-01-08). See `handoff_hold_to_recognize.md` for final status.

## Objective
The core logic for "Hold-to-Recognize" is implemented, but it lacks auditory feedback and visual fine-tuning. Your task is to complete the `SoundManager.js` integration and verify the visual sequence in the browser.

## Context
- `Sphere.js` triggers `soundManager.playRecognitionHum(intensity)` and `soundManager.setAmbientIntensity(volume)`.
- The `RECOGNITION` phase has two sub-phases: `PAUSE` (0.3s) and `RECOGNITION` (0.7s+).
- The `ParticleSystem.js` has `setTouchGlow(pos, intensity)` and `setPulse(amount)` methods ready.

## Requirements
1. **Implement `SoundManager.js` updates**:
    - Add `playRecognitionHum(intensity)`: A low, dark, rising frequency hum that intensifies with `intensity`.
    - Add `stopRecognitionHum()`: Graceful fade-out.
    - Implement `setAmbientIntensity(volume)`: Fades the main ambient background hum to 0 during the PAUSE sub-phase.
2. **Visual Verification**:
    - Run the dev server.
    - Use the browser tool to bypass the "Click to Enter" overlay.
    - Perform a "Hold" gesture on the Sphere.
    - **Verify**:
        - Gaze locks onto the finger.
        - Particles freeze during PAUSE.
        - Ambient sound fades to silence.
        - Warm glow appears at touch point during RECOGNITION sub-phase.
        - Pulse (heartbeat) starts after PAUSE.
3. **Refinement**:
    - Tune the pulse speed in `ParticleSystem.js` (currently synced to 80bpm in shader).
    - Tune the glow brightness if it's too subtle or too strong.
