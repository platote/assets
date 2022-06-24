import * as THREE from 'three';
import metaversefile from 'metaversefile';
import {Vector3} from 'three';

const {useFrame, useApp, useLocalPlayer, usePhysics, useCleanup} = metaversefile;

export default e => {
  const app = useApp();
  const localPlayer = useLocalPlayer();
  const physics = usePhysics();

  useFrame(({timeDiff}) => {
    const player = localPlayer.position;

    const origin = new Vector3(0, 10, 7);

    if (player.y < -50) {
      physics.setCharacterControllerPosition(localPlayer.characterController, origin);
    } else if (player.y > 50) {
        physics.setCharacterControllerPosition(localPlayer.characterController, origin);
      }
  });

  useCleanup(() => {
    for (const physicsId of physicsIds) {
      physics.removeGeometry(physicsId);
    }
  });

  return app;
};