# Progress

Что работает, что pending, known issues.

---

## Done

### Particle System
- [x] GPGPU compute (velocity + position textures)
- [x] 100k particles at 60fps (tier=ultra)
- [x] Curl noise base flow
- [x] Cursor repulsion (negative space)
- [x] Cursor vortex (swirl on fast movement)
- [x] Ribbon path-follow (history[32])
- [x] Wave ring impulses
- [x] DOM rect avoidance
- [x] Edge attractors

### Render Pipeline
- [x] Linear workflow (single gamma at output)
- [x] RenderTargets allocator (half-float when supported)
- [x] TrailAccumulationPass (ping-pong feedback)
- [x] LinearCompositePass (void/post crossfade)
- [x] PostFXPipeline (bloom + ACES tonemap)
- [x] Manifesto renders after bloom (crisp)

### Quality System
- [x] 5 tiers: ultra/high/mid/low/static
- [x] Auto-scaling on low FPS
- [x] prefers-reduced-motion support

### Scroll
- [x] ScrollOrchestrator (voidProgress, postProgress)
- [x] Reversible scroll (trails reset on exit)

### UI
- [x] CardLayer (tier cards)
- [x] EdgeUI (side strips)
- [x] DebugHUD

---

## In Progress

### Visual Quality
- [ ] Particle size/glow feels "cheap" — needs art direction
- [ ] Need metaphor for the visual language

---

## Pending

### Payments
- [ ] LemonSqueezy integration (checkout URLs empty)
- [ ] Entitlements API (workers exist, not wired)

### Content
- [ ] 7 rooms / states detailed design
- [ ] Manifesto text content
- [ ] Artifacts definition

### Polish
- [ ] Mobile touch input
- [ ] Sound design (optional)
- [ ] Transitions between rooms

---

## Known Issues

### P1 (needs investigation)
- Increasing particle size x3 breaks rendering (particles disappear, stretching)

### P2 (minor)
- `.zprofile` warning in shell (unrelated to project)

### P3 (cosmetic)
- Gold sparks might be too rare (step(0.9996, ...))

---

## Metrics

| Metric | Target | Current |
|--------|--------|---------|
| FPS (ultra, M1) | 60 | 60 |
| FPS (high, M1) | 60 | 60 |
| FPS (mid, M1) | 60 | 60 |
| Cold start | <2s | ~1s |
| Bundle size | N/A | 0 (CDN) |

---

## Recent Commits

```
af404c6 docs: add backlog with session notes and open questions
58be466 feat: particle quality + shepherd ribbon + visibility fix
068b311 fix: size postfx in drawing-buffer pixels
13c95df fix: reset viewport each frame and allow motion override
2e4f42a feat: add fx=1 render graph with postfx bloom
```
