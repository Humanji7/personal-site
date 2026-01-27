/**
 * KLYAP v18 — Membrane Canvas
 * Bioluminescent blob rendering system
 */

import { MEMBRANE_CONFIG } from './config.js';
import { AppState } from './state.js';

// Canvas and context
let canvas, ctx;
let width, height;
let animTime = 0;
const blobs = [];

/**
 * Initialize membrane canvas
 */
export function initMembrane() {
    canvas = document.getElementById('membrane-canvas');
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    requestAnimationFrame(draw);
}

/**
 * Resize canvas to window
 */
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initBlobs();
}

/**
 * Initialize blob objects
 */
function initBlobs() {
    blobs.length = 0;
    for (let i = 0; i < MEMBRANE_CONFIG.blobCount; i++) {
        blobs.push({
            x: Math.random() * width,
            y: Math.random() * height,
            baseRadius: 150 + Math.random() * 250,
            phase: Math.random() * Math.PI * 2,
            speed: MEMBRANE_CONFIG.breathSpeed + Math.random() * 0.15,
            driftX: (Math.random() - 0.5) * 0.3,
            driftY: (Math.random() - 0.5) * 0.3,
            hue: 280 + (Math.random() - 0.5) * 30,
            saturation: MEMBRANE_CONFIG.saturation + Math.random() * 15,
            lightness: MEMBRANE_CONFIG.lightness + Math.random() * 10
        });
    }
}

/**
 * Main draw loop
 */
function draw() {
    animTime += 0.016;
    ctx.clearRect(0, 0, width, height);

    const { x: mouseX, y: mouseY } = AppState.mouse;

    for (const blob of blobs) {
        // Update position with drift
        blob.x += blob.driftX;
        blob.y += blob.driftY;

        // Bounce at edges
        if (blob.x < -200 || blob.x > width + 200) blob.driftX *= -1;
        if (blob.y < -200 || blob.y > height + 200) blob.driftY *= -1;

        // Calculate breathing radius
        const breathFactor = 1 + Math.sin(animTime * blob.speed + blob.phase) * 0.35;
        const radius = blob.baseRadius * breathFactor;

        // Cursor influence
        const dx = mouseX - blob.x;
        const dy = mouseY - blob.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 400) * MEMBRANE_CONFIG.cursorInfluence;
        blob.x += dx * influence;
        blob.y += dy * influence;

        // Create gradient
        const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, radius
        );
        gradient.addColorStop(0, `hsla(${blob.hue}, ${blob.saturation}%, ${blob.lightness}%, ${MEMBRANE_CONFIG.baseOpacity})`);
        gradient.addColorStop(0.4, `hsla(${blob.hue}, ${blob.saturation - 10}%, ${blob.lightness - 5}%, ${MEMBRANE_CONFIG.baseOpacity * 0.6})`);
        gradient.addColorStop(0.7, `hsla(${blob.hue}, ${blob.saturation - 15}%, ${blob.lightness - 8}%, ${MEMBRANE_CONFIG.baseOpacity * 0.25})`);
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.beginPath();

        // Draw noisy polygon
        const segments = 60;
        for (let i = 0; i <= segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const noiseVal = Math.sin(angle * 3 + animTime + blob.phase) * 0.15 +
                Math.sin(angle * 5 + animTime * 0.7) * 0.1;
            const r = radius * (1 + noiseVal);
            const x = blob.x + Math.cos(angle) * r;
            const y = blob.y + Math.sin(angle) * r;

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }

    requestAnimationFrame(draw);
}
