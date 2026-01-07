# 🎭 СФЕРА: Gesture Reactions

## Контекст
Продолжение Stage 6 Deep Interaction. Gesture Recognition и Cursor Proximity Effect **готовы** — сфера видит курсор и классифицирует жесты.

## Что уже работает ✅
- `gestureType`: idle / stroke / poke / orbit / tremble / moving
- `directionalConsistency`: 0 (хаос) → 1 (линейно) 
- `angularVelocity`: скорость вращения вокруг центра
- **Cursor Proximity**: частицы светятся и тянутся к курсору

## Задача на сессию
Интегрировать `gestureType` в `Sphere.js` для эмоциональных реакций:

| Жест | Реакция сферы |
|------|---------------|
| **stroke** | Успокоение: tension --, breathAmount ++, мягкий цвет |
| **poke** | Испуг: мгновенный tension spike, goosebumps burst, возможно ripple |
| **orbit** | Гипноз: breathing синхронизируется со скоростью орбиты |
| **tremble** | Нервозность: goosebumps на максимум |

## Архитектура

```javascript
// В Sphere.js _applyEffects() добавить:
_processGesture(inputState) {
    const { gestureType, angularVelocity, directionalConsistency } = inputState
    
    switch (gestureType) {
        case 'stroke':
            // Успокоение — уменьшить tension, глубже дышать
            break
        case 'poke':
            // Испуг — spike tension, shiver
            break
        case 'orbit':
            // Гипноз — sync breathing с angularVelocity
            break
        case 'tremble':
            // Нервозность — goosebumps max
            break
    }
}
```

## Key Files
```
prototype-sphere/src/
├── Sphere.js             # 👈 Добавить _processGesture()
├── InputManager.js       # gestureType уже готов
├── ParticleSystem.js     # Шейдеры готовы
└── main.js
```

## Команды
```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run dev
# http://localhost:5175
```

## Debug API
```javascript
// Gesture state
window.app.inputManager.currentGesture
window.app.inputManager.directionalConsistency
window.app.inputManager.angularVelocity

// Tune thresholds
window.app.inputManager.STROKE_MAX_VELOCITY = 0.15
window.app.inputManager.POKE_MIN_VELOCITY = 0.25
window.app.inputManager.ORBIT_MIN_ANGULAR = 1.5

// Goosebumps control
window.app.particleSystem.material.uniforms.uGoosebumpsIntensity.value = 0.08
```

## Бонус: Touch Ripples (если время останется)
После gesture reactions можно добавить:
- `uRippleOrigin`, `uRippleTime` uniforms
- `triggerRipple(worldPoint)` API
- В vertex shader: `displacement = sin(distance - time) * decay`

---
**Философия:** Сфера чувствует намерение. Поглаживание ≠ тычок. Круговое движение ≠ дрожание.
