# KLYAP v14 Handoff

> Дата: 2026-01-14
> Статус: **Ассеты готовы, следующий этап — прототип механики**

---

## Что сделано в этой сессии

### 1. Генерация ассетов

Создан файл промптов `docs/plans/klyap-v14-generation-prompts.md` с 4 слоями:

| Слой | Эстетика | Количество |
|------|----------|------------|
| **intimate** | записки, ransom notes, handwritten | ~8 |
| **mirror** | глитч, разбитые экраны, popups | ~7 |
| **visceral** | вены, органика, medical horror | ~5 |
| **noise** | царапины, пыль, fingerprints | ~3 |

**Модели:** Nano Banana Pro (Google)

### 2. Обработка изображений

Скрипт `scripts/process-klyap-fragments.sh`:

```bash
# Pipeline:
# 1. Удаление Gemini watermark (60px bottom-right)
# 2. Чёрный фон → прозрачность
# 3. Trim по контенту

./scripts/process-klyap-fragments.sh
```

**Результат:** 23 PNG с прозрачным фоном в `assets/klyap-v14/fragments/`

---

## Следующие шаги

### Прототип механики (приоритет)

1. Создать `/prototypes/klyap-v14/`
2. HTML/CSS/JS структура:
   - Фрагменты появляются из центра
   - Анимация: blur → чёткость + opacity
   - Scroll как ускоритель потока
3. Тестировать ощущение doomscroll

### Опционально: дописать ассеты

- Больше noise текстур для оверлеев
- Разложить фрагменты по подпапкам слоёв
- Добавить цветовые вариации (purple/crimson tints)

---

## Файлы проекта

| Путь | Описание |
|------|----------|
| `assets/klyap-v14/raw/` | 23 оригинальных изображения |
| `assets/klyap-v14/fragments/` | 23 обработанных PNG |
| `docs/plans/klyap-v14-generation-prompts.md` | Промпты для генерации |
| `scripts/process-klyap-fragments.sh` | Скрипт обработки |

---

## NEXT SESSION PROMPT

```
Продолжи KLYAP v14.

Что сделано:
- 23 фрагмента (intimate/mirror/visceral/noise) обработаны
- PNG с прозрачным фоном в assets/klyap-v14/fragments/

Следующий этап:
Прототип механики — появление фрагментов из центра с blur→чёткость,
scroll как ускоритель. См. docs/plans/2026-01-14-klyap-v14-handoff.md
```

---

*Обновлено: 2026-01-14 20:35*
