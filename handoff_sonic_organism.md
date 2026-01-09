# Handoff: Sonic Organism

## Status: PHASE 2 TESTED ✅ → READY FOR PHASE 3

> [!NOTE]
> **Diagnostic Complete (2026-01-08)**
> Granular Membrane (Layer 3) was tested in browser - **NO HANG** detected.
> - Browser test with mouse/hold interactions: stable
> - Console logs: Granular membrane initialized successfully
> - No JS errors, no performance issues
> 
> **Next:** Real device testing (mobile touch) + continue to Layers 4-7

## Prompt для новой сессии

**Файл:** [`prompt_sonic_organism_continue.md`](file:///Users/admin/projects/personal-site/prompt_sonic_organism_continue.md)

---

## What Was Done (Phase 1) ✅

### New File: `SonicOrganism.js`
- **32 harmonics** — additive synthesis (Layer 1: Spectral Body)
- **5 polyrhythmic LFOs** — φ, primes, irrational ratios (Layer 2: Pulse Network)
- `update(sphereState, elapsed)` called every frame from `main.js`

### State Mappings Implemented
| State | Sound Effect |
|-------|--------------|
| `trustIndex` | Warm/cold spectral tilt (even/odd harmonics) |
| `proximity` | Upper harmonics boost |
| `colorProgress` | Overall brightness |
| `pulses.master/breath/heartbeat/neural/swell` | Polyrhythmic amplitude modulation |

### Integration
- `main.js` imports and initializes `SonicOrganism`
- Shares `AudioContext` with existing `SoundManager`
- Both systems coexist (continuous + event-triggered)

---

## What Was Done (Phase 2) ✅ TESTED

### New File: `public/worklets/GranularProcessor.js`
- **200 pre-allocated grains** (recycling pool pattern)
- **Circular feedback buffer** (96000 samples = 2 sec @ 48kHz)
- AudioWorklet processor for real-time granular synthesis

### Integration in `SonicOrganism.js`
- `_initGranularMembrane()` — loads worklet, creates AudioWorkletNode
- `_updateGranularMembrane(touch, ghostTraces)` — sends parameters via postMessage
- Audio routing: `spectralGain → granularNode → granularGain → masterGain`

### Touch-to-Sound Mappings
| Touch | Sound Effect |
|-------|--------------|
| X position | Pitch (±2 octaves) |
| Y position | Grain size (5-500ms) |
| Velocity | Density (5-200 grains/sec) |
| Intensity | Attack sharpness |
| Ghost traces | Freeze mode |

### Diagnostic Results (2026-01-08)
**Status:** Stable in desktop browser testing
- ✅ Granular membrane initialized without errors
- ✅ Mouse interactions (hold, movement) work smoothly
- ✅ No console errors or performance warnings
- ⏳ **TODO:** Test on real mobile device with touch gestures

**Potential optimizations if issues arise:**
1. Limit density cap (currently 5-200 grains/sec)
2. Throttle postMessage frequency (currently every frame @ 60fps)
3. Simplify interpolation or grain envelope calculations

---

## What's Next (Phase 3-4)

### Phase 2: Granular Membrane ✅ DONE
- ✅ **50-200 micro-grains** responding to touch
- ✅ AudioWorklet for real-time grain synthesis
- ✅ Touch X/Y → pitch, size, density
- ⏳ Final mobile device verification needed

### Phase 3: Formant Voice + Spatial Field
- **Vowel-like sounds** via parallel bandpass filters (F1-F5)
- Peace → [a], Curiosity → [i], Fear → [ɪ], Trust → [o]
- 3D panning following finger position

### Phase 4: Memory Resonance + Genre Morphing
- Sound evolves with relationship history
- Crossfade between 4 style poles (Ambient/Industrial/Organic/Synthetic)

---

## Technical Context

### Files
| File | Role |
|------|------|
| `src/SonicOrganism.js` | **NEW** — Living sound engine (340 lines) |
| `src/SoundManager.js` | Event-triggered sounds (unchanged) |
| `src/main.js` | Animation loop, calls `sonicOrganism.update()` |

### Current Architecture
```
main.js animate loop
       ↓
sonicOrganism.update({
    trustIndex,
    proximity,
    colorProgress,
    emotionalState,
    isActive
}, elapsed)
       ↓
Layer 1: Spectral Body (32 harmonics)
Layer 2: Pulse Network (5 LFOs)
Layer 3-7: TODO
```

---

## Verification Done

### Phase 1 (Spectral + Pulse)
- ✅ Browser test — no errors
- ✅ 60fps maintained
- ✅ Sound continuous from start

### Phase 2 (Granular Membrane)
- ✅ Diagnostic session (2026-01-08)
  - Granular membrane initialized successfully
  - No page hang with mouse interactions
  - No console errors
- ⏳ **TODO:** Mobile device testing with real touch gestures

## Open Questions for Phase 3-4
1. Formant filtering — optimal Q factor range for emotional expressiveness?
2. Spatial panning — HRTF support on mobile browsers (iOS Safari, Android Chrome)?
3. Performance budget — can we maintain 60fps with 5 active layers?
4. Vowel transitions — linear or exponential frequency interpolation?
