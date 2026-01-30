# Codebase Index

Карта файлов, ключевые связи, hot paths.

---

## Entry Points

| File | Purpose |
|------|---------|
| `main.js` | Boot, render loop, wiring |
| `index.html` | HTML shell (в корне prototypes/crowdfund-void/) |

---

## Core Modules

### Particles

| File | Purpose | Key exports |
|------|---------|-------------|
| `particles/ParticleSystem.js` | Orchestrator | `ParticleSystem` class |
| `particles/gpgpu/ParticleCompute.js` | GPGPU runner | `ParticleCompute` class |
| `particles/gpgpu/velocity.frag` | **ALL forces** | GLSL shader |
| `particles/gpgpu/position.frag` | Integration | GLSL shader |
| `particles/shaders/render.vert` | Visual: size, color | GLSL shader |
| `particles/shaders/render.frag` | Visual: glow shape | GLSL shader |

### Render Pipeline

| File | Purpose |
|------|---------|
| `render/RendererRoot.js` | WebGLRenderer wrapper |
| `render/RenderTargets.js` | RT allocation (rtVoid, rtPost, rtComposite) |
| `render/PostFXPipeline.js` | Bloom + tonemap |
| `render/layers/VoidLayer.js` | Void zone rendering |
| `render/layers/PostVoidLayer.js` | Post zone (particles + manifesto) |
| `render/passes/TrailAccumulationPass.js` | **Feedback trails** |
| `render/passes/LinearCompositePass.js` | Void/post crossfade |

### Systems

| File | Purpose |
|------|---------|
| `systems/InputController.js` | Pointer, velocity, waves, history |
| `systems/QualityManager.js` | Tiers, auto-scaling |
| `systems/ScrollOrchestrator.js` | Scroll progress |
| `systems/DebugHUD.js` | Debug overlay |

---

## Hot Paths (часто меняются)

### Поведение частиц
```
particles/gpgpu/velocity.frag
├── L50-70:  Base flow (curl noise + orbit)
├── L75-85:  Cursor repel + vortex
├── L95-150: Ribbon path-follow
└── L175-190: Rect avoidance
```

### Размер/цвет частиц
```
particles/shaders/render.vert
├── L108-126: Color palette
└── L127-133: Size calculation
```

### Качество
```
systems/QualityManager.js
├── L36-56:  Tier definitions
└── L70-87:  Auto-scaling logic
```

### Trail feedback
```
render/passes/TrailAccumulationPass.js
├── L38-84:  Composite shader
└── L193-241: Render method
```

---

## Data Flow Reference

```
Input → InputController → uniforms
                ↓
        velocity.frag (forces)
                ↓
        position.frag (integration)
                ↓
        render.vert/frag (visual)
                ↓
        TrailAccumulationPass (feedback)
                ↓
        PostFXPipeline (bloom, tonemap)
                ↓
            Screen
```

---

## Uniform Connections

### velocity.frag expects:
- `uDt` — delta time
- `uTime` — total time
- `uPointer` — cursor stage position
- `uPointerVel` — cursor velocity
- `uEdges` — edge attractor strength
- `uIntensity` — calm/intense (0-1)
- `uWavesCount`, `uWaves[8]` — ring impulses
- `uRectsCount`, `uRects[16]` — DOM rects to avoid
- `uHistoryCount`, `uHistory[32]` — pointer trail for ribbon

### render.vert expects:
- `uTime`, `uOpacity`, `uViewport`, `uIntensity`
- `uTier` — for color tinting
- `uPointer`, `uPointerVel`
- `uWavesCount`, `uWaves[8]`
- `uPositionTex`, `uVelocityTex` (GPGPU mode)

---

## Files to Read First

Для понимания системы:
1. `main.js` — общая картина
2. `velocity.frag` — логика движения
3. `TrailAccumulationPass.js` — как работают следы
4. `QualityManager.js` — система качества
