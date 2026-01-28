import { createContentCard } from './ContentCard.js';
import { rectToNdc, stageToPx } from '../../utils/stageSpace.js';

async function loadJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load JSON: ${url}`);
  return await res.json();
}

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

export class CardLayer {
  constructor({ rootId = 'ui-root' } = {}) {
    this.rootId = rootId;
    this.root = null;
    this.cards = [];
    this.viewport = { w: 1, h: 1 };
    this._visible = 0;
    this._entitlements = new Set();
  }

  async init({ viewport }) {
    this.viewport = { ...viewport };
    this.root = document.getElementById(this.rootId);
    if (!this.root) throw new Error(`CardLayer: missing #${this.rootId}`);

    const data = await loadJson(new URL('./content.json', import.meta.url));
    for (const item of data) {
      const el = createContentCard(item);
      el.style.pointerEvents = 'auto';
      this.root.appendChild(el);
      this.cards.push({
        item,
        el,
        stage: { ...item.stage },
        hover: 0,
      });

      el.addEventListener('mouseenter', () => (this._hover(el, true)), { passive: true });
      el.addEventListener('mouseleave', () => (this._hover(el, false)), { passive: true });
      el.addEventListener('focus', () => (this._hover(el, true)));
      el.addEventListener('blur', () => (this._hover(el, false)));
    }
  }

  setVisible(alpha) {
    this._visible = clamp01(alpha);
  }

  setEntitlements({ entitlements } = {}) {
    this._entitlements = new Set(entitlements || []);
  }

  resize({ viewport }) {
    this.viewport = { ...viewport };
  }

  tick({ input, scroll }) {
    const show = this._visible;
    const pxPointer = input.pointerStage;

    for (const c of this.cards) {
      // Light hover animation.
      const isHover = c.el.classList.contains('is-hover');
      const targetHover = isHover ? 1 : 0;
      c.hover += (targetHover - c.hover) * 0.12;

      const z = clamp01(c.stage.z);
      const parallax = (1.0 - z) * 0.06;
      const sx = c.stage.x + pxPointer.x * parallax;
      const sy = c.stage.y + pxPointer.y * parallax;

      const { x, y } = stageToPx({ x: sx, y: sy }, this.viewport);

      const scale = 0.85 + (1.0 - z) * 0.35 + c.hover * 0.05;
      const opacity = show * (0.25 + (1.0 - z) * 0.75);

      c.el.style.opacity = `${opacity}`;
      c.el.style.transform = `translate3d(${x}px, ${y}px, 0) translate3d(-50%, -50%, 0) scale(${scale})`;
      // Avoid animating CSS blur each frame (perf + “muddy” look). Use opacity/scale for depth.
      c.el.style.filter = '';

      // Reveal cards only in post-void zone.
      c.el.style.visibility = scroll.postProgress > 0.02 ? 'visible' : 'hidden';

      // Hard gating if entitlement says so (minimal: any tier unlocks).
      const unlocked = this._entitlements.size > 0;
      const shouldLock = c.item.locked && !unlocked;
      c.el.classList.toggle('is-locked', shouldLock);
    }
  }

  getObstacleRectsNdc({ max = 16 } = {}) {
    const rects = [];
    for (const c of this.cards) {
      if (c.el.style.visibility === 'hidden') continue;
      const r = c.el.getBoundingClientRect();
      rects.push(rectToNdc(r, this.viewport));
      if (rects.length >= max) break;
    }
    return rects;
  }

  _hover(el, on) {
    if (on) el.classList.add('is-hover');
    else el.classList.remove('is-hover');
  }
}
