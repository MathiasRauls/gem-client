uniform float uTime;

varying vec3 vPosition;
varying vec3 vNormal;
flat varying vec2 vUV;

void main() {
	// MVP ↓
	// projectionMatrix -> projects our objecr onto the screen (aspect ratio & the prespective)
	// viewMatrix -> position, orientation f our camera
	// modelMatrix -> position, scale, rotation of our model
	// gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
	vPosition = position;
	vNormal = normal;
	vUV = uv;
	vec4 modelViewPos = modelViewMatrix * vec4( position, 1.0 );
	vec4 projectedPos = projectionMatrix * modelViewPos;
	gl_Position = projectedPos;
}