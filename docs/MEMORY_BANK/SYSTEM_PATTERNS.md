# System Patterns

Архитектура, data flow, render pipeline.

---

## Render Graph (fx=1)

```
                     ┌─────────────┐
                     │   Input     │
                     │ Controller  │
                     └──────┬──────┘
                            │ uniforms
                            ▼
┌──────────┐         ┌─────────────┐
│ VoidLayer├────────►│ RT_void     │ (linear)
└──────────┘         └──────┬──────┘
                            │
┌──────────────────┐        │
│ PostVoidLayer    │        │
│ ┌──────────────┐ │        │
│ │velocity.frag │ │        │
│ │ (forces)     │ │        │
│ └──────┬───────┘ │        │
│        ▼         │        │
│ ┌──────────────┐ │        │
│ │position.frag │ │        │
│ │(integration) │ │        │
│ └──────┬───────┘ │        │
│        ▼         │        │
│ ┌──────────────┐ │        │
│ │render.vert/  │ │        │
│ │frag (visual) │ │        │
│ └──────┬───────┘ │        │
│        ▼         │        │
│ ┌──────────────┐ │        │
│ │TrailAccum    │ │        │
│ │Pass (feedback)│─┼───────┼───►RT_post (linear)
│ └──────────────┘ │        │
└──────────────────┘        │
                            │
              ┌─────────────┼─────────────┐
              │ LinearCompositePass       │
              │   mix(void, post, t)      │
              └─────────────┬─────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    RT_composite         │
              └─────────────┬───────────┘
                            │
              ┌─────────────▼───────────┐
              │    PostFXPipeline       │
              │  - UnrealBloomPass      │
              │  - ACES tonemap         │
              │  - sRGB gamma           │
              └─────────────┬───────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │    Screen               │
              │  + ManifestoText        │
              │    (crisp, no bloom)    │
              └─────────────────────────┘
```

---

## Data Flow: Input → Particles

```
window.pointermove
       │
       ▼
┌──────────────────┐
│ InputController  │
│ - pointerStage   │ (NDC: -1..1)
│ - pointerVelStage│
│ - waves[]        │ (ring impulses)
│ - history[32]    │ (ribbon path)
└────────┬─────────┘
         │ uniforms
         ▼
┌──────────────────┐
│ ParticleCompute  │
│ - velocity.frag  │
└────────┬─────────┘
         │ textures
         ▼
┌──────────────────┐
│ ParticleSystem   │
│ - render.vert    │
│ - render.frag    │
└──────────────────┘
```

---

## Velocity Forces (velocity.frag)

Порядок применения сил:

1. **Damping** — `vel *= mix(0.92, 0.985, intensity)` — затухание
2. **Soft bounds** — притяжение к центру если далеко
3. **Curl noise** — base flow (два слоя + orbit)
4. **Depth drift** — Z-слоистость
5. **Cursor repel** — негативное пространство вокруг курсора
6. **Cursor vortex** — закрутка при быстром движении
7. **Entourage field** — притяжение к точке "за курсором"
8. **Ribbon path-follow** — течение вдоль истории курсора
9. **Waves** — кольцевые импульсы
10. **Edge attractors** — притяжение к краям (для UI)
11. **Rect avoidance** — обход DOM-элементов

---

## Quality Tiers

| Tier | Particles | GPGPU | Blur | PostFX |
|------|-----------|-------|------|--------|
| ultra | 100k | Yes | Yes | Full |
| high | 50k | Yes | Yes | Full |
| mid | 25k | Yes | No | Reduced |
| low | 10k | No | No | Off |
| static | 0 | No | No | Off |

Auto-scaling: если FPS < 50, понижаем tier.

---

## Scroll Zones

```
voidProgress: 0 ──────────────────► 1
              [VOID ZONE]     [TRANSITION]

postProgress:                 0 ──────────────────► 1
                              [POST ZONE]
```

- `transition = smoothstep(0.98, 1.0, voidProgress)`
- `cardsVisible = smoothstep(0.12, 0.28, postProgress)`

---

## Key Patterns

### Ping-pong buffers (trails)
`rtA ↔ rtB` — composite prev + curr → next

### GPGPU compute
`GPUComputationRenderer` — velocity/position textures, square side = √count

### Additive blending
Частицы используют `AdditiveBlending` для свечения

### Linear workflow
Все операции в linear space до финального tonemap+gamma
