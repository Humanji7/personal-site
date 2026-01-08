# Prompt: Gesture Verification ✅ COMPLETED

**Для:** Следующая сессия SPHERE  
**Фокус:** Тестирование 4 новых жестов  
**Статус:** ✅ Verified 2026-01-08

## Контекст

Имплементировали 4 новых жеста в Stage 7:
- **Tap** — короткий тап (пульсация "я тут")
- **Flick** — быстрый swipe off screen (push + trace)
- **Hesitation** — approach → pause → retreat (грусть)
- **Spiral** — orbit + уменьшение радиуса (транс)

**Handoff:** `handoff_gesture_expansion.md`

---

## Задача

Протестировать все 4 жеста в браузере + регрессию.

### Test Matrix

| Жест | Действие | Expected Visual | Expected Sound |
|------|----------|-----------------|----------------|
| **TAP** | Короткий тап <0.3s | Pulse 15%, glow | Soft "bing" |
| **FLICK** | Fast swipe → off screen | Push ripple + ghost trace | Click + whoosh |
| **HESITATION** | Approach → pause 0.5s → retreat | Slow breathing, compression | Ambient fade |
| **SPIRAL** | Orbit + move finger closer | Breathing stops, pupil max | Low drone |

---

## Порядок работы

1. **Start dev server** (уже запущен на `:5173`)
2. **Navigate** → `http://localhost:5173`
3. **Test each gesture:**
   - Console log gesture classification
   - Verify visual reaction
   - Verify sound (if present)
4. **Regression check:**
   - stroke, poke, orbit, tremble, hold
5. **Document issues** → create bug report if needed

---

## Debug Helper

Add to browser console:
```js
window.sphere.setDebug(true)
```

---

## Success Criteria

- ✅ Все 4 жеста детектируются корректно
- ✅ Визуальные реакции работают
- ✅ Нет регрессий на старых жестах
- ✅ Console classification shows correct gesture name
