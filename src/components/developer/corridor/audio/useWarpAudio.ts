import { corridorAudioManager } from "./AudioManager";

const WARP_PLACEHOLDER = "/assets/audio/warp/warp_default.mp3";

export const useWarpAudio = () => ({
  playWarpLocked: () => corridorAudioManager.playOneShot(WARP_PLACEHOLDER, 0.42),
});
