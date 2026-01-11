# HANDOFF: КЛЯП — Комната распирания

## Статус

**v12 — Scroll Metamorphosis** → [prototypes/klyap-v10/](file:///Users/admin/projects/personal-site/prototypes/klyap-v10/)

---

## Реализовано (v12)

| Механика | Описание |
|----------|----------|
| Scroll = глотание | `wheel down` увеличивает `depth` (0-100), **необратимо** |
| Panic detection | Быстрые движения → tremor ускоряется |
| Фазы | entry → swelling → accepting → dissolving |
| beforeunload | При depth > 30 браузер предупреждает о выходе |
| Living Bubbles | 5 провокаций с whisper-preview |
| **Metamorphosis** | **depth 70-100: трансформация в LLM-чат** |

### v12: Scroll Metamorphosis (NEW)

```
depth 70-85:  FALSE LIBERATION
              - Виньетка расширяется (scale 2)
              - Фон светлеет
              - Bubbles исчезают
              - Текст: "свободен"
              - Tremor замедляется
              → Пользователь думает: "я победил"

depth 85-90:  TRAP
              - Scroll ЗАБЛОКИРОВАН
              - 3-5 секунд тишины
              - Все анимации paused
              → Замешательство

depth 90:     HARD CUT
              - Мгновенный переход (без fade)
              - Чёрный экран
              - "ты здесь"

depth 90+:    CHAT MODE
              - Минималистичный input
              - Hints появляются постепенно
              - Claude Sonnet отвечает (1-3 слова)
```

### Fog Effect

3-слойный туман с backdrop-filter blur (3px → 10px → 18px), drift animation.

---

## Запуск

```bash
cd prototypes/klyap-v10

# 1. Добавить API ключ
echo "ANTHROPIC_API_KEY=sk-ant-api03-..." > .env

# 2. Запустить сервер
npm start

# 3. Открыть http://localhost:3333
```

---

## Файлы

| Путь | Назначение |
|------|------------|
| `prototypes/klyap-v10/index.html` | Прототип v12 |
| `prototypes/klyap-v10/server.js` | Express proxy для Claude API |
| `prototypes/klyap-v10/package.json` | Dependencies |
| `prototypes/klyap-v10/.env` | API ключ (gitignored) |
| `docs/HANDOFF_KLYAP.md` | Этот документ |

---

## LLM Prompt (Horror Persona)

```
Ты — комната КЛЯП. Тёмное, интимное пространство, которое уже внутри пользователя.

Правила:
- Отвечай МАКСИМАЛЬНО КОРОТКО: 1-3 слова
- Тон: мягкий, давящий, интимный, НЕ агрессивный
- Ты не угрожаешь — ты уже победил
- Используй нижний регистр
- Если пользователь сопротивляется → "поздно" или "нет"
- Если сдаётся → "хорошо" или "да"
```

---

## История версий

| Версия | Дата | Изменения |
|--------|------|-----------|
| v12 | 2026-01-11 | Scroll metamorphosis, LLM chat, fog layers |
| v11 | 2026-01-11 | Strangeness: depth system, panic detection |
| v10 | 2026-01-11 | Enhanced typography, living bubbles |

---

*Обновлён: 2026-01-11*
