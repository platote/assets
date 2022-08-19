import * as THREE from 'three';
import metaversefile from 'metaversefile'

const { useApp, usePhysics, useLoaders, useCleanup, useActivate, useLocalPlayer, useFrame} = metaversefile;

import { rainbowFragment, rainbowVertex } from './shaders/rainbow.js'

const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

const localVector = new THREE.Vector3();

const thickenGeometry = (geometry, ratio) => {
  var positionAttribute = geometry.attributes.position
  var normalAttribute = geometry.attributes.normal

  for (var i = 0; i < positionAttribute.count; i++) {
    // access single vertex (x,y,z)
    var x = positionAttribute.getX(i)
    var y = positionAttribute.getY(i)
    var z = positionAttribute.getZ(i)
    x += normalAttribute.getX(i) * ratio
    y += normalAttribute.getY(i) * ratio
    z += normalAttribute.getZ(i) * ratio
    positionAttribute.setXYZ(i, x, y, z)
  }
}

const outlineMaterial = new THREE.MeshBasicMaterial({
  color: '#000000',
  side: THREE.BackSide,
})


export default e => {
    const app = useApp();
    const physics = usePhysics();
    const localPlayer = useLocalPlayer();
    let physicsIds = [];
    let elapsedTime = 0;
    let vehicle = null;
    let enginePower = 0;
    let powerFactor = 0.10;
    let velocity = new THREE.Vector3();
    let angularVelocity = new THREE.Vector3();
    let damping = 5;

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

    const rainbowMaterial = new THREE.ShaderMaterial({
      vertexShader: rainbowVertex,
      fragmentShader: rainbowFragment,
      vertexColors: true,
      // wireframe:true,
      transparent: true,
      side: THREE.FrontSide,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight),
        },
        uTexture: { value: null },
      },
    });

    class CustomSinCurve extends THREE.Curve {

      constructor( scale = 1 ) {
  
          super();
  
          this.scale = scale;
  
      }
  
      getPoint( t, optionalTarget = new THREE.Vector3() ) {
  
          const tx = t * 3 - 1.5;
          const ty = Math.sin( 2 * Math.PI * t ) / 10;
          const tz = 0;
  
          return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
  
      }
  
  }


    const path = new CustomSinCurve( 1 );
    const geometry = new THREE.TubeGeometry( path, 100, 0.05, 100, false );
    const rainbowGas = new THREE.Mesh(geometry, rainbowMaterial);
    rainbowGas.position.z = -1.6;
    rainbowGas.updateMatrixWorld();
    const rainbowGas2 = rainbowGas.clone();
    // const rainbowGas = new THREE.Mesh(rainbowGasGeometry, new THREE.MeshToonMaterial())

    (async () => {
        const u = `${baseUrl}/assets/air_skate.glb`; // must prefix "/bride-game" when working locally
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);        
        });

        app.add(gltf.scene);

        app.traverse(o => {
            // o.castShadow = true;
            if (o.name === "air_skate") {
              for (let i = 0; i < o.children.length; i++) {
                console.log(o.children[i])

                const outline = new THREE.Mesh(
                  o.children[i].geometry.clone(),
                  outlineMaterial
                )

                outline.position.copy(o.children[i].position);
                thickenGeometry(outline.geometry, 0.003);
                outline.updateMatrixWorld()
                o.children[i].add(outline)

                // if(o.children[i].material.name === "blue"){
                //   o.children[i].material = new THREE.MeshToonMaterial({ color : 0x00ffff, emissive : 0x00ffff, emissiveIntensity : 5})
                // }
                if(o.children[i].material.name === "pink"){
                  o.children[i].material = new THREE.MeshToonMaterial({ color : 0xffa6e2})
                }
              }
            }
            if (o.name === "moteur_R") {
              rainbowGas.rotation.x -= Math.PI / 2
              rainbowGas.updateMatrixWorld()
              rainbowGas.rotation.z -= Math.PI / 2
              rainbowGas.updateMatrixWorld()
              o.add(rainbowGas);
              // o.add(rainbowGas)
            }
            if (o.name === "moteur_L") {

              rainbowGas2.rotation.x -= Math.PI / 2
              rainbowGas2.updateMatrixWorld()
              rainbowGas2.rotation.z -= Math.PI / 2
              rainbowGas2.updateMatrixWorld()
              o.add(rainbowGas2);
              // o.add(rainbowGas)
            }
          });

        const physicsId = physics.addGeometry(gltf.scene);
        physicsIds.push(physicsId);

        vehicle = app.physicsObjects[0];
        vehicle.detached = true;

        vehicle.position.copy(app.position)
        physics.setTransform(vehicle);

        console.log(vehicle);
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


    useFrame( ( {timestamp, timeDiff}) => {


        // AESTHETICS

        elapsedTime = timestamp
  
        rainbowGas.rotation.y += 0.2
        rainbowGas.scale.y = Math.abs(Math.sin(elapsedTime / 500) / 5 + 1)
        rainbowGas.scale.z = Math.abs(Math.cos(elapsedTime / 500) / 5 + 1)
        rainbowGas.updateMatrixWorld()
  
        rainbowGas2.rotation.y += 0.2
        rainbowGas2.scale.y = Math.abs(Math.sin(elapsedTime / 500) / 5 + 1)
        rainbowGas2.scale.z = Math.abs(Math.cos(elapsedTime / 500) / 5 + 1)
        rainbowGas2.updateMatrixWorld()
  
        rainbowMaterial.uniforms.uTime.value = elapsedTime

        // UPDATE RIDE 

        const _updateRide = () => {
          if (sitSpec && localPlayer.avatar) {
            const {instanceId} = app;
                // localPlayer.avatar.app.visible = false;

            if (sitSpec.mountType) {
              physics.enableGeometry(vehicle);
              let quat = new THREE.Quaternion(vehicle.quaternion.x, vehicle.quaternion.y, vehicle.quaternion.z, vehicle.quaternion.w);
              let right = new THREE.Vector3(1, 0, 0).applyQuaternion(quat);
              let globalUp = new THREE.Vector3(0, 1, 0);
              let up = new THREE.Vector3(0, 1, 0).applyQuaternion(quat);
              let forward = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
    
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
    
              // if (rotor) { rotor.rotateY(enginePower * 10); }
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

        // _updateRide();
  
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
    });

    return app;
}