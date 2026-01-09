# Code-Simplifier: Session 6 — Integration & Finalization

## Роль

Ты — **code-simplifier** субагент. Твоя задача — упрощать код **без изменения функциональности**.

## Контекст

Сессия 6 из 6 (финальная) рефакторинга проекта `prototype-sphere`.

**Предыдущие сессии:**
- Session 1 ✅ — `InputManager.js` (THRESHOLDS object)
- Session 2 ✅ — `ParticleSystem.js`, `Eye.js` (shader extraction)
- Session 3 ✅ — `Sphere.js` (PHASE_CONFIG, gesture handlers map)
- Session 4 ✅ — `SoundManager.js`, `SonicOrganism.js` (helpers extraction)
- Session 5 ✅ — `MemoryManager.js`, `EffectConductor.js` (trace consolidation)

## Целевой файл

[main.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/main.js) — точка интеграции всех модулей

## Задачи

### 1. API Sync Verification

Убедиться, что все публичные API модулей, изменённых в S1-S5, корректно вызываются в `main.js`:
- `InputManager` методы жестов
- `ParticleSystem` / `Eye` обновления
- `Sphere` фазовые переходы
- `SoundManager` / `SonicOrganism` аудио-триггеры
- `MemoryManager` trust/trace методы
- `EffectConductor` активация эффектов

### 2. Initialization Order

Проверить и задокументировать порядок инициализации модулей. При необходимости:
- Добавить комментарии о зависимостях
- Консолидировать похожие init-блоки

### 3. Update Loop Cleanup

Метод `update()` или основной цикл:
- Проверить последовательность вызовов
- Удалить избыточные проверки
- Применить guard clauses если есть вложенные условия

### 4. Event Wiring Audit

Проверить связки событий (input → sphere → sound → effects):
- Убедиться что все callbacks корректны после рефакторинга
- Удалить мёртвый код если найден

## Правила

- ✅ **Минимальные изменения** — это верификационная сессия
- ✅ **Guard clauses** вместо вложенных `if-else`
- ✅ **Документировать** найденные проблемы
- ❌ **Не менять** логику взаимодействия модулей
- ❌ **Не менять** порядок инициализации без веской причины

## Верификация

```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run build
npm run dev
```

### Полный интеграционный тест:

- [ ] Сфера рендерится
- [ ] Глаз следит за курсором
- [ ] Все жесты распознаются (tap, poke, stroke, hold, flick, orbit, spiral, tremble, hesitation)
- [ ] Фазовые переходы работают
- [ ] Звуки воспроизводятся
- [ ] Trust сохраняется в localStorage
- [ ] Ghost/Warm traces появляются
- [ ] Effects активируются
- [ ] Haptic feedback работает (на поддерживаемых устройствах)
- [ ] Консоль без ошибок

## Workflow

1. Создать ветку: `git checkout -b refactor/session-6-integration`
2. Проверить API вызовы в main.js
3. Применить минимальные улучшения
4. Полный интеграционный тест
5. Финальный коммит

## После завершения

После успешной верификации Session 6:
1. Merge все ветки в main
2. Обновить CHANGELOG с описанием рефакторинга
3. Финальный билд и деплой

## Ссылки

- [Полный план](file:///Users/admin/.gemini/antigravity/knowledge/sphere_project_master/artifacts/architecture/refactoring_strategy_stage_7.md)
- [Code-simplifier workflow](file:///Users/admin/.gemini/antigravity/knowledge/agent_orchestration_patterns/artifacts/subagent_code_simplifier_workflow.md)
