/**
 * KLYAP v18 — Particle System
 * Viscous particles with decomposition and assembly effects
 */

import { PARTICLE_CONFIG, LAYER_PARTICLE_COLORS, CONFIG } from './config.js';
import { AppState, getCycleTime } from './state.js';

// Canvas and context
let canvas, ctx;
let width, height;
const particles = [];

// Wind state
const wind = { x: 0, y: 0, decay: 0.95 };
let lastWindCheck = 0;

/**
 * Initialize particle system
 */
export function initParticles() {
    canvas = document.getElementById('particle-canvas');
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', resize);

    requestAnimationFrame(draw);
}

/**
 * Resize canvas
 */
function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

/**
 * Particle class with viscosity physics
 */
class Particle {
    constructor(x, y, layer, isAssembly = false, targetX = 0, targetY = 0) {
        this.x = x;
        this.y = y;
        this.isAssembly = isAssembly;
        this.targetX = targetX;
        this.targetY = targetY;

        if (isAssembly) {
            this.vx = 0;
            this.vy = 0;
            this.easing = 0.02 + Math.random() * 0.03;
            this.delay = Math.floor(Math.random() * 20);
        } else {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 2;
            this.vy = Math.sin(angle) * speed * 0.5 - Math.random() * 1.5;
        }

        const colors = LAYER_PARTICLE_COLORS[layer] || LAYER_PARTICLE_COLORS.noise;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        this.alpha = isAssembly ? 0.3 : (0.7 + Math.random() * 0.3);
        this.targetAlpha = isAssembly ? 0.9 : 0;
        this.size = 2 + Math.random() * 6;
        this.decay = isAssembly ? -0.008 : (0.005 + Math.random() * 0.01);
        this.gravity = 0.06 + Math.random() * 0.1;
        this.viscosity = 0.90 + Math.random() * 0.07;
        this.stickChance = !isAssembly && Math.random() < 0.12;
        this.stickTime = this.stickChance ? 20 + Math.random() * 40 : 0;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.1 + Math.random() * 0.15;
        this.alive = true;
    }

    update() {
        if (this.isAssembly) {
            if (this.delay > 0) {
                this.delay--;
                return true;
            }
            const dx = this.targetX - this.x;
            const dy = this.targetY - this.y;
            this.x += dx * this.easing;
            this.y += dy * this.easing;
            this.alpha += 0.015;
            if (this.alpha > this.targetAlpha) this.alpha = this.targetAlpha;

            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 5) {
                this.alpha -= 0.05;
                if (this.alpha <= 0) this.alive = false;
            }
            return this.alive;
        }

        if (this.stickTime > 0) {
            this.stickTime--;
            this.alpha -= this.decay * 0.3;
            return this.alpha > 0;
        }

        // Apply wind
        this.vx += wind.x * 0.1;
        this.vy += wind.y * 0.05;

        // Organic wobble
        this.wobble += this.wobbleSpeed;
        this.vx += Math.sin(this.wobble) * 0.04;

        // Viscous physics
        this.vy += this.gravity;
        this.vx *= this.viscosity;
        this.vy *= this.viscosity;
        this.x += this.vx;
        this.y += this.vy;

        // Decay
        this.alpha -= this.decay;
        this.size *= 0.998;

        this.alive = this.alpha > 0.01 && this.y < height + 50;
        return this.alive;
    }
}

/**
 * Decompose fragment into particles
 */
export function decomposeFragment(fragment) {
    if (particles.length >= PARTICLE_CONFIG.MAX_PARTICLES) return;

    const rect = fragment.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const layerMatch = fragment.className.match(/layer-(\w+)/);
    const layer = layerMatch ? layerMatch[1] : 'noise';

    const count = PARTICLE_CONFIG.PER_FRAGMENT.min +
        Math.floor(Math.random() * (PARTICLE_CONFIG.PER_FRAGMENT.max - PARTICLE_CONFIG.PER_FRAGMENT.min));

    for (let i = 0; i < count; i++) {
        const x = centerX + (Math.random() - 0.5) * rect.width * 0.8;
        const y = centerY + (Math.random() - 0.5) * rect.height * 0.8;
        particles.push(new Particle(x, y, layer, false));
    }
}

/**
 * Assemble particles INTO a fragment
 */
export function assembleFragment(fragment) {
    if (particles.length >= PARTICLE_CONFIG.MAX_PARTICLES) return;

    const rect = fragment.getBoundingClientRect();
    const targetX = rect.left + rect.width / 2;
    const targetY = rect.top + rect.height / 2;

    const layerMatch = fragment.className.match(/layer-(\w+)/);
    const layer = layerMatch ? layerMatch[1] : 'noise';

    const count = PARTICLE_CONFIG.ASSEMBLY.min +
        Math.floor(Math.random() * (PARTICLE_CONFIG.ASSEMBLY.max - PARTICLE_CONFIG.ASSEMBLY.min));

    for (let i = 0; i < count; i++) {
        let x, y;
        const edge = Math.floor(Math.random() * 4);
        switch (edge) {
            case 0: x = Math.random() * width; y = -50; break;
            case 1: x = Math.random() * width; y = height + 50; break;
            case 2: x = -50; y = Math.random() * height; break;
            case 3: x = width + 50; y = Math.random() * height; break;
        }
        particles.push(new Particle(x, y, layer, true, targetX, targetY));
    }
}

/**
 * Trigger wind sweep effect
 */
export function triggerWindSweep() {
    const angle = Math.random() * Math.PI * 2;
    const strength = 4 + Math.random() * 6;
    wind.x = Math.cos(angle) * strength;
    wind.y = Math.sin(angle) * strength * 0.4;
}

/**
 * Get current phase from config
 */
function getCurrentPhase() {
    const elapsed = getCycleTime();
    if (elapsed < CONFIG.phases.sparse.end) return CONFIG.phases.sparse;
    if (elapsed < CONFIG.phases.hook.end) return CONFIG.phases.hook;
    if (elapsed < CONFIG.phases.overwhelm.end) return CONFIG.phases.overwhelm;
    return CONFIG.phases.fade;
}

/**
 * Main draw loop
 */
function draw() {
    ctx.clearRect(0, 0, width, height);

    // Update wind
    wind.x *= wind.decay;
    wind.y *= wind.decay;

    // Check for wind sweep trigger
    const now = Date.now();
    if (now - lastWindCheck > 1000) {
        lastWindCheck = now;
        const phase = getCurrentPhase();
        if (phase !== CONFIG.phases.sparse && Math.random() < PARTICLE_CONFIG.WIND_SWEEP_CHANCE) {
            triggerWindSweep();
        }
    }

    // Update and draw particles (swap-and-pop removal)
    let i = particles.length;
    while (i--) {
        const p = particles[i];
        if (!p.update()) {
            particles[i] = particles[particles.length - 1];
            particles.pop();
        } else {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    requestAnimationFrame(draw);
}
