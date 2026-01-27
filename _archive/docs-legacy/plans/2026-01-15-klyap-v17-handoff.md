# Personal Site v17 — Handoff Prompt

> **Дата:** 2026-01-15 23:00

---

## Контекст

KLYAP v17 создан. Готовы Phase 1-2:
- ✅ Performance: `maxActiveFragments=12`, max 3× повторений за цикл
- ✅ 40s time-based cycle: SPARSE(0-15s) → HOOK(15-30s) → OVERWHELM(30-38s) → FADE(38-40s)
- ✅ GSAP CDN подключен
- ✅ Scroll indicator в FADE фазе

---

## Твоя задача: Phase 3 — Tear Animation

**Цель:** После 40s цикла KLYAP экран "разрывается" и открывает Portfolio секцию.

**Технологии:**
- GSAP (уже подключен)
- WebGL shader для displacement-эффекта

**Концепт разрыва:**
```javascript
gsap.timeline()
  .to('#klyap-left', { x: '-50vw', duration: 0.8 })
  .to('#klyap-right', { x: '50vw', duration: 0.8 }, 0)
  .to('#portfolio', { opacity: 1, y: 0 }, 0.4);
```

**Подход:**
1. Дублировать KLYAP container на 2 половины (или clip-path)
2. Добавить `#portfolio-section` placeholder под KLYAP
3. Trigger tear в конце FADE фазы (38-40s)
4. WebGL shader: `feDisplacementMap` или custom GLSL

---

## Файлы

| Файл | Описание |
|------|----------|
| `prototypes/klyap-v17/index.html` | Рабочий прототип |
| `docs/plans/2026-01-15-personal-site-v17-strategy.md` | Стратегия (Structure B: Разрыв) |
| `.gemini/.../implementation_plan.md` | Полный план |

---

## Запуск

```bash
cd /Users/admin/projects/personal-site
npx serve . -p 3017
# → http://localhost:3017/prototypes/klyap-v17/
```

---

*Handoff: 2026-01-15 23:03*
