# HANDOFF: КЛЯП — Комната распирания

## Статус

**v13.5 — LLM Chat Integration** ✅ ГОТОВО

---

## Текущее состояние

Полнофункциональный прототип с text-driven диссоциацией + LLM чат.

### Контекст

Проблема: переход от text-driven к LLM chat выглядел "процедурным" — видно сгущение к центру.

Решение (после брейншторма с Ari Aster, Marina Abramović, Mark Danielewski, Felix Barrett):
**Трёхфазный невидимый переход** — input проявляется постепенно, пользователь не видит момента появления.

### Что делать (по порядку):

```
1. CSS: добавить .chat-input.revealing, .awaiting, .active + @keyframes awaitingPulse
2. JS: создать функцию updateSoftTransition() с тремя фазами
3. JS: вызывать updateSoftTransition() из applyDepthEffects()
4. JS: scroll blocking только на depth >= 100 (не раньше)
5. JS: убрать вызовы enterLiberationPhase/enterTrapPhase/executeHardCut из updateMetamorphosis()
6. HTML: убрать <div class="chat-arrival-text">напиши одно слово.</div>
7. Тест: запустить сервер, проскролить до 100, кликнуть
```

### Трёхфазный переход:

```
depth 80-90:   input ПРОЯВЛЯЕТСЯ (opacity 0 → 0.5)
               text-block тускнеет (opacity 1 → 0.5)

depth 90-100:  input ПОЛНОСТЬЮ ВИДЕН (opacity 0.5 → 1)
               внутри появляется "..."
               text-block почти невидим (opacity 0.2)

depth 100:     scroll БЛОКИРУЕТСЯ
               input ждёт клика (класс .awaiting)

клик:          input АКТИВИРУЕТСЯ
               "..." исчезает, фокус на поле
               metamorphosis.phase = 'chat'
```

### Утверждённые решения:

- **Клик:** где угодно на экране (`document.addEventListener('click', ...)`)
- **Arrival text:** убрать полностью
- **Bubbles:** НЕ сгущать к центру, оставить как есть

### Ключевой код (из плана):

```javascript
function updateSoftTransition() {
    const depth = state.depth;

    // Фаза 1: ПРОЯВЛЕНИЕ (80-90)
    if (depth >= 80 && depth < 90) {
        const progress = (depth - 80) / 10;
        chatInput.style.opacity = progress * 0.5;
        textEl.style.opacity = 1 - progress * 0.5;
    }

    // Фаза 2: ПРИСУТСТВИЕ (90-100)
    if (depth >= 90 && depth < 100) {
        chatInput.style.opacity = 0.5 + ((depth - 90) / 10) * 0.5;
        if (chatInput.value === '') chatInput.value = '...';
        textEl.style.opacity = 0.2;
    }

    // Фаза 3: СОГЛАСИЕ (100)
    if (depth >= 100 && !metamorphosis.awaitingClick) {
        metamorphosis.awaitingClick = true;
        chatInput.classList.add('awaiting');
        document.addEventListener('click', activateChat, { once: true });
    }
}

function activateChat() {
    chatInput.classList.remove('awaiting');
    chatInput.classList.add('active');
    chatInput.value = '';
    chatInput.focus();
    metamorphosis.phase = 'chat';
    metamorphosis.chatReady = true;
}
```

### Запуск для тестирования:

```bash
cd /Users/admin/projects/personal-site/prototypes/klyap-v13
python3 -m http.server 8080
# → http://localhost:8080
```

---

> **Философский сдвиг**: Текст — главный инструмент изменения сознания.
> Целевое состояние: **диссоциация** — "я наблюдаю себя со стороны".

| Документ | Назначение |
|----------|-----------|
| [KLYAP_CHARACTER.md](file:///Users/admin/projects/personal-site/docs/KLYAP_CHARACTER.md) | Характер комнаты — онтология, паттерны, голос |
| [KLYAP_SYSTEM_PROMPT.md](file:///Users/admin/projects/personal-site/docs/KLYAP_SYSTEM_PROMPT.md) | Рабочий system prompt для LLM |
| [KLYAP_V13_DISSOCIATION.md](file:///Users/admin/projects/personal-site/docs/KLYAP_V13_DISSOCIATION.md) | Философия и слои опыта |
| **[prototypes/klyap-v13/](file:///Users/admin/projects/personal-site/prototypes/klyap-v13/)** | **Прототип v13 (text-driven)** |
| [prototypes/klyap-v10/](file:///Users/admin/projects/personal-site/prototypes/klyap-v10/) | Прототип v12.2 (baseline) |

---

## v13: Реализовано

### State Machine: Font Glitch ↔ Text-Driven

| Действие | Результат |
|----------|-----------|
| Mouse move (до scroll) | Font Glitch — "распирает" на разных языках |
| Первый scroll | Font Glitch СТОП, Text-Driven СТАРТ |
| Остановка + mouse move | Font Glitch ВОЗВРАЩАЕТСЯ |
| Второй scroll | Font Glitch НАВСЕГДА OFF, только Text-Driven |

### Text-Driven Flow (14 сегментов) → Metamorphosis Handoff

```
DRIFT (0-50):  "ты здесь." → "ты читаешь." → "челюсть сжата" → "проверь."
SPLIT (50-78): "кто-то смотрит" → "ты думаешь, что это ты" → "уже неважно."
--- HANDOFF at depth 70 ---
METAMORPHOSIS (70+): Liberation → Trap → Hard Cut → Chat ("напиши одно слово.")
```

### Архитектура перехода depth 70→LLM

| Depth | Система | Событие |
|-------|---------|---------|
| 0-78 | TEXT_FLOW | Текстовая диссоциация |
| 70 | METAMORPHOSIS | Liberation: vignette расширяется, bubbles схлопываются |
| 78 | TEXT_FLOW | Последний текст: "уже неважно." |
| 85 | METAMORPHOSIS | Trap: scroll блокируется, всё замирает |
| ~88 | METAMORPHOSIS | Hard Cut: мгновенный переход |
| 88+ | CHAT | Input появляется: "напиши одно слово." |

**Ключевое решение:** TEXT_FLOW и Metamorphosis работают параллельно на depth 70-78, затем TEXT_FLOW завершается и Metamorphosis берёт полный контроль.

### Технические изменения

- Scroll sensitivity: `0.015` (медленный, контролируемый)
- MIN_DISPLAY_TIME: `2000ms` на текст
- Text queue system — тексты показываются последовательно
- Визуалы v12.2 сохранены (membrane, bubbles, fog)

---

## Запуск

```bash
# v13 (text-driven)
cd prototypes/klyap-v13
python3 -m http.server 8888
# → http://localhost:8888

# v12.2 (baseline с LLM)
cd prototypes/klyap-v10
npm start
# → http://localhost:3333
```

---

## Следующие шаги

- [x] Прототип v13 с text-driven flow
- [x] Тестирование scroll/text timing
- [x] Интеграция LLM в DIALOGUE фазу
- [ ] Звуковое измерение
- [ ] Переход в MAZUT

---

## Файлы

| Путь | Назначение |
|------|------------|
| `docs/KLYAP_CHARACTER.md` | Характер комнаты |
| `docs/KLYAP_SYSTEM_PROMPT.md` | System prompt для LLM |
| `docs/KLYAP_V13_DISSOCIATION.md` | Философия v13 |
| **`prototypes/klyap-v13/index.html`** | **Прототип v13 (text-driven + LLM)** |
| **`prototypes/klyap-v13/server.js`** | **Express proxy для Claude API** |
| `prototypes/klyap-v10/index.html` | Прототип v12.2 |
| `prototypes/klyap-v10/server.js` | Express proxy (legacy) |

---

## История версий

| Версия | Дата | Изменения |
|--------|------|-----------|
| **v13.6** | 2026-01-11 | TEXT_FLOW protection: panic text ("сладко") disabled after depth 10; LLM response stays 12s (was 8s, fixed finally block conflict) |
| v13.5 | 2026-01-11 | LLM Chat Integration: server.js с полным system prompt, контекст (depth/time/pattern), typing indicator |
| v13.4 | 2026-01-11 | Трёхфазный переход D+E+H: input проявляется (80-90), "..." (90-100), клик для активации (100) |
| v13.3 | 2026-01-11 | Metamorphosis Handoff: TEXT_FLOW завершается на depth 78, Metamorphosis ведёт к LLM |
| v13.2 | 2026-01-11 | Text Persistence Model: state machine держит текст через depth, MIN_DISPLAY_TIME 2.5s |
| v13.1 | 2026-01-11 | Text-Driven prototype: state machine (font glitch ↔ text flow), 19 text segments, MIN_DISPLAY_TIME, scroll tuning |
| v13 | 2026-01-11 | Философский сдвиг: текст как главный инструмент диссоциации. Character Design, System Prompt. |
| v12.2 | 2026-01-11 | Premium typography: Playfair Display, Mystery Quest, Special Elite |
| v12.1 | 2026-01-11 | Visual condensation: blobs/veins/glow converge to center |
| v12 | 2026-01-11 | Scroll metamorphosis, LLM chat, fog layers |
| v11 | 2026-01-11 | Strangeness: depth system, panic detection |
| v10 | 2026-01-11 | Enhanced typography, living bubbles |

---

*Обновлён: 2026-01-11*
