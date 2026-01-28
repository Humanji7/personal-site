import * as THREE from 'three';

import { ParticleSystem } from '../../particles/ParticleSystem.js';
import { ManifestoText } from '../../manifesto/ManifestoText.js';
import { TrailAccumulationPass } from '../passes/TrailAccumulationPass.js';

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function smoothstep(edge0, edge1, x) {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export class PostVoidLayer {
  constructor() {
    this.particleScene = null;
    this.overlayScene = null;
    this.camera = null;
    this.particles = new ParticleSystem();
    this.manifesto = new ManifestoText();
    this.trails = null;

    this._viewport = { w: 1, h: 1 };
    this._postProgress = 0;
    this._transition = 0;
    this._edges = 0;
    this._ramps = null;
    this._intensity = 1;
    this._presence = 0;
    this._lastDt = 0;
    this._lastNow = 0;
    this._shouldResetTrails = true;
    this._themeTier = -1;
  }

  async init({ renderer, viewport, quality }) {
    this._viewport = { ...viewport };

    this.particleScene = new THREE.Scene();
    this.overlayScene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    await this.particles.init({ renderer });
    this.particles.configure({ targetCount: quality.particleCount, useGpgpu: quality.useGpgpu });
    this.particles.resize({ viewport: this._viewport });
    this.particles.setOpacity(0);
    this.particleScene.add(this.particles.points);

    this.manifesto.init();
    this.overlayScene.add(this.manifesto.group);

    const tierScale =
      quality.tier === 'ultra' ? 0.55 : quality.tier === 'high' ? 0.5 : quality.tier === 'mid' ? 0.42 : 0.35;
    this.trails = new TrailAccumulationPass({
      renderer,
      viewport: this._viewport,
      caps: quality.caps,
      scale: tierScale,
    });

    renderer.compile(this.particleScene, this.camera);
    renderer.compile(this.overlayScene, this.camera);
  }

  setProgress({ postProgress, transition, edges, ramps }) {
    this._postProgress = postProgress;
    this._transition = transition;
    this._edges = edges ?? 0;
    this._ramps = ramps ?? null;
  }

  setIntensity(intensity01) {
    this._intensity = Math.min(1, Math.max(0, intensity01));
  }

  setThemeTier(tier) {
    const t = Number.isFinite(tier) ? Math.trunc(tier) : -1;
    this._themeTier = t;
    this.particles.setThemeTier?.(t);
  }

  resize({ viewport }) {
    this._viewport = { ...viewport };
    this.particles.resize({ viewport: this._viewport });
    this.trails?.resize({ viewport: this._viewport });
  }

  tick({ dt, now, quality, input, rects }) {
    this._lastDt = dt;
    this._lastNow = now;

    // Update particle budget if tier changed.
    this.particles.configure({ targetCount: quality.particleCount, useGpgpu: quality.useGpgpu });
    if (this.trails) {
      const tierScale =
        quality.tier === 'ultra'
          ? 0.55
          : quality.tier === 'high'
            ? 0.5
            : quality.tier === 'mid'
              ? 0.42
              : 0.35;
      this.trails.setScale(tierScale);
    }

    // Compute step (if enabled).
    this.particles.tickCompute({
      dt,
      now,
      pointerStage: input.pointerStage,
      pointerVelStage: input.pointerVelStage,
      edges: this._edges,
      waves: input.waves,
      rects,
      intensity: this._intensity,
    });

    // Render shader time (palette animation etc).
    this.particles.tick({ now, intensity: this._intensity });

    // Fade particles in during transition; keep visible in post zone.
    const presence = Math.max(this._transition, smoothstep(0.02, 0.08, this._postProgress));
    this.particles.setOpacity(presence);
    this._presence = presence;
    if (presence < 0.02) this._shouldResetTrails = true;

    // Manifesto timing. Keep readable in early post zone, then dissolve.
    this.manifesto.tick({ postProgress: this._postProgress, ramps: this._ramps, quality, now });
  }

  // Render particles/trails into target (fx=1 path)
  renderParticles(renderer, opts = {}) {
    const { target = null } = opts;

    if (this._shouldResetTrails) {
      this.trails?.reset();
      this._shouldResetTrails = false;
    }

    if (!this.trails) {
      if (target) renderer.setRenderTarget(target);
      renderer.render(this.particleScene, this.camera);
      if (target) renderer.setRenderTarget(null);
      return;
    }

    const baseDecay = this._intensity > 0.5 ? 0.962 : 0.925;
    const decay = Math.pow(baseDecay, Math.max(1, this._lastDt * 60));
    const currGain = this._intensity > 0.5 ? 0.8 : 0.7;
    const exposure = this._intensity > 0.5 ? 1.15 : 1.05;
    this.trails.render({
      particleScene: this.particleScene,
      camera: this.camera,
      dt: this._lastDt,
      now: this._lastNow,
      decay01: decay,
      presence01: this._presence,
      intensity01: this._intensity,
      currGain,
      exposure,
      outputTarget: target, // new: write to RT instead of screen
    });
  }

  // Render overlay (manifesto) — crisp, no bloom (fx=1 path)
  renderOverlay(renderer) {
    renderer.clearDepth();
    renderer.render(this.overlayScene, this.camera);
  }

  // Legacy render for fx=0 compatibility
  render(renderer) {
    this.renderParticles(renderer);
    this.renderOverlay(renderer);
  }

  destroy() {
    this.particles.destroy();
    this.trails?.destroy();
  }
}
