import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useScene, useLoaders, useCleanup, usePhysics} = metaversefile;

export default e => {
  const app = useApp();
  const scene = useScene();
  const {gltfLoader} = useLoaders();
  const physics = usePhysics();
  const url = './platote_assets/sofa-hills/sofa.glb';

  const fiveTone = new THREE.TextureLoader().load(
    './platote_assets/sofa-hills/fiveTone.jpg'
  )
  fiveTone.minFilter = fiveTone.magFilter = THREE.NearestFilter

  const toonMaterial = new THREE.MeshToonMaterial({
    color: '#567D46',
    gradientMap: fiveTone,
  });

  const normalMaterial = new THREE.MeshNormalMaterial();

  
  const physicsIds = [];
  let hillsApp = null;

  e.waitUntil((async () => {
    const u = url;

    const m = await metaversefile.import(u);
    hillsApp = metaversefile.createApp({
      name: u,
    });

    hillsApp.scale.set(0.5, 0.5, 0.5);

    hillsApp.updateMatrixWorld();
    await hillsApp.addModule(m);

    const hillsGeometry = hillsApp.children[0].children[0].geometry;
    
    console.log(hillsApp.children[0].children[0].geometry);

    let physicsId;
    physicsId = physics.addGeometry(hillsApp);
    physicsIds.push(physicsId)

    scene.add(hillsApp);

    hillsApp.children[0].children[0].material = normalMaterial;

    /*
    scene.traverse(child => {
      if (child.isMesh) {
        if (child.name == 'Plane') {
          child.material = normalMaterial;
        }
      }
    });
    */ 

  })());

  useCleanup(() => {
    scene.remove(hillsApp);
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};
