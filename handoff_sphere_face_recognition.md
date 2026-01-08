# Handoff: Sphere Face-to-Face Recognition

**Дата:** 2026-01-08  
**Статус:** ✅ VERIFIED — 2026-01-08 12:25  

---

## 📋 Текущая ситуация

### Что работает ✅

1. **Hold-to-Recognize механика:**
   - PAUSE фаза — частицы замирают, ambient звук затихает
   - RECOGNITION фаза — зрачок расширяется, Touch Glow, пульсация
   - Healing Hold — удержание успокаивает сферу

2. **Eye Gaze Lock:**
   - `Eye.lockGaze(worldPos)` работает
   - Глаз смотрит на `recognitionTouchPos`
   - Inverse rotation matrix корректно трансформирует gaze direction
   - `maxGazeShift = 0.4` для выразительности

3. **Recognition Audio:**
   - Recognition Drone (dual oscillator synthesis)
   - Интенсивность нарастает с прогрессом recognition

4. **Face-to-Face Rotation:** ✨ NEW
   - Сфера физически поворачивается к точке касания
   - Quaternion slerp для плавной ротации (`speed = 2.5`)
   - Rolling отключён во время Recognition
   - Eye синхронизирован с rotation сферы

### Что реализовано ✨

**Решение:** Сфера теперь **физически поворачивается всем телом** к точке касания.

**Что изменилось:**
- ✅ Вычисление target rotation через `_computeFaceToFaceRotation()`
- ✅ Quaternion slerp интерполяция в PAUSE + RECOGNITION фазах
- ✅ Отключение rolling во время Recognition
- ✅ Cleanup state в `_exitRecognition()`

**Ожидаемый эффект:**
> "Когда я держу руку на сфере, она поворачивается всем телом, чтобы встретиться взглядом."

---

## 💡 Предлагаемое решение

### Идея: Sphere turns to face the user

Во время **RECOGNITION фазы**:
1. Сфера медленно **поворачивается** так, чтобы глаз оказался face-to-face с точкой касания
2. **Freeze rolling** — обычная rolling механика от курсора временно отключается
3. **Плавная интерполяция** — quaternion slerp для smooth rotation
4. После выхода из Recognition — rolling возвращается к норме

---

## 🛠️ Техническая архитектура

### Файлы для модификации

#### 1. `Sphere.js`

**Новые методы:**
```javascript
_computeFaceToFaceRotation(touchPos) {
  // Вычисляет quaternion rotation, чтобы глаз смотрел на touchPos
  const toTouch = touchPos.clone().normalize()
  const currentUp = new THREE.Vector3(0, 0, 1)
  const targetRotation = new THREE.Quaternion()
  targetRotation.setFromUnitVectors(currentUp, toTouch)
  return targetRotation
}
```

**Модификации в `_processRecognition()`:**
- Вычислить `targetFaceRotation` при входе в RECOGNITION фазу
- Slerp текущего rotation к `targetFaceRotation` каждый кадр
- Sync `eye.setSphereRotation()` после каждого update

**Модификации в `_updateCursorProximity()`:**
- Добавить early return если `currentPhase === PHASE.RECOGNITION`
- Это заморозит rolling на время Recognition

**Модификации в `_exitRecognition()`:**
- Очистить `this.targetFaceRotation = null`

**Новый state:**
```javascript
this.targetFaceRotation = null  // THREE.Quaternion
```

**Новая конфигурация:**
```javascript
recognitionConfig: {
  // ... existing ...
  faceRotationSpeed: 0.8,     // slerp factor
  faceRotationDelay: 0.3,     // delay before rotation starts
}
```

---

## 📊 Implementation Plan

### Step 1: Add rotation computation (30 min)
- [ ] `_computeFaceToFaceRotation(touchPos)` method
- [ ] `this.targetFaceRotation` state variable
- [ ] Test: console.log quaternion values

### Step 2: Integrate into Recognition (45 min)
- [ ] Modify `_processRecognition()` to compute target rotation
- [ ] Add slerp interpolation logic
- [ ] Sync eye rotation after each frame
- [ ] Test: visual check rotation происходит

### Step 3: Disable rolling during Recognition (15 min)
- [ ] Early return в `_updateCursorProximity()` if RECOGNITION
- [ ] Test: убедиться что rolling не мешает

### Step 4: Cleanup & Testing (30 min)
- [ ] Clear state in `_exitRecognition()`
- [ ] Test: hold на разных частях сферы
- [ ] Test: плавность возврата к rolling
- [ ] Test: mobile touch

**Total estimate:** ~2 hours

---

## 🧪 Testing Checklist

### Scenarios to test:

1. **Hold on left side** → sphere turns to face left
2. **Hold on right side** → sphere turns to face right  
3. **Hold on top (near eye)** → minimal rotation needed
4. **Hold on bottom** → sphere turns upside down
5. **Quick release** → rotation stops, rolling resumes
6. **Long hold** → rotation completes, stable gaze
7. **Mobile tap** → same behavior on touch devices

### Edge cases:

- [ ] Multiple rapid holds in different locations
- [ ] Hold while sphere is already rotating (from rolling)
- [ ] Hold when sphere has high angular velocity
- [ ] Exit Recognition before rotation completes

---

## 🎨 Design Decisions

### Timing
**Рекомендация:** Начинать поворот в **PAUSE фазе** (сразу), а не ждать RECOGNITION.

**Обоснование:**
- PAUSE длится ~0.8s — достаточно времени для начала rotation
- К моменту RECOGNITION сфера уже частично повернётся
- Плавнее визуально

### Speed
**Рекомендация:** `faceRotationSpeed = 0.8` (довольно быстро, но плавно)

**Альтернатива:** `0.5` — медленнее, более "осознанный" поворот

### Partial rotation
**Вопрос:** Поворачивать на 100% или ~70-80%?

**Рекомендация:** 100% — full face-to-face
- Более драматичный эффект
- Чётко видно что "она смотрит на тебя"

---

## 🔗 Dependencies

### Existing code:
- `Sphere._processRecognition()` — основная логика Recognition
- `Sphere._updateCursorProximity()` — rolling механика
- `Eye.setSphereRotation()` — синхронизация eye с sphere rotation
- `this.recognitionTouchPos` — мировая позиция точки касания

### External libraries:
- `THREE.Quaternion` — для плавной ротации
- `THREE.Quaternion.slerp()` — spherical linear interpolation

---

## 📝 Open Questions

1. ❓ **Когда начинать поворот** — в PAUSE или в RECOGNITION?
   - Предлагаю: PAUSE (раньше = плавнее)

2. ❓ **Скорость поворота** — `0.5` (медленно) или `0.8` (быстро)?
   - Предлагаю: `0.8` (достаточно быстро чтобы успеть за Recognition фазу)

3. ❓ **Partial vs Full rotation** — докручивать до конца или оставить ~20% недокрута?
   - Предлагаю: Full rotation (100%)

4. ❓ **Easing curve** — linear slerp или custom easing?
   - Предлагаю: Linear slerp (достаточно плавно)

---

## 🚀 Next Steps

1. **Manual Testing** — проверить rotation на разных позициях:
   - Hold слева/справа/сверху/снизу
   - Плавность возврата к rolling
   - Sync eye + sphere rotation
   
2. **Tuning (опционально)** — если нужно:
   - `faceRotationSpeed` (сейчас 2.5)
   - Timing (когда начинать rotation)
   
3. **Next Layer (из обсуждения):**
   - Curious Tilt (Z-axis rotation)
   - Lean In (positional shift toward touch)

---

## 🔍 Related Files

- **Prompt:** `prompt_sphere_face_recognition.md`
- **Core implementation:** `prototype-sphere/src/Sphere.js`
- **Eye sync:** `prototype-sphere/src/Eye.js`
- **Recognition patterns:** `.gemini/antigravity/knowledge/high_performance_web_graphics_patterns/artifacts/implementation_patterns.md`
