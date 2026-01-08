# 🔊 PROMPT: Sonic Organism — Phase 2 (Granular Membrane)

## Mission
Implement **Layer 3: Granular Membrane** — tactile "skin" that responds to touch with 50-200 micro-grains.

## Context
Phase 1 complete:
- `SonicOrganism.js` exists with L1 (Spectral Body) + L2 (Pulse Network)
- Continuous `update()` loop running every frame
- See `handoff_sonic_organism.md` for full state

---

## Layer 3: Granular Membrane

### What
Cloud of 50-200 micro-grains responding to touch. Creates texture, not melody.

### How
Real-time granular synthesis using **AudioWorklet** for performance:
- Source: feedback buffer (records organism's own output)
- Grains: 5ms-500ms snippets, pitched, triggered in clouds

### Mapping
| Touch Parameter | Grain Effect |
|-----------------|--------------|
| Touch X | Grain pitch (±2 octaves) |
| Touch Y | Grain size (5ms-500ms) |
| Velocity | Density (5-200 grains/sec) |
| Pressure | Attack sharpness |
| Duration | Reverb (dry→wet) |
| Ghost Traces | Frozen/stretched loops |

---

## Implementation

### Step 1: Create AudioWorklet
**New file:** `src/worklets/GranularWorklet.js`
- `GranularProcessor` class extending `AudioWorkletProcessor`
- Receives grain parameters via `port.postMessage()`
- Manages grain pool (spawn, play, recycle)

### Step 2: Extend SonicOrganism.js
- Add `_initGranularMembrane()` method
- Register and create AudioWorklet node
- Add `_updateGranularMembrane(touchState)` method

### Step 3: Connect Touch Input
- In `main.js`, pass touch position to `sonicOrganism.update()`
- Add `touchX`, `touchY`, `touchVelocity` to state object

---

## Technical Notes

### AudioWorklet Registration
```javascript
await audioContext.audioWorklet.addModule('/src/worklets/GranularWorklet.js')
const granularNode = new AudioWorkletNode(audioContext, 'granular-processor')
```

### Grain Structure
```javascript
{
    startTime: number,
    duration: number,    // 5-500ms
    pitch: number,       // 0.25-4.0 (playback rate)
    attack: number,      // 0.01-0.2
    decay: number,
    position: number     // buffer read position
}
```

### Performance
- Max 200 concurrent grains
- Grain pool with recycling (no GC)
- Target: <1ms per audio frame

---

## Verification
- [ ] Grains audible when touching sphere
- [ ] Pitch shifts with X position
- [ ] Density increases with velocity
- [ ] Ghost traces create frozen grain loops
- [ ] Performance: 60fps, no audio glitches

---

## References
- `src/SonicOrganism.js` — add L3 here
- `src/InputManager.js` — touch state source
- `handoff_sonic_organism.md` — architecture context
