# HANDOFF: КЛЯП v10.3 — Living Bubbles

## Статус

**v10.3 готов** → [prototypes/klyap-v10/index.html](file:///Users/admin/projects/personal-site/prototypes/klyap-v10/index.html)

| Компонент | Статус |
|-----------|--------|
| Шрифт glitch | ✅ 8 шрифтов, рваные переходы |
| Мультиязычный текст | ✅ "распирает" на 12 языках |
| Letter-spacing/size jitter | ✅ |
| Chromatic aberration | ✅ RGB split (20%) |
| Scanline overlay | ✅ |
| **Living Bubbles** | ✅ **РЕАЛИЗОВАНО v10.3** |

---

## v10.3: Живые пузыри-провокации

| Molecule | Описание | Статус |
|----------|----------|--------|
| M1 | Blob-форма (organic morph) | ✅ |
| M2 | Async дыхание (per-bubble delay) | ✅ |
| M3 | Bio-luminescence (3-layer glow) | ✅ |
| M4 | Proximity reaction (тянется к курсору) | ✅ |
| M5 | Whisper preview (hint на long hover) | ✅ |
| M6 | First-movement trigger | ✅ |

### Новая система триггеров

**Вместо idle-timer → событийные триггеры:**

1. После 5+ сек без движения → пользователь "замер"
2. Первое движение после замирания → пробуждает следующий пузырь
3. Fallback: каждые 8 сек idle → автоматический показ

**Эффект**: Комната ЗАМЕЧАЕТ пользователя, не наоборот.

### Whisper preview

При hover 1.5 сек появляется hint:

| Пузырь | Whisper |
|--------|---------|
| мягко внутри | ...расскажу... |
| не сжимайся | ...не бойся... |
| ты не первый здесь | ...помню всех... |
| ничего не нужно делать | ...просто будь... |
| выдохни. я впитаю | ...всё заберу... |

---

## UX-анализ

Проведён на основе 4 фреймворков:
- Don Norman Emotional Design (visceral/behavioral/reflective)
- Nir Eyal Hooked Model (trigger/action/variable reward)
- BJ Fogg Behavior Model (motivation/ability/prompt)
- Horror Game Design patterns

**Ключевой инсайт**: Пузыри должны быть одновременно *отталкивающими* и *притягивающими*.

---

## Файлы

| Путь | Назначение |
|------|------------|
| `prototypes/klyap-v10/index.html` | Текущий прототип v10.3 |
| `.gemini/.../klyap_bubble_ux_analysis.md` | Полный UX-анализ |

---

## Следующие шаги

- [ ] LLM-интеграция: диалог с комнатой после клика
- [ ] Звуковые подсказки (whisper audio)
- [ ] Mobile touch adaptation

---

*Обновлён: 2026-01-11*
