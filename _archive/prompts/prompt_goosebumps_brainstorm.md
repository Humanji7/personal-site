# Prompt: Переосмысление Гусиной Кожи (SPHERE)

## Контекст
Мы работаем над интерактивной СФЕРОЙ — entry-point для персонального сайта. Это «живое существо» из 5000 частиц с эмоциональной state-machine (Peace → Listening → Tension → Bleeding → Trauma → Healing).

Сфера уже умеет:
- Дышать (синхронное расширение + микро-кипение + сердцебиение 80 bpm)
- Менять цвета по HSL (Deep Blue 240° → Nova Gold 45°)
- Кровоточить (evaporation) и кататься (rolling physics)
- Светиться при вдохе (Aura) и иметь глубину (Bokeh)

## Проблема
Реализация «гусиной кожи» (Goosebumps) ощущается **дёрганой и резкой**. При увеличении `uNoiseSpeed` в состоянии TENSION поверхность сферы начинает хаотично дрожать вместо органичного напряжения.

### Текущий код
```javascript
// Sphere.js — в TENSION/BLEEDING
const tensionIntensity = Math.min(1, this.tensionTime * 2.0)
const targetNoiseAmount = 0.08 + tensionIntensity * 0.07  // 0.08 → 0.15
const targetNoiseSpeed = 0.3 + tensionIntensity * 0.6     // 0.3 → 0.9
```

```glsl
// ParticleSystem.js — vertex shader
float noiseVal = snoise(aOriginalPos * 2.0 + uTime * uNoiseSpeed);
pos += dir * noiseVal * uNoiseAmount;
```

## Задача
Предложи альтернативный подход к эффекту «гусиной кожи», который будет:
1. Органичным и плавным, а не дёрганым
2. Передавать ощущение нарастающего напряжения
3. Соответствовать философии «живого существа»

## Возможные направления
- Частотное расслоение (базовый шум + мелкая рябь)
- Локальные мурашки (волна от курсора)
- Дискретные волны (пульсирующие всплески)
- Только амплитуда (без ускорения анимации)
- Частота шума (мельче текстура, но плавно)

## Ключевые файлы
- `prototype-sphere/src/ParticleSystem.js` — шейдерный код
- `prototype-sphere/src/Sphere.js` — state machine с модуляцией
- KI: `high_performance_web_graphics_patterns`

## Инструкция
1. Выбери или предложи подход
2. Напиши конкретные GLSL-сниппеты
3. Укажи какие uniforms добавить
4. Реализуй и проверь в браузере
