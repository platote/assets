import * as THREE from 'three';
import metaversefile from 'metaversefile'

const { useApp, usePhysics, useLoaders, useCleanup, useActivate, useLocalPlayer} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

export default e => {
    const app = useApp();
    const physics = usePhysics();
    const localPlayer = useLocalPlayer();
    let physicsIds = [];

    let sitSpec = null;

    (async () => {
        const u = `${baseUrl}/assets/air_skate.glb`; // must prefix "/bride-game" when working locally
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);        
        });

        app.add(gltf.scene);

        app.traverse(o => {
            // o.castShadow = true;
          });

        const physicsId = physics.addGeometry(gltf.scene);
        physicsIds.push(physicsId);
        app.updateMatrixWorld();

         })();

    sitSpec = app.getComponent("sit");
    console.log(sitSpec);


    useActivate(() => {

        sitSpec = app.getComponent('sit');
        if (sitSpec) {
          let rideMesh = null;
          const {instanceId} = app;
          const rideBone = sitSpec.sitBone ? rideMesh.skeleton.bones.find(bone => bone.name === sitSpec.sitBone) : null;
          const sitAction = {
            type: 'sit',
            time: 0,
            animation: sitSpec.subtype,
            controllingId: instanceId,
            controllingBone: rideBone,
          };
          localPlayer.setControlAction(sitAction);
          app.wear(false);
        }
      
      });

    useCleanup(() => {
    for (const physicsId of physicsIds) {
        physics.removeGeometry(physicsId);
    }
    });


    return app;
}