# KLYAP v16 Phase C: Particle Smear Transitions — Handoff

> **Date**: 2026-01-15
> **Status**: Ready to start
> **Prerequisite**: Phase A (Breathing Membrane) ✅ completed

---

## 🎯 Goal

Implement "nasty particle smear" transitions between fragments — organic, sticky, uncomfortable dissolve/reassemble effect.

**Key feeling**: когда фрагмент исчезает, он не просто fade out — он "размазывается" в частицы, которые липко стекают/рассыпаются. Новый фрагмент "собирается" из этих частиц.

---

## 📁 Current State

### Working Prototype
```
http://localhost:8889/prototypes/klyap-v16/
```

### Key Files
- `prototypes/klyap-v16/index.html` — main file (875 lines)
- `assets/klyap-v16/fragments/{layer}/` — 43 fragments total

### Already Implemented
- Breathing membrane (canvas, 5 blobs, cursor attraction)
- 6 layers (noise, intimate, vivid, mirror, flesh, visceral)
- Fragment spawn/despawn with CSS animations
- Layer transitions with flash + displacement

---

## 📐 Design Intent

### Visual Reference (from klyap-v16-implementation-plan.md)
```
Phase C: Particle Smear Transitions
- Противные частицы — "липкие", "текущие", "размазанные"
- Не красивый dissolve, а НЕПРИЯТНЫЙ smear
- Частицы группируются, стекают, прилипают
```

### Technical Approaches (choose one)

**Option 1: Canvas-based Particle System**
- Capture fragment as texture
- Spawn particles at fragment position
- Animate particles with gravity + "sticky" physics
- Render on separate canvas layer

**Option 2: CSS/WebGL Displacement**  
- Use SVG displacement filter
- Animate noise parameters for "melt" effect
- Lighter on performance

**Option 3: Hybrid**
- CSS for initial "break apart" effect
- Canvas particles for "sticky drip" aftermath

---

## 🔧 Implementation Notes

### Current Fragment Lifecycle (lines ~680-740)
```javascript
function spawnFragment() {
    // Creates fragment div with img
    // CSS animation: fragment-emerge (scale, opacity, blur)
    // Remove after animDuration * 1000 ms
}
```

### Suggested Integration Point
Instead of just `fragment.remove()`, trigger particle decomposition:
```javascript
// When fragment animation ends:
// 1. Capture fragment visual state
// 2. Hide original fragment
// 3. Spawn particles at same position
// 4. Animate particles (drip, scatter, stick)
// 5. After particle animation completes, remove fragment
```

### Performance Considerations
- Max 18 active fragments — particle overhead matters
- Consider pooling particles
- Use requestAnimationFrame for smooth animation
- Limit particle count per fragment (50-100?)

---

## 🎨 Visual Inspiration

**"Sticky" behavior:**
- Particles should feel like they have viscosity
- Some particles "stick" to edges/corners
- Gravity pulls particles down but slowly
- Color bleeding/smearing effect

**Reference**: melting wax, rotting organic matter, oil spill

---

## ✅ Acceptance Criteria

1. [ ] Fragments "dissolve" into particles when exiting
2. [ ] Particles have organic, uncomfortable motion (not smooth)
3. [ ] "Sticky" feel — some particles linger, drip, cling
4. [ ] Performance: maintains 55+ FPS with 10+ simultaneous dissolves
5. [ ] Works with all 6 layers (color tinting preserved)
6. [ ] Optional: new fragments "assemble" from particles (stretch goal)

---

## 🚀 Start Prompt

```
Implement Phase C for KLYAP v16 — Particle Smear Transitions.

Context:
- Working prototype: http://localhost:8889/prototypes/klyap-v16/
- Main file: prototypes/klyap-v16/index.html
- Phase A (breathing membrane) is complete
- 43 fragments across 6 layers

Goal:
Когда фрагмент исчезает, он должен "размазываться" в частицы — липкие, 
органические, неприятные. Не красивый dissolve, а uncomfortable smear.

Start by:
1. Read current spawnFragment() and fragment lifecycle
2. Choose technical approach (canvas particles vs CSS displacement)
3. Create implementation plan with specific steps
4. Request review before coding

Reference: docs/plans/klyap-v16-phase-c-handoff.md
```
