import * as THREE from 'three';
import metaversefile from 'metaversefile';

import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';




const { useApp, useLoaders, usePhysics, useFrame, useCleanup, useLocalPlayer, useInternals} = metaversefile;
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

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

  const _applyTexture = (mesh, image, rotation) => {
    const loader = new THREE.TextureLoader();
    const texture = loader.load( `${baseUrl}/assets/images/${image}`);
    texture.rotation = rotation;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const material = new THREE.MeshBasicMaterial({map: texture,  side:THREE.DoubleSide});
    mesh.material = material;
}

export default e => {
    const app = useApp();
    const physics = usePhysics();
    const localPlayer = useLocalPlayer();
    const { camera } = useInternals();
    let physicsIds = [];
    let mainSpawn = null;
    let clouds = [];
    let cloudOutlines = [];
    let cloudObj = null;
    let gameState = 0;
    let mainDoor = null;
    let spawnGame1 = null;
    let spawnGame2 = null;
    let spawnGame4 = null;
    let wassieDoor = null;
    let firstSpawn = null;
    let capsule = null;
    let skybox = null;
    let startZ = 5;
    let goalZ = 99;
    let degrees = 180;
    let timeSincePassive = 0;
    let timeSinceActive = 0;
    let timeSinceChangedTarget = 0;
    let minWait = 3500;
    let maxWait = 10000;
    let hide = true;
    let signalObj = null;
    let goColor = 0x2eb800;
    let stopColor = 0xc90000;
    let rotationSpeed = 2;
    let headObj = null;
    let activeLines = [];
    let eyeArray = [];
    let statePoster = null;
    let ballsArr = [];
    let bridgeFallLimit = 110;
    let glassArray = [];
    let glass = null;
    let stangeStart = null;
    let bridgeEnd = null;
    let game1 = null;
    let game2 = null;
    let game3 = null;
    let end5 = false;
    let spawnGame3 = null;

    let audioArray = [];
    let greenAudio = null;
    let redAudio = null;
    let scanAudio = null;
    let shotAudio = null;
    let robotAudio = null;
    let positiveAudio = null;
    let boss = null;
    let originBossPos = 0;
    let helper = null;


    const cloudMaterial = new THREE.MeshToonMaterial();
    const capsuleMaterial = new THREE.MeshToonMaterial();
    const textMaterial = new THREE.MeshNormalMaterial();
    const eyeMaterial = new THREE.MeshToonMaterial();
    const redBallMaterial = new THREE.MeshToonMaterial({color : stopColor });
    const greenBallMaterial = new THREE.MeshToonMaterial({color : goColor });

    const outlineMaterial = new THREE.MeshBasicMaterial({
        color: '#000000',
        side: THREE.BackSide,
      });


    
    const _createLine = (targetPos) => { 
        if(activeLines.length <= 2) {
            for (var i = 0; i < eyeArray.length; i++) {
            var dir = new THREE.Vector3(); // create once an reuse it
            let tempObj = eyeArray[i].clone();
            let worldPos = new THREE.Vector3();
            tempObj.localToWorld(worldPos);
            dir.subVectors( targetPos, worldPos );
            
            var pointA = worldPos.clone();
  
            var distance = worldPos.distanceTo(targetPos); // at what distance to determine pointB
  
            var pointB = new THREE.Vector3();
            pointB.addVectors ( pointA, dir.normalize().multiplyScalar( distance ) );
  
            let points = [];
            points.push(pointA);
            points.push(pointB);
            const geometry = new THREE.BufferGeometry().setFromPoints( points );
            var material = new THREE.LineBasicMaterial( { color : 0xff0000, linewidth: 2 } );
            var line = new THREE.Line( geometry, material );
            app.add( line );
            activeLines.push(line);
          }
        } else {
          _clearLines();
        }
      }

    
    const _clearLines = () => {
        for (var i = 0; i < activeLines.length; i++) {
          app.remove(activeLines[i]);
        }
        activeLines.length = 0;
    }

    
    const _checkCharacterIsMoving = (timestamp) => {
      if(localPlayer.characterPhysics.velocity.length().toFixed(2) > 1 && localPlayer.position.z < goalZ) {
        timeSincePassive = timestamp;
        hide = true;
        signalObj.material.emissive = new THREE.Color(goColor);
        _changeGameState(1, 1500);
        if(shotAudio && !shotAudio.isPlaying) {
          shotAudio.play();
        }
        //physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
      }

      /*for (var i = 0; i < npcManager.npcs.length; i++) {
        if(npcManager.npcs[i].characterPhysics.velocity.length().toFixed(2) > 1 && npcManager.npcs[i].position.x < goalX) {
          //physics.setCharacterControllerPosition(npcManager.npcs[i].characterController, defaultSpawn);
          let npcPlayer = npcManager.npcs[i];
           if (!npcPlayer.hasAction('stop')) {
              const newAction = {
                type: 'stop'
              };
              npcPlayer.addAction(newAction);
              
              setTimeout(() => {
                npcPlayer.removeAction('stop');
              }, 1000);
            }

        }
      }*/
    }

    const _changeGameState = (state, delay) => {


      if(state === 0) {
        _stopAllAudio();
        localPlayer.avatar.app.visible = false;
        game1.material = redBallMaterial;
        game2.material = redBallMaterial;
        game3.material = redBallMaterial;
        setTimeout(() => {
          localPlayer.avatar.app.visible = true;
          physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
        }, delay);

      }

      if(state === 1) {
        _stopAllAudio();
        game1.material = redBallMaterial;
        game2.material = redBallMaterial;
        game3.material = redBallMaterial;
        if (delay === 1500) {
          localPlayer.avatar.app.visible = false;
          setTimeout(() => {
            localPlayer.avatar.app.visible = true;
            physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
          }, delay);
        } else {
          console.log("going to first spawn")
          physics.setCharacterControllerPosition(localPlayer.characterController, firstSpawn.position);
          
        }
        
      }

      if(state === 2) {
        physics.setCharacterControllerPosition(localPlayer.characterController, spawnGame1.position);
      }

      if(state === 4) {
        game1.material = greenBallMaterial;
        game2.material = redBallMaterial;
        game3.material = redBallMaterial;
        physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
      }

      if(state === 5) {
        game1.material = greenBallMaterial;
        game2.material = redBallMaterial;
        game3.material = redBallMaterial;
        physics.setCharacterControllerPosition(localPlayer.characterController, spawnGame2.position);
      }

      if(state === 6) {
        game1.material = greenBallMaterial;
        game2.material = greenBallMaterial;
        game3.material = redBallMaterial;
        physics.setCharacterControllerPosition(localPlayer.characterController, mainSpawn.position);
      }

      if(state === 7) {
        game1.material = greenBallMaterial;
        game2.material = greenBallMaterial;
        game3.material = redBallMaterial;
        physics.setCharacterControllerPosition(localPlayer.characterController, spawnGame3.position);
      }

      if(state === 8) {
        physics.setCharacterControllerPosition(localPlayer.characterController, spawnGame4.position);
      }

      console.log("Changing the game state to STATE : " + state);

      if(state !== 1 && state !== 3) {
        if(positiveAudio  && !positiveAudio.isPlaying) {
          positiveAudio.play();
        }
      }

      setTimeout(() => {
        gameState = state;
      }, delay);

    }


    (async () => {
        const u = `${baseUrl}/assets/shrimp.glb`; // must prefix "/bride-game" when working locally
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);        
        });
        app.add(gltf.scene);

        app.traverse(o => {

            if(o.name === "image1") {
              _applyTexture(o, "HashieMask2_BeeK.jpg", - Math.PI / 2)
            }
            if(o.name === "image2") {
                _applyTexture(o, "wastice_jordanbenik.jpg", (- Math.PI / 2))
              }
            if(o.name === "image3") {
                _applyTexture(o, "loominati_yb.jpg", - Math.PI / 2)
              }
            if(o.name === "image4") {
                _applyTexture(o, "wassie-appraiser-by-bitter.png", Math.PI * (Math.PI / 2) )
              }
            if(o.name === "image5") {
            _applyTexture(o, "loom_goodnight_story-yb.jpg", -  Math.PI / 2)
            }
            if(o.name === "image6") {
              _applyTexture(o, "100_Wassie_Wednesday_huntinghumans.png",  - Math.PI / 2)
              }
          
            if(o.name === "platform3") {
              const platMaterial = new THREE.MeshLambertMaterial( { color: 0x09102b, opacity: 0.9, transparent: true} );
              o.material = platMaterial;
            }
            
            if (o.name === "boss") {
              boss = o;
              originBossPos = boss.position
            }

            if (o.name === "helper") {
              helper = o;
            }

            if(o.name.includes("cloud")) {
                cloudObj = o;
                cloudObj.material = cloudMaterial;
                if (cloudObj.name !== "cloudSpawn") {
                   clouds.push(cloudObj);
                }



                
                // const outline = new THREE.Mesh(
                //     cloudObj.geometry.clone(),
                //     outlineMaterial
                //   )
                // outline.position.copy(cloudObj.position);
                // thickenGeometry(outline.geometry, 0.012);
                // app.add(outline);
            }

            if(o.name === "MainDoor") {
              mainDoor = o;
            }
            if(o.name === "spawnGame1") {
              spawnGame1 = o;
            }
            if(o.name === "spawnGame4") {
              spawnGame4 = o;
            }
            if(o.name === "wassieDoor") {
              wassieDoor = o;
            }
            if(o.name === "firstSpawn") {
              firstSpawn = o;
            }
            if(o.name === "capsule") {
              capsule = o;
              capsule.material = capsuleMaterial;
            }
            if(o.name === "skybox") {
              skybox = o;
              skybox.material = capsuleMaterial;
            }
            if (o.name === "MainSpawn") {
              mainSpawn = o;
            }
            if (o.name === "spawnGame2") {
              spawnGame2 = o;
            }
            if (o.name === "signal") {
              signalObj = o;
            } 
            if (o.name === "head") {
              headObj = o;
            }
            if(o.name === "eyeL") {
              eyeArray[0] = o;
              eyeArray[0].material = eyeMaterial;
            }
            if(o.name === "eyeR") {
              eyeArray[1] = o;
              eyeArray[1].material = eyeMaterial;
            }
            if (o.name === "statePoster") {
              statePoster = o;
            }
            if (o.name === "spawnGame3") {
              spawnGame3 = o;
            }
            if (o.name === "game1") {
              game1 = o;
              game1.material = redBallMaterial;
            }
            if (o.name === "game2") {
              game2 = o;
              game2.material = redBallMaterial;
            }
            if (o.name === "game3") {
              game3 = o;
              game3.material = redBallMaterial;
            }
            if (o.name === "Boss") {
              boss = o;
            } 
            if (o.name === "bridgeEnd") {
              bridgeEnd = o;
            }
            if (o.name === "stangeStart") {
              stangeStart = o;

              const geometry = new THREE.BoxGeometry( 2, 0.05, 2 );
              const material = new THREE.MeshLambertMaterial( { color: 0x09102b, opacity: 0.5, transparent: true} );
              const mesh = new THREE.Mesh( geometry, material );
              const mesh2 = new THREE.Mesh( geometry, material );
    
              for (var i = 0; i < 18; i++) {
                let maxTracks = 5;
                let minTracks = 1;
                let randomSfx = Math.floor(Math.random() * (maxTracks - minTracks + 1)) + minTracks;
                let temp = mesh.clone();
                 temp.position.set(stangeStart.position.x - 5, (stangeStart.position.y), stangeStart.position.z + i*3.7 + 3);
                 app.add( temp );
                 glassArray.push(temp);
                 temp.updateMatrixWorld();
                 const physicsId = physics.addGeometry(temp);
                 physicsIds.push(physicsId);
                 temp.physicsId = physicsId;
                 physicsId.glassObj = temp;
    
                 let temp2 = mesh2.clone();
                 temp2.position.set(stangeStart.position.x - 8 , (stangeStart.position.y), stangeStart.position.z + i*3.7 + 3 );
                 app.add( temp2 );
                 glassArray.push(temp2);
                 temp2.updateMatrixWorld();
                 const physicsId2 = physics.addGeometry(temp2);
                 physicsIds.push(physicsId2);
                 temp2.physicsId = physicsId2;
                 physicsId2.glassObj = temp2;
    
                 if (Math.random() > 0.5) {
                  if(Math.random() > 0.5) {
                    temp.breakable = true 
                  }
                  else {
                    temp2.breakable = true
                  }
                }

                const listener = new THREE.AudioListener();
                camera.add( listener );
 
                const sound = new THREE.PositionalAudio( listener );
                const audioLoader = new THREE.AudioLoader();
                
                 audioLoader.load( `${baseUrl}/audio/glass` + randomSfx.toString() + '.wav', function( buffer ) {
                       sound.setBuffer( buffer );
                       sound.setRefDistance( 10 );
                       sound.setVolume( 100 );
                 });
                         
                if(temp.breakable) {
                   temp.add( sound );
                   temp.audio = sound;
                }
                else {
                   temp2.add( sound );
                   temp2.audio = sound;
                }
            }
          }
            o.castShadow = true;
          });



        const physicsId = physics.addGeometry(gltf.scene);
        physicsIds.push(physicsId);
        app.updateMatrixWorld();

        const listener = new THREE.AudioListener();
        camera.add( listener );

        greenAudio = new THREE.Audio( listener );
        redAudio = new THREE.Audio( listener );
        scanAudio = new THREE.Audio( listener );
        shotAudio = new THREE.Audio( listener );
        robotAudio = new THREE.Audio( listener );
        positiveAudio = new THREE.Audio(listener);

        audioArray.push(greenAudio, redAudio, scanAudio, shotAudio, robotAudio);

        const audioLoader = new THREE.AudioLoader();
        audioLoader.load( `${baseUrl}/audio/Robot_Head2.wav`, function( buffer ) {
               robotAudio.setBuffer( buffer );
               robotAudio.setVolume( 0.07 );
         });
         audioLoader.load( `${baseUrl}/audio/Green.wav`, function( buffer ) {
               greenAudio.setBuffer( buffer );
               greenAudio.setVolume( 2 );
         });
         audioLoader.load( `${baseUrl}/audio/Scanning.wav`, function( buffer ) {
               scanAudio.setBuffer( buffer );
               scanAudio.setVolume( 0.2 );
         });
         audioLoader.load( `${baseUrl}/audio/Alarm.wav`, function( buffer ) {
               redAudio.setBuffer( buffer );
               redAudio.setVolume( 0.5 );
         });
         audioLoader.load( `${baseUrl}/audio/shot.ogg`, function( buffer ) {
               shotAudio.setBuffer( buffer );
               shotAudio.setVolume( 1 );
         });
         audioLoader.load( `${baseUrl}/audio/positive.wav`, function( buffer ) {
               positiveAudio.setBuffer( buffer );
               positiveAudio.setVolume( 1 );
         });

         })();


    

    useFrame( ( {timestamp}) => {


 
        for (let i = 0; i < clouds.length; i ++) {
            clouds[i].position.x += Math.sin(timestamp/1000) / 100
        }

        if (localPlayer.avatar) {

          // console.log(localPlayer.position)

          if (gameState === 0 && wassieDoor) {
            var distance = localPlayer.position.distanceTo(wassieDoor.position);
            if (distance < 1.8) {
              _changeGameState(1, 500);
            }
          }

          if (gameState === 1 && mainDoor) {
            var dist = localPlayer.position.distanceTo(mainDoor.position);
            if (dist < 1.8) {
              _changeGameState(2, 500);
            }
          }

          if (gameState === 2 ) {
            if (localPlayer.position.z > startZ) {
              _changeGameState(3, 500);
            }
          }

          if (gameState === 3) {
            degrees = THREE.MathUtils.clamp(degrees, 0, 180);

            if(localPlayer.position.z > goalZ) {
              _changeGameState(4, 0);
              console.log("Goal achieved")
            }

            if(degrees === 0) {
              if((timestamp - timeSinceChangedTarget) > 500) {
               /* for (var i = 0; i < npcManager.npcs.length; i++) {
                  _createLine(npcManager.npcs[i].position);
                  timeSinceChangedTarget = timestamp;
              }*/
              if(scanAudio && !scanAudio.isPlaying) {
                scanAudio.play();
              }
              _createLine(localPlayer.position);
                  timeSinceChangedTarget = timestamp;
              }
              if((timestamp - timeSinceActive) > 5000) {
                timeSincePassive = timestamp;
                hide = true;
                signalObj.material.emissive = new THREE.Color(goColor);
                if(greenAudio  && !greenAudio.isPlaying) {
                  greenAudio.play();
                }
                if(scanAudio && scanAudio.isPlaying) {
                  scanAudio.stop();
                }
                if(robotAudio && !robotAudio.isPlaying) {
                  robotAudio.play();
                }
  
                /*for (var i = 0; i < npcManager.npcs.length; i++) {
                  let npcPlayer = npcManager.npcs[i];
                   if (!npcPlayer.hasAction('go')) {
                      const newAction = {
                        type: 'go'
                      };
                      npcPlayer.addAction(newAction);
                      
                      setTimeout(() => {
                        npcPlayer.removeAction('go');
                      }, 1000);
                    }
  
                }*/
              }
              _checkCharacterIsMoving(timestamp);
            }

            if(degrees === 180) {
              if((timestamp - timeSincePassive) > Math.floor(Math.random() * maxWait) + minWait) {
                timeSinceActive = timestamp;
                hide = false;
                signalObj.material.emissive = new THREE.Color(stopColor);
                if(redAudio  && !redAudio.isPlaying) {
                  redAudio.play();
                }
                if(robotAudio && !robotAudio.isPlaying) {
                  robotAudio.play();
                }
              }
            }

            if(hide) {
              degrees+=rotationSpeed;
              _clearLines();
            }

            else {
              degrees-=rotationSpeed;
            }

            headObj.rotation.y = THREE.MathUtils.degToRad(degrees);
            headObj.updateMatrixWorld();

          }

          if(gameState === 4) {

            var distance = localPlayer.position.distanceTo(mainDoor.position);
            if (distance < 1.8) {
              console.log("CHANGING TO THEEE STATEEE")
              _changeGameState(5, 500);
            }
          }

          if (gameState === 5) {
            if(localPlayer.position.y <= bridgeFallLimit && !end5) {
              _changeGameState(1, 1500);
            }

            var distance_5 = localPlayer.position.distanceTo(bridgeEnd.position);
            if (distance_5 < 1) {
              end5 = true;
              _changeGameState(6, 500);
            }

            const downQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI*0.5);
            const resultDown = physics.raycast(localPlayer.position, downQuat);

            if(resultDown && localPlayer.characterPhysics.lastGroundedTime === timestamp) {
              let foundObj = metaversefile.getPhysicsObjectByPhysicsId(resultDown.objectId);
              if(foundObj) {
                if(foundObj.glassObj) {
                  if(foundObj.glassObj.breakable) {
                    if(foundObj.glassObj.audio) {
                      foundObj.glassObj.audio.play();
                      foundObj.glassObj.visible = false;
                      physics.disableGeometry(foundObj);
                      physics.disableGeometryQueries(foundObj);
                    }
  
                    // Ensures falling and not being able to sprint/run to the next glass plate
                    physics.setCharacterControllerPosition(localPlayer.characterController, new THREE.Vector3(localPlayer.position.x, localPlayer.position.y - 1, localPlayer.position.z));
                  }
                }
              }
  
            }
          }

          if (gameState === 6) {

            var distance = localPlayer.position.distanceTo(mainDoor.position);
            if (distance < 1.8) {
              _changeGameState(7, 500);
            }

          }

          if (gameState === 7) {

            if (window.count >= 8 ) {
              _changeGameState(8, 500);
            }
          }
        } 

    })

    useCleanup(() => {
        for (const physicsId of physicsIds) {
          physics.removeGeometry(physicsId);
        }
      });

      const _stopAllAudio = () => {
        for (var i = 0; i < audioArray.length; i++) {
          if(audioArray[i].isPlaying) {
            audioArray[i].stop();
          }
        }
  
      }
      

    return app;
}