import * as THREE from 'three';
import metaversefile from 'metaversefile';
import { Vector3 } from 'three';

const {useApp, useFrame, useLoaders, usePhysics, useCleanup, useLocalPlayer, useActivate} = metaversefile;

const baseUrl = import.meta.url.replace(/(\/)[^\/\/]*$/, '$1'); 

const localVector = new THREE.Vector3();
const localVector2 = new THREE.Vector3();
const localVector3 = new THREE.Vector3();
const localVector4 = new THREE.Vector3();
const localVector5 = new THREE.Vector3();
const localQuaternion = new THREE.Quaternion();
const localQuaternion2 = new THREE.Quaternion();
const localQuaternion3 = new THREE.Quaternion();
const localEuler = new THREE.Euler();
const localMatrix = new THREE.Matrix4();
window.isDebug = false


export default () => {  

    const app = useApp();
    window.heli = app
    const physics = usePhysics();
    window.physics = physics;
    const physicsIds = [];
    const localPlayer = useLocalPlayer();

    let vehicleObj;

    let velocity = new THREE.Vector3();
    let angularVelocity = new THREE.Vector3();
    let vehicle = null;
    let yaw = 0;
    let roll = 0;
    let pitch = 0;
    let enginePower = 0;
    let powerFactor = 0.10;
    let damping = 5;
    let rotor = null;
    let sitSpec = null;

    // Inputs
    let keyW = false;
    let keyA = false;
    let keyS = false;
    let keyD = false;
    let keyShift = false;
    let keyQ = false;
    let keyE = false;
    let keyC = false;

    function onDocumentKeyDown(event) {
        var keyCode = event.which;
        if (keyCode == 87) { // W 
            keyW = true;
        }
        if (keyCode == 83) { // S 
            keyS = true;
        }
        if (keyCode == 65) { // A 
            keyA = true;
        }
        if (keyCode == 68) { // D 
            keyD = true;
        }
        if (keyCode == 69) { // E 
            keyE = true;
        }
        if (keyCode == 81) { // Q 
            keyQ = true;
        }
        if (keyCode == 16) { // L shift 
            keyShift = true;
        }
        if (keyCode == 67) { // C
            keyC = true;
        }
    };
    function onDocumentKeyUp(event) {
        var keyCode = event.which;
        if (keyCode == 87) { // W 
            keyW = false;
        }
        if (keyCode == 83) { // S 
            keyS = false;
        }
        if (keyCode == 65) { // A 
            keyA = false;
        }
        if (keyCode == 68) { // D 
            keyD = false;
        }
        if (keyCode == 69) { // E 
            keyE = false;
        }
        if (keyCode == 81) { // Q 
            keyQ = false;
        }
        if (keyCode == 16) { // L shift 
            keyShift = false;
        }
        if (keyCode == 67) { // C
            keyC = false;
        }
    };

    const _unwear = () => {
      if (sitSpec) {
        const sitAction = localPlayer.getAction('sit');
        if (sitAction) {
          localPlayer.removeAction('sit');
          // localPlayer.avatar.app.visible = true;
          // physics.setCharacterControllerPosition(localPlayer.characterController, app.position);
          sitSpec = null;
        }
      }
    };

    const loadModel = ( params ) => {

        return new Promise( ( resolve, reject ) => {
                
            const { gltfLoader } = useLoaders();
            gltfLoader.load( params.filePath + params.fileName, function( gltf ) {
                resolve( gltf.scene );     
            });
        })
    }

    const modelName = '/assets/air_skate.glb';
    // const modelName = 'copter_var2_v2_vian.glb';
    // const modelName = 'copter_var3_v2_vian.glb';
    let p1 = loadModel( { filePath: baseUrl, fileName: modelName, pos: { x: 0, y: 0, z: 0 } } ).then( result => { vehicleObj = result } );

    let loadPromisesArr = [ p1 ];

    Promise.all( loadPromisesArr ).then( models => {

        app.add( vehicleObj );

        const physicsId = physics.addBoxGeometry(
          new THREE.Vector3(0, 0.5, 0),
          new THREE.Quaternion(),
          new THREE.Vector3(0.6, 0.4, 1.5),
          true
        );
        physicsIds.push(physicsId);
        
        vehicle = app.physicsObjects[0];
        window.vehicle = vehicle;
        vehicle.detached = true;

        vehicle.position.copy(app.position)
        physics.setTransform(vehicle);

    });

    useFrame(( { timeDiff } ) => {

      const _updateRide = () => {
        if (sitSpec && localPlayer.avatar) {
          const {instanceId} = app;

          if(sitSpec.mountType) {
            if(sitSpec.mountType === "flying") {
              // localPlayer.avatar.app.visible = false;
              physics.enableGeometry(vehicle);
              let quat = new THREE.Quaternion(vehicle.quaternion.x, vehicle.quaternion.y, vehicle.quaternion.z, vehicle.quaternion.w);
              let right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
              let globalUp = new THREE.Vector3(0, 1, 0);
              let up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
              let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);

              let propSpec = app.getComponent("propeller");
              if(propSpec) {
                app.traverse(o => {
                  // Find propeller obj
                  if(o.name === propSpec.name) { rotor = o; }
                });
              }
              enginePower = 1;

              // IO
              if(keyShift) {
                velocity.x += up.x * powerFactor * enginePower;
                velocity.y += up.y * powerFactor * enginePower;
                velocity.z += up.z * powerFactor * enginePower;
              }
              if (keyC) {
                velocity.x -= up.x * powerFactor * enginePower;
                velocity.y -= up.y * powerFactor * enginePower;
                velocity.z -= up.z * powerFactor * enginePower;
              }
              if(keyQ) {
                angularVelocity.x += up.x * powerFactor/2 * enginePower;
                angularVelocity.y += up.y * powerFactor/2 * enginePower
                angularVelocity.z += up.z * powerFactor/2 * enginePower;
              }
              if (keyE) {
                angularVelocity.x -= up.x * powerFactor/2 * enginePower;
                angularVelocity.y -= up.y * powerFactor/2 * enginePower;
                angularVelocity.z -= up.z * powerFactor/2 * enginePower;
              }
              if(keyW) {
                angularVelocity.x += right.x * powerFactor/2 * enginePower;
                angularVelocity.y += right.y * powerFactor/2 * enginePower;
                angularVelocity.z += right.z * powerFactor/2 * enginePower;
              }
              if (keyS) {
                angularVelocity.x -= right.x * powerFactor/2 * enginePower;
                angularVelocity.y -= right.y * powerFactor/2 * enginePower;
                angularVelocity.z -= right.z * powerFactor/2 * enginePower;
              }
              if(keyA) {
                angularVelocity.x -= forward.x * powerFactor/2 * enginePower;
                angularVelocity.y -= forward.y * powerFactor/2 * enginePower;
                angularVelocity.z -= forward.z * powerFactor/2 * enginePower;
              }
              if (keyD) {
                angularVelocity.x += forward.x * powerFactor/2 * enginePower;
                angularVelocity.y += forward.y * powerFactor/2 * enginePower;
                angularVelocity.z += forward.z * powerFactor/2 * enginePower;
              }
              let gravity = new THREE.Vector3(0, -9.81, 0);
              let gravityCompensation = new THREE.Vector3(-gravity.x, -gravity.y, -gravity.z).length();
              gravityCompensation *= timeDiff/1000;
              gravityCompensation *= 0.98;
              let dot = globalUp.dot(up);
              gravityCompensation *= Math.sqrt(THREE.MathUtils.clamp(dot, 0, 1));

              let vertDamping = new THREE.Vector3(0, velocity.y, 0).multiplyScalar(-0.01);
              let vertStab = up.clone();
              vertStab.multiplyScalar(gravityCompensation);
              vertStab.add(vertDamping);
              vertStab.multiplyScalar(enginePower);

              // Fake gravity
              localVector.copy(new THREE.Vector3(0,-9.81, 0)).multiplyScalar(timeDiff/1000);
              velocity.add(localVector);

              velocity.add(vertStab);

              // Positional damping
              velocity.x *= THREE.MathUtils.lerp(1, 0.995, enginePower);
              velocity.z *= THREE.MathUtils.lerp(1, 0.995, enginePower);

              //Stabilization
              let rotStabVelocity = new THREE.Quaternion().setFromUnitVectors(up, globalUp);
              rotStabVelocity.x *= 0.3;
              rotStabVelocity.y *= 0.3;
              rotStabVelocity.z *= 0.3;
              rotStabVelocity.w *= 0.3;
              let rotStabEuler = new THREE.Euler().setFromQuaternion(rotStabVelocity);
              
              angularVelocity.x += rotStabEuler.x * enginePower / damping;
              angularVelocity.y += rotStabEuler.y * enginePower/ damping;
              angularVelocity.z += rotStabEuler.z * enginePower/ damping;

              angularVelocity.x *= 0.97;
              angularVelocity.y *= 0.97;
              angularVelocity.z *= 0.97;

              //Applying velocities
              physics.setVelocity(vehicle, velocity, false);
              physics.setAngularVelocity(vehicle, angularVelocity, false);

              if (rotor) { rotor.rotateY(enginePower * 10); }
            }
          }
        }
        if(app && vehicle) {
          //Applying physics transform to app
          app.position.copy(vehicle.position);
          app.quaternion.copy(vehicle.quaternion);
          app.updateMatrixWorld();
          // localPlayer.avatar.object.scene.children[0].children[0].quaternion.copy(vehicle.quaternion);
        }
      };
      _updateRide();

    });

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

    app.addEventListener('wearupdate', e => {
      if(e.wear) {
        document.addEventListener("keydown", onDocumentKeyDown, false);
        document.addEventListener('keyup', onDocumentKeyUp);
      } else {
        document.removeEventListener("keydown", onDocumentKeyDown, false);
        document.removeEventListener('keyup', onDocumentKeyUp);
        _unwear();
      }
    });

    useCleanup(() => {
      for (const physicsId of physicsIds) {
       physics.removeGeometry(physicsId);
      }
      _unwear();
    });

    return app;
}