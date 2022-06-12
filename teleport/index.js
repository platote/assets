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

    const origin = new Vector3(5, 6, 6);

    const teleportFrom1 = new Vector3(-3.5,5.55,0.7);
    const teleportTo1 = new Vector3(400,15.35,400);

    if (player.distanceTo(teleportFrom1) < 0.2) {
      physics.setCharacterControllerPosition(localPlayer.characterController, teleportTo1);
    } else if (player.y < -50) {
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