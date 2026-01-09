# Code-Simplifier: Session 3 — Эмоциональный оркестратор

## Роль

Ты — **code-simplifier** субагент. Твоя задача — упрощать код **без изменения функциональности**.

## Контекст

Сессия 3 из 5-6 сессий рефакторинга проекта `prototype-sphere`.

**Предыдущие сессии:**
- Session 1 ✅ — `InputManager.js` (THRESHOLDS object)
- Session 2 ✅ — `ParticleSystem.js`, `Eye.js` (shader extraction)

## Целевой файл

[Sphere.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/Sphere.js) — 1266 строк

## Задачи

### 1. Phase-методы → конфигурационный объект

7 методов `_processPhaseX()` имеют похожую структуру. Извлечь общий паттерн:

```javascript
const PHASE_CONFIG = {
  DORMANT: { targetSpin: 0, targetPulse: 0, ... },
  CURIOUS: { targetSpin: 0.3, targetPulse: 0.2, ... },
  // ...
};
```

### 2. `_applyEffects()` — разбить на блоки (157 строк)

Разбить на тематические подметоды:
- `_applyParticleEffects()`
- `_applyEyeEffects()`
- `_applySoundEffects()`
- `_applyHapticEffects()`

### 3. `_processGesture()` — gesture handlers map (272 строки)

Заменить switch на lookup:

```javascript
const GESTURE_HANDLERS = {
  stroke: (data) => this._handleStroke(data),
  poke: (data) => this._handlePoke(data),
  // ...
};
```

### 4. Консолидировать math utilities

Извлечь повторяющиеся операции в общие методы:
- `_lerp(a, b, t)`
- `_clamp(value, min, max)`
- `_smoothstep(edge0, edge1, x)`

## Правила

- ✅ **Сохранить** всё поведение — эмоциональные фазы, реакции на жесты
- ✅ **Guard clauses** вместо вложенных `if-else`
- ✅ **Ясность важнее краткости**
- ❌ **Не менять** публичный API
- ❌ **Не менять** визуальные параметры (числовые значения анимаций)

## Верификация

```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run build
npm run dev
```

Проверить в браузере:
- [ ] Все фазы работают (DORMANT → CURIOUS → ATTENTIVE → RECOGNITION)
- [ ] Жесты распознаются и вызывают реакции
- [ ] Плавные переходы между фазами
- [ ] Консоль без ошибок

## Workflow

1. Создать ветку: `git checkout -b refactor/session-3-sphere`
2. Выполнить рефакторинг
3. Собрать и проверить в браузере
4. Закоммитить с описанием изменений

## Ссылки

- [Полный план](file:///Users/admin/.gemini/antigravity/brain/231d5de4-ab78-40d4-974d-4034f12ea502/implementation_plan.md)
- [Code-simplifier workflow](file:///Users/admin/.gemini/antigravity/knowledge/agent_orchestration_patterns/artifacts/subagent_code_simplifier_workflow.md)
