# Handoff: Hold Osmosis — Reimagining Touch

**Дата:** 2026-01-08  
**Статус:** 🔴 READY FOR IMPLEMENTATION  
**Следующая сессия:** Имплементация

---

## 🎯 Что Меняем

**Старая модель:** Hold 0.5s → trigger RECOGNITION → sequence

**Новая модель:** Hold = continuous osmosis. Мгновенное начало, градиентное развитие.

### Философия
> "В момент касания природных вещей мы чувствуем обмен чем-то."
> "Обволакивающее, меж мембран клеток проникающее что-то."

**Hold — это не событие. Hold — это процесс взаимопроникновения.**

---

## 📋 Список Изменений

### 1. HapticManager (NEW FILE)
**Файл:** `src/HapticManager.js`

Создаём новый менеджер для вибрации:
```javascript
export class HapticManager {
  constructor() {
    this.supported = 'vibrate' in navigator
    this.lastPulse = 0
  }

  // Мягкий импульс при касании
  softTouch() {
    if (!this.supported) return
    navigator.vibrate(10)
  }

  // Heartbeat pattern (для глубокого контакта)
  heartbeat(intensity) {
    if (!this.supported) return
    const duration = Math.floor(20 + intensity * 30)
    navigator.vibrate([duration, 100, duration])
  }
}
```

### 2. SoundManager.js — MODIFY
**Добавить:** `startOsmosisBass()`, `setOsmosisDepth()`, `stopOsmosisBass()`

Заменяем `playRecognitionHum()` на более низкий, физически ощутимый bass:

```javascript
// НЕ заменяем, а добавляем рядом с recognition hum
// Osmosis Bass: 25-40Hz, субгармоники, ощущается телом
startOsmosisBass() {
  this.osmosisOsc = this.audioContext.createOscillator()
  this.osmosisOsc.type = 'sine'
  this.osmosisOsc.frequency.value = 25  // Очень низко
  
  this.osmosisGain = this.audioContext.createGain()
  this.osmosisGain.gain.value = 0  // Начинаем с нуля
  
  // Connect
  this.osmosisOsc.connect(this.osmosisGain)
  this.osmosisGain.connect(this.masterGain)
  this.osmosisOsc.start()
}

setOsmosisDepth(depth) {
  // depth: 0-1, где 1 = глубокий контакт
  const targetGain = depth * 0.5  // Максимум 0.5 (громко!)
  const targetFreq = 25 + depth * 15  // 25 → 40 Hz
  this.osmosisGain.gain.linearRampToValueAtTime(targetGain, now + 0.1)
  this.osmosisOsc.frequency.linearRampToValueAtTime(targetFreq, now + 0.1)
}
```

### 3. ParticleSystem.js — MODIFY
**Добавить uniform:** `uOsmosisDepth` (для визуальной "вмятины")

**Vertex shader изменения:**
```glsl
uniform float uOsmosisDepth;  // 0-1, глубина проникновения

// В main():
if (uCursorInfluence > 0.0 && uOsmosisDepth > 0.0) {
  // Частицы "расступаются" под пальцем
  float indent = uOsmosisDepth * 0.15;  // Макс 15% радиуса
  vec3 toCursor = normalize(uCursorWorldPos - worldPos);
  float dist = distance(worldPos, uCursorWorldPos);
  float indentFactor = smoothstep(0.0, 0.3, indent / max(dist, 0.01));
  
  // Смещаем частицы ОТ курсора (создаёт "вмятину")
  worldPos -= toCursor * indentFactor * 0.1;
}
```

**Fragment shader изменения:**
```glsl
// Warmth: amber glow spreading from touch
if (uOsmosisDepth > 0.0) {
  float warmth = uOsmosisDepth * uCursorInfluence;
  vec3 amberGlow = vec3(1.0, 0.7, 0.3);  // Warm amber
  baseColor = mix(baseColor, amberGlow, warmth * 0.4);
}
```

### 4. Sphere.js — MODIFY
**Главное изменение:** Убираем фазы PAUSE/RECOGNITION, заменяем на continuous gradient.

**Удалить:**
- `recognitionConfig.pauseDuration`
- `recognitionConfig.recognitionDuration`
- Разделение на "фазу 1" и "фазу 2"

**Добавить:**
```javascript
// В update() или _processGesture():
if (isHolding && cursorOnSphere) {
  const depth = this._calculateOsmosisDepth(holdDuration)
  
  // Haptic feedback
  if (this.haptic && depth > 0.1 && elapsed - this.lastHapticPulse > 0.8) {
    this.haptic.heartbeat(depth)
    this.lastHapticPulse = elapsed
  }
  
  // Sound
  if (this.soundManager) {
    this.soundManager.setOsmosisDepth(depth)
  }
  
  // Visual
  this.particles.setOsmosisDepth(depth)
}

_calculateOsmosisDepth(holdDuration) {
  // Градиент:
  // 0-0.3s: 0 (ничего)
  // 0.3-2s: 0 → 0.7 (основной рост)  
  // 2-5s: 0.7 → 1.0 (глубокий контакт)
  // 5s+: 1.0 (полный)
  
  if (holdDuration < 0.3) return 0
  if (holdDuration < 2) return (holdDuration - 0.3) / 1.7 * 0.7
  if (holdDuration < 5) return 0.7 + (holdDuration - 2) / 3 * 0.3
  return 1.0
}
```

### 5. main.js — MODIFY
**Добавить:** инициализацию HapticManager

```javascript
import { HapticManager } from './HapticManager.js'

// После создания SoundManager:
const hapticManager = new HapticManager()
sphere.setHapticManager(hapticManager)
```

---

## 📁 Файлы

| Файл | Действие | Что делаем |
|------|----------|------------|
| `src/HapticManager.js` | **CREATE** | Vibration API wrapper |
| `src/SoundManager.js` | MODIFY | Add osmosis bass (25Hz) |
| `src/ParticleSystem.js` | MODIFY | Add `uOsmosisDepth`, visual indent + warmth |
| `src/Sphere.js` | MODIFY | Replace phased recognition with continuous gradient |
| `src/main.js` | MODIFY | Initialize HapticManager |

---

## ✅ Verification Plan

### Тест 1: Haptic на Pixel
1. `npm run dev` в `prototype-sphere/`
2. Открыть на Pixel через local IP (показывается в терминале Vite)
3. Зажать палец на сфере
4. **Проверить:** Через ~0.8s должна быть мягкая вибрация

### Тест 2: Low Bass
1. Подключить наушники (или громкие динамики)
2. Зажать на сфере
3. **Проверить:** Низкий гул (физически ощущаемый) нарастает постепенно

### Тест 3: Visual Indent
1. В браузере на десктопе
2. Зажать мышь на сфере
3. **Проверить:** Частицы под курсором слегка "проседают" (создаётся вмятина)

### Тест 4: Gradient (не фазы)
1. Зажать и НЕ отпускать
2. **Проверить:** Эффекты нарастают ПЛАВНО, без скачков в 0.5s

---

## 🧠 Контекст для Будущего Агента

### Что было раньше
Hold запускал 3-фазную последовательность: PAUSE (0-0.4s) → RECOGNITION (0.4-1.2s) → LOOP.
Это работало, но ощущалось как "нажатие кнопки", а не как контакт.

### Что делаем теперь
Заменяем phases на continuous gradient. Нет "триггера" — есть постепенное проникновение.
Добавляем physical feedback: haptic vibration + low bass.

### Критерий успеха
**"Ощущается как прикосновение к живому."**
Не как UI interaction, а как exchange.

---

## 📂 Related Files

- `prompt_hold_experience_design.md` — оригинальный prompt с вопросами
- `hold_experience_vision.md` — философский документ (в brain artifacts)
- `handoff_hold_to_recognize.md` — предыдущий handoff (частично устарел)
- `docs/PHILOSOPHY.md` — общая философия проекта
