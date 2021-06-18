#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;
uniform vec2 u_resolution;
uniform float u_vanishValue;

void main(void) {
	if (vUv.x < u_vanishValue) discard;
  gl_FragColor = vec4(1.);
}
