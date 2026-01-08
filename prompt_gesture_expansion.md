# Prompt: Gesture Expansion Implementation

**Для:** Следующая сессия SPHERE  
**Фокус:** Имплементация 4 новых жестов

---

## Контекст

Мы провели исследование gesture universe через биологию и искусство.
Спланировали расширение таксономии с 5 до 9 жестов.

**Handoff:** `handoff_gesture_universe.md`

---

## Задача

Добавить 4 новых жеста в SPHERE:

| Жест | Детекция | Реакция |
|------|----------|---------|
| **Tap** | Короткий контакт (<0.3s), низкая скорость | Пульсация "я тут" |
| **Flick** | Быстрый выход с экрана | Как poke + push |
| **Hesitation** | approach → pause → retreat | Грусть + отзеркаливание |
| **Spiral** | Орбита + уменьшение радиуса | Глубокий транс (остановка, зрачок макс) |

---

## Файлы для изменения

1. `src/InputManager.js` — gesture detection
2. `src/Sphere.js` — gesture reactions

---

## Порядок работы

1. **InputManager:** Add Tap detection
2. **InputManager:** Add Flick detection  
3. **InputManager:** Add Hesitation state machine
4. **InputManager:** Add Spiral detection
5. **Sphere:** Add all 4 case handlers
6. **Test:** Verify in browser

---

## Связанные файлы

- `handoff_gesture_universe.md` — полный план
- `prompt_gesture_universe.md` — исходный research prompt
