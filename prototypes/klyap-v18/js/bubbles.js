/**
 * KLYAP v18 — Bubble System
 * Provocation bubbles with proximity reactions
 */

import { BUBBLE_CONFIG } from './config.js';
import { AppState } from './state.js';

// DOM elements
let bubbles;

/**
 * Initialize bubble system
 */
export function initBubbles() {
    bubbles = document.querySelectorAll('.provocation-bubble');

    // Track mouse movement
    document.addEventListener('mousemove', () => {
        AppState.bubble.mouseMoveCount++;
        AppState.bubble.lastMouseMove = Date.now();
    });

    // Setup hover listeners
    bubbles.forEach(bubble => {
        const whisperEl = bubble.querySelector('.whisper');
        const whisperText = bubble.dataset.whisper;
        if (!whisperEl || !whisperText) return;

        bubble.addEventListener('mouseenter', () => {
            const timer = setTimeout(() => {
                whisperEl.textContent = whisperText;
                bubble.classList.add('whisper-visible');
            }, BUBBLE_CONFIG.WHISPER_DELAY);
            AppState.bubble.hoverTimers.set(bubble, timer);
        });

        bubble.addEventListener('mouseleave', () => {
            const timer = AppState.bubble.hoverTimers.get(bubble);
            if (timer) clearTimeout(timer);
            bubble.classList.remove('whisper-visible');
            whisperEl.textContent = '';
        });
    });

    // Auto-show first bubble after 5s
    setTimeout(showNextBubble, 5000);

    // Show bubble every 10s
    setInterval(() => {
        if (AppState.bubble.shown < BUBBLE_CONFIG.MAX_BUBBLES) {
            showNextBubble();
        }
    }, 10000);

    // Bubble update loop
    setInterval(updateBubbles, 500);

    // Temporal Displacement: show first bubble immediately (fading)
    setTimeout(() => {
        const firstBubble = bubbles[0];
        if (firstBubble) {
            firstBubble.classList.add('visible');
            AppState.bubble.shown = 1;

            // Start fade out early (already leaving)
            setTimeout(() => {
                firstBubble.style.opacity = '0.4';
                firstBubble.style.transition = 'opacity 3s ease-out';
            }, 800);
        }
    }, 100);
}

/**
 * Show next bubble in sequence
 */
function showNextBubble() {
    if (AppState.bubble.shown >= BUBBLE_CONFIG.MAX_BUBBLES) return;
    const bubble = bubbles[AppState.bubble.shown];
    if (bubble) {
        bubble.classList.add('visible');
        AppState.bubble.shown++;
        console.log(`[KLYAP] Bubble ${AppState.bubble.shown} awakened`);
    }
}

/**
 * Update bubbles based on idle state
 */
function updateBubbles() {
    const idleDuration = (Date.now() - AppState.bubble.lastMouseMove) / 1000;
    const isIdle = idleDuration >= BUBBLE_CONFIG.IDLE_THRESHOLD_FOR_TRIGGER;

    if (isIdle) {
        AppState.bubble.wasIdle = true;
    }

    // First movement after idle → show bubble
    if (AppState.bubble.wasIdle && AppState.bubble.mouseMoveCount > AppState.bubble.prevMoveCount) {
        showNextBubble();
        AppState.bubble.wasIdle = false;
    }

    AppState.bubble.prevMoveCount = AppState.bubble.mouseMoveCount;

    // Also show on deep idle (every 8s)
    const idleBasedCount = Math.floor(idleDuration / 8);
    while (AppState.bubble.shown < idleBasedCount && AppState.bubble.shown < BUBBLE_CONFIG.MAX_BUBBLES) {
        showNextBubble();
    }

    // Proximity check
    updateBubbleProximity(AppState.mouse.x, AppState.mouse.y);
}

/**
 * Update bubble positions based on cursor proximity
 */
function updateBubbleProximity(mx, my) {
    bubbles.forEach(bubble => {
        if (!bubble.classList.contains('visible')) return;
        const rect = bubble.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = mx - cx;
        const dy = my - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < BUBBLE_CONFIG.PROXIMITY_RADIUS) {
            const pull = (1 - dist / BUBBLE_CONFIG.PROXIMITY_RADIUS) * BUBBLE_CONFIG.PROXIMITY_PULL;
            bubble.style.transform = `translateX(${dx * pull}px) translateY(${dy * pull}px) scale(1.02)`;
        } else {
            bubble.style.transform = '';
        }
    });
}
