# KLYAP v15 Integration Plan

> **Цель**: Интеграция — медленнее, богаче, атмосфернее  
> **Стратегия**: Фазовый подход, новый прототип `/klyap-v15/`

---

## Phased Rollout

| Phase | Scope | Effort | Risk |
|-------|-------|--------|------|
| **1** | Tempo + Meta Text | 🟢 Low | 🟢 Low |
| **2** | v13 Effects + Ambient Audio | 🟡 Medium | 🟡 Medium |
| **3a** | New Fragments: vivid + flesh (14) | 🟡 Medium | 🟡 Medium |
| **3b** | New Fragments: bruise + glow (11) | 🟡 Medium | 🟢 Low |
| **4** | Full Audio Layer | 🟡 Medium | 🟢 Low |

---

## Phase 1: Tempo + Meta Text

### 1.1 Interval Changes
| Parameter | v14 | v15 |
|-----------|-----|-----|
| Sparse | 500ms | **1200ms** |
| Hook | 150ms | **400ms** |
| Overwhelm | 50ms | **180ms** |
| Lifetime | 1.2-2s | **3-5s** |
| Max frags | 35 | **18** |
| Burst | 25% | **8%** |

### 1.2 Meta Text Upgrade
```css
.meta-message {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2rem, 5vw, 4rem);
    animation: textBreathe 6s ease-in-out infinite;
}
```

### 1.3 Displacement Softening
- Reduce max intensity: 150 → **80**
- Slower decay: 0.85 → **0.92**

---

## Phase 2: v13 Effects + Ambient Audio

### 2.1 Organic Bubbles
```css
.meta-message {
    border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%;
    animation: bubbleMorph 8s infinite, bubbleBreathe 4s infinite;
}
```

### 2.2 Breathing Animations
- Vignette breathing (slower)
- Text opacity pulse
- Fragment scale micro-oscillation

### 2.3 Dissociation Text Flow
- 0-20: Single words
- 20-40: Body awareness
- 40-60: "Who is reading?"
- 60-80: First person shift

### 2.4 Ambient Audio (Early Integration)
- Low-frequency drone loop (60-80 Hz)
- Breathing rhythm sync with vignette
- Volume tied to scroll depth (0.1 → 0.4)

---

## Phase 3a: New Fragments — vivid + flesh (14)

### Layer Distribution
| Layer | Count | Palette |
|-------|-------|---------|
| vivid | 8 | fuchsia, electric blue, acid green |
| flesh | 6 | skin tones + anomalies |

### Generation Pipeline
1. Prepare prompts per layer
2. Generate via Nano Banana Pro
3. Crop + transparency processing
4. Sort into layer folders
5. **Test integration before Phase 3b**

---

## Phase 3b: New Fragments — bruise + glow (11)

### Layer Distribution
| Layer | Count | Palette |
|-------|-------|---------|
| bruise | 6 | purple → yellow → green |
| glow | 5 | bioluminescent edges |

### Generation Pipeline
Same as 3a, builds on verified integration.

---

## Phase 4: Full Audio Layer

- Layer transition sounds (phase shifts)
- Breathing ambient (expand from 2.4)
- Meta message whispers
- Heartbeat at overwhelm phase

---

## File Structure

```
prototypes/
├── klyap-v14/     # Preserved (HELL mode)
└── klyap-v15/     # NEW (Integration)
    └── index.html
```

---

## Verification Criteria

### Phase 1
- [ ] Record 30s screencap of v14 and v15
- [ ] Side-by-side tempo comparison (v15 = "hypnotic" vs v14 = "frantic")
- [ ] Meta text readability: can read full message before fade

### Phase 2
- [ ] bubbleMorph animation @ 60fps (no jank)
- [ ] CPU usage < 25% during idle scroll
- [ ] Ambient audio plays on first scroll interaction
- [ ] Volume ramps correctly with scroll depth

### Phase 3a
- [ ] All 14 fragments load without 404
- [ ] Layer distribution visible (not all from one layer)
- [ ] Transparency renders correctly (no white edges)

### Phase 3b
- [ ] All 11 fragments load without 404
- [ ] "glow" fragments visible against dark background
- [ ] Total 25 new fragments integrated seamlessly

### Phase 4
- [ ] Audio transitions smooth (no clicks/pops)
- [ ] Whispers audible but not jarring
- [ ] Full experience test: 2-minute scroll session
