import * as THREE from 'three';

function clamp01(x) {
  return Math.min(1, Math.max(0, x));
}

function pickRenderTargetType({ renderer, caps }) {
  // Prefer half-float for smoother glow accumulation, fallback to 8-bit.
  const gl2 = caps?.webgl2 ?? renderer.capabilities.isWebGL2;
  const halfFloatOk = caps?.extColorBufferHalfFloat || caps?.extColorBufferFloat;
  if (gl2 && halfFloatOk) return THREE.HalfFloatType;
  return THREE.UnsignedByteType;
}

function makeTarget({ w, h, type }) {
  const rt = new THREE.WebGLRenderTarget(w, h, {
    format: THREE.RGBAFormat,
    type,
    depthBuffer: false,
    stencilBuffer: false,
  });
  rt.texture.minFilter = THREE.LinearFilter;
  rt.texture.magFilter = THREE.LinearFilter;
  rt.texture.generateMipmaps = false;
  return rt;
}

const FULLSCREEN_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

// Composite: prev * decay + curr. Adds a subtle warm shimmer in negative space.
const COMPOSITE_FRAG = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uPrev;
uniform sampler2D uCurr;
uniform float uDecay;
uniform float uPresence;
uniform float uTime;
uniform float uIntensity;
uniform float uCurrGain;
uniform float uExposure;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  vec3 prev = texture2D(uPrev, vUv).rgb;
  vec3 curr = texture2D(uCurr, vUv).rgb;
  vec3 col = prev * uDecay + curr * uCurrGain;

  // Warm shimmer in dark areas (negative space).
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  float darkness = smoothstep(0.28, 0.02, l);
  float n = noise2(vUv * vec2(48.0, 28.0) + vec2(uTime * 0.07, -uTime * 0.05));
  float flicker = 0.5 + 0.5 * sin(uTime * 1.2 + n * 6.283);
  float shimmer = darkness * flicker * mix(0.010, 0.028, uIntensity) * uPresence;
  vec3 warm = vec3(1.0, 0.86, 0.62);
  col += warm * shimmer * (0.35 + 0.65 * n);

  // Soft tone-map to prevent blowouts from additive particles + accumulation.
  col *= uExposure;
  col = col / (vec3(1.0) + col); // Reinhard

  gl_FragColor = vec4(col, 1.0);
}
`;

const BLIT_FRAG = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform float uOpacity;
void main() {
  vec3 col = texture2D(uTex, vUv).rgb;
  // Output in display space.
  col = pow(max(col, 0.0), vec3(1.0 / 2.2));
  gl_FragColor = vec4(col, uOpacity);
}
`;

export class TrailAccumulationPass {
  constructor({ renderer, viewport, caps, scale = 0.5 } = {}) {
    if (!renderer) throw new Error('TrailAccumulationPass requires renderer');
    this._renderer = renderer;
    this._caps = caps || null;
    this._scale = scale;

    const type = pickRenderTargetType({ renderer, caps });
    this._type = type;

    this._rtA = null;
    this._rtB = null;
    this._rtCurr = null;

    this._quadScene = new THREE.Scene();
    this._quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._matComposite = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uPrev: { value: null },
        uCurr: { value: null },
        uDecay: { value: 0.92 },
        uPresence: { value: 0 },
        uTime: { value: 0 },
        uIntensity: { value: 1 },
        uCurrGain: { value: 0.75 },
        uExposure: { value: 1.1 },
      },
    });

    this._matBlit = new THREE.ShaderMaterial({
      vertexShader: FULLSCREEN_VERT,
      fragmentShader: BLIT_FRAG,
      transparent: true,
      blending: THREE.NormalBlending,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uTex: { value: null },
        uOpacity: { value: 0 },
      },
    });

    this._quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._matComposite);
    this._quad.frustumCulled = false;
    this._quadScene.add(this._quad);

    this.resize({ viewport });
  }

  setScale(scale) {
    this._scale = clamp01(scale);
  }

  resize({ viewport }) {
    const dpr = this._renderer.getPixelRatio();
    const w = Math.max(2, Math.floor(viewport.w * dpr * this._scale));
    const h = Math.max(2, Math.floor(viewport.h * dpr * this._scale));

    if (this._rtA && this._rtA.width === w && this._rtA.height === h) return;

    this._rtA?.dispose();
    this._rtB?.dispose();
    this._rtCurr?.dispose();
    this._rtA = makeTarget({ w, h, type: this._type });
    this._rtB = makeTarget({ w, h, type: this._type });
    this._rtCurr = makeTarget({ w, h, type: this._type });

    // Start from black.
    this.reset();
  }

  reset() {
    const renderer = this._renderer;
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(this._rtA);
    renderer.clear(true, false, false);
    renderer.setRenderTarget(this._rtB);
    renderer.clear(true, false, false);
    renderer.setRenderTarget(this._rtCurr);
    renderer.clear(true, false, false);
    renderer.setRenderTarget(prev);
  }

  render({
    particleScene,
    camera,
    dt,
    now,
    decay01,
    presence01,
    intensity01,
    currGain,
    exposure,
  }) {
    const renderer = this._renderer;
    const prev = renderer.getRenderTarget();

    // 1) Render particles into low-res current buffer.
    renderer.setRenderTarget(this._rtCurr);
    renderer.clear(true, false, false);
    renderer.render(particleScene, camera);

    // 2) Composite prev + curr into next buffer.
    this._quad.material = this._matComposite;
    this._matComposite.uniforms.uPrev.value = this._rtA.texture;
    this._matComposite.uniforms.uCurr.value = this._rtCurr.texture;
    this._matComposite.uniforms.uDecay.value = decay01;
    this._matComposite.uniforms.uPresence.value = presence01;
    this._matComposite.uniforms.uTime.value = now;
    this._matComposite.uniforms.uIntensity.value = intensity01;
    this._matComposite.uniforms.uCurrGain.value = currGain;
    this._matComposite.uniforms.uExposure.value = exposure;

    renderer.setRenderTarget(this._rtB);
    renderer.render(this._quadScene, this._quadCam);

    // 3) Blit to screen (additive) so underlying void can crossfade out cleanly.
    this._quad.material = this._matBlit;
    this._matBlit.uniforms.uTex.value = this._rtB.texture;
    this._matBlit.uniforms.uOpacity.value = presence01;
    renderer.setRenderTarget(null);
    renderer.render(this._quadScene, this._quadCam);

    // Swap buffers.
    const tmp = this._rtA;
    this._rtA = this._rtB;
    this._rtB = tmp;

    renderer.setRenderTarget(prev);
  }

  destroy() {
    this._rtA?.dispose();
    this._rtB?.dispose();
    this._rtCurr?.dispose();
    this._matComposite?.dispose();
    this._matBlit?.dispose();
    this._quad?.geometry?.dispose();
  }
}
