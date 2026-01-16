# KLYAP Fragment Audit — Black Background Images

> **Дата:** 2026-01-15 23:44  
> **Статус:** ✅ Завершён

---

## Результаты аудита

### 1. Удалённые дубликаты (11 файлов)

Все дубликаты подтверждены через MD5:

| Слой | Удалённый файл | Дубликат |
|------|----------------|----------|
| intimate | fragment-008.png | =fragment-001.png |
| intimate | fragment-009.png | =fragment-002.png |
| intimate | fragment-010.png | =fragment-003.png |
| mirror | fragment-007.png | =fragment-001.png |
| mirror | fragment-008.png | =fragment-002.png |
| mirror | fragment-009.png | =fragment-003.png |
| visceral | fragment-007.png | =fragment-001.png |
| visceral | fragment-008.png | =fragment-002.png |
| visceral | fragment-009.png | =fragment-003.png |
| noise | fragment-005.png | =fragment-001.png |
| noise | fragment-006.png | =fragment-002.png |

---

### 2. Проблемные фрагменты для ре-генерации (12 файлов)

Изображения с шумовым/непрозрачным фоном вместо прозрачности:

| Слой | Файл | Проблема |
|------|------|----------|
| intimate | fragment-005.png | Шумовой фон по периметру |
| intimate | fragment-006.png | Шумовой фон по периметру |
| mirror | fragment-004.png | Шумовой фон с чёрными полосами |
| visceral | fragment-003.png | Шумовой фон по периметру |
| visceral | fragment-004.png | Шумовой фон с рамкой справа |
| visceral | fragment-005.png | Шумовой фон |
| visceral | fragment-006.png | Шумовой фон по периметру |
| noise | fragment-002.png | Шумовой фон с прямоугольной рамкой |
| flesh | fragment-002.png | Сплошной серый фон |
| flesh | fragment-003.png | Сплошной серый фон + линейка |
| vivid | fragment-003.png | Шумовой фон по всему изображению |
| vivid | fragment-005.png | Шумовой фон по периметру |

---

### 3. Корректные фрагменты для v17 (20 из 32)

После удаления дубликатов и исключения проблемных:

| Слой | Файлы | Количество |
|------|-------|------------|
| intimate | 001, 002, 003, 004, 007 | 5 |
| mirror | 001, 002, 003, 005, 006 | 5 |
| visceral | 001, 002 | 2 |
| noise | 001, 003, 004 | 3 |
| flesh | 001, 004 | 2 |
| vivid | 001, 002, 004 | 3 |
| **ИТОГО** | | **20** |

---

## Рекомендации для v17

1. **Использовать 20 корректных фрагментов** для запуска v17
2. **Ре-генерировать 12 проблемных** с явным указанием на прозрачный PNG фон
3. **Обновить LAYER_MAP** в прототипе для соответствия новому количеству

---

*Handoff: 2026-01-15 23:44*
