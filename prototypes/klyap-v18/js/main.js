/**
 * KLYAP v18 — Main Entry Point
 * Orchestrates all modules and initializes the experience
 */

import { CONFIG, TEMPORAL_DISPLACEMENT } from './config.js';
import { AppState, updateMousePosition, recordScroll } from './state.js';
import { initMembrane } from './membrane.js';
import { initParticles } from './particles.js';
import { initFragments, spawnFragment, spawnInitialState, getSpawnInterval } from './fragments.js';
import { initBubbles } from './bubbles.js';
import { initCycle, checkMeta, updateDebug } from './cycle.js';

// DOM elements
let cursor, stream;

/**
 * Main initialization
 */
function init() {
    cursor = document.getElementById('cursor');
    stream = document.getElementById('stream');

    // Initialize all modules
    initFragments();
    initMembrane();
    initParticles();
    initBubbles();
    initCycle();

    // Event listeners
    setupEventListeners();

    // Temporal Displacement: spawn initial state
    spawnInitialState();

    // Start main tick loop with SHOCK PAUSE
    const shockPause = TEMPORAL_DISPLACEMENT.enabled
        ? TEMPORAL_DISPLACEMENT.shockPauseDuration
        : CONFIG.timing.INITIAL_DELAY;
    setTimeout(tick, shockPause);

    console.log('[KLYAP v18.1] Temporal Displacement initialized');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        updateMousePosition(e.clientX, e.clientY);
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Scroll detection
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = Math.abs(e.deltaY);
        recordScroll(delta);

        // Accumulate exhaustion
        if (AppState.physics.scrollDelta > CONFIG.exhaustionThreshold) {
            AppState.physics.exhaustionLevel = Math.min(1, AppState.physics.exhaustionLevel + 0.03);
        }

        cursor.classList.add('active');
        setTimeout(() => cursor.classList.remove('active'), 300);
    }, { passive: false });
}

/**
 * Schedule next spawn
 */
function scheduleNext() {
    // VOID check
    if (!AppState.physics.isVoid && Math.random() < CONFIG.voidChance && AppState.layer.depth > 25) {
        AppState.physics.isVoid = true;
        const voidTime = CONFIG.voidDuration[0] +
            Math.random() * (CONFIG.voidDuration[1] - CONFIG.voidDuration[0]);
        setTimeout(() => {
            AppState.physics.isVoid = false;
            tick();
        }, voidTime);
        return;
    }

    // BURST check
    if (Math.random() < CONFIG.burstChance && AppState.layer.depth > 20) {
        const count = CONFIG.burstCount[0] +
            Math.floor(Math.random() * (CONFIG.burstCount[1] - CONFIG.burstCount[0] + 1));
        for (let i = 0; i < count; i++) {
            setTimeout(() => spawnFragment(), i * 150);
        }
        setTimeout(tick, getSpawnInterval() * 1.8);
        return;
    }

    // Normal spawn
    setTimeout(tick, getSpawnInterval());
}

/**
 * Main tick loop
 */
function tick() {
    if (!AppState.physics.isVoid) {
        spawnFragment();
        checkMeta();
    }
    updateDebug();
    scheduleNext();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
