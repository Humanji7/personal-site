# Handoff: Gesture Universe → Implementation

**Дата:** 2026-01-08  
**Статус:** ⏳ READY FOR IMPLEMENTATION  
**Следующая сессия:** `prompt_gesture_expansion.md`

---

## ✅ Что сделано

### Research Session
- Провели анализ 5 существующих жестов через биологию + искусство
- Определили gaps и возможности
- Разработали **Membrane Model** (все жесты = способы взаимодействия с мембраной)

### Planning
- Спланировали 4 новых жеста: Tap, Flick, Hesitation, Spiral
- Финализировали эмоциональную семантику:

| Жест | Реакция |
|------|---------|
| **Tap** | Пульсация ("я тут") |
| **Flick** | Как poke (startle + trace) |
| **Hesitation** | Грустит + зеркалит |
| **Spiral** | Глубокий транс (остановка дыхания, зрачок макс) |

---

## 📁 Ключевые файлы для имплементации

```
src/InputManager.js   — gesture detection (+4 новых)
src/Sphere.js         — gesture reactions (+4 case)
```

---

## 📋 План имплементации

### Phase 1: InputManager (~60 строк)
1. Add `contactDuration`, `justReleased` tracking
2. Implement TAP detection (before poke in priority)
3. Implement FLICK detection (fast exit)
4. Implement HESITATION state machine
5. Implement SPIRAL detection (orbit + shrinking radius)
6. Add `gestureHistory` buffer

### Phase 2: Sphere.js (~40 строк)
1. Add `case 'tap'` → pulse
2. Add `case 'flick'` → push + ghost trace
3. Add `case 'hesitation'` → slow + compress
4. Add `case 'spiral'` → trance

### Phase 3: Verification
1. Test each gesture in browser
2. Console.log gesture classification
3. Verify no regression

---

## ✅ All Semantics Finalized

Все 4 жеста готовы к имплементации.
