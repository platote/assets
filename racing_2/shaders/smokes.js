import * as THREE from 'three'

const smokeVertex = `
      ${THREE.ShaderChunk.common}
      varying vec2 vUv;
      varying vec3 vPattern;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform float uBeat;
      uniform float uSize;
      uniform sampler2D uTexture;
     

${THREE.ShaderChunk.logdepthbuf_pars_vertex}
void main() {
  vUv = uv;
  vec3 newPosition = position + normal * (1. - uv.x * (abs(sin(uTime)/12.)+1.));
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);
  gl_Position = projectedPosition;
  ${THREE.ShaderChunk.logdepthbuf_vertex}
}
    `

const smokeFragment = `
  precision highp float;
  precision highp int;
  #define PI 3.1415926535897932384626433832795
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
  varying vec3 vPattern;
  varying vec2 vUv;
  uniform vec2 uResolution;
  uniform float uRot;
  uniform float uTime;
  uniform sampler2D uTexture;


  #define TAU 6.28318530718

  float FuncR(float pX)
  {
    return 0.5 + 0.2*(1.0 + sin(mod(40.0*pX, TAU)));
  }
  
  
  float Layer(vec2 pQ, float pT)
  {
    vec2 Qt = pQ;
    Qt.x += pT;
  
    float Xi = floor(Qt.x);
    float Xf = Qt.x - Xi;
  
    vec2 C;
    float Yi;
    float D = 1.0;
  
    // Disk:
    Yi = -1.5;
    C = vec2(Xf, Qt.y ); 
    D =  min(D, length(C) - FuncR(Xi+ pT/80.0));
  
    // Previous disk:
    Yi = -1.5;
    C = vec2(Xf-1.0, Qt.y ); 
    D =  min(D, length(C) - FuncR(Xi+1.0+ pT/80.0));
  
    // Next Disk:
    Yi = -1.5;
    C = vec2(Xf+1.0, Qt.y); 
    D =  min(D, length(C) - FuncR(Xi-1.0+ pT/80.0));
  
    return D;
  }
  
  void main() {
  // float cloud = 0.;
  // for (float i = 1.; i <= 10.; i++) {
  //   cloud += step(0.25 , distance(vec2(i/20.) , vUv));
  // }
  // cloud += step(0.25 , distance(vec2(0.5) , vUv));
  // cloud += step(0.25 , distance(vec2(0.5) , vec2(vUv.x + 0.1 , vUv.y+0.1)));
  // Setup:
	vec2 UV = vUv*20.;	
  UV.y -= 5.;
  UV.y *= (1. + abs(sin(uTime*2.)/4.));
  vec3 Color= vec3(0.);

	for(float J=0.0; J<=1.0; J+=0.2)
	{
		// Cloud Layer: 
		float Lt =  uTime*(0.5  + 2.0*J)*(1.0 + 0.1*sin(226.0*J)) + 17.0*J;
		vec2 Lp = vec2(0.0, 0.3+1.5*( J - 0.5));
    Lp.y *= (1. + abs(sin(uTime*2.)));
		float L = Layer(UV + Lp, Lt);
		float V = mix( 0.0, 1.0, 1.0 - smoothstep( 0.0, 0.01, L ) );
		vec3 Lc=  mix( vec3(1.), vec3(1.0), J);

		Color =mix(Color, Lc,  V);
	}
  gl_FragColor = vec4(Color , 1.2 * (1. - vUv.x) * vUv.x* Color.r* (1. + sin(uTime)/4.));

  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`

export { smokeVertex, smokeFragment }
