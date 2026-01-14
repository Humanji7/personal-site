# KLYAP v14 Handoff

> Дата: 2026-01-14
> Статус: **✅ Doomscroll Trap реализован — все механики работают**

---

## Что сделано

### 1. Генерация ассетов

23 фрагмента в 4 слоях (intimate/mirror/visceral/noise):

| Слой | Эстетика | Количество |
|------|----------|------------|
| **intimate** | записки, ransom notes, handwritten | ~8 |
| **mirror** | глитч, разбитые экраны, popups | ~7 |
| **visceral** | вены, органика, medical horror | ~5 |
| **noise** | царапины, пыль, fingerprints | ~3 |

### 2. Обработка изображений

Скрипт `scripts/process-klyap-fragments.sh`:
- Удаление SynthID watermark (120px bottom-right)
- Чёрный фон → прозрачность (alpha channel)
- Trim по контенту

### 3. Прототип механики ✅

`prototypes/klyap-v14/index.html`:
- Фрагменты появляются из центра
- Анимация: blur → чёткость + opacity → drift outward
- **Scroll как ускоритель потока**
- Вигнетка + noise overlay
- Debug-панель (fragments counter, speed multiplier)

**Запуск:**
```bash
cd /Users/admin/projects/personal-site
python3 -m http.server 8889
# http://localhost:8889/prototypes/klyap-v14/
```

---

## Идеи по улучшению

### Механика
- [ ] Добавить "волны" плотности — периодические всплески фрагментов
- [ ] Сделать idle-режим медленнее, scroll более агрессивным
- [ ] Добавить звуковой слой (ambient drone + glitch при scroll)
- [ ] Реализовать "насыщение" — после N фрагментов начинается переход в MAZUT

### Визуал
- [ ] Добавить больше noise-текстур для разнообразия
- [ ] Цветовые tints (purple/crimson) по мере погружения
- [ ] Canvas blobs на заднем плане (как в v13)
- [ ] Периодические "вспышки" скан-линий (CRT эффект)

### Контент
- [ ] Разложить фрагменты по подпапкам слоёв для weighted random
- [ ] Сгенерировать ещё 10-15 фрагментов для разнообразия

---

## Файлы проекта

| Путь | Описание |
|------|----------|
| `prototypes/klyap-v14/index.html` | Рабочий прототип |
| `assets/klyap-v14/raw/` | 23 оригинальных изображения |
| `assets/klyap-v14/fragments/` | 23 обработанных PNG |
| `docs/plans/klyap-v14-generation-prompts.md` | Промпты для генерации |
| `scripts/process-klyap-fragments.sh` | Скрипт обработки |

---

## NEXT SESSION PROMPT

```
Продолжи KLYAP v14 — tweak frontend.

Статус:
- Механика doomscroll trap реализована (density curve, exhaustion, meta layer)
- Visual layers добавлены (vignette, scanlines, noise, purple tint)

Что нужно докрутить:
1. Поиграть с таймингами (sparse/hook/overwhelm intervals)
2. Настроить силу visual effects (vignette breathing, noise intensity)
3. Протестировать burst/void частоту — достаточно ли неожиданно?
4. Оценить meta messages — в нужные ли моменты появляются?
5. Общее ощущение: "хочу остановиться но не могу" — достигнуто?

Тест: http://localhost:8889/prototypes/klyap-v14/
```

---

*Обновлено: 2026-01-14 21:13*

