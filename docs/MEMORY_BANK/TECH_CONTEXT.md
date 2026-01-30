# Tech Context

Стек, зависимости, ограничения.

---

## Stack

| Компонент | Технология | Версия |
|-----------|------------|--------|
| 3D Engine | Three.js | r171 (CDN) |
| GPGPU | GPUComputationRenderer | three/addons |
| PostFX | EffectComposer, UnrealBloomPass | three/addons |
| Scroll | Custom ScrollOrchestrator | — |
| Payments | LemonSqueezy | Planned |
| Workers | Cloudflare Workers | Entitlements API |

---

## Browser Requirements

- **WebGL 2.0** — для GPGPU и half-float текстур
- **EXT_color_buffer_float** или **EXT_color_buffer_half_float** — для HDR рендеринга
- Fallback на UnsignedByteType если нет

---

## Build / Dev

```bash
# Локальный сервер (статика)
npx serve prototypes/crowdfund-void

# Или любой статический сервер
python -m http.server 8080
```

Нет bundler — чистые ES modules через importmap:
```html
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.171.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.171.0/examples/jsm/"
  }
}
</script>
```

---

## URL Parameters

| Param | Values | Default | Effect |
|-------|--------|---------|--------|
| `debug` | 0/1 | 0 | Show HUD |
| `tier` | ultra/high/mid/low/static | auto | Force quality |
| `fx` | 0/1 | 1 | PostFX pipeline |
| `exposure` | float | 1.2 | Tonemap exposure |
| `bloom` | float | 1.2 | Bloom strength |
| `threshold` | float | 0.7 | Bloom threshold |
| `intensity` | calm/intense | intense | Movement intensity |
| `motion` | 0/1 | 0 | Override prefers-reduced-motion |
| `api` | 0/1 | 0 | Enable entitlements API |

---

## Constraints

### Performance
- Target: 60 FPS на MacBook Pro M1 при tier=high
- Mobile: auto-downgrade до mid/low

### Memory
- Particle textures: 512x512 (262k) max для ultra
- Trail buffers: half-resolution

### Accessibility
- `prefers-reduced-motion` → tier=static
- Manual motion override через UI

---

## File Structure

```
prototypes/crowdfund-void/
├── main.js              # Entry, boot, render loop
├── void.js              # (legacy, unused?)
├── particles/
│   ├── ParticleSystem.js    # Orchestrator
│   ├── gpgpu/
│   │   ├── ParticleCompute.js
│   │   ├── velocity.frag    # ⭐ ALL forces
│   │   └── position.frag
│   └── shaders/
│       ├── render.vert      # Size, color, parallax
│       └── render.frag      # Glow shape
├── render/
│   ├── RendererRoot.js
│   ├── RenderTargets.js
│   ├── PostFXPipeline.js
│   ├── layers/
│   │   ├── VoidLayer.js
│   │   └── PostVoidLayer.js
│   └── passes/
│       ├── TrailAccumulationPass.js  # Feedback
│       └── LinearCompositePass.js
├── systems/
│   ├── InputController.js   # Pointer, waves, history
│   ├── QualityManager.js    # Tiers, auto-scale
│   ├── ScrollOrchestrator.js
│   └── DebugHUD.js
├── ui/
│   ├── cards/
│   ├── edges/
│   └── payments/
├── utils/
│   ├── deviceCaps.js
│   └── stageSpace.js
└── manifesto/
    ├── ManifestoText.js
    └── shaders/
```

---

## External Dependencies

Только Three.js через CDN. Никаких npm dependencies в рантайме.

Workers (Cloudflare):
- `workers/postvoid-entitlements/` — session/entitlements API
