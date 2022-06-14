import * as THREE from 'three';
import metaversefile from 'metaversefile';
import { shaderVertex, shaderFragment } from './shaders';

const {useApp, useFrame} = metaversefile;

export default e => {
    const app = useApp();

    const geometry = new THREE.PlaneBufferGeometry(1,1,512, 512);

    const material = new THREE.ShaderMaterial({
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment
        }
    );

    const plane = new THREE.Mesh(geometry, material);

    plane.position.copy(app.position);
    // plane.rotation.x = Math.PI/2;
    plane.updateMatrixWorld();

    app.add(plane);

    return app;
}