uniform float uDt;
uniform float uTime;
uniform vec2 uPointer;
uniform vec2 uPointerVel;
uniform float uEdges;
uniform float uIntensity;
uniform int uWavesCount;
uniform vec4 uWaves[8]; // (originX, originY, time, strength)
uniform int uRectsCount;
uniform vec4 uRects[16]; // (x0, y0, x1, y1) in stage/NDC space
uniform int uHistoryCount;
uniform vec4 uHistory[32]; // (x, y, age, speed) — pointer trail for ribbon effect

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

vec2 curl(vec2 p) {
  float e = 0.02;
  float n1 = noise2(p + vec2(0.0, e));
  float n2 = noise2(p - vec2(0.0, e));
  float a = (n1 - n2) / (2.0 * e);
  float n3 = noise2(p + vec2(e, 0.0));
  float n4 = noise2(p - vec2(e, 0.0));
  float b = (n3 - n4) / (2.0 * e);
  return vec2(a, -b);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos4 = texture2D(texturePosition, uv);
  vec4 vel4 = texture2D(textureVelocity, uv);

  vec3 pos = pos4.xyz;
  vec3 vel = vel4.xyz;

  // Damping (calm mode damps more).
  vel *= mix(0.92, 0.985, uIntensity);

  // Soft bounds: attract particles back if they drift too far from center.
  // This prevents "lost" particles after tab was hidden.
  float distFromCenter = length(pos.xy);
  float boundaryStart = 0.85; // Start attracting at 85% of stage
  float boundaryForce = smoothstep(boundaryStart, 1.2, distFromCenter);
  vec2 pullBack = -normalize(pos.xy + 1e-6);
  vel.xy += pullBack * boundaryForce * 0.5 * uDt;

  // Base flow: curl-noise rivers + global orbit.
  vec2 p = pos.xy;
  vec2 flow = curl(p * 1.35 + uTime * 0.12);
  flow += curl(p * 2.4 - uTime * 0.07) * 0.6;
  vec2 toCenter = -p;
  vec2 orbit = normalize(vec2(-toCenter.y, toCenter.x) + 1e-6);
  flow += orbit * (0.45 + 0.15 * sin(uTime * 0.5 + pos.z * 6.28));
  // Add flow directly (more “water/wind” than a constant-speed field).
  vel.xy += flow * mix(0.10, 0.28, uIntensity) * uDt;

  // Depth drift so swarm has real layering.
  float dz = (noise2(p * 2.0 + uTime * 0.25) - 0.5) * mix(0.02, 0.08, uIntensity);
  vel.z += dz * uDt;

  // Cursor negative space.
  vec2 toPointer = p - uPointer;
  float d = length(toPointer) + 1e-4;
  float repel = smoothstep(0.35, 0.0, d);
  vel.xy += normalize(toPointer) * repel * mix(0.35, 0.9, uIntensity) * uDt;

  // Cursor vortex: makes the “shepherd” feel alive.
  vec2 tangentP = normalize(vec2(-toPointer.y, toPointer.x) + 1e-6);
  float vortex = smoothstep(0.55, 0.0, d) * smoothstep(0.2, 1.5, length(uPointerVel));
  vel.xy += tangentP * vortex * mix(0.12, 0.55, uIntensity) * uDt;

  // Cursor "entourage field": pull slightly behind pointer velocity direction.
  float speed = length(uPointerVel);
  vec2 vDir = normalize(uPointerVel + 1e-6);
  vec2 behind = uPointer - vDir * 0.12;
  vec2 toBehind = behind - pos.xy;
  float dBehind = length(toBehind) + 1e-4;
  float follow = smoothstep(0.45, 0.0, dBehind) * smoothstep(0.2, 2.0, speed);
  vel.xy += normalize(toBehind) * follow * mix(0.25, 0.55, uIntensity) * uDt;

  // === RIBBON PATH-FOLLOW ===
  // Find closest point on pointer trail and flow along it.
  if (uHistoryCount > 1) {
    float minDist = 1e9;
    vec2 closestPoint = uHistory[0].xy;
    vec2 pathDir = vec2(1.0, 0.0);
    float closestSpeed = 0.0;
    float closestAge = 0.0;

    for (int i = 0; i < 31; i++) {
      if (i >= uHistoryCount - 1) break;

      vec4 h0 = uHistory[i];
      vec4 h1 = uHistory[i + 1];

      // Skip stale segments (age > 0.8s).
      if (h0.z > 0.8 || h1.z > 0.8) continue;

      vec2 a = h0.xy;
      vec2 b = h1.xy;
      vec2 ab = b - a;
      float abLen = length(ab) + 1e-6;

      // Project particle onto line segment.
      float t = clamp(dot(pos.xy - a, ab) / (abLen * abLen), 0.0, 1.0);
      vec2 proj = a + ab * t;
      float dist = length(pos.xy - proj);

      if (dist < minDist) {
        minDist = dist;
        closestPoint = proj;
        pathDir = normalize(ab + 1e-6);
        closestSpeed = mix(h0.w, h1.w, t);
        closestAge = mix(h0.z, h1.z, t);
      }
    }

    // Attraction to ribbon path (stronger when close, fades with age).
    float ribbonRadius = mix(0.15, 0.35, uIntensity);
    float attract = smoothstep(ribbonRadius, 0.0, minDist);
    float ageFade = smoothstep(0.6, 0.0, closestAge);
    float ribbonStrength = attract * ageFade * mix(0.4, 1.2, uIntensity);

    vec2 toPath = closestPoint - pos.xy;
    vel.xy += normalize(toPath + 1e-6) * ribbonStrength * 0.5 * uDt;

    // Tangential flow along path direction (creates ribbon/stream feel).
    vec2 tangent = pathDir;
    // Add slight swirl perpendicular to path.
    vec2 swirlDir = vec2(-tangent.y, tangent.x);
    float swirlPhase = sin(uTime * 3.0 + pos.x * 8.0 + pos.y * 6.0) * 0.3;

    vec2 flowDir = tangent + swirlDir * swirlPhase;
    float flowSpeed = closestSpeed * mix(0.3, 0.8, uIntensity);
    vel.xy += normalize(flowDir + 1e-6) * ribbonStrength * flowSpeed * uDt;
  }

  // Waves: ring impulse.
  for (int i = 0; i < 8; i++) {
    if (i >= uWavesCount) break;
    vec4 w = uWaves[i];
    float age = uTime - w.z;
    if (age < 0.0 || age > 2.2) continue;

    float waveSpeed = 0.55;
    float radius = age * waveSpeed;
    vec2 origin = w.xy;
    float strength = w.w;

    float dist = length(pos.xy - origin);
    float sigma = 0.04;
    float ring = exp(-((dist - radius) * (dist - radius)) / (2.0 * sigma * sigma));
    vec2 dir = normalize(pos.xy - origin + 1e-6);
    vel.xy += dir * ring * strength * mix(0.35, 1.2, uIntensity) * uDt;
  }

  // Edge attractors (left/right strips).
  float edgeX = 0.92;
  float pullL = smoothstep(0.7, 0.0, abs(pos.x + edgeX));
  float pullR = smoothstep(0.7, 0.0, abs(pos.x - edgeX));
  vel.x += (-pullL + pullR) * 0.10 * uEdges * mix(0.65, 1.0, uIntensity) * uDt;

  // DOM rect avoidance (cards/edges).
  for (int i = 0; i < 16; i++) {
    if (i >= uRectsCount) break;
    vec4 r = uRects[i];
    vec2 c = clamp(pos.xy, r.xy, r.zw);
    vec2 diff = pos.xy - c;
    float dist = length(diff) + 1e-4;
    float avoid = smoothstep(0.12, 0.0, dist);
    vel.xy += normalize(diff) * avoid * mix(0.7, 1.1, uIntensity) * uDt;
    // Tangential "flow around" to avoid dead stops.
    vec2 tang = vec2(-diff.y, diff.x);
    vel.xy += normalize(tang + 1e-6) * avoid * mix(0.18, 0.35, uIntensity) * uDt;
  }

  // Keep velocity bounded.
  vel = clamp(vel, vec3(-1.4), vec3(1.4));

  gl_FragColor = vec4(vel, 1.0);
}
