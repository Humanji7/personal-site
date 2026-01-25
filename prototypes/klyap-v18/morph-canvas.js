/**
 * KLYAP v18 — MorphCanvas
 * WebGL-based displacement morphing between fragment images
 * 
 * Uses Three.js for WebGL rendering with procedural noise displacement
 */

class MorphCanvas {
    constructor() {
        // WebGL support check
        this.enabled = this._canUseWebGL() && !('ontouchstart' in window);

        if (!this.enabled) {
            console.log('[MorphCanvas] WebGL disabled, using CSS fallback');
            return;
        }

        // Configuration
        this.config = {
            duration: 2000,
            intensity: 0.5,
            maxConcurrent: 2,
            cooldown: 3000
        };

        // State
        this.activeMorphs = 0;
        this.lastMorphTime = 0;
        this.textureCache = new Map();

        // Three.js setup
        this._initThree();

        console.log('[MorphCanvas] Initialized');
    }

    _canUseWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
        } catch (e) {
            return false;
        }
    }

    _initThree() {
        // Scene
        this.scene = new THREE.Scene();

        // Camera (orthographic for 2D effect)
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.z = 1;

        // Renderer
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
            opacity: 0;
            transition: opacity 0.3s ease-out;
        `;
        document.getElementById('klyap-container').appendChild(this.renderer.domElement);

        // Shader material
        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uTexture1: { value: null },
                uTexture2: { value: null },
                uProgress: { value: 0 },
                uIntensity: { value: this.config.intensity },
                uTime: { value: 0 },
                uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
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
                uniform vec2 uResolution;
                
                varying vec2 vUv;
                
                // Simplex-like noise (optimized)
                float hash(vec2 p) {
                    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                }
                
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    f = f * f * (3.0 - 2.0 * f); // smoothstep
                    
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    
                    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
                }
                
                float fbm(vec2 p) {
                    float value = 0.0;
                    float amplitude = 0.5;
                    for (int i = 0; i < 4; i++) {
                        value += amplitude * noise(p);
                        p *= 2.0;
                        amplitude *= 0.5;
                    }
                    return value;
                }
                
                void main() {
                    vec2 uv = vUv;
                    
                    // Procedural displacement
                    float n = fbm(uv * 6.0 + uTime * 0.2) * 2.0 - 1.0;
                    
                    // Displacement peaks at 50% progress (sin curve)
                    float dispStrength = sin(uProgress * 3.14159) * uIntensity;
                    float disp = n * dispStrength;
                    
                    // Displaced UVs
                    vec2 uv1 = uv + disp * (1.0 - uProgress);
                    vec2 uv2 = uv - disp * uProgress;
                    
                    // Clamp to prevent edge artifacts
                    uv1 = clamp(uv1, 0.0, 1.0);
                    uv2 = clamp(uv2, 0.0, 1.0);
                    
                    vec4 color1 = texture2D(uTexture1, uv1);
                    vec4 color2 = texture2D(uTexture2, uv2);
                    
                    // Smooth blend
                    float blend = smoothstep(0.0, 1.0, uProgress);
                    gl_FragColor = mix(color1, color2, blend);
                }
            `,
            transparent: true
        });

        // Plane geometry
        this.geometry = new THREE.PlaneGeometry(2, 2);
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        // Resize handler
        window.addEventListener('resize', () => this._onResize());

        // Animation time
        this.clock = new THREE.Clock();
    }

    _onResize() {
        if (!this.enabled) return;

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }

    /**
     * Load texture with caching
     */
    async _loadTexture(url) {
        if (this.textureCache.has(url)) {
            return this.textureCache.get(url);
        }

        return new Promise((resolve, reject) => {
            const loader = new THREE.TextureLoader();
            loader.load(url,
                (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    this.textureCache.set(url, texture);
                    resolve(texture);
                },
                undefined,
                reject
            );
        });
    }

    /**
     * Dispose texture from cache
     */
    _disposeTexture(url) {
        if (this.textureCache.has(url)) {
            const texture = this.textureCache.get(url);
            texture.dispose();
            this.textureCache.delete(url);
        }
    }

    /**
     * Check if morph can be triggered
     */
    canMorph() {
        if (!this.enabled) return false;
        if (this.activeMorphs >= this.config.maxConcurrent) return false;
        if (Date.now() - this.lastMorphTime < this.config.cooldown) return false;
        return true;
    }

    /**
     * Main morph method
     * @param {string} sourceUrl - URL of source image
     * @param {string} targetUrl - URL of target image
     * @param {number} duration - Duration in ms (optional)
     * @param {number} intensity - Displacement intensity (optional)
     */
    async morph(sourceUrl, targetUrl, duration, intensity) {
        if (!this.canMorph()) {
            console.log('[MorphCanvas] Morph blocked (cooldown or max concurrent)');
            return false;
        }

        this.activeMorphs++;
        this.lastMorphTime = Date.now();

        const morphDuration = duration || this.config.duration;
        const morphIntensity = intensity || this.config.intensity;

        console.log(`[MorphCanvas] Morph started: ${sourceUrl.split('/').pop()} → ${targetUrl.split('/').pop()}`);

        try {
            // Load textures
            const [tex1, tex2] = await Promise.all([
                this._loadTexture(sourceUrl),
                this._loadTexture(targetUrl)
            ]);

            // Setup uniforms
            this.material.uniforms.uTexture1.value = tex1;
            this.material.uniforms.uTexture2.value = tex2;
            this.material.uniforms.uProgress.value = 0;
            this.material.uniforms.uIntensity.value = morphIntensity;

            // Show canvas
            this.renderer.domElement.style.opacity = '1';

            // Animate with GSAP
            await new Promise((resolve) => {
                gsap.to(this.material.uniforms.uProgress, {
                    value: 1,
                    duration: morphDuration / 1000,
                    ease: 'power2.inOut',
                    onUpdate: () => {
                        this.material.uniforms.uTime.value = this.clock.getElapsedTime();
                        this.renderer.render(this.scene, this.camera);
                    },
                    onComplete: resolve
                });
            });

            // Hide canvas
            this.renderer.domElement.style.opacity = '0';

            // Cleanup after fade
            setTimeout(() => {
                // Dispose old texture (source), keep target for potential reuse
                this._disposeTexture(sourceUrl);
            }, 300);

            console.log('[MorphCanvas] Morph completed');

        } catch (error) {
            console.error('[MorphCanvas] Morph failed:', error);
        } finally {
            this.activeMorphs--;
        }

        return true;
    }

    /**
     * Get memory usage info
     */
    getMemoryInfo() {
        if (!this.enabled) return null;
        return {
            textures: this.renderer.info.memory.textures,
            geometries: this.renderer.info.memory.geometries,
            cachedTextures: this.textureCache.size
        };
    }

    /**
     * Dispose all resources
     */
    dispose() {
        if (!this.enabled) return;

        // Dispose all cached textures
        this.textureCache.forEach((texture, url) => {
            texture.dispose();
        });
        this.textureCache.clear();

        // Dispose Three.js resources
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
        this.renderer.domElement.remove();

        console.log('[MorphCanvas] Disposed');
    }
}

// Global instance
window.morphCanvas = new MorphCanvas();
