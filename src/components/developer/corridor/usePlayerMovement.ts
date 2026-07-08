import * as THREE from "three";

export const WALK_SPEED = 1.45;
export const SPRINT_SPEED = 2.55;
export const ACCELERATION = 7.5;
export const DECELERATION = 9.0;
export const MOUSE_SENSITIVITY = 0.002;

export interface PlayerMovementState {
  velocity: THREE.Vector3;
  speed: number;
  sprinting: boolean;
}

export const updatePlayerMovement = ({
  velocity,
  input,
  yaw,
  sprinting,
  delta,
}: {
  velocity: THREE.Vector3;
  input: THREE.Vector3;
  yaw: number;
  sprinting: boolean;
  delta: number;
}): PlayerMovementState => {
  const targetSpeed = sprinting ? SPRINT_SPEED : WALK_SPEED;
  const desiredVelocity =
    input.lengthSq() > 0.01
      ? input
          .clone()
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw)
          .multiplyScalar(targetSpeed)
      : new THREE.Vector3();

  const smoothing = input.lengthSq() > 0.01 ? ACCELERATION : DECELERATION;
  velocity.lerp(desiredVelocity, 1 - Math.exp(-smoothing * delta));

  return {
    velocity,
    speed: velocity.length(),
    sprinting: sprinting && input.lengthSq() > 0.01,
  };
};
