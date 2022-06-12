import * as THREE from 'three';
import metaversefile from 'metaversefile';

const {useApp, useFrame} = metaversefile;

const y180Quaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI);
const baseUrl = import.meta.url.replace(/(\/)[^\/\\]*$/, '$1');
const localEuler = new THREE.Euler();
const localEuler2 = new THREE.Euler();
const forward = new THREE.Vector3(0, 0, -1);

export default e => {
    const app = useApp();

    let balloon = null;

    const speed = 0.005;
    const angularSpeed = 0.002;


    (async () => {
        balloon = await metaversefile.createAppAsync({
          start_url: `${baseUrl}balloon.glb`,
        });
        balloon.quaternion.copy(y180Quaternion);
        balloon.frustumCulled = false;
        balloon.position.copy(app.position);
        balloon.updateMatrixWorld();

        app.add(balloon);
    })();
    
    const directionToFacingAngle = (() => {
        const localQuaternion = new THREE.Quaternion();
        const localEuler = new THREE.Euler();
        return direction => {
          localQuaternion.setFromUnitVectors(forward, direction);
          localEuler.setFromQuaternion(localQuaternion, 'YXZ');
          return localEuler.y;
        };
      })();

    const _angleQuaternionTowards = (quaternion, ry, radians) => {
        localEuler.setFromQuaternion(quaternion, 'YXZ');
        localEuler2.set(0, ry, 0, 'YXZ');
    
        localEuler.y += Math.PI*2;
        localEuler2.y += Math.PI*2;
    
        if (localEuler.y < localEuler2.y) {
          localEuler.y += radians;
          if (localEuler.y > localEuler2.y) {
            localEuler.y = localEuler2.y;
          }
        } else if (localEuler.y > localEuler2.y) {
          localEuler.y -= radians;
          if (localEuler.y < localEuler2.y) {
            localEuler.y = localEuler2.y;
          }
        }
    
        // console.log('update', localEuler.y, directionToFacingAngle(direction), direction.toArray().join(','));
    
        quaternion.setFromEuler(localEuler);
      };

      let balloonAction = null;

      const targetPositionAction = () => {
        const range = 10;
        const targetPosition = app.position.clone().add(new THREE.Vector3(Math.random() * 2 - 1, 0, Math.random() * 2 - 1).multiplyScalar(range));
        return {
            update(timestamp) {
                if (app.position.distanceTo(targetPosition) >= 1) {
                    const direction = targetPosition.clone().sub(app.position).normalize();
                    // console.log('got 2', direction.toArray().join(','));
                    app.position.add(direction.clone().multiplyScalar(speed));
                    // const directionQuaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Quaternion(), direction);
                    _angleQuaternionTowards(app.quaternion, directionToFacingAngle(direction), angularSpeed * 2);
                    app.updateMatrixWorld();
                    return true;
                  } else {
                    return false;
                  }
            }
        }
      };

      useFrame(({timestamp}) => {
        if(balloon) {

            for (;;) {
                if (!balloonAction) {
                    balloonAction = targetPositionAction();
                }
    
                if (balloonAction.update(timestamp)) {
                    break;
                } else {
                    balloonAction = null;
                }
            }
        }
      });

    return app;
}