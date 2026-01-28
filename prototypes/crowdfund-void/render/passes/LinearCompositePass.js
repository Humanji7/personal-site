/**
 * LinearCompositePass — blends void + post textures in linear space.
 * Output: linear color to rtComposite.
 */
import * as THREE from 'three';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 vUv;

uniform sampler2D uVoidTex;
uniform sampler2D uPostTex;
uniform float uMix; // 0 = void, 1 = post

void main() {
  vec3 voidCol = texture2D(uVoidTex, vUv).rgb;
  vec3 postCol = texture2D(uPostTex, vUv).rgb;

  // Simple crossfade in linear space.
  // Post is additive on top of fading void for smoother transition.
  vec3 col = mix(voidCol, voidCol * (1.0 - uMix) + postCol, uMix);

  gl_FragColor = vec4(col, 1.0);
}
`;

export class LinearCompositePass {
  constructor({ renderer }) {
    this._renderer = renderer;

    this._scene = new THREE.Scene();
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this._material = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uVoidTex: { value: null },
        uPostTex: { value: null },
        uMix: { value: 0 },
      },
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this._material);
    quad.frustumCulled = false;
    this._scene.add(quad);
  }

  render({ voidTexture, postTexture, mix, outputTarget }) {
    this._material.uniforms.uVoidTex.value = voidTexture;
    this._material.uniforms.uPostTex.value = postTexture;
    this._material.uniforms.uMix.value = mix;

    const renderer = this._renderer;
    const prev = renderer.getRenderTarget();
    renderer.setRenderTarget(outputTarget);
    renderer.clear(true, false, false);
    renderer.render(this._scene, this._camera);
    renderer.setRenderTarget(prev);
  }

  dispose() {
    this._material?.dispose();
  }
}
