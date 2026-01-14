/**
 * KLYAP v14 — Canvas Displacement Transition
 * Морфинг MIRROR → VISCERAL
 * 
 * Эффект "врастания" глитча в органическую ткань
 */

class TransitionCanvas {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.cssText = `
            position: fixed;
            inset: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 15;
            opacity: 0;
            transition: opacity 1s ease-in-out;
        `;
        
        this.container.appendChild(this.canvas);
        this.resize();
        
        window.addEventListener('resize', () => this.resize());
        
        this.sourceImg = null;
        this.targetImg = null;
        this.progress = 0;
        this.isActive = false;
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Загрузить изображения для морфинга
     */
    async loadImages(sourcePath, targetPath) {
        const loadImg = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
        
        try {
            [this.sourceImg, this.targetImg] = await Promise.all([
                loadImg(sourcePath),
                loadImg(targetPath)
            ]);
            return true;
        } catch (e) {
            console.warn('TransitionCanvas: Failed to load images', e);
            return false;
        }
    }
    
    /**
     * Запустить transition
     * @param {number} duration — длительность в ms
     */
    async start(duration = 2000) {
        if (!this.sourceImg || !this.targetImg) {
            console.warn('TransitionCanvas: Images not loaded');
            return;
        }
        
        this.isActive = true;
        this.canvas.style.opacity = '1';
        this.progress = 0;
        
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            if (!this.isActive) return;
            
            const elapsed = currentTime - startTime;
            this.progress = Math.min(elapsed / duration, 1);
            
            this.render();
            
            if (this.progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.finish();
            }
        };
        
        requestAnimationFrame(animate);
    }
    
    /**
     * Displacement render — pixel-level морфинг
     */
    render() {
        const { ctx, canvas, sourceImg, targetImg, progress } = this;
        const { width, height } = canvas;
        
        // Clear
        ctx.clearRect(0, 0, width, height);
        
        // Calculate displacement intensity (peaks in middle)
        const displacementIntensity = Math.sin(progress * Math.PI) * 50;
        
        // Draw source fading out
        ctx.globalAlpha = 1 - progress;
        ctx.filter = `blur(${progress * 20}px) hue-rotate(${progress * 90}deg)`;
        this.drawCentered(sourceImg);
        
        // Draw target fading in with displacement effect
        ctx.globalAlpha = progress;
        ctx.filter = `blur(${(1 - progress) * 20}px) saturate(${1 + progress})`;
        
        // Organic distortion via offset drawing
        const offsetX = Math.sin(progress * Math.PI * 4) * displacementIntensity;
        const offsetY = Math.cos(progress * Math.PI * 3) * displacementIntensity * 0.7;
        
        ctx.save();
        ctx.translate(offsetX, offsetY);
        this.drawCentered(targetImg);
        ctx.restore();
        
        // Reset
        ctx.globalAlpha = 1;
        ctx.filter = 'none';
    }
    
    /**
     * Draw image centered and scaled
     */
    drawCentered(img) {
        const { canvas, ctx } = this;
        const scale = Math.min(
            canvas.width / img.width,
            canvas.height / img.height
        ) * 0.6;
        
        const w = img.width * scale;
        const h = img.height * scale;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;
        
        ctx.drawImage(img, x, y, w, h);
    }
    
    /**
     * Завершить transition
     */
    finish() {
        this.isActive = false;
        this.canvas.style.opacity = '0';
        this.progress = 0;
        
        // Clear after fade
        setTimeout(() => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }, 1000);
    }
    
    /**
     * Триггер для MIRROR → VISCERAL перехода
     */
    async triggerMirrorToVisceral() {
        // Random mirror и visceral fragments
        const mirrorFrags = ['001', '002', '006', '008', '020', '021'];
        const visceralFrags = ['004', '007', '009', '012', '013', '019'];
        
        const source = mirrorFrags[Math.floor(Math.random() * mirrorFrags.length)];
        const target = visceralFrags[Math.floor(Math.random() * visceralFrags.length)];
        
        await this.loadImages(
            `/assets/klyap-v14/fragments/fragment-${source}.png`,
            `/assets/klyap-v14/fragments/fragment-${target}.png`
        );
        
        this.start(2500);
    }
}

// Export for use in main prototype
window.TransitionCanvas = TransitionCanvas;
