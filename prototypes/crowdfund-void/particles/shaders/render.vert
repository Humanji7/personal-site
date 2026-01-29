attribute vec3 aSeed;

uniform float uTime;
uniform float uOpacity;
uniform vec2 uViewport;
uniform float uIntensity;
uniform int uTier;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform int uWavesCount;
uniform vec4 uWaves[8]; // (originX, originY, time, strength)

#ifdef USE_GPGPU
attribute vec2 aUvRef;
uniform sampler2D uPositionTex;
uniform sampler2D uVelocityTex;
#endif

varying vec3 vColor;
varying float vAlpha;
varying vec2 vVelDir;
varying float vSpeed;

float hash13(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

void main() {
  float h = hash13(aSeed);

  vec3 pos;
#ifdef USE_GPGPU
  vec3 vel = texture2D(uVelocityTex, aUvRef).xyz;
  vSpeed = length(vel.xy);
  vVelDir = normalize(vel.xy + 1e-6);
  pos = texture2D(uPositionTex, aUvRef).xyz;
#else
  vec2 v = uPointerVel;
  float speed = length(v);
  // When pointer is idle, keep particles “alive” with a slow self-wake.
  if (speed < 0.05) {
    float ang = h * 6.283 + uTime * 0.6;
    v = normalize(vec2(sin(ang), cos(ang)));
    speed = 0.10 + 0.08 * abs(sin(uTime * 0.85 + h * 11.0));
  }
  vSpeed = speed;
  vVelDir = normalize(v + 1e-6);
  // Stage-space base position [-1..1] with gentle time warp.
  pos = (aSeed * 2.0 - 1.0);
  float z0 = fract(h + uTime * 0.03);
  pos.z = z0;

  float t = uTime * (0.35 + h * 0.25);
  pos.xy += vec2(sin(t + aSeed.y * 6.28), cos(t + aSeed.x * 6.28)) * 0.06;

  // Simple “rivers” swirl.
  float swirl = sin((pos.x * 2.0 + pos.y * 1.5) + uTime * 0.4) * 0.04;
  pos.xy += vec2(-pos.y, pos.x) * swirl;
#endif

  // Pointer parallax: gives depth without a 3D camera.
  float parallax = (0.12 + (1.0 - pos.z) * 0.18) * mix(0.6, 1.0, uIntensity);
  pos.xy += uPointer * parallax * 0.08;

  // Procedural cursor interaction (works even without GPGPU).
  vec2 toPointer = pos.xy - uPointer;
  float dP = length(toPointer) + 1e-4;
  float repel = smoothstep(0.28, 0.0, dP);
  pos.xy += normalize(toPointer) * repel * mix(0.03, 0.07, uIntensity);

  // Waves (visual displacement for procedural mode).
  for (int i = 0; i < 8; i++) {
    if (i >= uWavesCount) break;
    vec4 w = uWaves[i];
    float age = uTime - w.z;
    if (age < 0.0 || age > 2.2) continue;
    float waveSpeed = 0.55;
    float radius = age * waveSpeed;
    float dist = length(pos.xy - w.xy);
    float sigma = 0.05;
    float ring = exp(-((dist - radius) * (dist - radius)) / (2.0 * sigma * sigma));
    pos.xy += normalize(pos.xy - w.xy + 1e-6) * ring * w.w * mix(0.05, 0.12, uIntensity);
  }

  // Micro jitter (alive shimmer).
  float n = noise2(pos.xy * 3.0 + uTime * 0.7 + h * 10.0);
  pos.xy += (n - 0.5) * mix(0.004, 0.012, uIntensity);

  // Palette hint (will be refined later).
  vec3 magenta = vec3(1.0, 0.0, 1.0);
  vec3 cyan = vec3(0.0, 1.0, 1.0);
  vec3 violet = vec3(0.55, 0.0, 1.0);
  vec3 gold = vec3(1.0, 0.84, 0.0);

  float goldSpark = step(0.9996, hash13(aSeed + vec3(floor(uTime * 0.4))));
  vColor = mix(mix(magenta, cyan, fract(h * 1.7)), violet, smoothstep(0.2, 0.9, pos.z));
  vColor = mix(vColor, gold, goldSpark);

  // Tier-driven tint (hook for “tier pulls different colors”).
  vec3 tierCol = vColor;
  if (uTier == 0) tierCol = cyan;
  else if (uTier == 1) tierCol = violet;
  else if (uTier == 2) tierCol = magenta;
  else if (uTier == 3) tierCol = gold;
  float tierAmt = uTier >= 0 ? mix(0.08, 0.28, uIntensity) : 0.0;
  vColor = mix(vColor, tierCol, tierAmt);

  // Size: larger for visibility, depth-based variation.
  float depthSize = mix(3.0, 8.0, 1.0 - pos.z); // front=8, back=3
  float intensityMul = mix(0.85, 1.4, uIntensity);
  float baseSize = depthSize * intensityMul;
  // Scale by viewport aspect, clamped for ultra-wide.
  float aspectScale = min(2.5, uViewport.x / max(1.0, uViewport.y));
  gl_PointSize = baseSize * aspectScale;

  gl_Position = vec4(pos.xy, mix(0.2, 0.9, pos.z), 1.0);
  vAlpha = uOpacity;
}
