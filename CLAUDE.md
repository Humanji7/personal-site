# Post-Void

**GPU particle system (100k) с bloom/tonemap pipeline.**
Интерактивный перформанс — курсор-пастух ведёт рой частиц как ветер+вода.

---

## Quick Start

```bash
cd prototypes/crowdfund-void
npx serve .
# http://localhost:3000/?debug=1
```

---

## Начни здесь

| Задача | Читай |
|--------|-------|
| Понять проект | `docs/MEMORY_BANK/PROJECT_BRIEF.md` |
| Изменить поведение частиц | `prototypes/crowdfund-void/particles/gpgpu/velocity.frag` |
| Изменить размер/цвет | `prototypes/crowdfund-void/particles/shaders/render.vert` |
| Понять pipeline | `docs/MEMORY_BANK/SYSTEM_PATTERNS.md` |
| Найти файл | `docs/MEMORY_BANK/CODEBASE_INDEX.md` |
| Текущий фокус | `docs/MEMORY_BANK/ACTIVE_CONTEXT.md` |
| Термины | `docs/MEMORY_BANK/GLOSSARY.md` |

---

## Memory Bank

```
docs/MEMORY_BANK/
├── PROJECT_BRIEF.md    # Суть, goals, метафоры
├── SYSTEM_PATTERNS.md  # Архитектура, data flow, render graph
├── TECH_CONTEXT.md     # Стек, constraints, file structure
├── CODEBASE_INDEX.md   # Карта файлов, hot paths
├── ACTIVE_CONTEXT.md   # ⭐ Текущий фокус, открытые вопросы
├── PROGRESS.md         # Done, pending, known issues
└── GLOSSARY.md         # Термины проекта
```

---

## Текущий статус

**Готово:** GPGPU particles, PostFX bloom, quality tiers, scroll
**В работе:** Визуальное качество ("бедно и дёшево")
**Открыт:** Выбор образа-метафоры

---

## Протокол работы

См. `docs/PROTOCOL.md` — паттерны материализации идей:
- **СГУСТОК** — образ → конкретный элемент
- **НИТКА** — связи между фрагментами
- **ИНВЕРСИЯ** — проверка переворотом
- **ТЕЛЕСНЫЙ ТЕСТ** — синестезия
- **ПРОТОТИП** — код

---

## Workflows

### Изменить поведение частиц
1. Открой `velocity.frag` — все силы там (L50-190)
2. Тестируй с `?debug=1&tier=ultra`
3. Intensity: `uIntensity` (0=calm, 1=intense)

### Изменить визуал (размер/цвет)
1. Размер: `render.vert:L127-133`
2. Цвет: `render.vert:L108-126`
3. Glow shape: `render.frag`

### Добавить новый quality tier
1. `QualityManager.js:L36-56` — определение
2. Обнови `GLOSSARY.md`

---

## Gotchas

- **Gamma:** только в финальном pass (`PostFXPipeline`). НЕ трогай gamma в `TrailAccumulationPass`
- **Размер частиц:** `baseSize > 30.0` ломает рендер (текущий max ~11). Увеличивай `depthSize` в `render.vert:128` инкрементально, тестируй после каждого шага
- **void.js:** legacy файл, не используется
- **uHistory:** максимум 32 точки, старые (age > 0.8s) игнорируются в ribbon
- **Linear space:** все RT до PostFXPipeline работают в linear. Не добавляй pow(x, 2.2) в промежуточные шейдеры

---

## URL Params

`?debug=1` — HUD | `?tier=ultra` — quality | `?fx=0` — disable postfx

---

## Common Tasks (copy-paste)

### Увеличить размер частиц
```glsl
// render.vert:128 — изменить depthSize
float depthSize = mix(4.0, 10.0, 1.0 - pos.z); // было: 3.0, 8.0
```

### Добавить новую силу в velocity.frag
```glsl
// velocity.frag — после строки ~180 (перед финальным clamp)
vec2 myForce = normalize(someDir) * strength * uIntensity;
vel += myForce;
```

### Изменить цвет свечения
```glsl
// render.vert:108-115 — базовые цвета
vec3 warmCore = vec3(1.0, 0.95, 0.8);  // центр
vec3 coolEdge = vec3(0.7, 0.85, 1.0);  // край
```

### Отладка uniform
```javascript
// в консоли браузера
window.VOID?.particles?.uniforms  // все uniforms
window.VOID?.quality?.current     // текущий tier
```

---

## End-of-Session

```
[ ] Обновить ACTIVE_CONTEXT.md:
    - Дата: YYYY-MM-DD
    - Фокус: что делали
    - Блокеры: что мешает
    - Следующий шаг: конкретное действие
[ ] Обновить PROGRESS.md (done/pending)
[ ] ADR если архитектурное решение
```
