/**
 * KLYAP v18 — LocalizedMorphRenderer
 * WebGL-based displacement morphing attached to DOM elements
 */

class LocalizedMorphRenderer {
    constructor() {
        this.enabled = this._canUseWebGL() && !('ontouchstart' in window);

        if (!this.enabled) {
            console.log('[LocalizedMorph] Disabled, using CSS fallback');
            return;
        }

        this.config = {
            duration: 1500,
            intensity: 0.5,
            maxConcurrent: 5
        };

        // Map: element → { tex1, tex2, progress, gsapTween, startTime }
        this.activeMorphs = new Map();
        this.textureCache = new Map();
        this.rafId = null;

        this._initThree();
        this._startRenderLoop();

        // Debug hotkey (Shift+M) - only in debug mode
        if (location.search.includes('debug=true')) {
            document.addEventListener('keydown', (e) => {
                if (e.shiftKey && e.key === 'M') {
                    this.toggle();
                }
            });
        }

        console.log('[LocalizedMorph] Initialized');
    }

    _canUseWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) { return false; }
    }

    _initThree() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;

        this.renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: false,
            powerPreference: 'high-performance'
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.domElement.id = 'morph-canvas';
        this.renderer.domElement.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 20;
            pointer-events: none;
        `;
        this.renderer.autoClear = false;
        document.getElementById('klyap-container').appendChild(this.renderer.domElement);

        // Shader (same as before)
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture1: { value: null },
                uTexture2: { value: null },
                uProgress: { value: 0 },
                uIntensity: { value: this.config.intensity },
                uTime: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform sampler2D uTexture1;
                uniform sampler2D uTexture2;
                uniform float uProgress;
                uniform float uIntensity;
                uniform float uTime;
                varying vec2 vUv;

                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }

                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f);
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }

                float fbm(vec2 p) {
                    float v = 0.0, a = 0.5;
                    for (int i = 0; i < 4; i++) {
                        v += a * noise(p);
                        p *= 2.0;
                        a *= 0.5;
                    }
                    return v;
                }

                void main() {
                    vec2 uv = vUv;
                    float n = fbm(uv * 6.0 + uTime * 0.2) * 2.0 - 1.0;
                    float dispStrength = sin(uProgress * 3.14159) * uIntensity;
                    float disp = n * dispStrength;

                    vec2 uv1 = clamp(uv + disp * (1.0 - uProgress), 0.0, 1.0);
                    vec2 uv2 = clamp(uv - disp * uProgress, 0.0, 1.0);

                    vec4 c1 = texture2D(uTexture1, uv1);
                    vec4 c2 = texture2D(uTexture2, uv2);

                    gl_FragColor = mix(c1, c2, smoothstep(0.0, 1.0, uProgress));
                }
            `,
            transparent: true
        });

        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.clock = new THREE.Clock();
        window.addEventListener('resize', () => this._onResize());
    }

    _onResize() {
        if (!this.enabled) return;
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    _startRenderLoop() {
        const render = () => {
            this.rafId = requestAnimationFrame(render);
            if (this.activeMorphs.size === 0) return;

            this.renderer.clear();
            const time = this.clock.getElapsedTime();

            for (const [element, morph] of this.activeMorphs) {
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;

                // WebGL Y is flipped
                const y = window.innerHeight - rect.bottom;

                this.renderer.setScissor(rect.x, y, rect.width, rect.height);
                this.renderer.setViewport(rect.x, y, rect.width, rect.height);
                this.renderer.setScissorTest(true);

                this.material.uniforms.uTexture1.value = morph.tex1;
                this.material.uniforms.uTexture2.value = morph.tex2;
                this.material.uniforms.uProgress.value = morph.progress;
                this.material.uniforms.uTime.value = time;

                this.renderer.render(this.scene, this.camera);
            }

            this.renderer.setScissorTest(false);
        };
        render();
    }

    async _loadTexture(url) {
        if (this.textureCache.has(url)) return this.textureCache.get(url);

        return new Promise((resolve, reject) => {
            new THREE.TextureLoader().load(url, (tex) => {
                tex.minFilter = THREE.LinearFilter;
                tex.magFilter = THREE.LinearFilter;
                this.textureCache.set(url, tex);
                resolve(tex);
            }, undefined, reject);
        });
    }

    /**
     * Morph a specific DOM element
     * @param {HTMLElement} element - .fragment div
     * @param {string} sourceUrl - current image URL
     * @param {string} targetUrl - new image URL
     * @param {object} options - { duration, intensity, onComplete }
     */
    async morphElement(element, sourceUrl, targetUrl, options = {}) {
        if (!this.enabled) return false;
        if (this.activeMorphs.size >= this.config.maxConcurrent) return false;
        if (this.activeMorphs.has(element)) return false;

        const duration = options.duration || this.config.duration;
        const intensity = options.intensity || this.config.intensity;
        const img = element.querySelector('img');

        try {
            const [tex1, tex2] = await Promise.all([
                this._loadTexture(sourceUrl),
                this._loadTexture(targetUrl)
            ]);

            // Hide DOM image
            if (img) img.style.opacity = '0';

            const morph = { tex1, tex2, progress: 0, sourceUrl, targetUrl };
            this.activeMorphs.set(element, morph);

            console.log(`[LocalizedMorph] Started: ${element.className}`);

            // GSAP animation
            await new Promise((resolve) => {
                gsap.to(morph, {
                    progress: 1,
                    duration: duration / 1000,
                    ease: 'power2.inOut',
                    onComplete: resolve
                });
            });

            // Cleanup
            this.activeMorphs.delete(element);

            // Show new image
            if (img) {
                img.src = targetUrl;
                img.style.opacity = '1';
            }

            // Dispose source texture (keep target for reuse)
            if (this.textureCache.has(sourceUrl)) {
                this.textureCache.get(sourceUrl).dispose();
                this.textureCache.delete(sourceUrl);
            }

            if (options.onComplete) options.onComplete();
            console.log(`[LocalizedMorph] Completed`);
            return true;

        } catch (err) {
            console.error('[LocalizedMorph] Failed:', err);
            this.activeMorphs.delete(element);
            if (img) img.style.opacity = '1';
            return false;
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        this.renderer.domElement.style.display = this.enabled ? 'block' : 'none';
        console.log(`[LocalizedMorph] ${this.enabled ? 'ENABLED' : 'DISABLED'}`);
    }

    canMorph() {
        return this.enabled && this.activeMorphs.size < this.config.maxConcurrent;
    }

    dispose() {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.textureCache.forEach(t => t.dispose());
        this.textureCache.clear();
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();
    }
}

// Global instance
window.localizedMorph = new LocalizedMorphRenderer();
// Backward compat alias
window.morphCanvas = window.localizedMorph;
