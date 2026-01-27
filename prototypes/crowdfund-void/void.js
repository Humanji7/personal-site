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
    waveSmoothing: 0.08,  // slow follow for organic waves
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

    // Scroll tunnel
    tunnelSpeed: 0.15,  // глубина втягивания при scroll=1
    voidScrollHeight: 150,  // vh - high zone for void (was 300)
    tunnelWarpPower: 2.5,    // экспонента сжатия UV (1=линейно, 3=агрессивно)
    tunnelCoreGlow: 1.5,     // яркость центра на scroll=1
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
    scrollProgress: 0,  // 0-1
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
        
        // Time-based flow
        float t = uTime * 0.2;
        float breathScale = 1.0 + uBreath * 0.1;
        
        // ============================================
        // GRAVITY WELL - cursor → center via scroll
        // ============================================
        // Gravity target: lerp from cursor to center based on scroll
        vec2 screenCenter = vec2(0.5, 0.5);
        vec2 gravityTarget = mix(uMouseRaw, screenCenter, uScrollProgress);
        
        vec2 toGravity = gravityTarget - uv;
        float gravityDist = length(toGravity);
        vec2 gravityDir = normalize(toGravity + 0.0001);
        
        // Attraction: stronger near center, intensifies with scroll
        float baseAttraction = smoothstep(0.7, 0.0, gravityDist);
        float tunnelBoost = uScrollProgress * 0.5;
        float attraction = baseAttraction + tunnelBoost;
        
        // ============================================
        // EXPONENTIAL UV SINGULARITY (Hyperspace Tunnel)
        // ============================================
        float warpPower = 1.0 + uScrollProgress * uTunnelWarpPower;
        float dist = length(centeredUv);
        float warpedDist = pow(dist + 0.0001, warpPower); // exponential collapse
        vec2 gravityWarpedUv = normalize(centeredUv + 0.0001) * warpedDist;
        
        // Preserve cursor pull at low scroll (fade out as we dive)
        float cursorPull = (1.0 - uScrollProgress) * attraction * 0.08;
        gravityWarpedUv += gravityDir * cursorPull;
        
        // Velocity creates wake/trail behind movement
        float velocityEffect = uVelocityMagnitude * 0.5;
        vec2 velocityDir = normalize(uVelocity + 0.0001);
        
        // Wake effect - distortion trails behind fast movement
        vec2 wake = velocityDir * velocityEffect * 0.15;
        gravityWarpedUv -= wake;
        
        // ============================================
        // Domain warping with gravity influence
        // ============================================
        vec2 warpedUv = warp(gravityWarpedUv * 1.5, t);
        
        // Wave layers - all influenced by gravity field
        vec2 wave1 = warpedUv * 2.2 * breathScale;
        wave1 += vec2(sin(t * 0.7), cos(t * 0.5)) * 0.35;
        wave1 += gravityDir * attraction * 0.3; // Pull toward gravity center
        float n1 = fbm(wave1 + t * 0.25, 4);
        
        vec2 wave2 = warpedUv * 3.8 * breathScale;
        wave2 -= vec2(cos(t * 0.6), sin(t * 0.8)) * 0.3;
        wave2 += gravityDir * attraction * 0.2;
        wave2 -= wake * 0.5; // Wake affects deeper layer
        float n2 = fbm(wave2 - t * 0.18, 4);
        
        vec2 wave3 = warpedUv * 1.8 * breathScale;
        wave3 += vec2(sin(t * 0.4 + n1), cos(t * 0.3 + n2)) * 0.5;
        wave3 += gravityDir * attraction * 0.15;
        float n3 = fbm(wave3 + t * 0.12, 4);
        
        // Fine detail layer
        float detail = fbm(centeredUv * 6.0 + t * 0.3, 3) * 0.12;
        
        // Combine noise layers
        float noise = n1 * 0.45 + n2 * 0.3 + n3 * 0.25 + detail;
        noise = noise * 0.5 + 0.5;
        
        // Color blending - attraction intensifies accent color
        float colorMix1 = smoothstep(0.25, 0.65, noise + sin(t * 0.5) * 0.12);
        float colorMix2 = smoothstep(0.35, 0.75, noise + cos(t * 0.4) * 0.18);
        float colorMix3 = smoothstep(0.15, 0.55, noise * n3 + sin(t * 0.3) * 0.1);
        
        vec3 color = mix(uColor1, uColor2, colorMix1);
        color = mix(color, uColor3, colorMix2 * 0.65);
        color = mix(color, uColor4, colorMix3 * 0.35 * (1.0 + velocityEffect + attraction * 0.3));
        
        // Iridescence intensified near cursor
        float iridescence = sin(noise * 6.28 + t) * (0.08 + attraction * 0.05);
        color += vec3(iridescence * 0.3, iridescence * 0.15, iridescence * 0.4);
        
        // Breathing pulse
        float breathPulse = 0.75 + uBreath * 0.25;
        color *= breathPulse;
        
        // ============================================
        // GLOW - instant, part of gravity field
        // ============================================
        float cursorGlow = smoothstep(0.35, 0.0, gravityDist) * 0.45;
        cursorGlow *= (1.0 + velocityEffect * 0.4);
        // Glow color slightly warmer when moving fast
        vec3 glowColor = mix(vec3(1.0, 0.95, 0.9), vec3(1.0, 0.85, 0.7), velocityEffect);
        color += glowColor * cursorGlow;
        
        // Trail intensity shimmer
        color += vec3(0.12, 0.15, 0.25) * uTrailIntensity * 0.6;
        
        // ============================================
        // TUNNEL CORE GLOW → BLACKOUT (bright to black hole)
        // Phase 1 (scroll 0-0.7): bright core
        // Phase 2 (scroll 0.7-1.0): core inverts to BLACK HOLE
        // ============================================
        float coreShape = smoothstep(0.25, 0.0, gravityDist);
        
        // Brightness phases
        float brightPhase = smoothstep(0.0, 0.5, uScrollProgress);  // ramp up 0-50%
        float blackoutPhase = smoothstep(0.7, 1.0, uScrollProgress); // ramp down 70-100%
        
        // Core brightness: peaks at ~50-70%, then inverts to black
        float coreBrightness = coreShape * brightPhase * (1.0 - blackoutPhase) * uTunnelCoreGlow;
        color += vec3(1.0, 0.98, 0.95) * coreBrightness;
        
        // BLACK HOLE: subtract light from core at high scroll
        float blackHoleIntensity = coreShape * blackoutPhase * 2.0;
        color -= color * blackHoleIntensity;  // core becomes pure black
        
        // ============================================
        // TUNNEL VIGNETTE (dark edges intensify with scroll)
        // ============================================
        float tunnelVignette = 1.0 - length(centeredUv) * (0.3 + uScrollProgress * 0.7);
        color *= clamp(tunnelVignette, 0.0, 1.0);
        
        // ============================================
        // GLOBAL BLACKOUT (entire scene darkens at scroll=1)
        // ============================================
        float globalBlackout = smoothstep(0.85, 1.0, uScrollProgress);
        color *= 1.0 - globalBlackout * 0.8;  // darken everything
        
        // Depth gradient
        float depth = 1.0 - length(centeredUv) * 0.3;
        color *= depth;
        
        // Gamma correction
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
        uMouseRaw: { value: new THREE.Vector2(0.5, 0.5) },
        uVelocity: { value: new THREE.Vector2(0, 0) },
        uVelocityMagnitude: { value: 0 },
        uColor1: { value: CONFIG.colors.primary },
        uColor2: { value: CONFIG.colors.secondary },
        uColor3: { value: CONFIG.colors.tertiary },
        uColor4: { value: CONFIG.colors.accent },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTrailIntensity: { value: 0 },
        uScrollProgress: { value: 0 },
        uTunnelWarpPower: { value: CONFIG.tunnelWarpPower },
        uTunnelCoreGlow: { value: CONFIG.tunnelCoreGlow },
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

    // Scroll tracking - progress based on void-zone height only
    const voidZone = document.getElementById('void-zone');
    const voidContainer = document.getElementById('void-container');
    const voidZoneHeight = voidZone ? voidZone.offsetHeight - window.innerHeight : window.innerHeight;

    // NO CSS FADE - shader handles blackout transition
    // Void stays visible but turns into black hole

    window.addEventListener('scroll', () => {
        const progress = voidZoneHeight > 0 ? Math.min(window.scrollY / voidZoneHeight, 1) : 0;
        state.scrollProgress = progress;

        // At 100% scroll: disable pointer-events so emergence can be interacted with
        // Void stays visible (black hole) behind emergence
        if (progress >= 0.95) {
            voidContainer.style.pointerEvents = 'none';

            // Reveal emergence content
            const emergenceContent = document.querySelector('.emergence-content');
            if (emergenceContent && !emergenceContent.classList.contains('visible')) {
                emergenceContent.style.opacity = '1';
                emergenceContent.style.transform = 'translateY(0)';
                emergenceContent.classList.add('visible');
            }
        } else {
            voidContainer.style.pointerEvents = 'auto';
        }
    }, { passive: true });

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

    // RAW cursor (instant 1:1 for glow)
    uniforms.uMouseRaw.value.set(state.mouse.x, state.mouse.y);

    // SMOOTH cursor (organic wave flow)
    state.smoothMouse.x += (state.mouse.x - state.smoothMouse.x) * CONFIG.waveSmoothing;
    state.smoothMouse.y += (state.mouse.y - state.smoothMouse.y) * CONFIG.waveSmoothing;
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
    uniforms.uScrollProgress.value = state.scrollProgress;

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
