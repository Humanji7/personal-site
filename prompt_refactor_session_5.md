# Code-Simplifier: Session 5 — Memory & Effects

## Роль

Ты — **code-simplifier** субагент. Твоя задача — упрощать код **без изменения функциональности**.

## Контекст

Сессия 5 из 6 сессий рефакторинга проекта `prototype-sphere`.

**Предыдущие сессии:**
- Session 1 ✅ — `InputManager.js` (THRESHOLDS object)
- Session 2 ✅ — `ParticleSystem.js`, `Eye.js` (shader extraction)
- Session 3 ✅ — `Sphere.js` (PHASE_CONFIG, gesture handlers map)
- Session 4 ✅ — `SoundManager.js`, `SonicOrganism.js` (helpers extraction)

## Целевые файлы

1. [MemoryManager.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/MemoryManager.js) — 514 строк
2. [EffectConductor.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/EffectConductor.js) — 247 строк
3. [HapticManager.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/HapticManager.js) — 32 строки ✅ (уже чистый, не требует изменений)

## Задачи

### MemoryManager.js

1. **Trace logic consolidation** — методы `_createGhostTrace`/`createWarmTrace` и `_updateGhostTraces`/`_updateWarmTraces` дублируют логику. Создать общие методы:
   ```javascript
   _createTrace(type, inputState) { ... }
   _updateTraces(type, delta) { ... }
   ```

2. **setLatestTracePosition** — консолидировать `setLatestGhostTracePosition` и `setLatestWarmTracePosition` в один метод с параметром типа

3. **Trust modifiers** — методы `getTensionDecayModifier`, `getTraumaThresholdModifier`, `getPeaceColorMod` имеют похожий паттерн. Рассмотреть создание таблицы модификаторов

4. **Persistence methods** — методы `_loadTrust`, `_saveTrust`, `_scheduleSave` можно упростить

### EffectConductor.js

1. **Effect config** — вынести конфигурацию эффектов из конструктора в константу:
   ```javascript
   const EFFECT_CONFIG = {
     chromaticAberration: { weight: 0.25, minDuration: 1.5, ... },
     dynamicSize: { ... },
     sparkles: { ... }
   };
   ```

2. **`_rollDice()`** — упростить вычисление через guard clauses

3. **`_activateEffect` / `_deactivateEffect`** — возможно объединить в один метод с флагом

### HapticManager.js

- ✅ Уже достаточно чистый — не требует изменений

## Правила

- ✅ **Сохранить** всё поведение — trust persistence, ghost/warm traces, effect scheduling
- ✅ **Guard clauses** вместо вложенных `if-else`
- ✅ **Ясность важнее краткости**
- ❌ **Не менять** публичный API
- ❌ **Не менять** числовые параметры (trust decay rates, effect timings)

## Верификация

```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run build
npm run dev
```

Проверить в браузере:
- [ ] Trust index сохраняется между сессиями (localStorage)
- [ ] Ghost traces появляются и затухают
- [ ] Warm traces работают при prolonged stroke
- [ ] Effects (chromatic aberration, sparkles) активируются случайно
- [ ] Консоль без ошибок

## Workflow

1. Создать ветку: `git checkout -b refactor/session-5-memory-effects`
2. Выполнить рефакторинг MemoryManager.js
3. Выполнить рефакторинг EffectConductor.js
4. Собрать и проверить в браузере
5. Закоммитить с описанием изменений

## Ссылки

- [Полный план](file:///Users/admin/.gemini/antigravity/knowledge/sphere_project_master/artifacts/architecture/refactoring_strategy_stage_7.md)
- [Code-simplifier workflow](file:///Users/admin/.gemini/antigravity/knowledge/agent_orchestration_patterns/artifacts/subagent_code_simplifier_workflow.md)
