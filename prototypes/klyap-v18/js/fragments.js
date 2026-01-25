/**
 * KLYAP v18 — Fragment System
 * Spawn logic, layer management, and morphing triggers
 */

import {
    CONFIG, MAX_FRAGMENT_REPETITIONS, FRAGMENT_BASE, LAYER_MAP,
    LAYER_THRESHOLDS, DISPLACEMENT_INTENSITY, DISPLACEMENT_DECAY,
    TEMPORAL_DISPLACEMENT
} from './config.js';
import { AppState, getCycleTime, setLayer, updateDepth, resetFragmentUsage } from './state.js';
import { decomposeFragment, assembleFragment, triggerWindSweep } from './particles.js';

// DOM elements
let stream, layerFlash, displaceMap;

/**
 * Initialize fragment system
 */
export function initFragments() {
    stream = document.getElementById('stream');
    layerFlash = document.getElementById('layer-flash');
    displaceMap = document.getElementById('displace-map');

    // Preload all fragments
    Object.entries(LAYER_MAP).forEach(([layer, fragments]) => {
        fragments.forEach(id => {
            new Image().src = `${FRAGMENT_BASE}/${layer}/fragment-${id}.png`;
        });
    });
}

/**
 * Get current phase based on cycle time
 */
export function getCurrentPhase() {
    const elapsed = getCycleTime();
    if (elapsed < CONFIG.phases.sparse.end) return CONFIG.phases.sparse;
    if (elapsed < CONFIG.phases.hook.end) return CONFIG.phases.hook;
    if (elapsed < CONFIG.phases.overwhelm.end) return CONFIG.phases.overwhelm;
    return CONFIG.phases.fade;
}

/**
 * Get phase name for debug
 */
export function getPhaseName() {
    const phase = getCurrentPhase();
    if (phase === CONFIG.phases.sparse) return 'SPARSE';
    if (phase === CONFIG.phases.hook) return 'HOOK';
    if (phase === CONFIG.phases.overwhelm) return 'OVERWHELM';
    return 'FADE';
}

/**
 * Get current layer based on depth
 */
function getCurrentLayer() {
    for (let i = LAYER_THRESHOLDS.length - 1; i >= 0; i--) {
        if (AppState.layer.depth >= LAYER_THRESHOLDS[i].depth) {
            return LAYER_THRESHOLDS[i].layer;
        }
    }
    return 'noise';
}

/**
 * Calculate spawn interval based on phase and state
 */
export function getSpawnInterval() {
    const phase = getCurrentPhase();
    let interval = phase.interval + (Math.random() - 0.5) * phase.variance;

    // Incomplete Pattern: irregular drift (±15% additional)
    const patternDrift = 1 + (Math.sin(AppState.fragment.spawned * 0.7) * 0.15);
    interval *= patternDrift;

    // Scroll boost
    const scrollBoost = Math.min(AppState.physics.scrollDelta / 400, 1.5);
    interval /= (1 + scrollBoost * CONFIG.timing.SCROLL_BOOST_FACTOR);

    // Exhaustion penalty
    if (AppState.physics.exhaustionLevel > 0.3) {
        interval *= (1 + AppState.physics.exhaustionLevel * CONFIG.exhaustionPenalty);
    }

    // Decay scroll delta
    const timeSinceScroll = Date.now() - AppState.physics.lastScrollTime;
    if (timeSinceScroll > 150) {
        AppState.physics.scrollDelta *= 0.9;
    }

    // Slow decay of exhaustion
    AppState.physics.exhaustionLevel *= CONFIG.exhaustionDecay;

    return Math.max(interval, CONFIG.timing.MIN_SPAWN_INTERVAL);
}

/**
 * Trigger layer flash effect
 */
function triggerLayerFlash(layer) {
    layerFlash.className = layer + ' active';
    setTimeout(() => {
        layerFlash.classList.remove('active');
    }, 600);
    console.log(`Layer: ${layer}`);
}

/**
 * Trigger displacement effect
 */
function triggerDisplacement(fromLayer, toLayer) {
    const key = `${fromLayer}→${toLayer}`;
    const intensity = DISPLACEMENT_INTENSITY[key] || DISPLACEMENT_INTENSITY.default;

    displaceMap.setAttribute('scale', intensity);
    stream.classList.add('displacement-active');

    let currentScale = intensity;
    const decay = () => {
        currentScale *= DISPLACEMENT_DECAY;
        if (currentScale < 2) {
            stream.classList.remove('displacement-active');
            displaceMap.setAttribute('scale', 0);
            return;
        }
        displaceMap.setAttribute('scale', currentScale);
        requestAnimationFrame(decay);
    };
    requestAnimationFrame(decay);
}

/**
 * Spawn a single fragment
 */
export function spawnFragment() {
    if (AppState.fragment.active >= CONFIG.maxActiveFragments) return;

    // Update layer
    const newLayer = getCurrentLayer();
    const layerChanged = setLayer(newLayer);

    if (layerChanged) {
        triggerLayerFlash(newLayer);
        triggerDisplacement(AppState.layer.previous, newLayer);
        triggerWindSweep();

        // WebGL morph on layer change
        if (window.localizedMorph?.canMorph() && AppState.layer.previous) {
            const existingFrags = stream.querySelectorAll('.fragment');
            const morphTarget = existingFrags[existingFrags.length - 1];
            if (morphTarget) {
                const prevFrags = LAYER_MAP[AppState.layer.previous];
                const newFrags = LAYER_MAP[newLayer];
                const sourceId = prevFrags[Math.floor(Math.random() * prevFrags.length)];
                const targetId = newFrags[Math.floor(Math.random() * newFrags.length)];
                const sourceUrl = `${FRAGMENT_BASE}/${AppState.layer.previous}/fragment-${sourceId}.png`;
                const targetUrl = `${FRAGMENT_BASE}/${newLayer}/fragment-${targetId}.png`;

                window.localizedMorph.morphElement(morphTarget, sourceUrl, targetUrl);
                console.log(`[v18] Localized morph on fragment`);
            }
        }
    }

    const fragment = document.createElement('div');
    fragment.className = `fragment layer-${AppState.layer.current}`;

    // Random drift
    const angle = Math.random() * Math.PI * 2;
    const distance = 200 + Math.random() * 400;
    fragment.style.setProperty('--drift-x', Math.cos(angle) * distance + 'px');
    fragment.style.setProperty('--drift-y', Math.sin(angle) * distance + 'px');

    // Position
    const offsetX = (Math.random() - 0.5) * window.innerWidth * 0.75;
    const offsetY = (Math.random() - 0.5) * window.innerHeight * 0.75;
    fragment.style.left = `calc(50% + ${offsetX}px)`;
    fragment.style.top = `calc(50% + ${offsetY}px)`;
    fragment.style.rotate = (Math.random() * 40 - 20) + 'deg';
    fragment.style.zIndex = Math.floor(Math.random() * 50);

    // Animation duration
    const { min, max } = CONFIG.fragmentLifetime;
    const animDuration = min + Math.random() * (max - min);
    fragment.style.setProperty('--anim-duration', animDuration + 's');

    // Pick image with repetition limit
    const layerFragments = LAYER_MAP[AppState.layer.current];
    const availableFragments = layerFragments.filter(id => {
        const key = `${AppState.layer.current}/${id}`;
        return (AppState.fragment.usage[key] || 0) < MAX_FRAGMENT_REPETITIONS;
    });

    if (availableFragments.length === 0) return;

    const fragmentId = availableFragments[Math.floor(Math.random() * availableFragments.length)];
    const usageKey = `${AppState.layer.current}/${fragmentId}`;
    AppState.fragment.usage[usageKey] = (AppState.fragment.usage[usageKey] || 0) + 1;

    const img = document.createElement('img');
    img.src = `${FRAGMENT_BASE}/${AppState.layer.current}/fragment-${fragmentId}.png`;
    img.alt = '';
    const scale = 0.6 + Math.random() * 0.6;
    img.style.transform = `scale(${scale})`;

    fragment.appendChild(img);
    stream.appendChild(fragment);

    AppState.fragment.active++;
    AppState.fragment.spawned++;
    updateDepth();

    // Remove after animation
    setTimeout(() => {
        decomposeFragment(fragment);
        fragment.remove();
        AppState.fragment.active--;
    }, animDuration * 1000);

    // Particle assembly effect (30% chance)
    if (Math.random() < 0.3) {
        setTimeout(() => assembleFragment(fragment), 300);
    }
}

/**
 * Spawn initial state for Temporal Displacement (v18.1)
 */
export function spawnInitialState() {
    if (!TEMPORAL_DISPLACEMENT.enabled) {
        // Fallback to minimal spawn
        spawnFragment();
        spawnFragment();
        return;
    }

    const { initialFragmentCount, initialLayer, initialMorphCount } = TEMPORAL_DISPLACEMENT;

    // Force initial layer for hook effect
    setLayer(initialLayer);

    // Spawn fragments
    for (let i = 0; i < initialFragmentCount; i++) {
        spawnFragment();
    }

    // One fragment already mid-animation (fading)
    const fragments = stream.querySelectorAll('.fragment');
    if (fragments.length > 0) {
        fragments[0].style.animationDelay = `-${CONFIG.fragmentLifetime.min * 0.7}s`;
    }

    // Initial morph burst for disorientation
    if (window.localizedMorph?.enabled && fragments.length >= 2) {
        triggerInitialMorphs(fragments, initialMorphCount);
    }

    console.log(`[v18.1] Temporal Displacement: ${initialFragmentCount} frags, ${initialMorphCount} morphs`);
}

/**
 * Trigger initial morphs for disorientation effect
 */
function triggerInitialMorphs(fragments, count) {
    const morphTargets = Array.from(fragments).slice(0, count);
    const layers = Object.keys(LAYER_MAP);

    morphTargets.forEach((frag, i) => {
        setTimeout(() => {
            const fromLayer = layers[Math.floor(Math.random() * layers.length)];
            const toLayer = layers[Math.floor(Math.random() * layers.length)];

            const fromId = LAYER_MAP[fromLayer][Math.floor(Math.random() * LAYER_MAP[fromLayer].length)];
            const toId = LAYER_MAP[toLayer][Math.floor(Math.random() * LAYER_MAP[toLayer].length)];

            const sourceUrl = `${FRAGMENT_BASE}/${fromLayer}/fragment-${fromId}.png`;
            const targetUrl = `${FRAGMENT_BASE}/${toLayer}/fragment-${toId}.png`;

            window.localizedMorph.morphElement(frag, sourceUrl, targetUrl, {
                duration: 800 + i * 200,  // Staggered timing
                intensity: 0.7
            });
        }, 100 + i * 300);  // Staggered start
    });
}

/**
 * Get stream element for external use
 */
export function getStream() {
    return stream;
}

