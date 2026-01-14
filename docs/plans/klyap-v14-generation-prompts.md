# KLYAP v14 — Промпты для генерации (v2)

> Модели: Nano Banana Pro / Chat GPT Amatch 1.5
> Размер: 1024x1024

---

## ⚠️ КРИТИЧЕСКИ ВАЖНО

Каждый промпт должен давать **ИЗОЛИРОВАННЫЙ ФРАГМЕНТ НА ЧЁРНОМ ФОНЕ**.

НЕ должно быть:
- Сцен с объектами (лампы, столы, шляпы)
- Красивой композиции
- Стилизации под нуар/винтаж
- "Атмосферного" окружения

ДОЛЖНО быть:
- Один грязный фрагмент, парящий в пустоте
- Некрасиво, дискомфортно
- Как скан на плохом копире
- Хаос без автора

---

## Общий суффикс (добавлять к каждому промпту)

```
isolated on pure black void background, no scene, no surrounding 
objects, floating fragment, ugly uncomfortable aesthetic, low 
quality photocopy scan look, no artistic composition, raw and 
disturbing, 1024x1024
```

---

## Слой 1: INTIMATE (записки, секреты)

### С текстом

```
single torn paper scrap with messy handwritten text "you already know", 
dirty crumpled paper fragment, scotch tape, coffee stains, 
floating alone on pure black void, bad photocopy quality, 
no table no background objects, just the paper scrap, ugly scan aesthetic
```

```
ransom note style paper with cut-out magazine letters "don't pretend",
single paper fragment floating on black nothing, glue residue visible,
uneven letter sizes, chaotic arrangement, xerox copy quality,
no artistic composition, uncomfortable to look at
```

```
torn journal page corner with ballpoint pen scrawl "it was always you",
isolated paper fragment on black void, ink smears, paper fibers visible,
bad scanner quality, no scene no objects, just floating dirty paper
```

```
crumpled sticky note with desperate handwriting "why stop scrolling",
single fragment on pure black, adhesive residue, finger smudges,
photocopy artifact noise, no composition, raw ugly document scan
```

```
typewriter paper strip torn edge with "the feed owns you now",
floating ribbon of paper on black void, typewriter ink inconsistent,
paper yellowed unevenly, bad xerox quality, no artistic intent
```

### Без текста (для наложения кодом)

```
torn dirty paper scrap floating on pure black void,
empty yellowed surface ready for text, coffee ring stain,
scotch tape marks, crumpled texture, bad photocopy scan quality,
no objects around, isolated fragment, ugly uncomfortable
```

```
burned paper fragment corner floating on black nothing,
empty charred surface, ash residue, paper fibers exposed,
low quality scan aesthetic, no scene, one isolated piece
```

```
crumpled receipt paper scrap on pure black background,
blank dirty thermal paper fragment, faded areas,
bad xerox copy look, floating isolated, no composition
```

---

## Слой 2: MIRROR (цифровое, глитч)

### С текстом/данными

```
corrupted screen fragment showing glitched text "still watching",
isolated display chunk on black void, chromatic aberration,
broken pixel clusters, no device frame, just floating screen piece,
VHS tracking error, uncomfortable digital decay
```

```
cracked phone screen fragment with distorted "time wasted: infinite",
floating glass shard on pure black, dead pixels, no phone body,
just broken display piece, scan line artifacts, digital rot
```

```
old CRT monitor fragment with burned-in text "you chose this",
isolated screen piece floating on void, phosphor burn,
electron beam distortion, no monitor frame, raw digital decay
```

```
notification popup fragment "new content: forever", 
corrupted UI element floating on black, pixel bleeding,
interface decay, no context no device, isolated digital trash
```

### Без текста

```
abstract glitch texture fragment floating on black void,
chromatic aberration bands, corrupted pixel cluster,
no readable content, isolated digital artifact,
VHS noise pattern, uncomfortable electronic decay
```

```
cracked glass screen fragment on pure black background,
shattered display piece, dead pixel areas, backlight bleed,
no device frame, floating broken technology piece
```

```
pixelated corruption blob floating on void,
abstract data decay, purple and black color bleed,
no recognizable interface, raw digital destruction
```

---

## Слой 3: VISCERAL (телесное)

```
abstract vein texture fragment floating on black void,
isolated organic tissue piece, dark flesh membrane,
no recognizable body part, uncomfortable biological abstraction,
medical horror aesthetic, floating meat texture
```

```
dark membrane tissue fragment on pure black background,
wet organic surface, capillary network visible,
isolated flesh piece, no anatomy context, abstract body horror
```

```
biological decay texture floating on void,
abstract internal organ surface, dark crimson and purple,
no identifiable organ, just floating flesh fragment,
medical imaging nightmare quality
```

```
cell cluster abstract fragment on black nothing,
microscopy horror style, biological shapes,
isolated organic blob, dark wet texture,
uncomfortable scientific decay
```

```
vein network fragment floating alone on black,
branching organic pattern, dark blood tones,
no body context, abstract circulatory horror,
medical scan nightmare aesthetic
```

---

## Слой 4: NOISE (оверлеи)

```
dust and scratch texture on pure black,
floating particle cluster, film damage marks,
isolated noise fragment, no surface context,
ready for overlay blending, subtle decay
```

```
fingerprint smudge fragment on black void,
isolated grease mark, skin oil residue visible,
floating dirty touch mark, uncomfortable intimacy
```

```
water damage stain fragment floating on black,
isolated moisture mark, paper fiber distortion,
mold edge suggestion, decay texture piece
```

```
rust fragment floating on pure black void,
isolated corrosion texture, metal decay,
oxidation pattern, industrial rot piece
```

```
smoke wisp fragment on black background,
isolated fog strand, atmospheric decay piece,
subtle translucent texture, floating vapor
```

```
ink splatter fragment floating on void,
accidental stain shape, chaotic drip pattern,
isolated mark on black, no artistic intent
```

---

## Naming Convention

```
{слой}-{тип}-{номер}.png

intimate-note-001.png
intimate-scrap-002.png
mirror-glitch-001.png
mirror-crack-002.png
visceral-vein-001.png
visceral-membrane-002.png
noise-dust-001.png
noise-stain-002.png
```

---

## Если результат всё ещё "красивый"

Добавь эти фразы:

```
deliberately ugly, anti-aesthetic, uncomfortable to look at,
like evidence photo, like bad photocopy, like found footage,
no artistic merit, raw disturbing document
```

---

## Структура папок

```
assets/klyap-v14/fragments/
├── intimate/
├── mirror/
├── visceral/
└── noise/
```

---

*Обновлено: 2026-01-14 v2 — исправлено после фидбека*
