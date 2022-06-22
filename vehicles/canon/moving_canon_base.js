import * as THREE from 'three';
import metaversefile from 'metaversefile';
const {useApp, useFrame, useActivate, useWear, useUse, useLocalPlayer, usePhysics, useScene, getNextInstanceId, getAppByPhysicsId, useWorld, useDefaultModules, useCleanup} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const emptyArray = [];
const fnEmptyArray = () => emptyArray;
const rightQuaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI/2);
let localVector = new THREE.Vector3();


export default e => {
  const app = useApp();
  const localPlayer = useLocalPlayer();

  window.localPlayer = localPlayer;
  app.name = 'wasssie canon';

  let sitSpec = null;
  let originalPosition = null;

  const physics = usePhysics();
  const scene = useScene();

  let canonApp = null;
  let vehicle = null;
  let arrowApps = [];



  e.waitUntil((async () => {
    {
      let u2 = `${baseUrl}canon.glb`;
      const m = await metaversefile.import(u2);
      canonApp = metaversefile.createApp({
        name: u2,
      });
      canonApp.position.copy(app.position);
      canonApp.quaternion.copy(app.quaternion);
      canonApp.scale.copy(app.scale);
      canonApp.updateMatrixWorld();
      canonApp.name = 'wassie canon';
      canonApp.getPhysicsObjectsOriginal = canonApp.getPhysicsObjects;
      canonApp.getPhysicsObjects = fnEmptyArray;

      const components = [
        {
          "key": "instanceId",
          "value": getNextInstanceId(),
        },
        {
          "key": "contentId",
          "value": u2,
        },
        {
          "key": "physics",
          "value": true,
        },
        {
            "key": "sit",
            "value": {
              "subtype": "saddle",
              "sitOffset": [0, 0, 0]
            }
          },
          {
            "key": "aim",
            "value": {}
          },
          {
            "key": "use",
            "value": {
            }
          }
      ];
      
      for (const {key, value} of components) {
        canonApp.setComponent(key, value);
      }
      await canonApp.addModule(m);

      vehicle = canonApp.physicsObjects[0]; 

      scene.add(canonApp);

      const arrowTemplateMesh = canonApp.getObjectByName('wassie'); 
      arrowTemplateMesh.parent.remove(arrowTemplateMesh);

      const _createArrowApp = () => {
        const arrowApp = metaversefile.createApp({
          name: 'arrow',
        });

        const arrowMesh = arrowTemplateMesh.clone();
        arrowMesh.quaternion.premultiply(rightQuaternion);
        arrowMesh.frustumCulled = false;
        arrowApp.add(arrowMesh);

        arrowApp.velocity = new THREE.Vector3(0, 0, -1)
          .applyQuaternion(
            new THREE.Quaternion()
              .setFromRotationMatrix(canonApp.matrixWorld)
              .premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI/2))
          );
        
        arrowApp.updatePhysics = (timestamp, timeDiff) => {
          const timeDiffS = timeDiff / 1000;
          arrowApp.position.add(localVector.copy(arrowApp.velocity).multiplyScalar(timeDiffS));
          // console.log('add', arrowApp.id, arrowApp.position.toArray().join(','), localVector.toArray().join(','));
          arrowApp.updateMatrixWorld();
        };

        return arrowApp;
      };
      
      
      canonApp.addEventListener('use', e => {
        console.log('got bow use', canonApp);
        const arrowApp = _createArrowApp();
        scene.add(arrowApp);
        arrowApp.position.copy(canonApp.position);
        arrowApp.quaternion.copy(canonApp.quaternion);
        arrowApp.updateMatrixWorld();
        arrowApps.push(arrowApp);
      });


    }
  })());
  
  app.getPhysicsObjects = () => {
    return canonApp ? canonApp.getPhysicsObjectsOriginal() : [];
  };
  
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
  
  useUse(e => {
    if (e.use && canonApp) {
      canonApp.use();
    }
  });

  useFrame(({timestamp, timeDiff}) => {

      
    if (canonApp && vehicle) {

        // app.position.copy(vehicle.position);

        canonApp.position.copy(app.position);
        canonApp.quaternion.copy(app.quaternion);
        canonApp.updateMatrixWorld();
        app.updateMatrixWorld();

    } 

    for (const arrowApp of arrowApps) {
      arrowApp.updatePhysics(timestamp, timeDiff);
    }

  });

  app.addEventListener('wearupdate', e => {
    if (!e.wear) {

        if (sitSpec) {
            const sitAction = localPlayer.getAction('sit');
            if (sitAction) {
              localPlayer.removeAction('sit');
              sitSpec = null;
            }
          }

    }
  });
  
  useCleanup(() => {
    scene.remove(canonApp);
  });

  return app;
};