# Handoff: Tap-to-Transition (Stage 7)

## Текущий статус

**Tap-to-transition НЕ РЕАЛИЗОВАН.** Это следующая задача.

### Что сейчас делает tap/click:
- **Быстрый click** → Распознаётся как `poke` (боль) → сфера вздрагивает, создаётся Cold Trace
- **Долгий hold** → Распознаётся как `holding` → RECOGNITION sequence (Hold-to-Recognize)

### Почему tap "не меняет поведение":
Tap = короткое касание. Система интерпретирует его как **poke** (резкое движение). Это вызывает:
- `pokeStartle()` — сфера вздрагивает
- Возможно создание Cold Trace (если достаточно интенсивно)
- Повышение `tensionTime`

Но **перехода к следующей сцене нет**, потому что логика `TRANSITION` ещё не написана.

---

## Что нужно реализовать

### 1. Детекция "intentional tap"
В `InputManager.js` или `Sphere.js`:
- Raycast на сферу (клик именно по ней, не мимо)
- Условие: минимальное время взаимодействия с сайтом (например, > 5 сек)
- Различать: poke (резкое) vs intention tap (мягкий, осознанный)

### 2. Фаза TRANSITION в Sphere.js
```javascript
PHASE: {
  PEACE: 'peace',
  LISTENING: 'listening',
  TENSION: 'tension',
  TRAUMA: 'trauma',
  RECOGNITION: 'recognition',
  TRANSITION: 'transition'  // NEW
}
```

### 3. Анимация перехода
1. **Freeze** — замирание
2. **Contract** — сжатие к центру (0.5s)
3. **Fade** — рассыпание частиц (0.5s)
4. **Black** — чёрный экран → KLYAP

---

## Файлы для изменения
- `InputManager.js` — детекция intentional tap
- `Sphere.js` — фаза TRANSITION + анимация
- `main.js` — обработка "переход завершён"
- `ParticleSystem.js` — возможно, новые uniforms для fade

---

## Открытые вопросы
1. Как отличить intentional tap от poke?
2. Нужен ли минимальный "стаж" взаимодействия перед переходом?
3. Что после перехода — текст манифеста или сразу KLYAP?

## Ссылки
- [prompt_tap_transition.md](prompt_tap_transition.md) — Полный промпт задачи
- [handoff_hold_to_recognize.md](handoff_hold_to_recognize.md) — Hold-to-Recognize (реализовано)
