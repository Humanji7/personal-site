export class EdgeUI {
  constructor({ rootId = 'ui-root' } = {}) {
    this.rootId = rootId;
    this.root = null;
    this.left = null;
    this.right = null;
    this._visible = 0;
  }

  init() {
    this.root = document.getElementById(this.rootId);
    if (!this.root) throw new Error(`EdgeUI: missing #${this.rootId}`);

    this.left = document.createElement('aside');
    this.left.className = 'pv-edge pv-edge--left';
    this.left.innerHTML = `
      <div class="pv-edge__title">depth</div>
      <div class="pv-edge__value" id="pv-depth">0m</div>
    `;
    this.left.style.pointerEvents = 'auto';

    this.right = document.createElement('aside');
    this.right.className = 'pv-edge pv-edge--right';
    this.right.innerHTML = `
      <div class="pv-tiers">
        <button class="pv-tier" data-tier="0">Наблюдатель — Free</button>
        <button class="pv-tier" data-tier="1">Спутник — $5/mo</button>
        <button class="pv-tier" data-tier="2">Voyager — $15/mo</button>
        <button class="pv-tier" data-tier="3">Голос — $50/mo</button>
      </div>
    `;
    this.right.style.pointerEvents = 'auto';

    this.root.appendChild(this.left);
    this.root.appendChild(this.right);

    this.right.querySelectorAll('button[data-tier]').forEach((btn) => {
      const dispatchHover = (active) => {
        btn.dispatchEvent(
          new CustomEvent(active ? 'pv-tier-hover' : 'pv-tier-unhover', { bubbles: true }),
        );
      };

      btn.addEventListener('click', () => {
        // LemonSqueezy wiring lands in Task 12.
        btn.dispatchEvent(new CustomEvent('pv-tier-click', { bubbles: true }));
      });

      btn.addEventListener('pointerenter', () => dispatchHover(true));
      btn.addEventListener('pointerleave', () => dispatchHover(false));
      btn.addEventListener('focus', () => dispatchHover(true));
      btn.addEventListener('blur', () => dispatchHover(false));
    });
  }

  setVisible(alpha) {
    this._visible = Math.min(1, Math.max(0, alpha));
  }

  tick({ scroll }) {
    const a = this._visible;
    const show = scroll.postProgress > 0.35;

    this.left.style.opacity = `${a}`;
    this.right.style.opacity = `${a}`;
    this.left.style.visibility = show ? 'visible' : 'hidden';
    this.right.style.visibility = show ? 'visible' : 'hidden';

    const depth = Math.round(scroll.postProgress * 1200);
    const depthEl = document.getElementById('pv-depth');
    if (depthEl) depthEl.textContent = `${depth}m`;
  }
}
