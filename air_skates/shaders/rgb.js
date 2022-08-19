import * as THREE from 'three'

const rgbVertex = `
      ${THREE.ShaderChunk.common}
      varying vec2 vUv;
      varying vec3 vNormal;
      uniform vec2 uResolution;
      uniform float uTime;
      uniform sampler2D uTexture;
     
${THREE.ShaderChunk.logdepthbuf_pars_vertex}
void main() {
  vUv = uv;
  vNormal = normal;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);
  gl_Position = projectedPosition;
  ${THREE.ShaderChunk.logdepthbuf_vertex}
}
    `

const rgbFragment = `
  precision highp float;
  precision highp int;
  #define PI 3.1415926535897932384626433832795
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
  varying vec2 vUv;
  varying vec3 vNormal;
  uniform vec2 uResolution;
  uniform sampler2D uTexture;
  uniform float uTime;
  
  void main() {
    float time = uTime/1000.;

    // vec4 color0 = vec4(59./255., 84./255., 98./255., 1.0); // EAD292
    // vec4 color1 = vec4(53./255., 100./255., 58./255., 1.0); // 7EB1A8
    // vec4 color2 = vec4(100./255., 96./255., 61./255., 1.0); // FDAB89
    // vec4 color3 = vec4(71./255., 67./255., 94./255., 1.0); // DB0C36
    vec4 color0 = vec4(0.3, 0.7, 1., 1.0); // EAD292
    vec4 color1 = vec4(0.2, 0.9, 1. , 1.0); // DB0C36
    vec4 color2 = vec4(0. , 0.5, 0.9, 1.0); // FDAB89
    vec4 color3 = vec4(0.2 , 0.8 , 1., 1.0); // 7EB1A8

 
    vec2 uv = vUv;
    // uv.x += sin(time*10.)/7.;
    // uv.y -= sin(time*10.)/7.;
 
    //Example coordinates.  In practise these would be passed in
    // as parameters
    vec2 P0 = vec2(0.1 , 0.1);
    vec2 P1 = vec2(0.7,0.3);
    vec2 P2 = vec2(0.3,0.7);
    vec2 P3 = vec2(0.9,0.9);
    
    vec2 Q = P0 - P2;
    vec2 R = P1 - P0;
    vec2 S = R + P2 - P3;
    vec2 T = P0 - uv;
    
    float u;
    float t;
 
    if(Q.x == 0.0 && S.x == 0.0) {
        u = -T.x/R.x;
        t = (T.y + u*R.y) / (Q.y + u*S.y);
    } else if(Q.y == 0.0 && S.y == 0.0) {
        u = -T.y/R.y;
        t = (T.x + u*R.x) / (Q.x + u*S.x);
    } else {
        float A = S.x * R.y - R.x * S.y;
        float B = S.x * T.y - T.x * S.y + Q.x*R.y - R.x*Q.y;
        float C = Q.x * T.y - T.x * Q.y;
        // Solve Au^2 + Bu + C = 0
        if(abs(A) < 0.0001)
            u = -C/B;
        else
        u = (-B+sqrt(B*B-4.0*A*C))/(2.0*A);
        t = (T.y + u*R.y) / (Q.y + u*S.y);
    }
    u = clamp(u,0.0,1.0);
    t = clamp(t,0.0,1.0);
 
    // These two lines smooth out t and u to avoid visual 'lines' at the boundaries.  They can be removed to improve performance at the cost of graphics quality.
    t = smoothstep(0.0, 1.0, t);
    u = smoothstep(0.0, 1.0, u);
 
  vec4 colorA = mix(color0,color1,u);
  vec4 colorB = mix(color2,color3,u);
  vec4 finalColor = mix(colorA, colorB, t);
  finalColor.r /= cos(time*2.)/3.+1.;
  finalColor.g *= cos(time*2.)/1.5+1.;
  finalColor.b *= sin(time*2.)/1.5+1.;
  finalColor.g += (1. - finalColor.r)/5.;
  finalColor.b -= (1. - finalColor.r)/5.;
  finalColor.rgb = mix(finalColor.rgb , vNormal , 0.2 - abs(-sin(time)/10.)); 

  gl_FragColor = finalColor;
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`
export { rgbVertex, rgbFragment }
