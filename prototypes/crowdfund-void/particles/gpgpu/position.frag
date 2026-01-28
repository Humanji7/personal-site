uniform float uDt;
uniform float uTime;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos4 = texture2D(texturePosition, uv);
  vec3 vel = texture2D(textureVelocity, uv).xyz;

  vec3 pos = pos4.xyz;
  pos += vel * uDt;

  // Wrap stage bounds [-1..1]
  pos.xy = mod(pos.xy + 1.0, 2.0) - 1.0;

  // Keep depth in [0..1]
  pos.z = mod(pos.z, 1.0);

  gl_FragColor = vec4(pos, 1.0);
}
