# HANDOFF: КЛЯП Background v6/v7

**Дата:** 2026-01-10  
**Статус:** В процессе итераций

---

## Что сделано

### V6 (`/prototypes/klyap-v6/index.html`) — CSS-усиление

Интенсифицированная версия v5:

| Элемент | V5 | V6 |
|---------|----|----|
| **Вены opacity** | 0.15 | 0.45 |
| **Вены толщина** | 1-3px | 3-10px |
| **Tremor** | 1px, каждые 4s | 3px, каждые 3s |
| **Heartbeat** | 0.6% scale | 1.5% scale |
| **Vignette** | scale 0.88 | scale 0.78 (давит сильнее) |

**Новые элементы:**
- `swallow-wave` — расходящиеся круги (перистальтика)
- `membrane` — дополнительный слой давления
- `organic-mass` — морфящиеся blob-ы с `border-radius` анимацией
- `textDistort` — текст дёргается вместе с tremor
- `worldHue` — hue-rotate -10° для цветового сдвига

---

### V7 (`/prototypes/klyap-v7/index.html`) — Canvas подход

**Полностью новый подход:**
- Canvas-based рендер 60fps
- Органические blob-ы с деформацией (noise-based контур)
- Вены с волновой анимацией
- Blob-ы реагируют на курсор (притягиваются)
- Кастомный cursor-glow
- Глотательные волны каждые 1.5s

**⚠️ Проблема:** браузер подвис при тестировании. Возможно слишком тяжёлый рендер.

---

## Что НЕ решено (из prompt_klyap_background_v2.md)

1. **"Мерзко-мягкое"** — пока это "красивый живой фон", не вызывает физический дискомфорт
2. **Давление** — виньетка давит, но нет ощущения "стены сходятся"
3. **Текст как часть организма** — частично (tremor sync), но недостаточно

---

## Направления для следующей сессии

### А) Звук (высокий потенциал)
- Тихий heartbeat (low-frequency pulse)
- Влажные звуки glitch/gulp
- Web Audio API + oscillator

### Б) Радикальное визуальное
- SVG-маски с живыми краями вместо radial-gradient
- WebGL shader для distortion (как sphere-777)
- Particles system (мелкие частицы как споры)

### В) Фиксация V7
- Оптимизировать Canvas-рендер
- Уменьшить BLOB_COUNT / VEIN_COUNT
- Протестировать в чистом браузере

### Г) Интерактивность
- Чем дольше смотришь — тем сильнее эффект
- Отслеживание внимания через eye-tracking API или время на странице

---

## Как запустить

```bash
cd /Users/admin/projects/personal-site
python3 -m http.server 8899 --directory prototypes
```

- V5: http://localhost:8899/klyap-v5/
- V6: http://localhost:8899/klyap-v6/
- V7: http://localhost:8899/klyap-v7/

---

## Файлы

```
prototypes/
├── klyap-v5/index.html   # Стабильная база
├── klyap-v6/index.html   # CSS-усиление ✓
└── klyap-v7/index.html   # Canvas эксперимент (unstable)
```

---

*Следующий агент: начни с тестирования v6 и v7 в своём браузере. Реши, какой путь продолжать — CSS (v6) или Canvas (v7).*
