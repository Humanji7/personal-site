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

        // Warm/cold color split (Phase 2 prep)
        const warmHue = 25 + Math.random() * 20;   // 25-45 (newspaper aged)
        const coldHue = 270 + Math.random() * 30;  // 270-300 (violet ink)
        const hue = Math.random() < 0.6 ? warmHue : coldHue;

        // Typography weight randomization
        const weights = [300, 400, 500, 600, 700, 800, 900];
        const weight = randomPick(weights);

        // Inverted check (black background, white text)
        const isInverted = Math.random() < rc.invertedChance;
        const bg = isInverted ? '#1a1a1a' : randomPick(rc.backgrounds);

        // Shadow variation for depth
        const shadowX = randomInRange(0.5, 2.5);
        const shadowY = randomInRange(1, 4);

        span.style.cssText = `
            font-family: ${font};
            font-weight: ${weight};
            background: ${bg};
            color: ${isInverted ? '#fff' : `hsl(${hue}, 35%, 18%)`};
            transform: rotate(${rotation}deg) scale(${scale});
            --shadow-offset-x: ${shadowX}px;
            --shadow-offset-y: ${shadowY}px;
            --base-rotation: ${rotation}deg;
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

    // Pre-calculate random values for organic variation
    const rotations = Array.from(letters).map(() => randomInRange(-20, 20));

    // Add animating class for will-change optimization
    letters.forEach(l => l.classList.add('animating'));

    gsap.from(letters, {
        y: () => -120 - Math.random() * 80,  // -120 to -200 (varied heights)
        autoAlpha: 0,
        scale: () => 0.1 + Math.random() * 0.2,  // 0.1 to 0.3 (varied scales)
        rotation: (i) => rotations[i],
        duration: 0.55,
        ease: 'power2.out',  // Natural deceleration, not bouncy
        stagger: {
            each: RANSOM_CONFIG.staggerDelay / 1000,  // 50ms = 3 frames @60fps
            from: 'start'
        },
        onComplete: () => {
            // Reset will-change to prevent GPU memory leak
            letters.forEach(l => {
                l.classList.remove('animating');
                l.style.willChange = 'auto';
            });
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
