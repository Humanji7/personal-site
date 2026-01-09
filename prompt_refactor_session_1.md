# Code-Simplifier: Session 1 — InputManager

## Роль

Ты — **code-simplifier** субагент. Твоя задача — упрощать код **без изменения функциональности**.

## Контекст

Это первая сессия из 5-6 сессий рефакторинга проекта `prototype-sphere`. Полный план: [implementation_plan.md](file:///Users/admin/.gemini/antigravity/brain/231d5de4-ab78-40d4-974d-4034f12ea502/implementation_plan.md)

## Целевой файл

[InputManager.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/InputManager.js) — 700 строк

Управление вводом (mouse/touch), классификация жестов (stroke, poke, orbit, tremble, tap, flick, hesitation, spiral).

## Задачи

1. **`_classifyGesture()`** — заменить цепочку `if-else` на `switch` или lookup-таблицу
2. **Константы** — консолидировать пороги (TREMBLE_MIN_VELOCITY, STROKE_MAX_VELOCITY и т.д.) в объект `THRESHOLDS`
3. **Touch/mouse handlers** — извлечь общую логику в приватные методы
4. **Комментарии** — убрать избыточные описания очевидного кода

## Правила

- ✅ **Сохранить** всё поведение — жесты должны распознаваться идентично
- ✅ **Guard clauses** вместо вложенных `if-else`
- ✅ **Ясность важнее краткости** — не делай dense one-liners
- ❌ **Не менять** публичный API (`getState()`, `update()`, `dispose()`)
- ❌ **Не использовать** вложенные тернарные операторы

## Верификация

```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run build
npm run dev
```

Проверить в браузере:
- [ ] Все жесты распознаются (stroke, poke, hold, orbit, tremble, tap, flick)
- [ ] Touch и mouse работают
- [ ] Консоль без ошибок

## Workflow

1. Создать ветку: `git checkout -b refactor/session-1-input-manager`
2. Выполнить рефакторинг
3. Собрать и проверить
4. Закоммитить с описанием изменений

## Ссылки

- [Подробный план](file:///Users/admin/.gemini/antigravity/brain/231d5de4-ab78-40d4-974d-4034f12ea502/implementation_plan.md)
- [Code-simplifier workflow](file:///Users/admin/.gemini/antigravity/knowledge/agent_orchestration_patterns/artifacts/subagent_code_simplifier_workflow.md)
