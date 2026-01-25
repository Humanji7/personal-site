/**
 * KLYAP v18.6 — Perceptual Chaos Effects
 * Ghost text, scratches, and other atmosphere effects
 */

import { GHOST_TEXT_CONFIG, TACTILE_CONFIG, IDIOTIC_CONFIG } from './config.js';
import { AppState } from './state.js';

let ghostTextContainer, scratchesOverlay;
let activeGhostTexts = [];
let mouseTimeout = null;
let lastMouseTime = 0;

// ====== GHOST TEXT ======

/**
 * Initialize ghost text system
 */
export function initGhostText() {
    ghostTextContainer = document.getElementById('ghost-text-container');
    if (!ghostTextContainer) return;

    // Spawn initial ghost texts at random positions
    for (let i = 0; i < GHOST_TEXT_CONFIG.maxActive; i++) {
        createGhostText();
    }

    console.log('[v18.6] Ghost text initialized');
}

/**
 * Create a single ghost text element
 */
function createGhostText() {
    const text = document.createElement('div');
    text.className = 'ghost-text';
    text.textContent = GHOST_TEXT_CONFIG.phrases[
        Math.floor(Math.random() * GHOST_TEXT_CONFIG.phrases.length)
    ];

    // Random position (avoid center and edges)
    const x = 10 + Math.random() * 80; // 10-90% width
    const y = 10 + Math.random() * 80; // 10-90% height
    text.style.left = `${x}%`;
    text.style.top = `${y}%`;

    ghostTextContainer.appendChild(text);
    activeGhostTexts.push(text);

    return text;
}

/**
 * Update ghost text visibility based on mouse movement
 */
export function updateGhostTextVisibility() {
    const now = Date.now();
    lastMouseTime = now;

    // Show ghost texts
    activeGhostTexts.forEach(text => {
        text.classList.add('visible');
    });

    // Clear previous timeout
    if (mouseTimeout) clearTimeout(mouseTimeout);

    // Start fade timeout
    mouseTimeout = setTimeout(() => {
        activeGhostTexts.forEach(text => {
            text.classList.remove('visible');
        });

        // Occasionally respawn at new positions
        if (Math.random() < 0.3) {
            respawnGhostTexts();
        }
    }, GHOST_TEXT_CONFIG.fadeTime);
}

/**
 * Respawn ghost texts at new positions
 */
function respawnGhostTexts() {
    activeGhostTexts.forEach(text => text.remove());
    activeGhostTexts = [];

    for (let i = 0; i < GHOST_TEXT_CONFIG.maxActive; i++) {
        createGhostText();
    }
}

// ====== SCRATCHES OVERLAY ======

/**
 * Initialize scratches overlay
 */
export function initScratches() {
    scratchesOverlay = document.getElementById('scratches-overlay');
    if (!scratchesOverlay) return;

    // Generate random scratches
    generateScratches();

    // Periodically regenerate
    setInterval(generateScratches, 5000);

    console.log('[v18.6] Scratches initialized');
}

/**
 * Generate SVG scratches
 */
function generateScratches() {
    if (!scratchesOverlay) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    let svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Generate 5-10 random scratches
    const count = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
        const y = Math.random() * height;
        const x1 = Math.random() * width * 0.3;
        const x2 = x1 + 50 + Math.random() * 200;
        const opacity = 0.1 + Math.random() * 0.1;

        svg += `<line 
            x1="${x1}" y1="${y}" 
            x2="${x2}" y2="${y + (Math.random() - 0.5) * 4}" 
            stroke="rgba(255,255,255,${opacity})" 
            stroke-width="${0.5 + Math.random() * 1}"
        />`;
    }

    svg += '</svg>';
    scratchesOverlay.innerHTML = svg;
}

// ====== TACTILE EFFECTS ======

let stream, ghostCursors = [];
let focusBlurInterval = null;

/**
 * Initialize tactile effects
 */
export function initTactile() {
    stream = document.getElementById('stream');
    initFocusBlur();
    console.log('[v18.6] Tactile effects initialized');
}

/**
 * Trigger vibration on layer change
 */
export function triggerVibration() {
    if (!stream) return;

    stream.classList.add('vibrating');
    setTimeout(() => {
        stream.classList.remove('vibrating');
    }, 200);
}

/**
 * Initialize focus blur cycle
 */
function initFocusBlur() {
    let startTime = Date.now();

    function updateBlur() {
        const elapsed = Date.now() - startTime;
        const progress = (elapsed % TACTILE_CONFIG.focusBlurPeriod) / TACTILE_CONFIG.focusBlurPeriod;

        // Sine wave: 0 → 1 → 0
        const blurAmount = Math.sin(progress * Math.PI) * TACTILE_CONFIG.focusBlurMax;
        document.body.style.filter = blurAmount > 0.1 ? `blur(${blurAmount}px)` : '';

        requestAnimationFrame(updateBlur);
    }

    updateBlur();
}

/**
 * Trigger chromatic aberration on layer change
 */
export function triggerChromaticAberration() {
    if (!stream) return;

    stream.classList.add('chromatic-aberration');
    setTimeout(() => {
        stream.classList.remove('chromatic-aberration');
    }, TACTILE_CONFIG.chromaticDuration);
}

// ====== IDIOTIC ELEMENTS ======

/**
 * Initialize ghost cursors
 */
export function initGhostCursors() {
    ghostCursors = Array.from(document.querySelectorAll('.ghost-cursor'));
    console.log('[v18.6] Ghost cursors initialized:', ghostCursors.length);
}

/**
 * Update ghost cursor positions with delay
 */
export function updateGhostCursors(x, y) {
    ghostCursors.forEach((cursor, i) => {
        setTimeout(() => {
            cursor.style.left = `${x}px`;
            cursor.style.top = `${y}px`;
        }, IDIOTIC_CONFIG.ghostCursorDelays[i] || 50);
    });
}

/**
 * Trigger random cursor wait (call on spawn)
 */
export function triggerRandomCursorWait() {
    if (Math.random() > IDIOTIC_CONFIG.cursorWaitChance) return;

    document.body.classList.add('cursor-wait');

    const duration = IDIOTIC_CONFIG.cursorWaitDuration[0] +
        Math.random() * (IDIOTIC_CONFIG.cursorWaitDuration[1] - IDIOTIC_CONFIG.cursorWaitDuration[0]);

    setTimeout(() => {
        document.body.classList.remove('cursor-wait');
    }, duration);
}
