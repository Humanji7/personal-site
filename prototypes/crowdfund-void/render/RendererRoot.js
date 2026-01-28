import * as THREE from 'three';

export class RendererRoot {
  constructor({ canvas }) {
    if (!canvas) throw new Error('RendererRoot requires a canvas');

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });

    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.autoClear = false;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.layers = [];
  }

  setLayers(layers) {
    this.layers = layers;
  }

  resize(w, h) {
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h);
  }

  // Render-graph support: clear screen before frame
  beginFrame() {
    this.renderer.setRenderTarget(null);
    // Guard against any pass leaving a reduced viewport/scissor behind.
    const w = this.renderer.domElement.width;
    const h = this.renderer.domElement.height;
    this.renderer.setScissorTest(false);
    this.renderer.setViewport(0, 0, w, h);
    this.renderer.clear(true, true, true);
  }

  // Legacy path (fx=0)
  render() {
    this.renderer.clear();
    for (const layer of this.layers) layer.render(this.renderer);
  }
}
