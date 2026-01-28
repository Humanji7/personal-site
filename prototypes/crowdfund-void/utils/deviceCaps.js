export function getDeviceCaps(renderer) {
  const gl = renderer.getContext();
  const webgl2 =
    typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

  const maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const maxVtfUnits = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const reducedMotion =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const extColorBufferFloat = gl.getExtension('EXT_color_buffer_float');
  const extColorBufferHalfFloat = gl.getExtension('EXT_color_buffer_half_float');

  return {
    webgl2,
    maxTextureSize,
    maxVtfUnits,
    dpr,
    reducedMotion,
    extColorBufferFloat: !!extColorBufferFloat,
    extColorBufferHalfFloat: !!extColorBufferHalfFloat,
  };
}

