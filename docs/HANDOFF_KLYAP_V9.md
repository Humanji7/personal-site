# HANDOFF: КЛЯП v9 → v10

## Статус

**v9 готов** → [prototypes/klyap-v9/index.html](file:///Users/admin/projects/personal-site/prototypes/klyap-v9/index.html)

| Компонент | Статус |
|-----------|--------|
| Font glitch (8 шрифтов) | ✅ работает |
| Color glitch (7 цветов в палитре) | ✅ работает |
| Базовая механика v8 | ✅ унаследована |

---

## Следующая сессия: PINTEREST RESEARCH + POLISH

### 1. Pinterest Research (ПРИОРИТЕТ)

> Задача: зайти в Pinterest через Playwright, найти "чернуху" для вдохновения.

**Поисковые запросы:**
- `horror typography glitch`
- `thriller title cards Fincher`
- `organic horror texture`
- `body horror design`
- `disturbing soft aesthetic`
- `slime typography`

**Цель:** собрать визуальные референсы для:
- Дёрганья шрифтов
- Органических текстур
- "Тошнотворно мягкого" цветокора

### 2. Polish (после research)

- [ ] Портал — добавить дёрганье
- [ ] Шрифты — усилить эффект по референсам
- [ ] Letter-spacing / size jitter (если подтвердится)
- [ ] Возможно: побуквенный глитч

---

## Файлы

| Путь | Назначение |
|------|------------|
| `prototypes/klyap-v9/index.html` | Текущий рабочий (font + color glitch) |
| `prototypes/klyap-v10/` | Будет создан после research |

---

## Текущий код глитча

```javascript
const GLITCH_FONTS = [
    'Georgia, serif',
    '"Courier New", monospace',
    'Impact, sans-serif',
    '"Times New Roman", serif',
    'Arial Black, sans-serif',
    'Garamond, serif',
    'Verdana, sans-serif',
    '"Trebuchet MS", sans-serif'
];

const GLITCH_COLORS = [
    'hsl(285, 20%, 50%)',   // base purple
    'hsl(295, 25%, 55%)',   // warmer magenta
    'hsl(275, 22%, 48%)',   // cooler purple
    'hsl(310, 18%, 52%)',   // pink-magenta
    'hsl(265, 20%, 45%)',   // blue-purple
    'hsl(180, 12%, 42%)',   // sickly cyan
    'hsl(160, 10%, 40%)',   // bile green-grey
];
```

---

*Создан: 2026-01-10*
