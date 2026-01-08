# Prompt 2: The Threshold Transition (to KLYAP)

## Objective
Finalize the "Hold-to-Recognize" sequence by implementing the transition to the first room: **KLYAP**.

## Context
Conceptually, the gesture sequence is:
1. **Hold** (Intention) → 2. **Pause** (She hears) → 3. **Recognition** (She understands) → 4. **Threshold** (Deep Transition).
We have steps 1-3. You need to implement step 4.

## Requirements
1. **Define Unfolding Phase**:
    - In `Sphere.js`, add logic for when `PHASE.RECOGNITION` completes its timers (or a new `PHASE.TRANSITION`).
    - **Visuals**:
        - The Sphere should stop breathing and start to "contract" or "unfold" (e.g., set `mesh.scale` and `baseSize` to 0 rapidly).
        - Particles should rapidly accelerate away or towards the center (using `repulsion` or a new effect).
        - Fade to black.
2. **Display Manifest Text**:
    - Once the screen is black, display the phrase: **"Исправление — это ложь. Правда была в ошибке."**
    - The text should fade in slowly and stay for 2-3 seconds.
3. **Room Transition**:
    - After the text fades out, trigger the transition to the `KLYAP` room state.
    - Since this is a prototype, this might involve simply stopping the Sphere rendering and logging "Entering KLYAP".
    - Check `main.js` for how to swap the active scene component or manage the transition state.

## Aesthetic
The transition should feel like a "breach" or a "quiet explosion." It's not a technical loading screen; it's a narrative threshold.
- Sound: A deep resonant thud or silence following the rising hum.
- Motion: Violent but controlled contraction.
