# 🔊 PROMPT: Sonic Organism — Living Sound System

## Mission
Transform SPHERE's sound from "poor event triggers" into a **living sonic organism** — as complex and alive as the visual particle system.

## Philosophy
> Sound is not a reaction. Sound is the sphere's continuous presence made audible.

The sphere has a **voice, body, memory, and mood**. Its sound should reflect all of these simultaneously.

---

## Architecture: 7 Layers of Sonic Complexity

### Layer 1: SPECTRAL BODY (Additive Synthesis)
**What:** 32+ harmonics forming the sphere's "vocal timbre"
**How:** Each harmonic has independent amplitude, LFO, envelope
**Mapping:**
- Trust level → warm/cold spectral tilt (even/odd harmonic balance)
- Proximity → upper harmonics intensity
- Emotional state → spectral centroid shift

### Layer 2: PULSE NETWORK (Polyrhythmic LFOs)
**What:** Interlocking rhythms that never repeat exactly
**How:** 5 LFOs with irrational ratios (φ, primes)
**Mapping:**
- Master Pulse (60bpm base) → global amplitude
- Breath Cycle (÷3) → spectral movement
- Heartbeat (×φ) → rhythmic accents
- Neural Flicker (×13) → high-freq grain density
- Emotional Swell (÷7) → overall brightness

### Layer 3: GRANULAR MEMBRANE (Touch Texture)
**What:** Cloud of 50-200 micro-grains responding to touch
**How:** Real-time granular synthesis with feedback buffer
**Mapping:**
- Touch X → grain pitch (±2 octaves)
- Touch Y → grain size (5ms-500ms)
- Velocity → grain density (5-200/sec)
- Pressure → grain attack (sharp/soft)
- Duration → grain reverb (dry→wet)
- Ghost Traces → frozen/stretched grains

### Layer 4: FORMANT VOICE (Vocal Modeling)
**What:** Almost-speech, vowel-like sounds
**How:** Parallel bandpass filters modeling vocal tract (F1-F5)
**Mapping:**
- PEACE → [a] open, soft
- CURIOSITY → [i] rising
- FEAR → [ɪ] constricted, tremolo
- TRUST → [o] warm
- TRAUMA → noise only, no voice
- Gestures → consonant-like events

### Layer 5: SPATIAL FIELD (3D Audio)
**What:** Sound positioned in space around user
**How:** Stereo panning, HRTF for headphones, convolution reverb
**Mapping:**
- Touch point → sound position follows finger
- Trust → room size (claustrophobic ↔ open)
- State → reverb character

### Layer 6: MEMORY RESONANCE (Evolving Sound)
**What:** Sound changes based on relationship history
**How:** Persistent parameters that unlock over time
**Triggers:**
- First visit = simple, monophonic, curious
- Positive history = richer harmonics, warmer
- Trauma = narrower spectrum, defensive
- Long-term = unique signature develops

### Layer 7: GENRE MORPHING (Style Crossfade)
**What:** Blend between sonic worlds based on state
**How:** 4 poles (Ambient, Industrial, Organic, Synthetic), crossfade
**Mapping:**
- Trust → Ambient ↔ Industrial
- Velocity → Organic ↔ Synthetic
- State → rotation in style space

---

## Implementation Priority

### Phase 1: Foundation (This Session)
1. **Refactor SoundManager** → `SonicOrganism.js`
2. Implement **Spectral Body** (32 harmonics, modulated)
3. Implement **Pulse Network** (5 LFOs with irrational ratios)
4. Wire to `main.js` animation loop: `sonicOrganism.update(sphereState)`

### Phase 2: Touch Layer
1. Implement **Granular Membrane** using AudioWorklet
2. Connect to InputManager touch events
3. Map all touch parameters

### Phase 3: Voice & Space
1. Implement **Formant Voice** (5-filter vocal tract)
2. Implement **Spatial Field** (panning, reverb)

### Phase 4: Memory & Style
1. Connect to MemoryManager for **Memory Resonance**
2. Implement **Genre Morphing** crossfade system

---

## Technical Notes

### Current State
- `SoundManager.js` exists with basic event-triggered sounds
- Ambient hum at 60Hz, gesture one-shots
- No continuous modulation, no spatial, no granular

### Key Files
- `/prototype-sphere/src/SoundManager.js` — current implementation
- `/prototype-sphere/src/Sphere.js` — calls sound triggers
- `/prototype-sphere/src/main.js` — animation loop

### Web Audio Constraints
- AudioWorklet needed for granular (50-200 grains)
- Pre-computed wavetables for efficiency
- Target: 60fps without audio glitches

---

## Success Criteria

| Current | Target |
|---------|--------|
| Sound plays on events | Sound flows continuously |
| Same sound every time | Sound varies with context |
| No spatial awareness | Sound follows touch in space |
| No memory | Sound evolves with relationship |
| One "genre" | Fluid style morphing |
| ~5 oscillators | ~350+ oscillators |
| "Бедный" | "Живой организм" |

---

## Reference
- Conversation: Discussed in depth on 2026-01-08
- Philosophy: Sound as breath, not button
- Inspiration: Theremin, singing bowls, binaural beats, granular synthesis
