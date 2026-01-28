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

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.autoClear = false;

    this.layers = [];
  }

  setLayers(layers) {
    this.layers = layers;
  }

  resize(w, h) {
    this.renderer.setSize(w, h);
  }

  render() {
    this.renderer.clear();
    for (const layer of this.layers) layer.render(this.renderer);
  }
}
