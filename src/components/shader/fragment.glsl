#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D landscape;
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform vec2 u_resolution;

// const vec2 s = vec2(1, 1.7320508);

float hex(vec2 p) {
  p.x *= 0.57735*2.0;
	p.y += mod(floor(p.x), 2.0) * 0.5;
	p = abs((mod(p, 1.0) - 0.5));
	return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 1.);
}

// float hex2(in vec2 p){
//   p = abs(p);
//   return max(dot(p, s*.5), p.x); // Hexagon.
// }

// vec4 getHex(vec2 p){
//   vec4 hC = floor(vec4(p, p - vec2(.5, 1))/s.xyxy) + .5;
//   vec4 h = vec4(p - hC.xy*s, p - (hC.zw + .5)*s);
//   return dot(h.xy, h.xy)<dot(h.zw, h.zw) ? vec4(h.xy, hC.xy) : vec4(h.zw, hC.zw + vec2(.5, 1));
// }

void main(void) {
  // vec3 X = dFdx(vNormal);
  // vec3 Y = dFdy(vNormal);
  // vec3 normal = normalize(cross(X, Y));
	vec2 pos = vUv.xy;
  // vec3 v = normalize(vPosition)
	// vec2 p = pos / 0.5; 
	// float r = (1.0 - 0.7) * 0.1;

  // vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
  // vec4 hex_uv = getHex(uv);
  // float iso = hex2(hex_uv.xy);

  // vec2 pos = gl_FragCoord.xy;
	vec2 p = pos / 0.01; 
	float  r = (1.0 -0.7)*0.4;	
	vec4 hexagon = vec4(smoothstep(0.1, r - 0.1, hex(p)));
  gl_FragColor = vec4(hexagon.x, hexagon.y, hexagon.z, 0.5);
  // gl_FragColor = vec4(1., 1., 1., 0.0);

	// vec4 hexagon = vec4(hex(p));

  // gl_FragColor = hexagon;
  // mix(vec4(1.0, 1.0, 1.0, 0.0), vec4(1., 1., 1., 1.), hexagon);;
}
