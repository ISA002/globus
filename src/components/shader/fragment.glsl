#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform vec2 u_resolution;

float hex(vec2 p) {
  p.x *= 0.57735*2.0;
	p.y += mod(floor(p.x), 2.0) * 0.5;
	p = abs((mod(p, 1.0) - 0.5));
	return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 0.9);
}

void main(void) {
	vec2 pos = vUv.xy / 3.;
  pos.x *= 2.;

	vec2 p = pos / 0.01; 
	float  r = (1.0 - 0.6)*0.4;	
	vec4 hexagon = vec4(smoothstep(0.1, r - 0.1, hex(p)));
  gl_FragColor = vec4(hexagon.x, hexagon.y, hexagon.z, 0.1);
}
