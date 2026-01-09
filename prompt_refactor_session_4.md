# Code-Simplifier: Session 4 — Аудио системы

## Роль

Ты — **code-simplifier** субагент. Твоя задача — упрощать код **без изменения функциональности**.

## Контекст

Сессия 4 из 5-6 сессий рефакторинга проекта `prototype-sphere`.

**Предыдущие сессии:**
- Session 1 ✅ — `InputManager.js` (THRESHOLDS object)
- Session 2 ✅ — `ParticleSystem.js`, `Eye.js` (shader extraction)
- Session 3 ✅ — `Sphere.js` (PHASE_CONFIG, gesture handlers map)

## Целевые файлы

1. [SoundManager.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/SoundManager.js) — 546 строк
2. [SonicOrganism.js](file:///Users/admin/projects/personal-site/prototype-sphere/src/SonicOrganism.js) — 513 строк
3. [GranularProcessor.js](file:///Users/admin/projects/personal-site/prototype-sphere/public/worklets/GranularProcessor.js) — 211 строк (минимальные изменения)

## Задачи

### SoundManager.js

1. **Паттерн создания осцилляторов** — повторяется в каждом play-методе:
   ```javascript
   _createOscillator(type, frequency, gain) { ... }
   ```

2. **Envelope pattern (ADSR)** — извлечь общий паттерн attack-decay-release:
   ```javascript
   _applyEnvelope(gainNode, attack, decay, sustain, release) { ... }
   ```

3. **Play-методы** — консолидировать общую логику (playWhoosh, playChime, playPulse и т.д.)

### SonicOrganism.js

1. **Init-методы** — убрать дублирование в `_initSpectralBody`, `_initPulseNetwork`, `_initGranularMembrane`

2. **Update-методы** — консолидировать похожую логику обновления

### GranularProcessor.js

- ✅ Уже достаточно чистый — минимальные изменения по необходимости

## Правила

- ✅ **Сохранить** всё звуковое поведение — тембр, громкость, тайминги
- ✅ **Guard clauses** вместо вложенных `if-else`
- ✅ **Ясность важнее краткости**
- ❌ **Не менять** публичный API
- ❌ **Не менять** звуковые параметры (частоты, envelope values)

## Верификация

```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run build
npm run dev
```

Проверить в браузере:
- [ ] Ambient hum при взаимодействии
- [ ] Gesture-specific sounds работают (stroke, poke, tap, flick)
- [ ] Звук плавно нарастает и затухает
- [ ] Консоль без ошибок (особенно AudioContext warnings)

## Workflow

1. Создать ветку: `git checkout -b refactor/session-4-audio`
2. Выполнить рефакторинг SoundManager.js
3. Выполнить рефакторинг SonicOrganism.js
4. Собрать и проверить в браузере (звук!)
5. Закоммитить с описанием изменений

## Ссылки

- [Полный план](file:///Users/admin/.gemini/antigravity/brain/231d5de4-ab78-40d4-974d-4034f12ea502/implementation_plan.md)
- [Code-simplifier workflow](file:///Users/admin/.gemini/antigravity/knowledge/agent_orchestration_patterns/artifacts/subagent_code_simplifier_workflow.md)
