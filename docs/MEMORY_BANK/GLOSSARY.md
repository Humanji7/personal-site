# Glossary

Термины проекта.

---

## Render

| Term | Definition |
|------|------------|
| **RT** | Render Target — offscreen texture for intermediate rendering |
| **rtVoid** | RT for void zone (black background layer) |
| **rtPost** | RT for post zone (particles + trails) |
| **rtComposite** | RT for combined void + post before postfx |
| **Linear workflow** | All operations in linear color space, gamma applied once at output |
| **Ping-pong** | Double-buffering technique (A↔B swap) |
| **ACES tonemap** | Film-industry standard tone mapping curve |

---

## Particles

| Term | Definition |
|------|------------|
| **GPGPU** | General-Purpose GPU computing — physics on GPU via textures |
| **velocity.frag** | Shader that computes all particle forces |
| **position.frag** | Shader that integrates velocity → position |
| **curl noise** | Divergence-free noise for fluid-like motion |
| **ribbon** | Particle behavior following cursor path history |

---

## Input

| Term | Definition |
|------|------------|
| **pointerStage** | Cursor position in NDC (-1 to 1) |
| **pointerVelStage** | Cursor velocity in stage units per second |
| **history[32]** | Ring buffer of recent pointer positions for ribbon effect |
| **wave** | Ring impulse emanating from fast cursor movement |
| **idle** | Cursor hasn't moved for >1.2s |

---

## Quality

| Term | Definition |
|------|------------|
| **tier** | Quality level: ultra/high/mid/low/static |
| **GPGPU-capable** | WebGL2 + float texture support |
| **auto-scale** | Automatic tier reduction when FPS < 50 |
| **prefers-reduced-motion** | OS accessibility setting → static tier |

---

## Scroll

| Term | Definition |
|------|------------|
| **voidProgress** | 0-1 progress through void zone |
| **postProgress** | 0-1 progress through post zone |
| **transition** | Crossfade factor between void and post |
| **keyframe** | Named scroll position (void, transition, post) |

---

## PostFX

| Term | Definition |
|------|------------|
| **UnrealBloomPass** | Three.js bloom implementation |
| **exposure** | Pre-tonemap brightness multiplier |
| **threshold** | Minimum brightness for bloom |
| **bloom strength** | Intensity of glow effect |
| **bloom radius** | Spread of bloom halo |

---

## Art Direction

| Term | Definition |
|------|------------|
| **shepherd** | Cursor leads, particles follow (not pushed) |
| **wind+water** | Metaphor for particle behavior — flowing, not exploding |
| **negative space** | Dark area around cursor (repulsion zone) |
| **warm shimmer** | Subtle flicker in empty areas |
| **расплавленный свет** | "Molten light" — target aesthetic for particles |

---

## Project

| Term | Definition |
|------|------------|
| **void** | Entry zone — black, minimal |
| **post** | Main interactive zone — particles |
| **manifesto** | Text layer over particles |
| **tier cards** | Donation tier buttons (0-3) |
| **artifact** | Reward for completing the journey |
