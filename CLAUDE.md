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
- **Размер x3:** увеличение размера частиц в 3 раза ломает рендер — причина не исследована
- **void.js:** legacy файл, не используется
- **uHistory:** максимум 32 точки, старые (age > 0.8s) игнорируются в ribbon

---

## URL Params

`?debug=1` — HUD | `?tier=ultra` — quality | `?fx=0` — disable postfx

---

## End-of-Session

```
[ ] Обновить ACTIVE_CONTEXT.md (фокус, блокеры)
[ ] Обновить PROGRESS.md (done/pending)
[ ] ADR если архитектурное решение
```
