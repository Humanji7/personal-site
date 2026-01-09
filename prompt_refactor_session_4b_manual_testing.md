# Session 4B: Ручное тестирование звука

> ⚠️ **Это НЕ для агента** — агент не может слышать звуки.
> Выполни тестирование сам после коммита.

## Подготовка
```bash
cd /Users/admin/projects/personal-site/prototype-sphere
npm run dev
```
Открой http://localhost:5173/ в браузере.

## Чеклист тестирования

### Ambient sounds
- [ ] Hover над сферой → появляется ambient hum
- [ ] Уход курсора → hum затухает плавно

### Gesture sounds
| Жест | Ожидаемый звук |
|------|----------------|
| Stroke (быстрое движение) | Glass chime |
| Poke (клик) | Sharp click + resonance |
| Tap (короткое касание) | Soft tap |
| Flick (резкий свайп) | Whoosh |
| Tremble (дрожание) | Tremolo effect |

### Hold interaction
- [ ] Hold (удержание 1-2 сек) → recognition hum нарастает
- [ ] Продолжительный hold (3+ сек) → osmosis bass подключается
- [ ] Отпускание → плавный fade out обоих

### Консоль
- [ ] Нет ошибок (кроме favicon 404 — это ок)

## Результат
Если всё работает — рефакторинг Session 4 завершён ✅
