import * as THREE from 'three'

const shaderVertex = `
      ${THREE.ShaderChunk.common}
      // PUT DEFS HERE

     
${THREE.ShaderChunk.logdepthbuf_pars_vertex}
// PUT FUNC HERE
void main() {


  ${THREE.ShaderChunk.logdepthbuf_vertex}
}
    `

const shaderFragment = `
  ${THREE.ShaderChunk.logdepthbuf_pars_fragment}

        ${THREE.ShaderChunk.logdepthbuf_fragment}
      }
`

export { shaderVertex, shaderFragment }