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
  float streak = 1.0 + vSpeed * mix(2.0, 6.0, uIntensity);

  float x = dot(p, dir) / streak;
  float y = dot(p, perp);
  float r2 = x * x + y * y;
  if (r2 > 1.0) discard;

  float r = sqrt(r2);

  // Multi-layer soft glow for organic feel.
  float core = exp(-r2 * 8.0);           // tight bright center
  float mid = exp(-r2 * 2.5);            // soft mid falloff
  float outer = exp(-r2 * 0.8);          // wide ambient glow

  float speedBoost = smoothstep(0.05, 0.5, vSpeed);

  // Combine layers with speed-reactive intensity.
  float brightness = core * 1.8
                   + mid * (0.6 + speedBoost * 0.4)
                   + outer * (0.15 + speedBoost * 0.1);

  float a = (core + mid * 0.7 + outer * 0.25) * vAlpha;

  vec3 col = vColor * brightness;

  gl_FragColor = vec4(col, a);
}
