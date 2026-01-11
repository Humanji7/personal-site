# HANDOFF: КЛЯП — Комната распирания

## Статус

**v13 — Text-Driven Dissociation** (прототип готов, тестирование)

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

### Text-Driven Flow (19 сегментов)

```
DRIFT (0-50):  "ты здесь." → "ты читаешь." → "челюсть сжата" → "проверь."
SPLIT (50-80): "кто-то смотрит" → "ты думаешь, что это ты" → "я или ты?"
YIELD (80-95): тишина → "напиши одно слово" → input field
```

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
- [/] Тестирование scroll/text timing
- [ ] Интеграция LLM в DIALOGUE фазу (опционально)
- [ ] Звуковое измерение
- [ ] Переход в MAZUT

---

## Файлы

| Путь | Назначение |
|------|------------|
| `docs/KLYAP_CHARACTER.md` | Характер комнаты |
| `docs/KLYAP_SYSTEM_PROMPT.md` | System prompt для LLM |
| `docs/KLYAP_V13_DISSOCIATION.md` | Философия v13 |
| **`prototypes/klyap-v13/index.html`** | **Прототип v13 (text-driven)** |
| `prototypes/klyap-v10/index.html` | Прототип v12.2 |
| `prototypes/klyap-v10/server.js` | Express proxy для Claude API |

---

## История версий

| Версия | Дата | Изменения |
|--------|------|-----------|
| **v13.1** | 2026-01-11 | Text-Driven prototype: state machine (font glitch ↔ text flow), 19 text segments, MIN_DISPLAY_TIME, scroll tuning |
| v13 | 2026-01-11 | Философский сдвиг: текст как главный инструмент диссоциации. Character Design, System Prompt. |
| v12.2 | 2026-01-11 | Premium typography: Playfair Display, Mystery Quest, Special Elite |
| v12.1 | 2026-01-11 | Visual condensation: blobs/veins/glow converge to center |
| v12 | 2026-01-11 | Scroll metamorphosis, LLM chat, fog layers |
| v11 | 2026-01-11 | Strangeness: depth system, panic detection |
| v10 | 2026-01-11 | Enhanced typography, living bubbles |

---

*Обновлён: 2026-01-11*
