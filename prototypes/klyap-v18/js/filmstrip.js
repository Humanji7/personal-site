/**
 * KLYAP v18.6 — Filmstrip Effect
 * Vertical film strip with accelerating scroll (8-13s window)
 */

import { FILMSTRIP_CONFIG } from './config.js';
import { getCycleTime } from './state.js';

let filmstrip, content;
let isActive = false;
let animationFrame = null;
let startY = 0;

/**
 * Initialize filmstrip
 */
export function initFilmstrip() {
    filmstrip = document.getElementById('filmstrip');
    if (!filmstrip) return;

    content = filmstrip.querySelector('.filmstrip-content');
    generateFilmContent();
}

/**
 * Generate film content — mini frames and noise
 */
function generateFilmContent() {
    if (!content) return;

    // Clear existing
    content.innerHTML = '';

    // Generate 20 frames
    for (let i = 0; i < 20; i++) {
        const frame = document.createElement('div');
        frame.className = 'film-frame';

        // Random content type
        const type = Math.random();
        if (type < 0.3) {
            // Noise
            frame.classList.add('frame-noise');
        } else if (type < 0.6) {
            // Glitch
            frame.classList.add('frame-glitch');
            frame.style.backgroundColor = `hsla(${Math.random() * 360}, 60%, 20%, 0.8)`;
        } else {
            // Dark
            frame.classList.add('frame-dark');
        }

        content.appendChild(frame);
    }
}

/**
 * Update filmstrip visibility and animation
 */
export function updateFilmstrip() {
    if (!filmstrip) return;

    const elapsed = getCycleTime();
    const shouldBeActive = elapsed >= FILMSTRIP_CONFIG.startTime && elapsed <= FILMSTRIP_CONFIG.endTime;

    if (shouldBeActive && !isActive) {
        // Start filmstrip
        isActive = true;
        filmstrip.classList.add('active');
        startY = 0;
        generateFilmContent();
        animate();
        console.log('[v18.6] Filmstrip started');
    } else if (!shouldBeActive && isActive) {
        // Stop filmstrip
        isActive = false;
        filmstrip.classList.remove('active');
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        console.log('[v18.6] Filmstrip ended');
    }
}

/**
 * Animate filmstrip scroll with acceleration
 */
function animate() {
    if (!isActive || !content) return;

    const elapsed = getCycleTime();
    const progress = (elapsed - FILMSTRIP_CONFIG.startTime) / (FILMSTRIP_CONFIG.endTime - FILMSTRIP_CONFIG.startTime);

    // Exponential acceleration
    const speed = FILMSTRIP_CONFIG.initialSpeed * Math.pow(FILMSTRIP_CONFIG.acceleration, progress * 3);

    startY += speed * 0.016; // ~60fps

    // Loop content
    const contentHeight = content.scrollHeight / 2;
    if (startY >= contentHeight) {
        startY = 0;
        generateFilmContent(); // Regenerate for variety
    }

    content.style.transform = `translateY(-${startY}px)`;

    animationFrame = requestAnimationFrame(animate);
}
