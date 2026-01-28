/**
 * PostFXPipeline — bloom + tonemap + gamma pipeline.
 * Input: linear texture from composite pass.
 * Output: display-ready image to screen.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Final output shader: exposure + ACES tonemap + gamma
const FinalOutputShader = {
  uniforms: {
    tDiffuse: { value: null },
    uExposure: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform float uExposure;

    // ACES filmic tonemap (simple fit)
    vec3 ACESFilm(vec3 x) {
      float a = 2.51;
      float b = 0.03;
      float c = 2.43;
      float d = 0.59;
      float e = 0.14;
      return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
    }

    void main() {
      vec3 col = texture2D(tDiffuse, vUv).rgb;
      col *= uExposure;
      col = ACESFilm(col);
      col = pow(col, vec3(1.0 / 2.2)); // sRGB gamma
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

// Input scene shader: samples the input texture
const InputShader = {
  uniforms: {
    uInputTex: { value: null },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uInputTex;
    void main() {
      gl_FragColor = texture2D(uInputTex, vUv);
    }
  `,
};

export class PostFXPipeline {
  constructor({ renderer, width, height, config = {} }) {
    this._renderer = renderer;
    this._width = width;
    this._height = height;

    // Config with defaults
    this._config = {
      exposure: config.exposure ?? 1.2,
      bloomStrength: config.bloom ?? 1.2,
      bloomThreshold: config.threshold ?? 0.7,
      bloomRadius: config.bloomRadius ?? 0.5,
    };

    // Input scene: fullscreen quad that samples the composite texture
    this._inputScene = new THREE.Scene();
    this._inputCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this._inputMaterial = new THREE.ShaderMaterial({
      uniforms: { ...InputShader.uniforms },
      vertexShader: InputShader.vertexShader,
      fragmentShader: InputShader.fragmentShader,
      depthTest: false,
      depthWrite: false,
    });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._inputMaterial);
    quad.frustumCulled = false;
    this._inputScene.add(quad);

    // EffectComposer
    this._composer = new EffectComposer(renderer);

    // RenderPass: renders the input scene (which just samples our texture)
    this._renderPass = new RenderPass(this._inputScene, this._inputCamera);
    this._composer.addPass(this._renderPass);

    // UnrealBloomPass
    const resolution = new THREE.Vector2(width, height);
    this._bloomPass = new UnrealBloomPass(
      resolution,
      this._config.bloomStrength,
      this._config.bloomRadius,
      this._config.bloomThreshold,
    );
    this._composer.addPass(this._bloomPass);

    // Final output pass (tonemap + gamma)
    this._finalPass = new ShaderPass(FinalOutputShader);
    this._finalPass.uniforms.uExposure.value = this._config.exposure;
    this._composer.addPass(this._finalPass);

    this._composer.setSize(width, height);
  }

  setInput(texture) {
    this._inputMaterial.uniforms.uInputTex.value = texture;
  }

  setExposure(value) {
    this._config.exposure = value;
    this._finalPass.uniforms.uExposure.value = value;
  }

  setBloom(strength, threshold, radius) {
    if (strength !== undefined) {
      this._config.bloomStrength = strength;
      this._bloomPass.strength = strength;
    }
    if (threshold !== undefined) {
      this._config.bloomThreshold = threshold;
      this._bloomPass.threshold = threshold;
    }
    if (radius !== undefined) {
      this._config.bloomRadius = radius;
      this._bloomPass.radius = radius;
    }
  }

  resize(width, height) {
    this._width = width;
    this._height = height;
    this._composer.setSize(width, height);
    this._bloomPass.resolution.set(width, height);
  }

  render(dt) {
    this._composer.render(dt);
  }

  dispose() {
    this._inputMaterial?.dispose();
    this._composer?.dispose?.();
  }
}
