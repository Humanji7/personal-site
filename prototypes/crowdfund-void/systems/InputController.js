import * as THREE from 'three';

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

export class InputController {
  constructor({ maxWaves = 8, historySize = 32 } = {}) {
    this.maxWaves = maxWaves;
    this.historySize = historySize;

    this.pointerPx = new THREE.Vector2(0, 0);
    this.pointerStage = new THREE.Vector2(0, 0);
    this.pointerVelStage = new THREE.Vector2(0, 0);
    this._lastPointerStage = new THREE.Vector2(0, 0);
    this._lastT = performance.now();

    this.isIdle = true;
    this._lastMoveAt = performance.now();
    this._lastWaveEmitAt = -Infinity;

    // Packed waves: vec4(originX, originY, time, strength)
    this.waves = Array.from({ length: maxWaves }, () => new THREE.Vector4(0, 0, -1e9, 0));
    this._waveCursor = 0;

    // Pointer history for ribbon/path-follow effect.
    // Each entry: vec4(x, y, age, speed) — age in seconds since sample.
    this.pointerHistory = Array.from({ length: historySize }, () => new THREE.Vector4(0, 0, 1e9, 0));
    this._historyInterval = 0.016; // ~60fps sampling
    this._lastHistorySampleAt = -Infinity;

    this._viewport = { w: 1, h: 1 };
    this._onPointerMove = (e) => this._handlePointerMove(e);
  }

  init({ viewport }) {
    this._viewport = { ...viewport };
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
  }

  resize({ viewport }) {
    this._viewport = { ...viewport };
  }

  tick({ nowMs }) {
    const dtMs = Math.max(1, nowMs - this._lastT);
    const dt = dtMs / 1000;
    const nowSec = nowMs / 1000;

    this.pointerVelStage
      .copy(this.pointerStage)
      .sub(this._lastPointerStage)
      .multiplyScalar(1 / dt);

    this._lastPointerStage.copy(this.pointerStage);
    this._lastT = nowMs;

    this.isIdle = nowMs - this._lastMoveAt > 1200;
    if (this.isIdle) this.pointerVelStage.multiplyScalar(0.0);

    // Update history ages.
    for (let i = 0; i < this.historySize; i++) {
      this.pointerHistory[i].z += dt;
    }

    // Sample new history point at interval.
    const speed = this.pointerVelStage.length();
    if (nowSec - this._lastHistorySampleAt >= this._historyInterval && !this.isIdle) {
      // Shift history (oldest drops off).
      for (let i = this.historySize - 1; i > 0; i--) {
        this.pointerHistory[i].copy(this.pointerHistory[i - 1]);
      }
      // Insert new sample at front: (x, y, age=0, speed).
      this.pointerHistory[0].set(this.pointerStage.x, this.pointerStage.y, 0, speed);
      this._lastHistorySampleAt = nowSec;
    }

    // Emit waves based on current velocity (rate-limited).
    const canEmit = !this.isIdle && speed > 0.6 && nowMs - this._lastWaveEmitAt > 90;
    if (canEmit) {
      const strength = clamp01(speed / 6);
      this.emitWave({ now: nowSec, strength });
      this._lastWaveEmitAt = nowMs;
    }
  }

  emitWave({ now, strength = 1 } = {}) {
    const t = now ?? performance.now() / 1000;
    const idx = this._waveCursor % this.maxWaves;
    this.waves[idx].set(this.pointerStage.x, this.pointerStage.y, t, strength);
    this._waveCursor += 1;
  }

  destroy() {
    window.removeEventListener('pointermove', this._onPointerMove);
  }

  _handlePointerMove(e) {
    this.pointerPx.set(e.clientX, e.clientY);

    const x = (this.pointerPx.x / this._viewport.w) * 2 - 1;
    const y = -((this.pointerPx.y / this._viewport.h) * 2 - 1);
    this.pointerStage.set(x, y);

    const nowMs = performance.now();
    const moved = this._lastPointerStage.distanceToSquared(this.pointerStage) > 1e-6;
    if (moved) this._lastMoveAt = nowMs;
  }
}
