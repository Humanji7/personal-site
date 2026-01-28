export class DebugHUD {
  constructor({ enabled = false } = {}) {
    this.enabled = enabled;
    this.el = null;
  }

  init() {
    if (!this.enabled) return;
    this.el = document.createElement('div');
    this.el.id = 'debug-hud';
    document.body.appendChild(this.el);
  }

  setText(text) {
    if (!this.el) return;
    this.el.textContent = text;
  }

  destroy() {
    this.el?.remove();
    this.el = null;
  }
}

