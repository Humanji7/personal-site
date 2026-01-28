import * as THREE from 'three';
import { Text } from 'troika-three-text';

const CONFIG = {
  basePulseSpeed: 0.0008,
  pulseAmplitude: 0.15,

  cursorInfluence: 0.5,
  waveSmoothing: 0.08,
  velocityDecay: 0.85,

  maxTrails: 120,
  trailLifespan: 3000,

  colors: {
    primary: new THREE.Color(0x0d9488),
    secondary: new THREE.Color(0xf97068),
    tertiary: new THREE.Color(0xa78bfa),
    accent: new THREE.Color(0xfbbf24),
    deep: new THREE.Color(0x0a0a12),
  },

  pauseThreshold: 1500,
  rapidThreshold: 0.025,

  tunnelSpeed: 0.15,
  voidScrollHeight: 150,
  tunnelWarpPower: 2.5,
  tunnelCoreGlow: 1.5,

  emergenceFont:
    'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@2.304/fonts/ttf/JetBrainsMono-Regular.ttf',
  emergenceText: 'О. Ты дошёл.',
  emergenceFontSize: 0.08,
  emergenceThreshold: 0.85,
};

const MICRO_TEXTS = {
  onEnter: ['А, ты.', 'Вошёл.'],
  onRapid: ['Куда спешишь?', 'Медленнее.'],
  onPause: ['Стоишь. Думаешь?', 'Тишина. Хорошо.'],
  onLeave: ['Уходишь? Ладно.', 'Вернёшься — буду здесь.'],
  onReturn: ['Снова ты.', 'Помню тебя.'],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Copied from prototypes/crowdfund-void/void.js (kept identical for parity)
const fragmentShader = `
uniform float uTime;
uniform float uBreath;
uniform vec2 uMouse;
uniform vec2 uMouseRaw;
uniform vec2 uVelocity;
uniform float uVelocityMagnitude;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec2 uResolution;
uniform float uTrailIntensity;
uniform float uScrollProgress;
uniform float uTunnelWarpPower;
uniform float uTunnelCoreGlow;
uniform float uLayerFade;

varying vec2 vUv;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439,
           -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
          + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
              dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

float fbm(vec2 st, int octaves) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    if (i >= octaves) break;
    value += amplitude * snoise(st * frequency);
    frequency *= 2.0;
    amplitude *= 0.5;
  }
  return value;
}

vec2 warp(vec2 p, float t) {
  float n1 = fbm(p + t * 0.1, 4);
  float n2 = fbm(p + vec2(5.2, 1.3) + t * 0.08, 4);
  return p + vec2(n1, n2) * 0.4;
}

void main() {
  vec2 uv = vUv;
  vec2 centeredUv = uv - 0.5;
  float aspect = uResolution.x / uResolution.y;
  centeredUv.x *= aspect;

  float t = uTime * 0.2;
  float breathScale = 1.0 + uBreath * 0.1;

  vec2 screenCenter = vec2(0.5, 0.5);
  vec2 gravityTarget = mix(uMouseRaw, screenCenter, uScrollProgress);

  vec2 toGravity = gravityTarget - uv;
  float gravityDist = length(toGravity);
  vec2 gravityDir = normalize(toGravity + 0.0001);

  float baseAttraction = smoothstep(0.7, 0.0, gravityDist);
  float tunnelBoost = uScrollProgress * 0.5;
  float attraction = baseAttraction + tunnelBoost;

  float warpPower = 1.0 + uScrollProgress * uTunnelWarpPower;
  float dist = length(centeredUv);
  float warpedDist = pow(dist + 0.0001, warpPower);
  vec2 gravityWarpedUv = normalize(centeredUv + 0.0001) * warpedDist;

  float cursorPull = (1.0 - uScrollProgress) * attraction * 0.08;
  gravityWarpedUv += gravityDir * cursorPull;

  float velocityEffect = uVelocityMagnitude * 0.5;
  vec2 velocityDir = normalize(uVelocity + 0.0001);
  vec2 wake = velocityDir * velocityEffect * 0.15;
  gravityWarpedUv -= wake;

  vec2 warpedUv = warp(gravityWarpedUv * 1.5, t);

  vec2 wave1 = warpedUv * 2.2 * breathScale;
  wave1 += vec2(sin(t * 0.7), cos(t * 0.5)) * 0.35;
  wave1 += gravityDir * attraction * 0.3;
  float n1 = fbm(wave1 + t * 0.25, 4);

  vec2 wave2 = warpedUv * 3.8 * breathScale;
  wave2 -= vec2(cos(t * 0.6), sin(t * 0.8)) * 0.3;
  wave2 += gravityDir * attraction * 0.2;
  wave2 -= wake * 0.5;
  float n2 = fbm(wave2 - t * 0.18, 4);

  vec2 wave3 = warpedUv * 1.8 * breathScale;
  wave3 += vec2(sin(t * 0.4 + n1), cos(t * 0.3 + n2)) * 0.5;
  wave3 += gravityDir * attraction * 0.15;
  float n3 = fbm(wave3 + t * 0.12, 4);

  float detail = fbm(centeredUv * 6.0 + t * 0.3, 3) * 0.12;

  float noise = n1 * 0.45 + n2 * 0.3 + n3 * 0.25 + detail;
  noise = noise * 0.5 + 0.5;

  float colorMix1 = smoothstep(0.25, 0.65, noise + sin(t * 0.5) * 0.12);
  float colorMix2 = smoothstep(0.35, 0.75, noise + cos(t * 0.4) * 0.18);
  float colorMix3 = smoothstep(0.15, 0.55, noise * n3 + sin(t * 0.3) * 0.1);

  vec3 color = mix(uColor1, uColor2, colorMix1);
  color = mix(color, uColor3, colorMix2 * 0.65);
  color = mix(color, uColor4, colorMix3 * 0.35 * (1.0 + velocityEffect + attraction * 0.3));

  float iridescence = sin(noise * 6.28 + t) * (0.08 + attraction * 0.05);
  color += vec3(iridescence * 0.3, iridescence * 0.15, iridescence * 0.4);

  float breathPulse = 0.75 + uBreath * 0.25;
  color *= breathPulse;

  float cursorGlow = smoothstep(0.35, 0.0, gravityDist) * 0.45;
  cursorGlow *= (1.0 + velocityEffect * 0.4);
  vec3 glowColor = mix(vec3(1.0, 0.95, 0.9), vec3(1.0, 0.85, 0.7), velocityEffect);
  color += glowColor * cursorGlow;

  color += vec3(0.12, 0.15, 0.25) * uTrailIntensity * 0.6;

  float coreShape = smoothstep(0.25, 0.0, gravityDist);
  float brightPhase = smoothstep(0.0, 0.5, uScrollProgress);
  float blackoutPhase = smoothstep(0.7, 1.0, uScrollProgress);

  float coreBrightness = coreShape * brightPhase * (1.0 - blackoutPhase) * uTunnelCoreGlow;
  color += vec3(1.0, 0.98, 0.95) * coreBrightness;

  float blackHoleIntensity = coreShape * blackoutPhase * 2.0;
  color -= color * blackHoleIntensity;

  float tunnelVignette = 1.0 - length(centeredUv) * (0.3 + uScrollProgress * 0.7);
  color *= clamp(tunnelVignette, 0.0, 1.0);

  float globalBlackout = smoothstep(0.85, 1.0, uScrollProgress);
  color *= 1.0 - globalBlackout * 0.8;

  float depth = 1.0 - length(centeredUv) * 0.3;
  color *= depth;

  color = pow(color, vec3(0.95));
  gl_FragColor = vec4(color * uLayerFade, 1.0);
}
`;

export class VoidLayer {
  constructor() {
    this.scene = null;
    this.camera = null;
    this.mesh = null;
    this.material = null;
    this.uniforms = null;
    this.emergenceText = null;

    this._viewport = { w: 1, h: 1 };
    this._fade = 1;

    this._state = {
      mouse: new THREE.Vector2(0, 0),
      smoothMouse: new THREE.Vector2(0, 0),
      velocity: new THREE.Vector2(0, 0),
      lastMouse: new THREE.Vector2(0, 0),
      lastMoveTime: Date.now(),
      isFirstVisit: !localStorage.getItem('void-visited'),
      trails: [],
      breathPhase: 0,
      hasEntered: false,
      isPausing: false,
      microTextTimeout: null,
      scrollProgress: 0,
    };

    this._onPointerMove = (e) => this._handlePointerMove(e);
    this._onMouseEnter = () => this._handlePointerEnter();
    this._onMouseLeave = () => this._handlePointerLeave();
  }

  async init({ renderer, viewport }) {
    this._viewport = { ...viewport };

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.z = 1;

    this.uniforms = {
      uTime: { value: 0 },
      uBreath: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uMouseRaw: { value: new THREE.Vector2(0.5, 0.5) },
      uVelocity: { value: new THREE.Vector2(0, 0) },
      uVelocityMagnitude: { value: 0 },
      uColor1: { value: CONFIG.colors.primary },
      uColor2: { value: CONFIG.colors.secondary },
      uColor3: { value: CONFIG.colors.tertiary },
      uColor4: { value: CONFIG.colors.accent },
      uResolution: { value: new THREE.Vector2(this._viewport.w, this._viewport.h) },
      uTrailIntensity: { value: 0 },
      uScrollProgress: { value: 0 },
      uTunnelWarpPower: { value: CONFIG.tunnelWarpPower },
      uTunnelCoreGlow: { value: CONFIG.tunnelCoreGlow },
      uLayerFade: { value: 1 },
    };

    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: this.uniforms,
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.emergenceText = new Text();
    this.emergenceText.text = CONFIG.emergenceText;
    this.emergenceText.font = CONFIG.emergenceFont;
    this.emergenceText.fontSize = CONFIG.emergenceFontSize;
    this.emergenceText.anchorX = 'center';
    this.emergenceText.anchorY = 'middle';
    this.emergenceText.textAlign = 'center';
    this.emergenceText.color = 0xffffff;
    this.emergenceText.fillOpacity = 0;
    this.emergenceText.letterSpacing = 0.05;
    this.emergenceText.position.z = 0.1;
    this.emergenceText.sync();
    this.scene.add(this.emergenceText);

    // Input listeners (kept here for parity; later moved to InputController).
    window.addEventListener('pointermove', this._onPointerMove, { passive: true });
    window.addEventListener('mouseenter', this._onMouseEnter, { passive: true });
    window.addEventListener('mouseleave', this._onMouseLeave, { passive: true });

    // Mark as visited (preserves existing behavior).
    localStorage.setItem('void-visited', 'true');

    // Maintain the current DOM timing behavior.
    setTimeout(() => {
      const mainMessage = document.querySelector('.main-message');
      mainMessage?.classList.add('visible');
    }, 1000);

    // Touch the renderer once so Three initializes internal state early.
    renderer.compile(this.scene, this.camera);
  }

  setProgress(voidProgress) {
    this._state.scrollProgress = voidProgress;
  }

  setFade(alpha) {
    this._fade = Math.min(1, Math.max(0, alpha));
  }

  resize({ viewport }) {
    this._viewport = { ...viewport };
    this.uniforms.uResolution.value.set(this._viewport.w, this._viewport.h);
  }

  tick({ dt, now }) {
    const state = this._state;

    // Time
    this.uniforms.uTime.value = now;

    // Breathing pulse
    state.breathPhase += CONFIG.basePulseSpeed;
    this.uniforms.uBreath.value = Math.sin(state.breathPhase) * CONFIG.pulseAmplitude;

    // RAW cursor
    this.uniforms.uMouseRaw.value.set(state.mouse.x, state.mouse.y);

    // Smooth cursor
    state.smoothMouse.x += (state.mouse.x - state.smoothMouse.x) * CONFIG.waveSmoothing;
    state.smoothMouse.y += (state.mouse.y - state.smoothMouse.y) * CONFIG.waveSmoothing;
    this.uniforms.uMouse.value.set(state.smoothMouse.x, state.smoothMouse.y);

    // Velocity decay
    state.velocity.multiplyScalar(CONFIG.velocityDecay);
    this.uniforms.uVelocity.value.copy(state.velocity);
    this.uniforms.uVelocityMagnitude.value = state.velocity.length() * 5;

    // Trails → intensity
    const nowMs = Date.now();
    let trailIntensity = 0;
    const validTrails = [];
    for (const trail of state.trails) {
      const age = nowMs - trail.time;
      if (age < CONFIG.trailLifespan) {
        const fade = 1 - age / CONFIG.trailLifespan;
        trailIntensity += trail.intensity * fade * 0.1;
        validTrails.push(trail);
      }
    }
    state.trails = validTrails;
    this.uniforms.uTrailIntensity.value = Math.min(trailIntensity, 1);
    this.uniforms.uScrollProgress.value = state.scrollProgress;
    this.uniforms.uLayerFade.value = this._fade;

    // Emergence fade-in
    const p = state.scrollProgress;
    const emergenceProgress = Math.max(0, (p - CONFIG.emergenceThreshold) / (1.0 - CONFIG.emergenceThreshold));
    const smoothEmergence = emergenceProgress * emergenceProgress * (3 - 2 * emergenceProgress);
    this.emergenceText.fillOpacity = smoothEmergence * this._fade;

    // DOM layer transition behavior (kept identical).
    const voidContainer = document.getElementById('void-container');
    const voidTextLayer = document.getElementById('void-text-layer');
    if (p >= 0.85) {
      if (voidContainer) voidContainer.style.pointerEvents = 'none';
      if (voidTextLayer) {
        voidTextLayer.style.opacity = '0';
        voidTextLayer.style.transition = 'opacity 0.5s ease-out';
      }
    } else {
      if (voidContainer) voidContainer.style.pointerEvents = 'auto';
      if (voidTextLayer) voidTextLayer.style.opacity = '1';
    }

    // Pause detection
    const timeSinceMove = nowMs - state.lastMoveTime;
    if (timeSinceMove > CONFIG.pauseThreshold && state.hasEntered && !state.isPausing) {
      state.isPausing = true;
      this._showMicroText(pickRandom(MICRO_TEXTS.onPause));
    }
  }

  render(renderer, opts = {}) {
    const { target = null } = opts;
    if (target) {
      renderer.setRenderTarget(target);
    }
    renderer.render(this.scene, this.camera);
    if (target) {
      renderer.setRenderTarget(null);
    }
  }

  destroy() {
    window.removeEventListener('pointermove', this._onPointerMove);
    window.removeEventListener('mouseenter', this._onMouseEnter);
    window.removeEventListener('mouseleave', this._onMouseLeave);

    if (this._state.microTextTimeout) clearTimeout(this._state.microTextTimeout);
    this._state.microTextTimeout = null;

    this.mesh?.geometry?.dispose?.();
    this.material?.dispose?.();
  }

  _handlePointerMove(e) {
    const state = this._state;
    const now = Date.now();

    const x = e.clientX / this._viewport.w;
    const y = 1.0 - e.clientY / this._viewport.h;
    state.mouse.set(x, y);

    state.velocity.x = state.mouse.x - state.lastMouse.x;
    state.velocity.y = state.mouse.y - state.lastMouse.y;

    const velocityMag = state.velocity.length();
    if (velocityMag > 0.001) {
      state.trails.push({
        x: state.mouse.x,
        y: state.mouse.y,
        time: now,
        intensity: Math.min(velocityMag * 10, 1),
      });
      while (state.trails.length > CONFIG.maxTrails) state.trails.shift();
    }

    if (velocityMag > CONFIG.rapidThreshold && !state.hasEntered) {
      this._showMicroText(pickRandom(MICRO_TEXTS.onRapid));
    }

    state.isPausing = false;
    state.lastMoveTime = now;
    state.lastMouse.copy(state.mouse);
  }

  _handlePointerEnter() {
    const state = this._state;
    if (state.hasEntered) return;
    state.hasEntered = true;
    const texts = state.isFirstVisit ? MICRO_TEXTS.onEnter : MICRO_TEXTS.onReturn;
    this._showMicroText(pickRandom(texts));
  }

  _handlePointerLeave() {
    const state = this._state;
    this._showMicroText(pickRandom(MICRO_TEXTS.onLeave));
    state.hasEntered = false;
  }

  _showMicroText(text) {
    const el = document.getElementById('micro-text');
    if (!el) return;

    if (this._state.microTextTimeout) clearTimeout(this._state.microTextTimeout);
    el.textContent = text;
    el.classList.add('visible');
    this._state.microTextTimeout = setTimeout(() => {
      el.classList.remove('visible');
    }, 2500);
  }
}
