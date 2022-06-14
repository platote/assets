import * as THREE from 'three'

const shaderVertex = `
      ${THREE.ShaderChunk.common}
     
${THREE.ShaderChunk.logdepthbuf_pars_vertex}
void main() {


  ${THREE.ShaderChunk.logdepthbuf_vertex}
  vec4 localPosition = vec4(position, 1.0);
  gl_Position = projectionMatrix * modelViewMatrix * localPosition;
}
    `

const shaderFragment = `
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}

    void main() {
        gl_FragColor = vec4(0.0);
        ${THREE.ShaderChunk.logdepthbuf_fragment}
    }
`

export { shaderVertex, shaderFragment }