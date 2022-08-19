import * as THREE from 'three'

const rainbowVertex = `
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
  vec3 newPosition = position + normal * (1. - uv.x * (abs(sin(uTime/1000.)/12.)+1.))/1.3;
  vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;
  // gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.);
  gl_Position = projectedPosition;
  ${THREE.ShaderChunk.logdepthbuf_vertex}
}
    `

const rainbowFragment = `
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
    vec4 color0 = vec4(0.1, 0.8, 0.9 , 1.0); // DB0C36
    vec4 color1 = vec4(0., 1., 0.8, 1.0); // 7EB1A8
    vec4 color2 = vec4(0.2, 0.5, 1., 1.0); // EAD292
    vec4 color3 = vec4(0. , 0.6, 0.9, 1.0); // FDAB89

 
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    // vec2 uv = vUv;
    // uv.x += sin(time*10.)/7.;
    // uv.y -= sin(time*10.)/7.;
 
    //Example coordinates.  In practise these would be passed in
    // as parameters
    vec2 P0 = vec2(0.31 , 0.3);
    vec2 P1 = vec2(0.7,0.31);
    vec2 P2 = vec2(0.28,0.71);
    vec2 P3 = vec2(0.72,0.75);
    
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
  // t = smoothstep(0.0, 1.0, t);
  // u = smoothstep(0.0, 1.0, u);
 
  vec4 colorA = mix(color0,color1,u);
  vec4 colorB = mix(color2,color3,u);
  vec4 finalColor = mix(colorA, colorB, t);
  finalColor.r *= sin(time*4.)/4.+1.;
  finalColor.g *= cos(time*4.)/2.+1.;
  finalColor.b /= cos(time*4.)/5.+1.;
  finalColor.rgb += 0.2;
  finalColor.a = vUv.x;
  gl_FragColor = finalColor;
  ${THREE.ShaderChunk.logdepthbuf_fragment}
  }
`
// const rainbowFragment = `
//   precision highp float;
//   precision highp int;
//   #define PI 3.1415926535897932384626433832795
//   ${THREE.ShaderChunk.logdepthbuf_pars_fragment}
//   varying vec2 vUv;
//   varying vec3 vNormal;
//   uniform vec2 uResolution;
//   uniform sampler2D uTexture;
//   uniform float uTime;

//   void main() {
//     float time = uTime/1000.;

//     // vec4 color0 = vec4(59./255., 84./255., 98./255., 1.0); // EAD292
//     // vec4 color1 = vec4(53./255., 100./255., 58./255., 1.0); // 7EB1A8
//     // vec4 color2 = vec4(100./255., 96./255., 61./255., 1.0); // FDAB89
//     // vec4 color3 = vec4(71./255., 67./255., 94./255., 1.0); // DB0C36
//     vec4 color0 = vec4(0.3, 0.7-sin(time)/10., 1., 1.0); // EAD292
//     vec4 color1 = vec4(0.7+sin(time)/10., 0.4-sin(time)/10., 1. , 1.0); // DB0C36
//     vec4 color2 = vec4(1. - sin(time)/10., 0.5+sin(time)/10., 0.3, 1.0); // FDAB89
//     vec4 color3 = vec4(0.1+cos(time)/20., 0.9, 0.3, 1.0); // 7EB1A8

//     vec2 uv = gl_FragCoord.xy / uResolution.xy * (1. + sin(time)/3.);
//     // uv.x += sin(time*10.)/7.;
//     // uv.y -= sin(time*10.)/7.;

//     //Example coordinates.  In practise these would be passed in
//     // as parameters
//     vec2 P0 = vec2(0.31 - sin(time)/20.,0.3+ sin(time)/20.);
//     vec2 P1 = vec2(0.7+cos(time)/10.,0.31+ cos(time)/15.);
//     vec2 P2 = vec2(0.28,0.71 + cos(time/2.)/10.);
//     vec2 P3 = vec2(0.72-sin(time)/20.,0.75- sin(time)/10.);

//     vec2 Q = P0 - P2;
//     vec2 R = P1 - P0;
//     vec2 S = R + P2 - P3;
//     vec2 T = P0 - uv;

//     Q += sin(time)/10.;
//     R -= sin(time)/12.;
//     S -= sin(time)/11.;
//     T += sin(time)/9.;

//     float u;
//     float t;

//     if(Q.x == 0.0 && S.x == 0.0) {
//         u = -T.x/R.x;
//         t = (T.y + u*R.y) / (Q.y + u*S.y);
//     } else if(Q.y == 0.0 && S.y == 0.0) {
//         u = -T.y/R.y;
//         t = (T.x + u*R.x) / (Q.x + u*S.x);
//     } else {
//         float A = S.x * R.y - R.x * S.y;
//         float B = S.x * T.y - T.x * S.y + Q.x*R.y - R.x*Q.y;
//         float C = Q.x * T.y - T.x * Q.y;
//         // Solve Au^2 + Bu + C = 0
//         if(abs(A) < 0.0001)
//             u = -C/B;
//         else
//         u = (-B+sqrt(B*B-4.0*A*C))/(2.0*A);
//         t = (T.y + u*R.y) / (Q.y + u*S.y);
//     }
//     u = clamp(u,0.0,1.0);
//     t = clamp(t,0.0,1.0);

//     // These two lines smooth out t and u to avoid visual 'lines' at the boundaries.  They can be removed to improve performance at the cost of graphics quality.
//     t = smoothstep(0.0, 1.0, t);
//     u = smoothstep(0.0, 1.0, u);

//   vec4 colorA = mix(color0,color1,u);
//   vec4 colorB = mix(color2,color3,u);
//   vec4 finalColor = mix(colorA, colorB, t);

//   vec2 c1 = vUv + 0.1;
//   vec2 lightUv = vec2(c1.y * 0.5 + 0.25 , 0.5);
//   float angle = atan(c1.x, c1.y);
//   float radius = 0.05 + sin(angle * (27.1)) * 0.01;
//   float strength = step(radius,max(abs(lightUv.x-0.5),abs(lightUv.y-0.5)));
//   vec3 displaceColor = finalColor.bgr;
//   displaceColor *= (1. - strength);
//   finalColor.rgb *= strength;
//   finalColor.rgb += displaceColor;
//   gl_FragColor = finalColor;
//   ${THREE.ShaderChunk.logdepthbuf_fragment}
//   }
// `

export { rainbowVertex, rainbowFragment }
