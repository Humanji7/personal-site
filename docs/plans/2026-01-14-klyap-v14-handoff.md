# KLYAP v14 Handoff

> Дата: 2026-01-14
> Статус: Готов к генерации контента

---

## Контекст

Переосмыслили КЛЯП из "комнаты с характером" в "бездушную ленту" — пародию на doomscroll. Убрали всё, что предполагает существо: диалог, LLM, кнопки выбора, режимы прогрессии.

**Ключевой сдвиг:** КЛЯП — не кто-то, кто затягивает. Это функция, алгоритм. Ты сам себя затыкаешь. Рот занят потреблением.

---

## Что решено

### Механика потока

| Аспект | Решение |
|--------|---------|
| Появление фрагментов | Из центра наружу, расползаются |
| Драйвер прогрессии | Время (базовый) + Scroll (ускоритель) |
| Контент | Три слоя: intimate / mirror / visceral — рандомный микс |
| Скрытая прогрессия | Эхо точнее, плотность выше, МАЗУТ просачивается |
| Эффект появления | A: blur → чёткость + B: прозрачность → видимость |

### Визуальный подход

| Аспект | Решение |
|--------|---------|
| Источник картинок | Pre-gen через diffusion (низкий denoising = "грязь") |
| Текст | Микс: часть внутри картинок, часть накладывается кодом |
| Motion | Процедурный (CSS/JS), не After Effects |
| Эстетика | Шматы грязи, разнообразие букв, хаос без автора |

### Что убрано из v13

- Bubbles слева (провокации)
- Chat hints (кнопки выбора)
- Chat input + LLM
- Font glitch на одном слове
- Режимы DRIFT/SPLIT/YIELD/DIALOGUE
- TEXT_FLOW как прогрессия

### Что сохранено из v13

- Canvas blobs (фон)
- Vignette, noise, scanlines
- Fog layers (для перехода в МАЗУТ)
- Scroll как механика (переделанный)

---

## Референсы собраны

Папка: `/references/klyap-v14/`

| Файл | Назначение |
|------|------------|
| `01-ransom-note-typography.png` | intimate — буквы из журналов |
| `02-glitch-typography.png` | mirror — глитч, chromatic aberration |
| `03-organic-texture.png` | visceral — вены, органика |
| `04-grunge-texture.png` | noise — грязь, царапины |
| `05-dark-web-design.png` | horror UI |
| `06-david-carson.png` | деконструкция, хаос |
| `07-information-overload.png` | overwhelm эстетика |

---

## Следующие шаги

### 1. Naming Convention для картинок

Определить структуру имён файлов:
```
{слой}-{тип}-{номер}.png

Примеры:
intimate-note-001.png      # записка с текстом
intimate-scrap-002.png     # клочок бумаги
mirror-glitch-001.png      # глитч текст
mirror-screen-002.png      # экранный артефакт
visceral-vein-001.png      # органическая текстура
visceral-flesh-002.png     # телесное
noise-scratch-001.png      # царапины
noise-stain-002.png        # пятна
```

### 2. Промпты для генерации

Составить промпты для каждого слоя. Использовать:
- Низкий denoising (10-20 шагов) для "грязи"
- Тёмную палитру (фиолетовый, чёрный, тёмно-красный)
- Стиль: experimental typography, collage, decay

**Примерные направления:**

**intimate (записки, секреты):**
```
torn paper note, handwritten text, dark background,
vintage journal scrap, ransom note aesthetic,
low quality scan, creased paper
```

**mirror (про юзера, цифровое):**
```
glitch text, chromatic aberration, screen distortion,
corrupted digital artifact, vhs noise,
broken lcd screen texture
```

**visceral (телесное):**
```
organic texture, dark flesh, vein pattern,
body horror abstract, membrane texture,
biological decay, dark red black
```

**noise (фоновая грязь):**
```
grunge overlay, scratch texture, dust particles,
dirty glass, decay texture, film grain dark
```

### 3. Генерация батча

1. Выбрать модель (SDXL Turbo / LCM / другое)
2. Сгенерировать по 20-30 картинок на слой
3. Отобрать лучшие
4. Переименовать по convention
5. Закинуть в `/assets/klyap-v14/fragments/`

### 4. Прототип механики

После получения картинок:
1. Создать `/prototypes/klyap-v14/`
2. Реализовать появление из центра
3. Добавить blur/opacity анимации
4. Тестировать ощущение потока

---

## Открытые вопросы для следующей сессии

- [ ] Сколько картинок на слой? (предложение: 30 intimate, 20 mirror, 20 visceral, 30 noise)
- [ ] Какой размер картинок? (предложение: 512x512 или 768x768)
- [ ] Какой сервис для генерации? (Midjourney / DALL-E / Stable Diffusion API)
- [ ] Нужен ли текст внутри intimate-картинок или весь текст накладывается кодом?

---

## Файлы проекта

| Путь | Описание |
|------|----------|
| `docs/KLYAP_CHARACTER.md` | Характер комнаты (требует обновления под v14) |
| `docs/plans/2026-01-12-klyap-redesign.md` | Дизайн-документ v14 |
| `prototypes/klyap-v13/` | Текущий прототип (будет заменён) |
| `references/klyap-v14/` | Собранные референсы |

---

*Handoff создан: 2026-01-14*
