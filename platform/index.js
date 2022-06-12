import * as THREE from 'three';
import metaversefile from 'metaversefile'

const { useApp, useFrame, usePhysics } = metaversefile;


export default e => {
    const app = useApp();
    const physics = usePhysics();

    let time, collider;

    const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.3,0.04, 0.3),
        new THREE.MeshToonMaterial()
    )


    collider = physics.addGeometry(box);
    
    box.position.set(-2.4, 4.5, -1.5);
    collider.position.copy(box.position);

    app.add(box);



    app.updateMatrixWorld();

    const clock = new THREE.Clock();

    useFrame(() => {
        time = clock.getElapsedTime();
        box.position.y = Math.abs(Math.sin(time))*1.2 + 4.3;
        box.updateMatrixWorld();
        collider.position.copy(box.position);
        physics.setTransform(collider);

    });
    return app;
}