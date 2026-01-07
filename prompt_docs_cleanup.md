# Prompt: Наведение порядка в документации проекта

## Context
Personal Site проект накопил множество markdown-файлов за время разработки SPHERE прототипа. Нужна систематизация и архивация.

## Текущее состояние
В корне `/Users/admin/projects/personal-site/` находятся:

### Актуальные документы
| Файл | Назначение | Статус |
|------|------------|--------|
| `handoff.md` | Текущий хендофф сессии | ✅ Актуален |
| `ARCHITECTURE_SPHERE.md` | Архитектура сферы | ? Проверить |
| `PROTOTYPE_SPHERE.md` | Описание прототипа | ? Проверить |
| `LABYRINTH.md` | Философия "лабиринта" | ? Проверить |
| `SEEDS.md` | Эмоциональные семена | ? Проверить |
| `PROTOCOL.md` | Протокол взаимодействия | ? Проверить |

### Рабочие промпты (возможно устарели)
```
prompt_brainstorm_bleeding.md
prompt_debug_hsl.md
prompt_deep_interaction.md
prompt_dynamic_usize.md
prompt_effect_conductor_phase2.md
prompt_gesture_reactions.md
prompt_goosebumps_brainstorm.md
prompt_gradient_colors.md
prompt_new_session.md
prompt_next_stage.md
prompt_particle_count_brainstorm.md
prompt_particle_doubling.md
prompt_sphere_prototype.md
```

### Другие файлы
- `CLAUDE.md` — ? 
- `personal_site_base_v4.md` — ?
- `prototype-sphere/SPHERE_STATUS.md` — статус внутри прототипа

## Задачи

### 1. Аудит документов
- [ ] Прочитать каждый .md файл в корне
- [ ] Определить: актуален / устарел / дублирует
- [ ] Составить таблицу с рекомендациями

### 2. Архивация устаревших
- [ ] Создать папку `_archive/` в корне
- [ ] Переместить туда выполненные промпты и устаревшие доки
- [ ] Добавить `_archive/README.md` с описанием

### 3. Структурирование актуальных
- [ ] Создать папку `docs/` для основной документации
- [ ] Переместить актуальные документы
- [ ] Обновить ссылки если есть

### 4. Единый README
- [ ] Создать корневой `README.md` (если нет)
- [ ] Добавить оглавление с ссылками на доки
- [ ] Краткое описание проекта

## Предлагаемая структура

```
personal-site/
├── README.md                    # Точка входа
├── handoff.md                   # Текущий хендофф
├── docs/
│   ├── ARCHITECTURE.md          # Техническая архитектура
│   ├── PHILOSOPHY.md            # LABYRINTH + SEEDS объединены
│   └── PROTOCOL.md              # Протокол взаимодействия
├── prototype-sphere/
│   ├── SPHERE_STATUS.md         # Статус прототипа
│   └── src/...
└── _archive/
    ├── README.md                # Что здесь и почему
    └── prompts/                 # Все выполненные промпты
        └── *.md
```

## Рекомендации
- Не удалять файлы, только архивировать
- Сначала аудит, потом перемещение
- Сохранить историю решений в архиве
