# Prompt: Удвоение частиц сферы

## Контекст

Интерактивная сфера из частиц (Three.js Points). Сейчас 2000 частиц — хочется сделать плотнее и красивее.

**Расположение:** `/Users/admin/projects/personal-site/prototype-sphere/`

## Текущее состояние

```javascript
// ParticleSystem.js, конструктор
constructor(count = 2000, ghostRatio = 0.03)
```

- **2000 частиц** — базовый count
- **60 ghost частиц** (3%) — мерцающие, полупрозрачные
- **Fibonacci sphere distribution** — равномерное распределение

## Задача

Увеличить количество частиц с 2000 до **4000-6000** для более плотной, красивой сферы.

## Ключевые моменты для реализации

1. **Изменить дефолт в `ParticleSystem.js`:**
   ```javascript
   constructor(count = 4000, ghostRatio = 0.03)
   ```

2. **Проверить производительность:**
   - 60 FPS на MacBook M-series
   - Мобильные устройства (если есть деградация — добавить LOD)

3. **Возможные оптимизации:**
   - Уменьшить `uSize` uniform пропорционально (чтобы частицы не сливались)
   - Проверить memory footprint Float32Array'ов

4. **Опционально — адаптивная плотность:**
   ```javascript
   const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent)
   const count = isMobile ? 2000 : 5000
   ```

## Запуск

```bash
cd prototype-sphere && npm run dev
# http://localhost:5175/
```

## Критерии успеха

- [ ] Сфера выглядит более плотной и "живой"
- [ ] 60 FPS на desktop
- [ ] Evaporation bleeding по-прежнему работает плавно
- [ ] На мобильных нет сильных просадок (или есть fallback)
