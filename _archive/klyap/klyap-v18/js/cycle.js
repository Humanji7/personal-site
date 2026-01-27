/**
 * KLYAP v18 — Cycle System
 * 40-second cycle, meta messages, and tear animation
 */

import { CONFIG, CYCLE_DURATION, TEXT_PHRASES } from './config.js';
import { AppState, getCycleTime, resetFragmentUsage } from './state.js';
import { getStream, getPhaseName } from './fragments.js';
import { shouldUseRansom, applyRansomStyle, animateRansomAppear } from './text-effects.js';

// DOM elements
let vignette, metaEl, debugEl, scrollIndicator, textBlock;
let currentPhraseIndex = 0;
let lastCycleNum = 1;

/**
 * Initialize cycle system
 */
export function initCycle() {
    vignette = document.getElementById('vignette');
    metaEl = document.getElementById('meta');
    debugEl = document.getElementById('debug');
    scrollIndicator = document.getElementById('scroll-indicator');
    textBlock = document.getElementById('text-block');

    // Text-block system
    setTimeout(showTextBlock, 3000);
    setInterval(rotateTextBlock, 30000);

    // Tear check interval
    setInterval(checkTearTrigger, 100);
}

/**
 * Check meta messages and cycle state
 */
export function checkMeta() {
    const elapsed = getCycleTime();
    const stream = getStream();

    // Time-based meta messages
    for (let i = CONFIG.metaMessages.length - 1; i >= 0; i--) {
        const msg = CONFIG.metaMessages[i];
        if (elapsed >= msg.time && AppState.cycle.lastMetaIndex < i) {
            AppState.cycle.lastMetaIndex = i;
            showMeta(msg.text);
            break;
        }
    }

    // Show scroll indicator in FADE phase
    if (elapsed >= CONFIG.phases.fade.start) {
        scrollIndicator.classList.add('visible');
    } else {
        scrollIndicator.classList.remove('visible');
    }

    // Cycle reset
    if (elapsed < 1000 && AppState.cycle.lastMetaIndex > 0) {
        AppState.cycle.lastMetaIndex = -1;
        resetFragmentUsage();
        console.log('[v17] Cycle reset');
    }

    // Tremor based on cycle time
    if (elapsed >= 20000) {
        stream.classList.add('tremor');
    } else {
        stream.classList.remove('tremor');
    }
    if (elapsed >= 32000) {
        stream.classList.remove('tremor');
        stream.classList.add('intense-tremor');
    } else if (elapsed < 32000) {
        stream.classList.remove('intense-tremor');
    }

    // Intense vignette
    if (elapsed >= 25000) {
        vignette.classList.add('intense');
    } else {
        vignette.classList.remove('intense');
    }
}

/**
 * Show meta message
 */
function showMeta(text) {
    metaEl.textContent = text;
    metaEl.classList.add('visible');
    setTimeout(() => {
        metaEl.classList.remove('visible');
    }, 4000);
}

/**
 * Update debug display
 */
export function updateDebug() {
    const elapsed = getCycleTime();
    const elapsedSec = (elapsed / 1000).toFixed(1);
    const cycleNum = Math.floor((Date.now() - AppState.cycle.startTime) / CYCLE_DURATION) + 1;
    const phaseName = getPhaseName();

    debugEl.innerHTML = `
        v18 MODULAR | cycle: ${cycleNum} | time: ${elapsedSec}s<br>
        phase: ${phaseName} | layer: ${AppState.layer.current.toUpperCase()}<br>
        frags: ${AppState.fragment.spawned} | active: ${AppState.fragment.active}${AppState.physics.isVoid ? ' | VOID' : ''}
    `;
}

/**
 * Show text block
 */
function showTextBlock() {
    textBlock.classList.add('visible');
    setTimeout(() => textBlock.classList.add('pulse'), 2000);
}

/**
 * Rotate text block phrase
 */
function rotateTextBlock() {
    textBlock.classList.remove('visible', 'pulse', 'ransom-mode');
    setTimeout(() => {
        currentPhraseIndex = (currentPhraseIndex + 1) % TEXT_PHRASES.length;
        const phrase = TEXT_PHRASES[currentPhraseIndex];

        if (shouldUseRansom()) {
            console.log('[v18.7] Ransom style for:', phrase);
            applyRansomStyle(textBlock, phrase);
            textBlock.classList.add('visible');
            animateRansomAppear(textBlock);
        } else {
            textBlock.textContent = phrase;
            textBlock.classList.add('visible');
        }

        setTimeout(() => textBlock.classList.add('pulse'), 1500);
    }, 1000);
}

/**
 * Check for tear trigger
 */
function checkTearTrigger() {
    const currentCycle = Math.floor((Date.now() - AppState.cycle.startTime) / CYCLE_DURATION) + 1;

    // Detect cycle transition
    if (currentCycle > lastCycleNum && !AppState.cycle.tearTriggered && AppState.fragment.spawned > 5) {
        console.log('[v17] Cycle ' + lastCycleNum + ' complete, triggering tear!');
        triggerTear();
    }
    lastCycleNum = currentCycle;
}

/**
 * Trigger tear animation
 */
function triggerTear() {
    if (AppState.cycle.tearTriggered) return;
    AppState.cycle.tearTriggered = true;
    console.log('[v17] Tear triggered!');

    // Freeze KLYAP animations
    document.body.classList.add('klyap-frozen');

    // GSAP Timeline for tear effect
    const tl = gsap.timeline({
        onComplete: () => {
            AppState.cycle.tearComplete = true;
            console.log('[v17] Tear complete — Portfolio revealed');
        }
    });

    // Phase 1: Tear crack appears and grows vertically
    tl.to('#tear-crack', {
        scaleY: 1,
        duration: 0.6,
        ease: 'power2.out'
    });

    // Phase 2: Crack widens
    tl.to('#tear-crack', {
        width: '60vw',
        boxShadow: '0 0 80px 40px hsla(290, 70%, 50%, 0.8)',
        duration: 0.8,
        ease: 'power3.inOut'
    }, 0.4);

    // Phase 3: KLYAP container clips away
    tl.to('#klyap-container', {
        clipPath: 'inset(0 50% 0 50%)',
        opacity: 0.3,
        filter: 'blur(8px)',
        duration: 1.2,
        ease: 'power3.inOut'
    }, 0.5);

    // Phase 4: Fade in portfolio
    tl.to('#portfolio-section', {
        opacity: 1,
        scale: 1,
        duration: 1,
        ease: 'power2.out'
    }, 0.8);

    // Phase 5: Hide tear crack and KLYAP
    tl.to('#tear-crack', {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in'
    }, 1.8);

    tl.to('#klyap-container', {
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in'
    }, 2);
}
