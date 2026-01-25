/**
 * KLYAP v18.6 — Autistic Data Overlays
 * Fragment counter, timestamp, mouse coordinates
 */

import { AUTISTIC_DATA_CONFIG } from './config.js';
import { AppState } from './state.js';

let fragmentCounter, timestamp, mouseCoords;
let animationFrame = null;
let startTime = Date.now();

/**
 * Initialize data overlay
 */
export function initDataOverlay() {
    if (!AUTISTIC_DATA_CONFIG.enabled) return;

    fragmentCounter = document.getElementById('data-fragment-counter');
    timestamp = document.getElementById('data-timestamp');
    mouseCoords = document.getElementById('data-mouse-coords');

    if (!fragmentCounter || !timestamp || !mouseCoords) {
        console.warn('[v18.6] Data overlay elements not found');
        return;
    }

    startTime = Date.now();
    tick();

    console.log('[v18.6] Data overlay initialized');
}

/**
 * Animation frame tick
 */
function tick() {
    updateFragmentCounter();
    updateTimestamp();

    animationFrame = requestAnimationFrame(tick);
}

/**
 * Update fragment counter display
 */
function updateFragmentCounter() {
    if (!fragmentCounter) return;
    fragmentCounter.textContent = `frags: ${AppState.fragment.spawned}`;
}

/**
 * Update timestamp display (hh:mm:ss.ms)
 */
function updateTimestamp() {
    if (!timestamp) return;

    const elapsed = Date.now() - startTime;
    const hours = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    const ms = (elapsed % 1000).toString().padStart(3, '0');

    timestamp.textContent = `${hours}:${minutes}:${seconds}.${ms}`;
}

/**
 * Update mouse coordinates display
 */
export function updateMouseCoordsDisplay(x, y) {
    if (!mouseCoords) return;

    mouseCoords.textContent = `x:${x} y:${y}`;
    mouseCoords.style.left = `${x + 20}px`;
    mouseCoords.style.top = `${y + 20}px`;
}
