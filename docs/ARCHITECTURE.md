# Архитектура: Прототип СФЕРА

> BMAD Phase 3 — Technical Architecture Document

---

## Обзор системы

Интерактивная 3D-сфера из частиц, реагирующая на поведение пользователя. Учит без слов: созидание требует паузы.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │   main.js   │→ │  Sphere.js  │→ │ ParticleSystem  │  │
│  │   (Init)    │  │  (Orchestr) │  │    (Render)     │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
│         │                │                  │           │
│         ▼                ▼                  ▼           │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │InputManager │  │AudioManager │  │    Shaders      │  │
│  │  (Events)   │  │   (Sound)   │  │  (GPU Render)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Компоненты

### 1. main.js — Entry Point

**Обязанности:**
- Инициализация Three.js (scene, camera, renderer)
- Создание экземпляров Sphere, AudioManager
- RAF loop (requestAnimationFrame)
- Resize handling

**API:**
```javascript
// Lifecycle
init() → void
animate() → void
dispose() → void
```

---

### 2. Sphere.js — Orchestrator

**Обязанности:**
- Управление состоянием сферы (REST / MOVING / BLEEDING)
- Координация между ParticleSystem, InputManager, AudioManager
- Логика переходов между состояниями
- Таймеры для адаптивного дыхания и Лего-сборки

**Состояния:**
```
REST ←→ MOVING ←→ BLEEDING
  │                    │
  └────── LEGO ────────┘ (при длительном REST)
```

**API:**
```javascript
constructor(scene: Scene, audioManager: AudioManager)
update(delta: number, inputState: InputState) → void
getState() → SphereState
dispose() → void
```

---

### 3. ParticleSystem.js — Renderer

**Обязанности:**
- Создание BufferGeometry с позициями частиц
- Управление типами частиц (normal, ghost, falling)
- Пульсация (breathing)
- Lerp к курсору
- Отрыв и падение при кровотечении
- Шрамы (сохранение offset)
- Лего-формации

**Структура данных:**
```javascript
// Per-particle attributes (BufferGeometry)
position: Float32Array     // x, y, z
originalPos: Float32Array  // для возврата
velocity: Float32Array     // скорость падения
type: Uint8Array           // 0=normal, 1=ghost, 2=falling
scarOffset: Float32Array   // смещение от шрама
```

**API:**
```javascript
constructor(count: number, ghostRatio: number)
setBreathingPhase(phase: number) → void      // 0-1
applyMouseAttraction(mousePos: Vec3, strength: number) → void
startBleeding(intensity: number) → void
stopBleeding() → void
applyScars() → void
enterLegoMode() → void
exitLegoMode() → void
update(delta: number) → void
getMesh() → Points
```

---

### 4. InputManager.js — Events

**Обязанности:**
- Отслеживание позиции мыши (normalized -1 to 1)
- Расчёт velocity (скорость движения)
- Определение состояния: idle / moving / frantic
- Таймер неподвижности

**Пороги:**
| Параметр | Значение |
|----------|----------|
| IDLE_THRESHOLD | velocity < 0.01 в течение 0.5 сек |
| FRANTIC_THRESHOLD | velocity > 0.3 в течение 0.3 сек |
| LEGO_TRIGGER | idle > 10 сек |
| MANIFEST_TRIGGER | idle > 8 сек |

**API:**
```javascript
constructor(domElement: HTMLElement)
getState() → InputState { position, velocity, idleTime, isFramtic }
update(delta: number) → void
dispose() → void
```

---

### 5. AudioManager.js — Sound

**Обязанности:**
- Создание и управление осцилляторами
- Три слоя: drone, rustle, whine
- Crossfade между состояниями
- Spatial audio не требуется (2D)

**Архитектура звука:**
```
AudioContext
├── droneOsc (sine 35Hz) → droneGain → masterGain → destination
├── rustleNoise (brownian) → rustleGain → masterGain
└── whineOsc (sine 2000Hz) → whineGain → masterGain
```

**API:**
```javascript
constructor()
setState(state: 'rest' | 'moving' | 'frantic') → void
setIntensity(value: number) → void  // 0-1
mute() / unmute() → void
dispose() → void
```

---

### 6. Shaders

**vertex.glsl:**
```glsl
attribute float type;
attribute vec3 scarOffset;
uniform float uTime;
uniform float uBreathPhase;
uniform vec3 uMousePos;
uniform float uMouseStrength;

// Breathing pulsation
// Mouse attraction with lerp
// Type-based behavior (ghost shimmer)
```

**fragment.glsl:**
```glsl
uniform vec3 uColorNormal;   // #2D1B4E
uniform vec3 uColorGhost;    // lighter
uniform vec3 uColorFalling;  // #39FF14

// Color based on type
// Ghost: alpha oscillation
// Falling: bright lime
```

---

## Потоки данных

```
User Input (mouse)
       │
       ▼
InputManager.update()
       │
       ├──→ velocity, position, idleTime
       │
       ▼
Sphere.update()
       │
       ├──→ State transition logic
       │         │
       │         ├──→ AudioManager.setState()
       │         │
       │         └──→ ParticleSystem methods
       │
       ▼
ParticleSystem.update()
       │
       ├──→ Update BufferGeometry attributes
       │
       ▼
Three.js Render (GPU via Shaders)
       │
       ▼
Canvas Output
```

---

## Решения и обоснования

| Решение | Почему |
|---------|--------|
| **Three.js Points** | Оптимально для 2000-5000 частиц, GPU-accelerated |
| **CPU-based physics (MVP)** | Проще отладка, GPGPU — оптимизация позже |
| **Web Audio API oscillators** | Легковесно, без загрузки файлов, proceдурная генерация |
| **State machine в Sphere** | Централизованная логика, проще тестировать |
| **Shaders для визуала** | Производительность, параллельная обработка всех частиц |

---

## Зависимости

```json
{
  "dependencies": {
    "three": "^0.160.0"
  },
  "devDependencies": {
    "vite": "^5.0.0"
  }
}
```

Никаких дополнительных библиотек. Минимализм.

---

## Риски и митигации

| Риск | Митигация |
|------|-----------|
| Производительность при 5000 частиц | Начать с 2000, профилировать |
| Web Audio autoplay policy | Показать "Click to enter" |
| Mobile touch events | Добавить touch support в InputManager |
| Шрамы накапливаются бесконечно | Лимит % травмированных частиц |

---

## Файловая структура (финальная)

```
/prototype-sphere/
├── index.html
├── style.css
├── src/
│   ├── main.js
│   ├── Sphere.js
│   ├── ParticleSystem.js
│   ├── InputManager.js
│   ├── AudioManager.js
│   └── shaders/
│       ├── vertex.glsl
│       └── fragment.glsl
├── package.json
└── vite.config.js
```

---

*BMAD Phase 3 Complete — Ready for Story Sequencing*
