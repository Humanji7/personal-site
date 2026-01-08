# Handoff: Sonic Organism

## Status: PHASE 1 COMPLETE ✅ → PHASE 2 READY

## What Was Done (Phase 1)

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

## What's Next (Phase 2-4)

### Phase 2: Granular Membrane
- **50-200 micro-grains** responding to touch
- AudioWorklet for real-time grain synthesis
- Touch X/Y → pitch, size, density

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
- ✅ Browser test — no errors
- ✅ 60fps maintained
- ✅ Sound continuous from start

## Open Questions for Phase 2
1. Should granular grains be sampled (buffer) or synthesized (pure tones)?
2. Touch velocity — how to detect? (differentiate position over time)
3. AudioWorklet — browser support on mobile?
