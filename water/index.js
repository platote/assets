import * as THREE from 'three';
import metaversefile from 'metaversefile'

const { useApp, useFrame, useInternals } = metaversefile;

import {
    shaderVertex,
    shaderFragment
  } from './shaders.js'

export default e => {
    const app = useApp();
    const {camera, renderer} = useInternals();

    let params = {
        foamColor: 0x14c6a5,
        waterColor: 0xffffff,
        threshold: 0.6
      };

    let water, depthMaterial, renderTarget;

    let pixelRatio = renderer.getPixelRatio();

    let supportsDepthTextureExtension = !!renderer.extensions.get(
        "WEBGL_depth_texture"
      );

    renderTarget = new THREE.WebGLRenderTarget(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      );

    renderTarget.texture.minFilter = THREE.NearestFilter;
    renderTarget.texture.magFilter = THREE.NearestFilter;
    renderTarget.texture.generateMipmaps = false;
    renderTarget.stencilBuffer = false;

    if (supportsDepthTextureExtension === true) {
        renderTarget.depthTexture = new THREE.DepthTexture();
        renderTarget.depthTexture.type = THREE.UnsignedShortType;
        renderTarget.depthTexture.minFilter = THREE.NearestFilter;
        renderTarget.depthTexture.maxFilter = THREE.NearestFilter;
      }





    let dudvMap = new THREE.TextureLoader().load(
        "https://i.imgur.com/hOIsXiZ.png"
      );

    dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

    depthMaterial = new THREE.MeshDepthMaterial();
    depthMaterial.depthPacking = THREE.RGBADepthPacking;
    depthMaterial.blending = THREE.NoBlending;

    let uniforms = {
        time: {
          value: 0
        },
        threshold: {
          value: 0.00001
        },
        tDudv: {
          value: null
        },
        tDepth: {
          value: null
        },
        cameraNear: {
          value: 0
        },
        cameraFar: {
          value: 0
        },
        resolution: {
          value: new THREE.Vector2()
        },
        foamColor: {
          value: new THREE.Color()
        },
        waterColor: {
          value: new THREE.Color()
        }
      };

      let waterGeometry = new THREE.PlaneBufferGeometry(100, 100);

      let waterMaterial = new THREE.ShaderMaterial({
        defines: {
          DEPTH_PACKING: supportsDepthTextureExtension === true ? 0 : 1,
          ORTHOGRAPHIC_CAMERA: 0
        },
        uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib["fog"], uniforms]),
        vertexShader: shaderVertex,
        fragmentShader: shaderFragment, 
        fog: true
      });

      waterMaterial.uniforms.cameraNear.value = camera.near;
      waterMaterial.uniforms.cameraFar.value = camera.far;

      waterMaterial.uniforms.resolution.value.set(
        window.innerWidth * pixelRatio,
        window.innerHeight * pixelRatio
      );

      waterMaterial.uniforms.tDudv.value = dudvMap;
      waterMaterial.uniforms.tDepth.value =
      supportsDepthTextureExtension === true
        ? renderTarget.depthTexture
        : renderTarget.texture;

      water = new THREE.Mesh(waterGeometry, waterMaterial);
      water.rotation.x = -Math.PI * 0.5;
      water.position.y = 3.5;

      app.add(water);

      app.updateMatrixWorld();

      var clock = new THREE.Clock();

    useFrame(() => {

        // renderer.setRenderTarget(renderTarget);
        // renderer.render(scene, camera);
        // renderer.setRenderTarget(null);


        var time = clock.getElapsedTime();
        water.visible = true;
        app.overrideMaterial = depthMaterial;

        water.material.uniforms.threshold.value = params.threshold;
        water.material.uniforms.time.value = time / 2;
        water.material.uniforms.foamColor.value.set(params.foamColor);
        water.material.uniforms.waterColor.value.set(params.waterColor);

    });
    return app;
}