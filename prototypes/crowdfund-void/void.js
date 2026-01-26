/**
 * The Void — Живое Пространство
 * 
 * Формула: Цветовые волны + Пульс + Ожидание
 * 4 столпа: Живое Присутствие, Честная Странность, Тайна-Приглашение, Резонанс
 */

import * as THREE from 'three';

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
    // Breathing pulse
    basePulseSpeed: 0.0008,
    pulseAmplitude: 0.15,

    // Cursor response
    cursorInfluence: 0.5,
    cursorSmoothing: 0.9,
    velocityDecay: 0.85,

    // Echo trails
    maxTrails: 120,
    trailLifespan: 3000, // ms

    // Color palette (organic, warm dreamscape)
    colors: {
        primary: new THREE.Color(0x0d9488),   // Deep teal
        secondary: new THREE.Color(0xf97068), // Warm coral
        tertiary: new THREE.Color(0xa78bfa),  // Soft violet
        accent: new THREE.Color(0xfbbf24),    // Golden amber
        deep: new THREE.Color(0x0a0a12),      // Deep void
    },

    // Timing thresholds
    pauseThreshold: 1500,    // ms without movement = pause
    rapidThreshold: 0.025,   // velocity threshold for rapid movement
};

// ============================================================
// STATE
// ============================================================
const state = {
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
};

// ============================================================
// MICRO-TEXTS (from copywriting)
// ============================================================
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

// ============================================================
// SHADERS
// ============================================================
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    uniform float uTime;
    uniform float uBreath;
    uniform vec2 uMouse;
    uniform vec2 uVelocity;
    uniform float uVelocityMagnitude;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uColor4;
    uniform vec2 uResolution;
    uniform float uTrailIntensity;
    
    varying vec2 vUv;
    
    // Noise functions
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
    
    // Enhanced FBM with configurable octaves
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
    
    // Domain warping for organic flow
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
        
        // Time-based flow (slightly faster)
        float t = uTime * 0.2;
        float breathScale = 1.0 + uBreath * 0.1;
        
        // Mouse influence with smooth falloff
        vec2 toMouse = (uMouse - uv) * 2.0;
        float mouseDist = length(toMouse);
        float mouseInfluence = smoothstep(0.6, 0.0, mouseDist) * 0.5;
        
        // Velocity creates ripples
        float velocityEffect = uVelocityMagnitude * 0.4;
        vec2 velocityDir = normalize(uVelocity + 0.001);
        
        // Domain warping base
        vec2 warpedUv = warp(centeredUv * 1.5, t);
        
        // Wave layers with organic movement + warping
        vec2 wave1 = warpedUv * 2.2 * breathScale;
        wave1 += vec2(sin(t * 0.7), cos(t * 0.5)) * 0.35;
        wave1 += toMouse * mouseInfluence;
        float n1 = fbm(wave1 + t * 0.25, 4);
        
        vec2 wave2 = warpedUv * 3.8 * breathScale;
        wave2 -= vec2(cos(t * 0.6), sin(t * 0.8)) * 0.3;
        wave2 += velocityDir * velocityEffect;
        float n2 = fbm(wave2 - t * 0.18, 4);
        
        vec2 wave3 = warpedUv * 1.8 * breathScale;
        wave3 += vec2(sin(t * 0.4 + n1), cos(t * 0.3 + n2)) * 0.5;
        float n3 = fbm(wave3 + t * 0.12, 4);
        
        // Fine detail layer
        float detail = fbm(centeredUv * 6.0 + t * 0.3, 3) * 0.12;
        
        // Combine noise layers
        float noise = n1 * 0.45 + n2 * 0.3 + n3 * 0.25 + detail;
        noise = noise * 0.5 + 0.5; // Normalize to 0-1
        
        // Color blending based on noise and position
        float colorMix1 = smoothstep(0.25, 0.65, noise + sin(t * 0.5) * 0.12);
        float colorMix2 = smoothstep(0.35, 0.75, noise + cos(t * 0.4) * 0.18);
        float colorMix3 = smoothstep(0.15, 0.55, noise * n3 + sin(t * 0.3) * 0.1);
        
        vec3 color = mix(uColor1, uColor2, colorMix1);
        color = mix(color, uColor3, colorMix2 * 0.65);
        color = mix(color, uColor4, colorMix3 * 0.35 * (1.0 + velocityEffect));
        
        // Add subtle iridescence
        float iridescence = sin(noise * 6.28 + t) * 0.08;
        color += vec3(iridescence * 0.3, iridescence * 0.15, iridescence * 0.4);
        
        // Breathing pulse on overall intensity
        float breathPulse = 0.75 + uBreath * 0.25;
        color *= breathPulse;
        
        // Cursor glow - warmer
        float cursorGlow = smoothstep(0.4, 0.0, mouseDist) * 0.4;
        cursorGlow *= (1.0 + velocityEffect * 0.6);
        color += vec3(1.0, 0.95, 0.9) * cursorGlow;
        
        // Trail intensity adds shimmer
        color += vec3(0.12, 0.15, 0.25) * uTrailIntensity * 0.6;
        
        // Softer vignette
        float vignette = 1.0 - smoothstep(0.4, 1.4, length(centeredUv));
        color *= vignette;
        
        // Subtle depth gradient
        float depth = 1.0 - length(centeredUv) * 0.3;
        color *= depth;
        
        // Gamma correction for smoother colors
        color = pow(color, vec3(0.95));
        
        gl_FragColor = vec4(color, 1.0);
    }
`;

// ============================================================
// THREE.JS SETUP
// ============================================================
let scene, camera, renderer, mesh, uniforms;

function init() {
    const canvas = document.getElementById('void-canvas');

    // Scene
    scene = new THREE.Scene();

    // Camera (orthographic for fullscreen quad)
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: false,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Uniforms
    uniforms = {
        uTime: { value: 0 },
        uBreath: { value: 0 },
        uMouse: { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity: { value: new THREE.Vector2(0, 0) },
        uVelocityMagnitude: { value: 0 },
        uColor1: { value: CONFIG.colors.primary },
        uColor2: { value: CONFIG.colors.secondary },
        uColor3: { value: CONFIG.colors.tertiary },
        uColor4: { value: CONFIG.colors.accent },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTrailIntensity: { value: 0 },
    };

    // Shader material
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
    });

    // Fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Event listeners
    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseenter', onMouseEnter);
    window.addEventListener('mouseleave', onMouseLeave);

    // Show main text after delay
    setTimeout(() => {
        const mainMessage = document.querySelector('.main-message');
        mainMessage.classList.add('visible');
    }, 1000);

    // Mark as visited
    localStorage.setItem('void-visited', 'true');

    // Start animation
    animate();
}

function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
}

function onMouseMove(e) {
    const now = Date.now();

    // Normalized mouse position
    state.mouse.x = e.clientX / window.innerWidth;
    state.mouse.y = 1.0 - e.clientY / window.innerHeight; // Flip Y

    // Calculate velocity
    state.velocity.x = state.mouse.x - state.lastMouse.x;
    state.velocity.y = state.mouse.y - state.lastMouse.y;

    const velocityMag = state.velocity.length();

    // Add trail point
    if (velocityMag > 0.001) {
        state.trails.push({
            x: state.mouse.x,
            y: state.mouse.y,
            time: now,
            intensity: Math.min(velocityMag * 10, 1),
        });

        // Limit trail count
        while (state.trails.length > CONFIG.maxTrails) {
            state.trails.shift();
        }
    }

    // Detect rapid movement
    if (velocityMag > CONFIG.rapidThreshold && !state.hasEntered) {
        showMicroText(pickRandom(MICRO_TEXTS.onRapid));
    }

    // Reset pause state
    state.isPausing = false;
    state.lastMoveTime = now;
    state.lastMouse.copy(state.mouse);
}

function onMouseEnter() {
    if (!state.hasEntered) {
        state.hasEntered = true;
        const texts = state.isFirstVisit ? MICRO_TEXTS.onEnter : MICRO_TEXTS.onReturn;
        showMicroText(pickRandom(texts));
    }
}

function onMouseLeave() {
    showMicroText(pickRandom(MICRO_TEXTS.onLeave));
    state.hasEntered = false;
}

function showMicroText(text) {
    const el = document.getElementById('micro-text');

    // Clear any existing timeout
    if (state.microTextTimeout) {
        clearTimeout(state.microTextTimeout);
    }

    // Show new text
    el.textContent = text;
    el.classList.add('visible');

    // Hide after delay
    state.microTextTimeout = setTimeout(() => {
        el.classList.remove('visible');
    }, 2500);
}

// ============================================================
// ANIMATION LOOP
// ============================================================
function animate() {
    requestAnimationFrame(animate);

    const now = Date.now();

    // Update time
    uniforms.uTime.value = performance.now() * 0.001;

    // Breathing pulse
    state.breathPhase += CONFIG.basePulseSpeed;
    uniforms.uBreath.value = Math.sin(state.breathPhase) * CONFIG.pulseAmplitude;

    // Smooth cursor following
    state.smoothMouse.x += (state.mouse.x - state.smoothMouse.x) * CONFIG.cursorSmoothing;
    state.smoothMouse.y += (state.mouse.y - state.smoothMouse.y) * CONFIG.cursorSmoothing;
    uniforms.uMouse.value.set(state.smoothMouse.x, state.smoothMouse.y);

    // Decay velocity
    state.velocity.multiplyScalar(CONFIG.velocityDecay);
    uniforms.uVelocity.value.copy(state.velocity);
    uniforms.uVelocityMagnitude.value = state.velocity.length() * 5;

    // Calculate trail intensity (fading based on time)
    let trailIntensity = 0;
    const validTrails = [];
    for (const trail of state.trails) {
        const age = now - trail.time;
        if (age < CONFIG.trailLifespan) {
            const fade = 1 - age / CONFIG.trailLifespan;
            trailIntensity += trail.intensity * fade * 0.1;
            validTrails.push(trail);
        }
    }
    state.trails = validTrails;
    uniforms.uTrailIntensity.value = Math.min(trailIntensity, 1);

    // Pause detection
    const timeSinceMove = now - state.lastMoveTime;
    if (timeSinceMove > CONFIG.pauseThreshold && state.hasEntered && !state.isPausing) {
        state.isPausing = true;
        showMicroText(pickRandom(MICRO_TEXTS.onPause));
    }

    renderer.render(scene, camera);
}

// ============================================================
// START
// ============================================================
init();
