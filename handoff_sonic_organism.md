# Handoff: Sonic Organism

## Status: READY FOR IMPLEMENTATION

## Context
This session (2026-01-08) established the vision for transforming SPHERE's sound system from event-triggered samples to a living sonic organism.

### Problem Statement
> "Звук бедный, реально бедный. Это не что-то такое же живое, как переливающиеся частицы."

Current sound: triggers play → silence.
Target sound: continuous, breathing, evolving presence.

### Key Insight
Particles work like this:
```
cursor position → continuous parameters → render every frame
```

Sound should work identically:
```
sphere state → continuous parameters → synthesize every frame
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────┐
│                     SONIC ORGANISM                          │
├─────────────────────────────────────────────────────────────┤
│  L7: Genre Morphing      │ Ambient ↔ Industrial ↔ Organic  │
│  L6: Memory Resonance    │ Sound evolves with history       │
│  L5: Spatial Field       │ 3D positioning, reverb           │
│  L4: Formant Voice       │ Vowel-like presence             │
│  L3: Granular Membrane   │ Touch texture (50-200 grains)   │
│  L2: Pulse Network       │ Polyrhythmic LFOs               │
│  L1: Spectral Body       │ 32 harmonics, additive          │
└─────────────────────────────────────────────────────────────┘
                               ↑
                    update(sphereState) every frame
```

---

## Technical Context

### Current Files
| File | Role |
|------|------|
| `src/SoundManager.js` | 546 lines, event-triggered sounds |
| `src/Sphere.js` | Calls `soundManager.playGestureSound()` |
| `src/main.js` | Animation loop, could call `sonicOrganism.update()` |

### Current SoundManager Methods
- `_initAmbientHum()` — 60Hz drone, LFO modulated
- `playGestureSound(gesture, intensity)` — one-shots
- `playRecognitionHum()` / `stopRecognitionHum()` — phase sounds
- `startOsmosisBass()` / `setOsmosisDepth()` — hold sound

### What Needs to Change
1. **New file: `SonicOrganism.js`** — main class
2. **New file: `GranularWorklet.js`** — AudioWorklet for grains
3. **Modify `main.js`** — call `sonicOrganism.update(state)` in loop
4. **Modify `Sphere.js`** — pass continuous state, not events

---

## Implementation Phases

### Phase 1: Foundation
- Create `SonicOrganism.js`
- Implement Spectral Body (32 harmonics)
- Implement Pulse Network (5 LFOs)
- Wire to animation loop

### Phase 2: Touch
- Implement Granular Membrane (AudioWorklet)
- Connect touch parameters

### Phase 3: Voice & Space
- Formant Voice (5 filters)
- Spatial Field (panning, reverb)

### Phase 4: Memory & Style
- Memory Resonance (persistent evolution)
- Genre Morphing (style crossfade)

---

## Verification Approach
- **Browser testing**: Open prototype, interact, listen
- **Console logging**: Log parameter values to verify continuous updates
- **Performance**: Monitor frame rate (target 60fps)
- **A/B comparison**: Toggle old/new sound systems

---

## References
- Full vision: `prompt_sonic_organism.md`
- Current sound: `src/SoundManager.js`
- Gesture system: `prompt_gesture_expansion.md`
