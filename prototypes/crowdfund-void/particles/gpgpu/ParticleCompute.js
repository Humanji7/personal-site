import * as THREE from 'three';
import { GPUComputationRenderer } from 'three/addons/misc/GPUComputationRenderer.js';

function fillPosition(data, side) {
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const i = (y * side + x) * 4;
      data[i + 0] = (Math.random() * 2 - 1) * 1.0; // x in [-1..1]
      data[i + 1] = (Math.random() * 2 - 1) * 1.0; // y in [-1..1]
      data[i + 2] = Math.random(); // z in [0..1]
      data[i + 3] = 1;
    }
  }
}

function fillVelocity(data, side) {
  for (let y = 0; y < side; y++) {
    for (let x = 0; x < side; x++) {
      const i = (y * side + x) * 4;
      data[i + 0] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 1;
    }
  }
}

export class ParticleCompute {
  constructor({ renderer, side, velocityShader, positionShader }) {
    this.side = side;
    this.gpu = new GPUComputationRenderer(side, side, renderer);
    this.gpu.setDataType(THREE.HalfFloatType);

    const dtPosition = this.gpu.createTexture();
    const dtVelocity = this.gpu.createTexture();
    fillPosition(dtPosition.image.data, side);
    fillVelocity(dtVelocity.image.data, side);

    this.velVar = this.gpu.addVariable('textureVelocity', velocityShader, dtVelocity);
    this.posVar = this.gpu.addVariable('texturePosition', positionShader, dtPosition);

    this.gpu.setVariableDependencies(this.velVar, [this.velVar, this.posVar]);
    this.gpu.setVariableDependencies(this.posVar, [this.velVar, this.posVar]);

    // Uniforms
    this.velVar.material.uniforms.uDt = { value: 0.016 };
    this.velVar.material.uniforms.uTime = { value: 0 };
    this.velVar.material.uniforms.uPointer = { value: new THREE.Vector2(0, 0) };
    this.velVar.material.uniforms.uPointerVel = { value: new THREE.Vector2(0, 0) };
    this.velVar.material.uniforms.uEdges = { value: 0 };
    this.velVar.material.uniforms.uIntensity = { value: 1 };
    this.velVar.material.uniforms.uWavesCount = { value: 0 };
    this.velVar.material.uniforms.uWaves = {
      value: Array.from({ length: 8 }, () => new THREE.Vector4(0, 0, -1e9, 0)),
    };
    this.velVar.material.uniforms.uRectsCount = { value: 0 };
    this.velVar.material.uniforms.uRects = {
      value: Array.from({ length: 16 }, () => new THREE.Vector4(0, 0, 0, 0)),
    };

    this.posVar.material.uniforms.uDt = { value: 0.016 };
    this.posVar.material.uniforms.uTime = { value: 0 };

    const err = this.gpu.init();
    if (err) throw new Error(err);
  }

  tick({ dt, now, pointerStage, pointerVelStage, edges, waves, rects, intensity }) {
    this.velVar.material.uniforms.uDt.value = dt;
    this.velVar.material.uniforms.uTime.value = now;
    this.velVar.material.uniforms.uPointer.value.copy(pointerStage);
    this.velVar.material.uniforms.uPointerVel.value.copy(pointerVelStage);
    this.velVar.material.uniforms.uEdges.value = edges;
    if (typeof intensity === 'number') this.velVar.material.uniforms.uIntensity.value = intensity;

    const count = Math.min(8, waves.length);
    this.velVar.material.uniforms.uWavesCount.value = count;
    for (let i = 0; i < 8; i++) {
      const w = waves[i];
      if (!w) {
        this.velVar.material.uniforms.uWaves.value[i].set(0, 0, -1e9, 0);
        continue;
      }
      this.velVar.material.uniforms.uWaves.value[i].copy(w);
    }

    const rc = Math.min(16, rects?.length ?? 0);
    this.velVar.material.uniforms.uRectsCount.value = rc;
    for (let i = 0; i < 16; i++) {
      const r = rects?.[i];
      if (!r) {
        this.velVar.material.uniforms.uRects.value[i].set(0, 0, 0, 0);
        continue;
      }
      this.velVar.material.uniforms.uRects.value[i].set(r.x0, r.y0, r.x1, r.y1);
    }

    this.posVar.material.uniforms.uDt.value = dt;
    this.posVar.material.uniforms.uTime.value = now;

    this.gpu.compute();
  }

  get positionTexture() {
    return this.gpu.getCurrentRenderTarget(this.posVar).texture;
  }

  get velocityTexture() {
    return this.gpu.getCurrentRenderTarget(this.velVar).texture;
  }
}
