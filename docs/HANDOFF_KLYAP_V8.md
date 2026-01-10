# HANDOFF: КЛЯП v8 → v9

## Статус

**v8 готов** → [prototypes/klyap-v8/index.html](file:///Users/admin/projects/personal-site/prototypes/klyap-v8/index.html)

| Компонент | Статус |
|-----------|--------|
| Визуал (canvas blobs, вены, виньетка) | ✅ готово |
| Текст «распирает» | ✅ появляется через 2с |
| Механика времени | ✅ портал через 20с |
| Idle detection | ✅ пульс ×3 при бездействии |
| Паттерн tracking | ✅ `localStorage.klyap_data` |

---

## Следующая сессия: ШРИФТ-МОНТАЖ

### Идея

> Шрифт слова «распирает» должен **дёргано меняться**. По-монтажному. Как в долбаном триллере для мразей.

### Референсы

- **Title cards** в триллерах (Fincher-style)
- **Glitch text** эффекты
- Резкие jump-cuts между шрифтами
- Не плавно! Дёргано, рваные переходы

### Техническая реализация

```javascript
// Примерный подход
const fonts = [
  'Georgia, serif',
  '"Courier New", monospace',
  'Impact, sans-serif',
  '"Times New Roman", serif',
  'Arial Black, sans-serif'
];

// Случайные интервалы (неритмично)
function glitchFont() {
  const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
  textEl.style.fontFamily = randomFont;
  
  // Следующий switch через 50-300ms (рваный ритм)
  const nextDelay = 50 + Math.random() * 250;
  setTimeout(glitchFont, nextDelay);
}
```

### Вариации эффекта

1. **Только шрифт** — меняется семейство
2. **+ размер** — дёргается кегль (±10%)
3. **+ tracking** — letter-spacing прыгает
4. **+ позиция** — микро-offset (1-3px)
5. **+ opacity flicker** — мерцание 0.7-1.0

### Триггер

- Включается при `phase: swelling` (после появления текста)
- Возможно: усиливается при idle (чаще переключения)

---

## Файлы

| Путь | Назначение |
|------|------------|
| `prototypes/klyap-v8/index.html` | Текущий прототип, рабочий |
| `prototypes/klyap-v9/index.html` | Будет создан: + font glitch |

---

## Debug

В v8 включён debug overlay (`CONFIG.DEBUG = true`). Для production → false.

---

*Создан: 2026-01-10*
