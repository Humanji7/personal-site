const KEYFRAMES = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

function keyframeFor(p) {
  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (p >= KEYFRAMES[i] && p < KEYFRAMES[i + 1]) return i + 1;
  }
  return 6;
}

export class ScrollOrchestrator {
  constructor({ voidZoneId = 'void-zone', postZoneId = 'post-void-zone' } = {}) {
    this.voidZoneId = voidZoneId;
    this.postZoneId = postZoneId;

    this.scrollY = 0;
    this.viewportH = 1;
    this.voidH = 1;
    this.postH = 1;
    this.voidTopY = 0;
    this.voidEndY = 0;
    this.postTopY = 0;
    this.postStartY = 0;
    this.postEndY = 0;

    this._onScroll = () => {
      this.scrollY = window.scrollY || window.pageYOffset || 0;
    };
    this._onResize = () => this.measure();
  }

  init() {
    this.measure();
    this._onScroll();
    window.addEventListener('scroll', this._onScroll, { passive: true });
    window.addEventListener('resize', this._onResize, { passive: true });
  }

  measure() {
    const voidZone = document.getElementById(this.voidZoneId);
    const postZone = document.getElementById(this.postZoneId);

    this.viewportH = Math.max(1, window.innerHeight);
    this.voidH = Math.max(this.viewportH, voidZone?.offsetHeight || this.viewportH);
    this.postH = Math.max(this.viewportH, postZone?.offsetHeight || this.viewportH);

    this.voidTopY = voidZone?.offsetTop || 0;
    this.postTopY = postZone?.offsetTop ?? this.voidTopY + this.voidH;

    // Void progress spans the full declared zone height.
    // Post-void begins immediately at the start of #post-void-zone (reversible scroll).
    this.voidEndY = this.voidTopY + Math.max(1, this.voidH);
    this.postStartY = this.postTopY;
    this.postEndY = this.postTopY + Math.max(1, this.postH - this.viewportH);
  }

  getSnapshot() {
    const voidScrollable = Math.max(1, this.voidH);
    const postScrollable = Math.max(1, this.postH - this.viewportH);

    const voidProgress = clamp01((this.scrollY - this.voidTopY) / voidScrollable);
    const postScrollY = Math.max(0, this.scrollY - this.postTopY);
    const postProgressRaw = clamp01(postScrollY / postScrollable);
    const postProgress = postProgressRaw;
    const keyframe = keyframeFor(postProgress);

    const ramps = {
      enter: smoothstep(0.0, 0.08, postProgress),
      edges: smoothstep(0.4, 0.8, postProgress),
      manifestoFly: smoothstep(0.4, 0.6, postProgress),
      final: smoothstep(0.8, 1.0, postProgress),
    };

    return { voidProgress, postProgress, postProgressRaw, keyframe, ramps };
  }

  destroy() {
    window.removeEventListener('scroll', this._onScroll);
    window.removeEventListener('resize', this._onResize);
  }
}
