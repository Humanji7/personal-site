/**
 * RenderTargets — allocator for render-graph targets.
 * All targets store linear color (no gamma).
 */
import * as THREE from 'three';

export class RenderTargets {
  constructor({ renderer, caps, width, height }) {
    this.renderer = renderer;
    this.caps = caps;
    this.width = width; // CSS px
    this.height = height; // CSS px

    // Choose texture type: prefer HalfFloat for HDR headroom
    this.textureType = this._chooseTextureType();

    this.pixelRatio = this.renderer.getPixelRatio?.() ?? 1;

    this.rtVoid = null;
    this.rtPost = null;
    this.rtComposite = null;

    this._allocate();
  }

  _chooseTextureType() {
    const { webgl2, extColorBufferFloat, extColorBufferHalfFloat } = this.caps;
    if (webgl2 && (extColorBufferHalfFloat || extColorBufferFloat)) {
      return THREE.HalfFloatType;
    }
    return THREE.UnsignedByteType;
  }

  _createTarget(widthPx, heightPx) {
    return new THREE.WebGLRenderTarget(widthPx, heightPx, {
      type: this.textureType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      generateMipmaps: false,
      depthBuffer: false,
      stencilBuffer: false,
    });
  }

  _allocate() {
    const dpr = this.pixelRatio;
    const widthPx = Math.max(2, Math.floor(this.width * dpr));
    const heightPx = Math.max(2, Math.floor(this.height * dpr));

    this.rtVoid = this._createTarget(widthPx, heightPx);
    this.rtPost = this._createTarget(widthPx, heightPx);
    this.rtComposite = this._createTarget(widthPx, heightPx);
  }

  resize(width, height) {
    if (this.width === width && this.height === height) return;

    this.width = width;
    this.height = height;

    // Keep targets aligned with the renderer drawing buffer (CSS * DPR).
    this.pixelRatio = this.renderer.getPixelRatio?.() ?? 1;
    const widthPx = Math.max(2, Math.floor(width * this.pixelRatio));
    const heightPx = Math.max(2, Math.floor(height * this.pixelRatio));

    this.rtVoid.setSize(widthPx, heightPx);
    this.rtPost.setSize(widthPx, heightPx);
    this.rtComposite.setSize(widthPx, heightPx);
  }

  dispose() {
    this.rtVoid?.dispose();
    this.rtPost?.dispose();
    this.rtComposite?.dispose();
    this.rtVoid = null;
    this.rtPost = null;
    this.rtComposite = null;
  }
}
