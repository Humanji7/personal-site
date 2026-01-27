---
description: Create comprehensive Design Briefs for designers and frontend developers. Combines deep UX thinking with anti-AI-slop aesthetic standards. Use when packaging complex visual/interaction concepts into actionable specifications.
---

# Design Brief Creation Skill

## When to Use
- Packaging complex visual concepts for external designers/developers
- Creating specifications that preserve creative vision
- Documenting interaction patterns that require high-fidelity execution
- Bridging the gap between abstract vision and implementable specs

## Philosophy

### Words Are Spells
Every word in the brief is an instruction. Copy is not filler — it's incantation.
- **Verbs** command action
- **Adjectives** set the emotional register
- **Nouns** name the sacred objects of the interface

### Anti-AI-Slop Mandate
The resulting design must be **unforgettable**. Generic patterns are forbidden:
- No Inter, Roboto, Arial, system fonts
- No purple gradients on white
- No cookie-cutter layouts
- No "clean and modern" without specificity

### Bold Aesthetic Direction
Every brief must commit to an EXTREME aesthetic position:
- Brutally minimal OR maximalist chaos
- Retro-futuristic OR organic/natural
- Luxury/refined OR playful/toy-like
- Editorial/magazine OR brutalist/raw
- Art deco/geometric OR soft/pastel

## Brief Structure

### 1. SOUL (Why This Exists)
```markdown
## Soul

### Purpose
[One sentence: what problem does this solve?]

### For Whom
[Ideal user persona — not demographics, but psychographics]

### Against Whom
[Anti-persona — who should NOT feel at home here]

### Core Emotion
[The ONE feeling the interface must evoke]

### Voice
[3-5 adjectives defining the tone]
Examples: "Intimate, authoritative, slightly mad"
```

### 2. AESTHETIC DIRECTION
```markdown
## Aesthetic Direction

### Conceptual Position
[The extreme aesthetic choice, e.g., "Electric organism in darkness"]

### Color System
| Role | Value | Rationale |
|------|-------|-----------|
| Primary | | |
| Accent | | |
| Background | | |
| Text | | |

### Typography
| Use | Font | Why |
|-----|------|-----|
| Display | | |
| Body | | |
| Accent | | |

### Visual References
[Embed 3-5 reference images with captions explaining what to take from each]

### Anti-References (What to Avoid)
[2-3 examples of what this should NOT look like]
```

### 3. ARCHITECTURE (What Exists)
```markdown
## Architecture

### Layer Stack
[Z-index ordered list of visual layers, from back to front]

Example:
1. Deep background (static)
2. Atmospheric layer (fog/particles)
3. Content layer (cards, media)
4. Text layer (headlines, copy)
5. UI layer (fixed navigation, CTAs)

### Responsive Breakpoints
| Breakpoint | Behavior Change |
|------------|-----------------|
| Mobile | |
| Tablet | |
| Desktop | |
```

### 4. INTERACTIONS (How It Moves)
```markdown
## Interactions

### Scroll Behavior
[What happens at different scroll positions]

| Scroll % | Event |
|----------|-------|
| 0-20% | |
| 20-50% | |
| 50-80% | |
| 80-100% | |

### Cursor Interactions
[How elements respond to mouse/touch]

### State Transitions
[Hover, active, focus, loading states]

### Animation Principles
- Timing function:
- Duration range:
- Stagger pattern:
```

### 5. CONTENT SPECIFICATION
```markdown
## Content

### Content Types
| Type | Count | Behavior |
|------|-------|----------|
| | | |

### Content States
| State | Visual Treatment |
|-------|------------------|
| Default | |
| Hover | |
| Locked | |
| Active | |

### Copy Voice
[Examples of actual copy that should appear]

| Element | Copy | Tone |
|---------|------|------|
| CTA | | |
| Empty state | | |
| Error | | |
```

### 6. TECHNICAL REQUIREMENTS
```markdown
## Technical Requirements

### Stack
- Framework:
- Styling:
- Animation:
- 3D/WebGL:

### Performance Targets
- First paint:
- Interactive:
- Lighthouse score:

### Browser Support
[Minimum requirements]

### Accessibility
[WCAG level and specific considerations]
```

### 7. DELIVERABLES
```markdown
## Deliverables

### From Designer
- [ ] High-fidelity mockups (Figma/Sketch)
- [ ] Component library
- [ ] Animation specifications
- [ ] Asset exports

### From Developer
- [ ] Working prototype
- [ ] Component code
- [ ] Documentation
- [ ] Performance audit
```

## Execution Process

1. **Extract** — Deep interview to understand the vision
2. **Commit** — Choose the aesthetic extreme
3. **Document** — Fill every section with specificity
4. **Visualize** — Generate reference images where words fail
5. **Review** — Validate with stakeholder before handoff

## Quality Checklist

Before considering a brief complete:
- [ ] Every section has specific, actionable content
- [ ] Color values are actual hex/HSL, not "blue"
- [ ] Typography choices are specific fonts, not categories
- [ ] Interactions describe timing and easing
- [ ] Copy examples are written, not described
- [ ] Anti-patterns are explicitly listed
- [ ] References are embedded, not linked
- [ ] Technical constraints are measurable
