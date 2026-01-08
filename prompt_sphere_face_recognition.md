# Sphere Face-to-Face Recognition

## 🎯 Проблема

Во время Hold-to-Recognize:
- ✅ **Глаз смотрит** на точку касания (gaze lock работает)
- ❌ **Сфера не поворачивается** — остаётся в текущей ориентации
- ❌ **Визуально слабая реакция** — глаз может смотреть "вбок" от камеры, и это не заметно

**Результат:** Момент узнавания выглядит неполноценно — только глаз реагирует, а сфера как будто безучастна.

---

## 💡 Желаемое поведение

### Идея: "Она поворачивается к тебе"

Во время **RECOGNITION фазы** сфера должна:

1. **Медленно повернуться** так, чтобы глаз оказался **face-to-face** с точкой касания
2. **Freeze rolling** — временно отключить обычную rolling механику от курсора
3. **Smooth interpolation** — плавная ротация (2-3 секунды)
4. **Return to normal** — после выхода из Recognition вернуть rolling

### Эффект для пользователя

> "Когда я держу руку на сфере, она не просто **смотрит** на меня — она **поворачивается всем телом**, чтобы встретиться взглядом. Это момент полного внимания."

---

## 🛠️ Техническая реализация

### 1. Вычисление целевой ориентации

**Цель:** Найти rotation сферы, при котором глаз (на северном полюсе) будет смотреть на `recognitionTouchPos`.

```javascript
// В Sphere.js, во время RECOGNITION фазы
_computeFaceToFaceRotation(touchPos) {
  // Направление от центра сферы к точке касания
  const toTouch = touchPos.clone().normalize()
  
  // Глаз находится на северном полюсе (0, 0, 1)
  // Нужно повернуть сферу так, чтобы (0, 0, 1) указывал на toTouch
  
  // Используем quaternion для плавной ротации
  const currentUp = new THREE.Vector3(0, 0, 1)
  const targetRotation = new THREE.Quaternion()
  targetRotation.setFromUnitVectors(currentUp, toTouch)
  
  return targetRotation
}
```

### 2. Плавная интерполяция во время Recognition

**В `_processRecognition()`:**

```javascript
// ФАЗА 2: УЗНАВАНИЕ
if (t < cfg.pauseDuration + cfg.recognitionDuration) {
  const recogT = (t - cfg.pauseDuration) / cfg.recognitionDuration  // 0 → 1
  
  // ... existing recognition logic ...
  
  // NEW: Поворот сферы к точке касания
  if (!this.targetFaceRotation) {
    this.targetFaceRotation = this._computeFaceToFaceRotation(this.recognitionTouchPos)
  }
  
  // Плавная интерполация rotation
  const currentQuat = new THREE.Quaternion().setFromEuler(this.particles.mesh.rotation)
  currentQuat.slerp(this.targetFaceRotation, delta * 0.8)  // Smooth interpolation
  this.particles.mesh.rotation.setFromQuaternion(currentQuat)
  
  // Sync eye rotation
  this.eye.setSphereRotation(this.particles.mesh.rotation)
}
```

### 3. Freeze rolling во время Recognition

**В `_updateCursorProximity()`:**

```javascript
// Skip rolling if in RECOGNITION phase
if (this.currentPhase === PHASE.RECOGNITION) {
  return  // Don't apply cursor attraction/rolling
}

// ... existing rolling logic ...
```

### 4. Cleanup после выхода из Recognition

**В `_exitRecognition()`:**

```javascript
_exitRecognition() {
  // Clear recognition state
  this.targetFaceRotation = null
  
  // ... existing cleanup ...
}
```

---

## 📋 Checklist

### Phase 1: Core Rotation Logic
- [ ] Добавить метод `_computeFaceToFaceRotation(touchPos)`
- [ ] Добавить `this.targetFaceRotation` state variable
- [ ] Интегрировать rotation interpolation в `_processRecognition()`

### Phase 2: Disable Conflicting Mechanics
- [ ] Freeze rolling в `_updateCursorProximity()` во время RECOGNITION
- [ ] Убедиться что magnetism не мешает

### Phase 3: Cleanup & Testing
- [ ] Clear `targetFaceRotation` в `_exitRecognition()`
- [ ] Тестировать: hold на разных частях сферы
- [ ] Проверить: плавность перехода обратно к rolling после exit

---

## 🎨 Тюнинг параметров

```javascript
recognitionConfig: {
  // ... existing ...
  
  // NEW: Face-to-face rotation
  faceRotationSpeed: 0.8,     // slerp factor (0-1, higher = faster)
  faceRotationDelay: 0.3,     // delay before starting rotation (seconds)
}
```

### Возможные варианты behaviour:

1. **Immediate turn** — сфера начинает поворачиваться сразу в PAUSE фазе
2. **Delayed turn** — поворот начинается только в RECOGNITION фазе
3. **Gradual turn** — очень медленный поворот в течение всего hold

---

## 🧪 Проверка

### Manual test scenario:

1. Reload page
2. Hold на **левой** стороне сферы (3+ секунды)
3. **Ожидание:** Сфера медленно поворачивается так, чтобы глаз смотрел на точку касания
4. Release
5. **Ожидание:** Rolling возвращается к нормальной работе

### Success criteria:

✅ Сфера плавно поворачивается во время Recognition  
✅ Глаз оказывается "лицом" к точке касания  
✅ После выхода rolling работает нормально  
✅ Нет резких скачков rotation  

---

## 🤔 Открытые вопросы

1. **Скорость поворота** — насколько быстро? (предлагаю медленно, 2-3 сек)
2. **Когда начинать** — в PAUSE или в RECOGNITION фазе?
3. **Easing** — linear slerp или custom easing curve?
4. **Partial rotation** — поворачивать на 100% или на ~70% (чуть недокрутить для organic feel)?
