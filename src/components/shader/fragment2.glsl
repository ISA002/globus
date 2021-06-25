#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
uniform sampler2D u_map;

float hex(vec2 p) {
  p.x *= 0.57735*2.0;
	p.y += mod(floor(p.x), 2.0) * 0.5;
	p = abs((mod(p, 1.0) - 0.5));
	return abs(max(p.x * 1.5 + p.y, p.y * 2.0) - 0.9);
}

void main(void) {


	vec4 tex = texture2D(u_map, vUv);
	if (tex.r > 0.3 && tex.g > 0.3 && tex.b > 0.3) discard;
	tex.a = 0.4;

  gl_FragColor = tex;
}
