# KLYAP v16 Handoff — Session 2026-01-15

> Дата: 2026-01-15  
> Статус: **✅ Text-block + Bubbles интегрированы**

---

## Что реализовано в этой сессии

### Text-block система
- Центральное слово с дыхательной анимацией
- 8 фраз с ротацией каждые 15 сек
- Появление через 3 сек после загрузки

### Provocation Bubbles (5 штук)
- Живые баблы слева с blob morphing + bio-luminescence
- Whisper hints при долгом наведении
- Auto-show: первый через 5 сек, далее каждые 10 сек
- Idle-trigger + proximity reaction

---

## NEXT SESSION: Phase D — Оптимизация и полировка

### Scope

1. **Tuning spawn timing**
   - Замедлить скорость появления фрагментов в начале (sparse phase)
   - Увеличить интервалы между спавнами для более гипнотического эффекта
   - Файл: `prototypes/klyap-v16/index.html` → `CONFIG.phases`

2. **Text-block timing**
   - Удлинить промежуток показа центрального текста (сейчас 15 сек между ротациями → увеличить)
   - Возможно замедлить fade in/out анимацию
   - Файл: `prototypes/klyap-v16/index.html` → `setInterval(rotateTextBlock, ...)`

3. **Fragment cropping audit**
   - Проблема: некоторые изображения появляются с чёрным фоном (не вырезаны)
   - Необходимо: проверить скрипт обработки `scripts/process-klyap-v16-fragments.sh`
   - Перегенерировать проблемные фрагменты
   - Директория: `assets/klyap-v16/fragments/{layer}/`

---

## Файловая структура

| Путь | Описание |
|------|----------|
| `prototypes/klyap-v16/index.html` | Основной прототип (~1450 строк) |
| `assets/klyap-v16/fragments/` | 6 слоёв: intimate, mirror, visceral, noise, vivid, flesh |
| `scripts/process-klyap-v16-fragments.sh` | Скрипт обработки (crop + transparency) |
| `scripts/crop-fragments.sh` | Альтернативный скрипт кропа |

---

## Ключевые конфиги для tuning

```javascript
// В CONFIG — timing
phases: {
    sparse: { maxDepth: 12, interval: 1200, variance: 300 },   // <- увеличить interval
    hook: { maxDepth: 40, interval: 400, variance: 100 },
    overwhelm: { maxDepth: 100, interval: 180, variance: 40 }
},

// Text-block rotation
setInterval(rotateTextBlock, 15000);  // <- увеличить до 25000-30000

// Bubble auto-show
setTimeout(showNextBubble, 5000);
setInterval(() => { ... }, 10000);  // <- можно увеличить
```

---

## NEXT SESSION PROMPT

```
Продолжи KLYAP v16 — Phase D: Оптимизация.

Статус:
- Text-block + Bubbles DONE
- Фрагменты появляются, но нужен tuning

Задачи:
1. Замедлить spawn timing в sparse/hook phases (CONFIG.phases)
2. Удлинить интервал ротации text-block (сейчас 15s → 25-30s)
3. Аудит невырезанных фрагментов:
   - Найти PNG с чёрным фоном
   - Исправить process-klyap-v16-fragments.sh
   - Перекропить проблемные

Тест: http://localhost:8889/prototypes/klyap-v16/
```

---

*Обновлено: 2026-01-15 21:22*
