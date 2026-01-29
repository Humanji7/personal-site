import * as THREE from 'three';

import { ParticleCompute } from './gpgpu/ParticleCompute.js';

async function loadText(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load shader: ${url}`);
  return await res.text();
}

function randomSeedArray(count) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3 + 0] = Math.random();
    arr[i * 3 + 1] = Math.random();
    arr[i * 3 + 2] = Math.random();
  }
  return arr;
}

function uvRefArray(side) {
  const count = side * side;
  const arr = new Float32Array(count * 2);
  for (let i = 0; i < count; i++) {
    const x = i % side;
    const y = Math.floor(i / side);
    arr[i * 2 + 0] = (x + 0.5) / side;
    arr[i * 2 + 1] = (y + 0.5) / side;
  }
  return arr;
}

function makeDummyTexture() {
  const data = new Uint8Array([0, 0, 0, 255]);
  const tex = new THREE.DataTexture(data, 1, 1, THREE.RGBAFormat);
  tex.needsUpdate = true;
  return tex;
}

export class ParticleSystem {
  constructor() {
    this.count = 0;
    this.side = 0;
    this.useGpgpu = false;

    this.geometry = new THREE.BufferGeometry();
    this.material = null;
    this.points = null;

    this._renderer = null;
    this._compute = null;
    this._computeShaders = null;
    this._dummyPosTex = makeDummyTexture();
    this._dummyVelTex = makeDummyTexture();
  }

  async init({ renderer }) {
    this._renderer = renderer;

    const [vertexShader, fragmentShader, velocityShader, positionShader] = await Promise.all([
      loadText(new URL('./shaders/render.vert', import.meta.url)),
      loadText(new URL('./shaders/render.frag', import.meta.url)),
      loadText(new URL('./gpgpu/velocity.frag', import.meta.url)),
      loadText(new URL('./gpgpu/position.frag', import.meta.url)),
    ]);

    this._computeShaders = { velocityShader, positionShader };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      defines: {},
      uniforms: {
        uTime: { value: 0 },
        uOpacity: { value: 0 },
        uViewport: { value: new THREE.Vector2(1, 1) },
        uIntensity: { value: 1 },
        uTier: { value: -1 },
        uPointer: { value: new THREE.Vector2(0, 0) },
        uPointerVel: { value: new THREE.Vector2(0, 0) },
        uWavesCount: { value: 0 },
        uWaves: { value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -1e9, 0)) },
        uPositionTex: { value: this._dummyPosTex },
        uVelocityTex: { value: this._dummyVelTex },
      },
    });

    this.points = new THREE.Points(this.geometry, this.material);
    // Custom shaders don't use a `position` attribute, so Three can't compute a bounding sphere.
    // Disable frustum culling to ensure points render.
    this.points.frustumCulled = false;
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), 10);
  }

  configure({ targetCount, useGpgpu }) {
    const nextUseGpgpu = !!useGpgpu;
    const nextSide = targetCount > 0 ? Math.ceil(Math.sqrt(targetCount)) : 0;
    const nextCount = nextSide > 0 ? nextSide * nextSide : 0;

    const needsRebuild = nextSide !== this.side || nextUseGpgpu !== this.useGpgpu;
    const sideChanged = nextSide !== this.side;
    this.useGpgpu = nextUseGpgpu;
    this.side = nextSide;

    if (needsRebuild) this._rebuild(nextCount);

    if (sideChanged) this._compute = null;

    // Compute is only created when enabled.
    if (this.useGpgpu && nextSide > 0 && !this._compute) {
      try {
        this._compute = new ParticleCompute({
          renderer: this._renderer,
          side: nextSide,
          velocityShader: this._computeShaders.velocityShader,
          positionShader: this._computeShaders.positionShader,
        });
      } catch {
        this.useGpgpu = false;
        this._compute = null;
      }
    }

    if (!this.useGpgpu) this._compute = null;

    return { count: nextCount, side: nextSide };
  }

  _rebuild(count) {
    this.count = count;

    if (count <= 0) {
      this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(0), 3));
      this.geometry.setAttribute('aUvRef', new THREE.BufferAttribute(new Float32Array(0), 2));
      this.geometry.setDrawRange(0, 0);
      return;
    }

    const seeds = randomSeedArray(count);
    this.geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 3));

    const uvRef = uvRefArray(this.side);
    this.geometry.setAttribute('aUvRef', new THREE.BufferAttribute(uvRef, 2));

    this.geometry.setDrawRange(0, count);
  }

  setOpacity(alpha) {
    if (!this.material) return;
    this.material.uniforms.uOpacity.value = alpha;
  }

  setThemeTier(tier) {
    if (!this.material) return;
    const t = Number.isFinite(tier) ? Math.trunc(tier) : -1;
    this.material.uniforms.uTier.value = t;
  }

  resize({ viewport }) {
    if (!this.material) return;
    this.material.uniforms.uViewport.value.set(viewport.w, viewport.h);
  }

  tick({ now, intensity }) {
    if (!this.material) return;
    this.material.uniforms.uTime.value = now;
    if (typeof intensity === 'number') this.material.uniforms.uIntensity.value = intensity;
  }

  tickCompute({ dt, now, pointerStage, pointerVelStage, edges, waves, rects, intensity, history }) {
    if (!this.material) return;

    // Always drive render uniforms for procedural mode as well.
    this.material.uniforms.uPointer.value.copy(pointerStage);
    this.material.uniforms.uPointerVel.value.copy(pointerVelStage);
    if (typeof intensity === 'number') this.material.uniforms.uIntensity.value = intensity;
    {
      const count = Math.min(8, waves.length);
      this.material.uniforms.uWavesCount.value = count;
      for (let i = 0; i < 8; i++) {
        const w = waves[i];
        if (!w) {
          this.material.uniforms.uWaves.value[i].set(0, 0, -1e9, 0);
          continue;
        }
        this.material.uniforms.uWaves.value[i].copy(w);
      }
    }

    if (this.useGpgpu && this._compute) {
      this._compute.tick({ dt, now, pointerStage, pointerVelStage, edges, waves, rects, intensity, history });
      if (!this.material.defines.USE_GPGPU) {
        this.material.defines.USE_GPGPU = 1;
        this.material.needsUpdate = true;
      }
      this.material.uniforms.uPositionTex.value = this._compute.positionTexture;
      this.material.uniforms.uVelocityTex.value = this._compute.velocityTexture;
      return;
    }

    if (this.material.defines.USE_GPGPU) {
      delete this.material.defines.USE_GPGPU;
      this.material.needsUpdate = true;
    }
    this.material.uniforms.uPositionTex.value = this._dummyPosTex;
    this.material.uniforms.uVelocityTex.value = this._dummyVelTex;
  }

  destroy() {
    this.geometry.dispose();
    this.material?.dispose();
  }
}
