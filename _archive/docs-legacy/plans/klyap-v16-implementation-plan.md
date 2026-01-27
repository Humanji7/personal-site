# KLYAP v16 Implementation Plan

> **Цель**: Живой атмосферный фон + расширенная вариативность + мерзкий particle smear  
> **Статус**: Ready for execution

---

## Phase Order

| Phase | Feature | Effort |
|-------|---------|--------|
| **A** | Breathing Membrane (noticeable) | 🟡 Medium |
| **B** | +20 New Fragments | 🟡 Medium |
| **C** | Particle Smear Transitions | 🟡 Medium |
| ~~D~~ | ~~Wind Sweep~~ | ⏸️ Deferred |

---

## Phase A: Breathing Membrane

### Config (Noticeable, Not Subtle)
```javascript
const MEMBRANE_CONFIG = {
    blobCount: 5,
    baseOpacity: 0.6,       // заметный, не еле видный
    saturation: 40,         // насыщенный
    lightness: 15,          // тёмный но видимый
    breathSpeed: 0.25,      // медленное дыхание
    cursorInfluence: 0.08   // реагирует на мышь
};
```

### z-index Stack
```
membrane-canvas: 1  (background — живой)
#stream:         10 (fragments)
#vignette:       100 (поверх всего)
```

### Source
Port from `prototypes/klyap-v13/index.html`:
- Lines 976-1004: `initBlobs()`
- Lines 1101-1180: `draw()` blob rendering

---

## Phase B: +20 New Fragments

### Distribution
| Layer | Add | Total After |
|-------|-----|-------------|
| intimate | +3 | 10 |
| mirror | +3 | 9 |
| visceral | +3 | 9 |
| noise | +2 | 6 |
| **vivid** (new) | +5 | 5 |
| **flesh** (new) | +4 | 4 |
| **TOTAL** | +20 | 43 |

### Generation Prompts

#### intimate (+3)
```
Isolated fragment on pure black background.
Xerox scan aesthetic, photocopy artifact grain.
Subject: close-up of wrinkled fabric or skin fold.
Uncomfortable intimacy. No composition, raw crop.
```

#### mirror (+3)
```
Isolated fragment on pure black background.
Glitched, inverted colors, digital corruption.
Subject: distorted face reflection, broken mirror edge.
Uncanny valley. Photocopy scan look.
```

#### visceral (+3)
```
Isolated fragment on pure black background.
Organic textures: meat, membrane, vein-like patterns.
Red/purple tones, wet appearance.
Medical scan aesthetic, disturbing close-up.
```

#### noise (+2)
```
Isolated fragment on pure black background.
Pure visual noise: static, grain, interference patterns.
Grayscale, high contrast, texture-only.
```

#### vivid (+5) — NEW LAYER
```
Isolated fragment on pure black background.
Sickly bright colors: fuchsia, acid green, electric blue.
Subject: artificial textures, plastic, synthetic materials.
Oversaturated, cheap neon aesthetic.
```

#### flesh (+4) — NEW LAYER
```
Isolated fragment on pure black background.
Skin tones with anomalies: bruises, veins, pores.
Macro photography look, uncomfortable detail.
Photocopy scan grain, desaturated flesh.
```

### Processing Pipeline
```bash
# After generation:
./scripts/process-klyap-fragments.sh
# → crops, adds transparency, outputs to assets/klyap-v16/fragments/
```

---

## Phase C: Particle Smear Transitions

### Concept
При появлении нового фрагмента — **мерзкое размазывание частиц** между предыдущим и новым:
- Старый фрагмент "растаскивается" на частицы
- Частицы летят к позиции нового фрагмента
- Новый фрагмент "собирается" из частиц

### Technical Approach

#### Option 1: CSS Dissolve + Reassemble
```css
.fragment.dissolving {
    animation: particleDissolve 0.8s ease-out forwards;
    filter: blur(8px) url(#displacement-heavy);
}

@keyframes particleDissolve {
    0% { 
        transform: scale(1); 
        opacity: 1;
        filter: blur(0);
    }
    50% { 
        transform: scale(1.3) skewX(15deg); 
        opacity: 0.6;
        filter: blur(12px);
    }
    100% { 
        transform: scale(0.1) translateX(var(--smear-dir)); 
        opacity: 0;
        filter: blur(20px);
    }
}
```

#### Option 2: Canvas Particle System
```javascript
// При исчезновении фрагмента
function smearFragment(fragmentEl, targetX, targetY) {
    const rect = fragmentEl.getBoundingClientRect();
    const particles = [];
    const PARTICLE_COUNT = 30;
    
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: rect.left + Math.random() * rect.width,
            y: rect.top + Math.random() * rect.height,
            targetX: targetX + (Math.random() - 0.5) * 100,
            targetY: targetY + (Math.random() - 0.5) * 100,
            size: 3 + Math.random() * 8,
            speed: 0.02 + Math.random() * 0.03,
            color: `hsla(${280 + Math.random() * 30}, 40%, 30%, 0.8)`
        });
    }
    
    animateParticles(particles);
}
```

### Trigger Points
- Layer transitions (noise→intimate, etc.)
- Every N-th fragment spawn (configurable)
- Burst events

### Visual Character
- **Мерзкий**: органические цвета, нелинейное движение
- **Липкий**: частицы как будто тянутся/прилипают
- **Дискомфортный**: нестабильные траектории

---

## File Structure

```
prototypes/
├── klyap-v15/     # Current
└── klyap-v16/     # NEW
    └── index.html

assets/
└── klyap-v16/
    └── fragments/
        ├── intimate/    # +3
        ├── mirror/      # +3
        ├── visceral/    # +3
        ├── noise/       # +2
        ├── vivid/       # +5 (new layer)
        └── flesh/       # +4 (new layer)
```

---

## Verification

### Phase A
- [ ] Membrane visible behind fragments
- [ ] Blobs breathe at ~0.25 speed
- [ ] 60fps maintained
- [ ] Cursor slightly attracts blobs

### Phase B
- [ ] 20 new fragments load
- [ ] Layer distribution correct
- [ ] No white edges on transparency

### Phase C
- [ ] Smear triggers on layer transition
- [ ] Particle movement feels organic/sticky
- [ ] No performance drop during smear

---

## Next Steps

1. **Phase A first** — визуально проверить membrane
2. **Phase B** — генерация 20 фрагментов (prompts готовы выше)
3. **Phase C** — выбрать CSS vs Canvas approach после оценки performance
