precision mediump float;
uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
flat varying vec2 vUV;

void main() {
	vec2 uv = vUV;
	uv -= vec2(0.5);
	uv *= 2.0;
	gl_FragColor = vec4(vec3(smoothstep(.5,.9,length(vNormal.xxy))), 1);
}