import * as THREE from 'three';
import metaversefile from 'metaversefile';

const { useApp, useLoaders, usePhysics, useFrame, useCleanup, useInternals} = metaversefile;
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');

import { rainbowFragment, rainbowVertex } from './shaders/rainbow.js'

const outlineMaterial = new THREE.MeshBasicMaterial({
  color: '#000000',
  side: THREE.BackSide,
})

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


export default e => {
    const app = useApp();
    const physics = usePhysics();
    let physicsIds = [];
    let elapsedTime = 0;


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


    const cloudMaterial = new THREE.MeshToonMaterial();
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
    })

    const rainbowToonMaterial = new THREE.MeshToonMaterial()

    const path = new CustomSinCurve( 1 );
    const geometry = new THREE.TubeGeometry( path, 100, 0.05, 100, false );
    const rainbowGas = new THREE.Mesh(geometry, rainbowMaterial);
    rainbowGas.position.z = -1.6;
    rainbowGas.updateMatrixWorld();
    const rainbowGas2 = rainbowGas.clone();
    // const rainbowGas = new THREE.Mesh(rainbowGasGeometry, new THREE.MeshToonMaterial())

    (async () => {
        const u = `${baseUrl}/assets/racing_2.glb`; // must prefix "/bride-game" when working locally
        let gltf = await new Promise((accept, reject) => {
            const {gltfLoader} = useLoaders();
            gltfLoader.load(u, accept, function onprogress() {}, reject);        
        });

        app.add(gltf.scene);

        app.traverse(o => {

            if(o.name.includes("cloud")) {
              o.material = cloudMaterial;
      
          }
            o.castShadow = true;
          });

        const physicsId = physics.addGeometry(gltf.scene);
        physicsIds.push(physicsId);
        app.updateMatrixWorld();

         })();

    const customizeSkate = () => {
        setTimeout(() => {
          const rootScene = useInternals().scene
          rootScene.traverse((o) => {
            if (o.name === "air_skate") {
              console.log(o)
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
          })
        }, 1000)
      }
      
    customizeSkate()


    useFrame( ( {timestamp}) => {

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

    })

    useCleanup(() => {
        for (const physicsId of physicsIds) {
          physics.removeGeometry(physicsId);
        }
      });

      

    return app;
}