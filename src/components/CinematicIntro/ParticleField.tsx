import React, { useEffect, useRef } from "react";

interface ParticleFieldProps {
  reducedMotion: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number;
  speed: number;
  size: number;
  alpha: number;
}

const createParticle = (width: number, height: number): Particle => ({
  x: Math.random() * width,
  y: Math.random() * height,
  z: Math.random(),
  speed: 0.12 + Math.random() * 0.32,
  size: 0.45 + Math.random() * 1.25,
  alpha: 0.18 + Math.random() * 0.52,
});

export const ParticleField: React.FC<ParticleFieldProps> = ({ reducedMotion }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let animationFrame = 0;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let lastFrameTime = 0;
    const isSmallScreen = () => window.matchMedia("(max-width: 680px)").matches;

    const resize = () => {
      const mobile = isSmallScreen();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.75);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * pixelRatio);
      canvas.height = Math.floor(height * pixelRatio);
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

      const targetCount = Math.min(
        mobile ? 30 : 72,
        Math.max(mobile ? 22 : 32, Math.floor((width * height) / (mobile ? 28000 : 21000)))
      );

      particles = Array.from({ length: targetCount }, () =>
        createParticle(width, height)
      );
    };

    const drawTopography = (time: number) => {
      context.save();
      context.globalAlpha = 0.16;
      context.strokeStyle = "rgba(183, 248, 202, 0.22)";
      context.lineWidth = 1;

      const rowEnd = isSmallScreen() ? 6 : 9;
      const xStep = isSmallScreen() ? 28 : 18;

      for (let row = -2; row < rowEnd; row += 1) {
        context.beginPath();
        const yBase = height * 0.15 + row * 58;
        for (let x = -40; x <= width + 40; x += xStep) {
          const wave =
            Math.sin((x + time * 0.012) * 0.012 + row * 0.8) * 12 +
            Math.cos((x - time * 0.006) * 0.008) * 8;
          const y = yBase + wave + x * 0.035;
          if (x === -40) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.stroke();
      }

      context.restore();
    };

    const draw = (time = 0) => {
      const mobile = isSmallScreen();
      const minFrameGap = mobile ? 1000 / 30 : 1000 / 50;

      if (!reducedMotion && time - lastFrameTime < minFrameGap) {
        animationFrame = requestAnimationFrame(draw);
        return;
      }

      lastFrameTime = time;
      context.clearRect(0, 0, width, height);

      const gradient = context.createRadialGradient(
        width * 0.56,
        height * 0.42,
        0,
        width * 0.56,
        height * 0.42,
        Math.max(width, height) * 0.64
      );
      gradient.addColorStop(0, "rgba(183, 248, 202, 0.11)");
      gradient.addColorStop(0.36, "rgba(232, 207, 145, 0.055)");
      gradient.addColorStop(1, "rgba(5, 6, 8, 0)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      drawTopography(time);

      particles.forEach((particle) => {
        if (!reducedMotion) {
          particle.y -= particle.speed * (0.4 + particle.z);
          particle.x += Math.sin(time * 0.0006 + particle.z * 9) * 0.12;

          if (particle.y < -10) {
            particle.y = height + 10;
            particle.x = Math.random() * width;
          }
        }

        context.beginPath();
        context.fillStyle = `rgba(232, 207, 145, ${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      });

      if (!reducedMotion) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [reducedMotion]);

  return <canvas className="particle-field" ref={canvasRef} aria-hidden="true" />;
};
