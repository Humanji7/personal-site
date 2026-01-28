precision highp float;

varying vec3 vColor;
varying float vAlpha;
varying vec2 vVelDir;
varying float vSpeed;

uniform float uIntensity;

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  // Velocity-streak shape: rotate into velocity basis, stretch along direction.
  vec2 dir = normalize(vVelDir + 1e-6);
  vec2 perp = vec2(-dir.y, dir.x);
  float streak = 1.0 + vSpeed * mix(2.0, 7.0, uIntensity);

  float x = dot(p, dir) / streak;
  float y = dot(p, perp);
  float r2 = x * x + y * y;
  if (r2 > 1.0) discard;

  // Soft disc + glow.
  float core = smoothstep(0.25, 0.0, r2);
  float glow = smoothstep(1.0, 0.10, r2);

  float speedGlow = smoothstep(0.1, 0.6, vSpeed) * 0.35;
  float a = (core * 0.75 + glow * (0.30 + speedGlow)) * vAlpha;
  vec3 col = vColor * (core * 1.35 + glow * (0.65 + speedGlow));

  gl_FragColor = vec4(col, a);
}
