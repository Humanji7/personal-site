/**
 * KLYAP v18.7 — Text Effects
 * Ransom Note Typography for central text
 * 
 * Best practices applied:
 * - Using gsap.from() for efficiency
 * - Animating only transform properties (x, y, rotation, scale)
 * - Single stagger animation instead of per-letter tweens
 * - will-change: transform on letters
 */

import { RANSOM_CONFIG } from './config.js';

/**
 * Check if ransom style should be used (30% chance)
 */
export function shouldUseRansom() {
    return RANSOM_CONFIG.enabled && Math.random() < RANSOM_CONFIG.chance;
}

/**
 * Get random value in range
 */
function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Pick random item from array
 */
function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Apply ransom note style to text element
 * Creates letter spans with randomized styling
 */
export function applyRansomStyle(element, text) {
    // Clear previous content
    element.innerHTML = '';
    element.classList.add('ransom-mode');

    const fragment = document.createDocumentFragment();
    const chars = text.split('');

    chars.forEach((char) => {
        if (char === ' ') {
            const space = document.createElement('span');
            space.className = 'ransom-space';
            space.textContent = '\u00A0'; // non-breaking space
            fragment.appendChild(space);
            return;
        }

        const span = document.createElement('span');
        span.className = 'ransom-letter';
        span.textContent = char;

        // Apply randomized styles directly
        const rotation = randomInRange(RANSOM_CONFIG.rotation.min, RANSOM_CONFIG.rotation.max);
        const scale = randomInRange(RANSOM_CONFIG.scale.min, RANSOM_CONFIG.scale.max);
        const bg = randomPick(RANSOM_CONFIG.backgrounds);
        const font = randomPick(RANSOM_CONFIG.fonts);
        const hue = 280 + randomInRange(RANSOM_CONFIG.hueShift.min, RANSOM_CONFIG.hueShift.max);

        // Set final transform state (after animation)
        span.style.cssText = `
            font-family: ${font};
            background: ${bg};
            color: hsl(${hue}, 35%, 18%);
            transform: rotate(${rotation}deg) scale(${scale});
        `;

        // Torn edge variant
        if (Math.random() < RANSOM_CONFIG.tornEdgeChance) {
            span.classList.add('torn-edge');
        }

        fragment.appendChild(span);
    });

    element.appendChild(fragment);
}

/**
 * Animate ransom letters with optimized gsap.from()
 * Uses single stagger call for all letters
 */
export function animateRansomAppear(container) {
    const letters = container.querySelectorAll('.ransom-letter');
    if (!letters.length) return;

    // Use gsap.from() - more efficient for entrance animations
    // Animate FROM offscreen TO current position (set in CSS)
    gsap.from(letters, {
        y: -25,
        opacity: 0,
        scale: 0.3,
        rotation: '+=random(-20, 20)',
        duration: 0.35,
        ease: 'back.out(2)',
        stagger: {
            each: RANSOM_CONFIG.staggerDelay / 1000,
            from: 'start'
        },
        clearProps: 'opacity' // Clean up after animation
    });
}

/**
 * Reset text block to normal mode
 */
export function resetRansomStyle(element) {
    element.classList.remove('ransom-mode');
    element.innerHTML = '';
}
