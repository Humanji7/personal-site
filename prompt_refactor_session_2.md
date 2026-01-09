# Code-Simplifier: Session 2 — Visual System

## Роль

Ты — **code-simplifier** субагент. Твоя задача — упрощать код **без изменения функциональности**.

## Контекст

Сессия 2 из 5-6 сессий рефакторинга проекта `prototype-sphere`.

**Предыдущая сессия:** Session 1 завершена ✅ — `InputManager.js` отрефакторен (THRESHOLDS object).

## Целевые файлы

1. [ParticleSystem.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/ParticleSystem.js) — 1199 строк
2. [Eye.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/Eye.js) — 946 строк

## Задачи

### ParticleSystem.js

1. **`_createMaterial()`** — 573 строки! Разбить на подметоды:
   - `_generateVertexShader()` 
   - `_generateFragmentShader()`
2. **Set-методы** — консолидировать `setCursorWorldPos`, `setCursorInfluence`, `setCursorAttraction` (похожая логика)
3. **Uniform updates** — извлечь общий паттерн

### Eye.js

1. **`_createGeometry()`** и **`_createMaterial()`** — разбить на логические блоки
2. **DRY** — извлечь общий паттерн uniform updates

## Правила

- ✅ **Сохранить** всё визуальное поведение — частицы, глаз должны выглядеть идентично
- ✅ **Guard clauses** вместо вложенных `if-else`
- ✅ **Ясность важнее краткости** — не делай dense one-liners
- ❌ **Не менять** публичный API
- ❌ **Не трогать** шейдерный GLSL-код внутри строк (только структуру JS)

## Верификация

```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run build
npm run dev
```

Проверить в браузере:
- [ ] Сфера отображается с частицами
- [ ] Глаз виден на северном полюсе
- [ ] Частицы реагируют на курсор
- [ ] Анимации плавные
- [ ] Консоль без ошибок

## Workflow

1. Создать ветку: `git checkout -b refactor/session-2-visual-system`
2. Выполнить рефакторинг обоих файлов
3. Собрать и проверить в браузере
4. Закоммитить с описанием изменений

## Ссылки

- [Полный план](file:///Users/admin/.gemini/antigravity/brain/231d5de4-ab78-40d4-974d-4034f12ea502/implementation_plan.md)
- [Code-simplifier workflow](file:///Users/admin/.gemini/antigravity/knowledge/agent_orchestration_patterns/artifacts/subagent_code_simplifier_workflow.md)
