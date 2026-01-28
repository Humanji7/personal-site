const TIERS = ['ultra', 'high', 'mid', 'low', 'static'];

export class QualityManager {
  constructor({ caps, initialTier = null } = {}) {
    this.caps = caps;
    this.forcedTier = initialTier;

    this.tier = 'high';
    this.particleCount = 50_000;
    this.useGpgpu = false;
    this.blurEnabled = false;

    this._fps = 60;
    this._lastFpsT = performance.now();
    this._frames = 0;
    this._cooldownMs = 5000;
    this._lastTierChangeAt = -Infinity;
  }

  initFromCaps() {
    if (this.forcedTier) return this.setTier(this.forcedTier);
    if (this.caps.reducedMotion) return this.setTier('static');

    const gpgpuCapable =
      this.caps.webgl2 && (this.caps.extColorBufferFloat || this.caps.extColorBufferHalfFloat);
    return this.setTier(gpgpuCapable ? 'high' : 'mid');
  }

  setTier(tier) {
    if (!TIERS.includes(tier)) throw new Error(`Unknown tier: ${tier}`);
    this.tier = tier;

    const gpgpuCapable =
      this.caps.webgl2 && (this.caps.extColorBufferFloat || this.caps.extColorBufferHalfFloat);

    if (tier === 'ultra') {
      this.particleCount = 100_000;
      this.useGpgpu = gpgpuCapable;
      this.blurEnabled = true;
    } else if (tier === 'high') {
      this.particleCount = 50_000;
      this.useGpgpu = gpgpuCapable;
      this.blurEnabled = true;
    } else if (tier === 'mid') {
      this.particleCount = 25_000;
      this.useGpgpu = gpgpuCapable;
      this.blurEnabled = false;
    } else if (tier === 'low') {
      this.particleCount = 10_000;
      this.useGpgpu = false;
      this.blurEnabled = false;
    } else {
      this.particleCount = 0;
      this.useGpgpu = false;
      this.blurEnabled = false;
    }
  }

  tickFps() {
    this._frames += 1;
    const now = performance.now();
    const dt = now - this._lastFpsT;
    if (dt < 500) return this._fps;
    this._fps = (this._frames * 1000) / dt;
    this._frames = 0;
    this._lastFpsT = now;
    return this._fps;
  }

  maybeAutoScale() {
    if (this.forcedTier || this.caps.reducedMotion) return;
    const now = performance.now();
    if (now - this._lastTierChangeAt < this._cooldownMs) return;

    if (this._fps < 50 && this.tier !== 'static') {
      this._lastTierChangeAt = now;
      const idx = TIERS.indexOf(this.tier);
      this.setTier(TIERS[Math.min(TIERS.length - 1, idx + 1)]);
      return;
    }

    // Conservative upsell: only mid → high.
    if (this._fps > 58 && this.tier === 'mid') {
      this._lastTierChangeAt = now;
      this.setTier('high');
    }
  }

  get fps() {
    return this._fps;
  }
}
