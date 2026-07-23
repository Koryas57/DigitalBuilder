import { RefObject, useEffect, useRef } from "react";

type UseVideoEndFrameArgs = {
  videoRef: RefObject<HTMLVideoElement>;
  isPlaying: boolean;
  onEndFrame: () => void;
};

export const useVideoEndFrame = ({ videoRef, isPlaying, onEndFrame }: UseVideoEndFrameArgs) => {
  const completedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) {
      completedRef.current = false;
      return;
    }

    const lockFinalFrame = () => {
      if (completedRef.current || !Number.isFinite(video.duration) || video.duration <= 0) {
        return;
      }

      if (video.currentTime >= video.duration - 0.08 || video.ended) {
        completedRef.current = true;
        video.pause();

        try {
          video.currentTime = Math.max(0, video.duration - 0.04);
        } catch {
          // Some browsers can reject currentTime writes right at the end of media.
        }

        onEndFrame();
      }
    };

    video.addEventListener("timeupdate", lockFinalFrame);
    video.addEventListener("ended", lockFinalFrame);

    return () => {
      video.removeEventListener("timeupdate", lockFinalFrame);
      video.removeEventListener("ended", lockFinalFrame);
    };
  }, [isPlaying, onEndFrame, videoRef]);
};
