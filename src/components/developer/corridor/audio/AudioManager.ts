export class AudioManager {
  private unlocked = false;
  private cache = new Map<string, HTMLAudioElement>();

  unlock() {
    this.unlocked = true;
    window.dispatchEvent(new CustomEvent("corridor-audio-unlocked"));
  }

  isUnlocked() {
    return this.unlocked;
  }

  getAudio(src: string) {
    if (!this.cache.has(src)) {
      const audio = new Audio(src);
      audio.preload = "auto";
      this.cache.set(src, audio);
    }

    return this.cache.get(src)!;
  }

  playOneShot(src: string, volume = 0.5) {
    if (!this.unlocked) return;
    const audio = this.getAudio(src).cloneNode(true) as HTMLAudioElement;
    audio.volume = volume;
    void audio.play().catch(() => undefined);
  }

  playSegment(src: string, startTime: number, duration: number, volume = 0.5, playbackRate = 1) {
    if (!this.unlocked) return;
    const audio = this.getAudio(src).cloneNode(true) as HTMLAudioElement;
    audio.volume = volume;
    audio.playbackRate = playbackRate;

    const stop = () => {
      audio.pause();
      audio.currentTime = 0;
    };
    const stopTimer = window.setTimeout(stop, duration * 1000);
    const play = () => {
      const safeStartTime = Number.isFinite(audio.duration)
        ? Math.min(startTime, Math.max(0, audio.duration - duration - 0.02))
        : startTime;
      audio.currentTime = safeStartTime;
      void audio.play().catch(() => {
        window.clearTimeout(stopTimer);
      });
    };

    audio.addEventListener("ended", () => window.clearTimeout(stopTimer), { once: true });
    if (audio.readyState >= 1) {
      play();
    } else {
      audio.addEventListener("loadedmetadata", play, { once: true });
      audio.load();
    }
  }

  playLoop(src: string, volume = 0.35, startTime = 0) {
    if (!this.unlocked) return null;
    const audio = this.getAudio(src);
    audio.loop = true;
    audio.volume = volume;
    audio.currentTime = startTime;
    void audio.play().catch(() => undefined);
    return audio;
  }
}

export const corridorAudioManager = new AudioManager();
