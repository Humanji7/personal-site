/**
 * KLYAP v18 — Unified State Management
 * Single source of truth for all application state
 */

import { CYCLE_DURATION } from './config.js';

// ====== UNIFIED APP STATE ======
export const AppState = {
    // Fragment state
    fragment: {
        spawned: 0,
        active: 0,
        usage: {} // Track usage per fragment for repetition limit
    },

    // Bubble/provocation state
    bubble: {
        shown: 0,
        wasIdle: false,
        prevMoveCount: 0,
        mouseMoveCount: 0,
        lastMouseMove: Date.now(),
        hoverTimers: new Map()
    },

    // 40s cycle state
    cycle: {
        startTime: Date.now(),
        tearTriggered: false,
        tearComplete: false,
        lastMetaIndex: -1
    },

    // Physics/scroll state
    physics: {
        scrollDelta: 0,
        exhaustionLevel: 0,
        lastScrollTime: 0,
        isVoid: false,
        wind: { x: 0, y: 0, decay: 0.95 }
    },

    // Layer state
    layer: {
        current: 'noise',
        previous: null,
        depth: 0
    },

    // Mouse position
    mouse: {
        x: 0,
        y: 0
    }
};

// ====== STATE UTILITIES ======

/**
 * Reset fragment usage tracking (on cycle reset)
 */
export function resetFragmentUsage() {
    Object.keys(AppState.fragment.usage).forEach(k => {
        delete AppState.fragment.usage[k];
    });
}

/**
 * Get elapsed time in current 40s cycle
 */
export function getCycleTime() {
    return (Date.now() - AppState.cycle.startTime) % CYCLE_DURATION;
}

/**
 * Get current cycle number
 */
export function getCycleNumber() {
    return Math.floor((Date.now() - AppState.cycle.startTime) / CYCLE_DURATION) + 1;
}

/**
 * Update mouse position
 */
export function updateMousePosition(x, y) {
    AppState.mouse.x = x;
    AppState.mouse.y = y;
}

/**
 * Record scroll event
 */
export function recordScroll(delta) {
    AppState.physics.scrollDelta += delta;
    AppState.physics.lastScrollTime = Date.now();
}

/**
 * Update layer transition
 */
export function setLayer(newLayer) {
    if (newLayer !== AppState.layer.current) {
        AppState.layer.previous = AppState.layer.current;
        AppState.layer.current = newLayer;
        return true; // Layer changed
    }
    return false;
}

/**
 * Update depth based on fragments spawned
 */
export function updateDepth() {
    AppState.layer.depth = Math.min(100, AppState.fragment.spawned * 1.2);
}
