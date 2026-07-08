export const WALK_BOB_AMPLITUDE = 0.035;
export const SPRINT_BOB_AMPLITUDE = 0.065;
export const WALK_BOB_FREQUENCY = 7.5;
export const SPRINT_BOB_FREQUENCY = 11.0;
export const CAMERA_SWAY_AMOUNT = 0.018;
export const CAMERA_ROLL_AMOUNT = 0.012;

export interface HeadBobState {
  y: number;
  x: number;
  roll: number;
  footstepPulse: boolean;
}

export const getHeadBob = ({
  time,
  speed,
  sprinting,
  reducedMotion,
}: {
  time: number;
  speed: number;
  sprinting: boolean;
  reducedMotion: boolean;
}): HeadBobState => {
  if (reducedMotion || speed < 0.04) {
    return { y: 0, x: 0, roll: 0, footstepPulse: false };
  }

  const speedWeight = Math.min(speed / (sprinting ? 2.55 : 1.45), 1);
  const amplitude = (sprinting ? SPRINT_BOB_AMPLITUDE : WALK_BOB_AMPLITUDE) * speedWeight;
  const frequency = sprinting ? SPRINT_BOB_FREQUENCY : WALK_BOB_FREQUENCY;
  const phase = time * frequency;
  const footPhase = Math.sin(phase);

  return {
    y: Math.abs(footPhase) * amplitude,
    x: Math.sin(phase * 0.5) * CAMERA_SWAY_AMOUNT * speedWeight,
    roll: Math.sin(phase) * CAMERA_ROLL_AMOUNT * speedWeight,
    footstepPulse: footPhase > 0.96,
  };
};
