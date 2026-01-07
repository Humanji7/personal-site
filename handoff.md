# Handoff: Sphere Prototype — 7 января 2026

## Статус

**Этап 1 ✅ ГОТОВ** — Базовая сфера работает.

## Что сделано

### Этап 1: Базовая сфера (COMPLETE ✅)
- ✅ Three.js сцена, камера, renderer
- ✅ 2500 частиц в Фибоначчи-распределении
- ✅ Дыхание (breathing animation)
- ✅ Унифицированный ввод (мышь/тач)
- ✅ Базовая аттракция к курсору
- ✅ Click-to-start overlay

### Следующий: Этап 2-3 (Bleeding & Scars)
- [ ] "Суетливое" движение → частицы отрываются (bleeding)
- [ ] Цвет падающих: #39FF14 (лаймовый)
- [ ] Шрамы остаются после кровотечения
- [ ] Адаптивное дыхание (замедляется при idle)

---

## Промпт для следующей сессии

```
Продолжаем работу над интерактивной сферой для personal-site.

КОНТЕКСТ:
@/Users/admin/projects/personal-site/CLAUDE.md
@/Users/admin/projects/personal-site/ARCHITECTURE_SPHERE.md
@/Users/admin/projects/personal-site/PROTOTYPE_SPHERE.md
@/Users/admin/projects/personal-site/handoff.md

СКИЛЛЫ ДЛЯ ЗАГРУЗКИ:
- Frontend Developer (Three.js, WebGL шейдеры, GLSL)
- Animation/Motion Design (easings, physics simulation)
- Creative Coding (generative, particle systems)

МЕТОДОЛОГИЯ:
Используй ПРОТОТИП паттерн из materialization_protocol — быстрый код 
для ощущения механики. Не перфекционизм, а итерация.

ТЕКУЩИЙ СТАТУС:
Этап 1 завершён — сфера рендерится, дышит, реагирует на мышь.
Код в /prototype-sphere/ работает на localhost:5173.

ЗАДАЧИ (Этап 2-3):
1. Отслеживание "суетливости" (velocity > threshold > duration)
2. При суете → частицы отрываются и падают (bleeding)
3. Цвет падающих: #39FF14
4. После bleeding → шрамы (частицы не возвращаются на 100%)
5. Адаптивное дыхание (при idle → замедляется)

ФАЙЛЫ ДЛЯ РАБОТЫ:
- src/ParticleSystem.js — основная логика частиц
- src/InputManager.js — есть velocity tracking
- Возможно создать src/Sphere.js как orchestrator

КРИТЕРИИ ГОТОВНОСТИ:
- Быстрое движение мыши 1-2 сек → видно отрыв частиц
- Частицы падают вниз с гравитацией
- После падения — сфера чуть "помята"
```

---

## Ключевые файлы

| Файл | Что там |
|------|---------|
| `ARCHITECTURE_SPHERE.md` | Полная техническая архитектура |
| `src/ParticleSystem.js` | Логика частиц, шейдеры inline |
| `src/InputManager.js` | velocity, idleTime tracking |

---

## Технические заметки

### vite-plugin-glsl
**Важно:** плагин требует `@rollup/pluginutils` + настройку `include`.
Без этого ломает CSS. Уже исправлено.

### Архитектура bleeding
Из ARCHITECTURE_SPHERE.md:
```javascript
// Per-particle attributes
type: Uint8Array  // 0=normal, 1=ghost, 2=falling
velocity: Float32Array  // для падения
scarOffset: Float32Array  // смещение от шрама
```

Логика:
1. При frantic input → случайные частицы type=2
2. type=2 → падают (velocity.y -= gravity)
3. Когда падут за экран → возврат, но scarOffset остаётся

---

*Обновлено: 7 января 2026, 15:05*
