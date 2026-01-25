/**
 * KLYAP v18.7.1 — Text Effects (UPGRADED)
 * Ransom Note Typography with enhanced visceral details
 * 
 * Additions:
 * - Inverted letters (white on black)
 * - Tape overlay effect
 * - Blood specks
 * - Overlapping letters
 * - Multiple torn edge variants
 * - Variable shadow depths
 */

import { RANSOM_CONFIG } from './config.js';

/**
 * Check if ransom style should be used
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
 * Creates letter spans with randomized styling and visceral effects
 */
export function applyRansomStyle(element, text) {
    element.innerHTML = '';
    element.classList.add('ransom-mode');

    const fragment = document.createDocumentFragment();
    const chars = text.split('');
    const rc = RANSOM_CONFIG;

    chars.forEach((char, i) => {
        if (char === ' ') {
            const space = document.createElement('span');
            space.className = 'ransom-space';
            space.textContent = '\u00A0';
            fragment.appendChild(space);
            return;
        }

        const span = document.createElement('span');
        span.className = 'ransom-letter';
        span.textContent = char;

        // Base random values
        const rotation = randomInRange(rc.rotation.min, rc.rotation.max);
        const scale = randomInRange(rc.scale.min, rc.scale.max);
        const font = randomPick(rc.fonts);
        const hue = 280 + randomInRange(rc.hueShift.min, rc.hueShift.max);

        // Inverted check (black background, white text)
        const isInverted = Math.random() < rc.invertedChance;
        const bg = isInverted ? '#1a1a1a' : randomPick(rc.backgrounds);

        // Shadow variation for depth
        const shadowX = randomInRange(0.5, 2.5);
        const shadowY = randomInRange(1, 4);

        span.style.cssText = `
            font-family: ${font};
            background: ${bg};
            color: ${isInverted ? '#fff' : `hsl(${hue}, 35%, 18%)`};
            transform: rotate(${rotation}deg) scale(${scale});
            --shadow-offset-x: ${shadowX}px;
            --shadow-offset-y: ${shadowY}px;
        `;

        if (isInverted) span.classList.add('inverted');

        // Tape effect (scotch tape overlay)
        if (Math.random() < rc.tapeChance) {
            span.classList.add('taped');
            span.style.setProperty('--tape-angle', `${randomInRange(120, 160)}deg`);
        }

        // Blood speck
        if (Math.random() < rc.bloodSpeckChance) {
            span.classList.add('bloody');
            span.style.setProperty('--blood-x', `${randomInRange(60, 100)}%`);
            span.style.setProperty('--blood-y', `${randomInRange(-3, 3)}px`);
        }

        // Overlapping letter (negative margin)
        if (Math.random() < rc.overlapChance && i > 0) {
            span.classList.add('overlap-right');
        }

        // Torn edges (5 random variants)
        if (Math.random() < rc.tornEdgeChance) {
            const tornVariant = Math.floor(Math.random() * 5) + 1;
            span.classList.add(`torn-${tornVariant}`);
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

    // Pre-calculate random rotations for performance
    const rotations = Array.from(letters).map(() => randomInRange(-20, 20));

    gsap.from(letters, {
        y: -30,
        autoAlpha: 0,  // Better than opacity for GSAP
        scale: 0.3,
        rotation: (i) => rotations[i],  // Pre-calculated
        duration: 0.4,
        ease: 'back.out(2.2)',
        stagger: {
            each: RANSOM_CONFIG.staggerDelay / 1000,
            from: 'start'
        }
    });
}

/**
 * Reset text block to normal mode
 */
export function resetRansomStyle(element) {
    element.classList.remove('ransom-mode');
    element.innerHTML = '';
}
