import React, { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import "./Showroom.scss";

interface ModelViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Showroom: React.FC<ModelViewerModalProps> = ({
  isOpen,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    let isModalOpen = true;
    let disposed = false;

    const modalContent = document.querySelector(".modal-content");
    if (!modalContent) return;

    const container = document.createElement("div");
    container.style.width = "100%";
    container.style.height = "100%";
    modalContent.appendChild(container);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeeeeee);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2, 5);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const loader = new GLTFLoader();

    let jaguar: THREE.Object3D;
    loader.load(
      "/assets/models/Jaguar/scene.gltf",
      (gltf) => {
        jaguar = gltf.scene;
        jaguar.scale.set(10, 10, 10);
        jaguar.rotation.y = Math.PI / 2;
        jaguar.position.set(0, 0, 0);

        jaguar.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });

        scene.add(jaguar);
      },
      undefined,
      (error) => console.error("Erreur chargement Jaguar :", error)
    );

    loader.load(
      "/assets/models/Scene/scene.gltf",
      (gltf) => {
        const environment = gltf.scene;
        environment.scale.set(1, 1, 1);
        environment.position.set(0, 0, 0);
        environment.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
        scene.add(environment);
      },
      undefined,
      (error) => console.error("Erreur chargement décor :", error)
    );

    // AUDIO
    const listener = new THREE.AudioListener();
    camera.add(listener);
    const audioLoader = new THREE.AudioLoader();

    let engineIdle: THREE.Audio;
    let engineAccel: THREE.Audio;
    let ambientSound: THREE.Audio;

    engineIdle = new THREE.Audio(listener);
    audioLoader.load("/assets/audio/IdlingCarSoundEffect.mp3", (buffer) => {
      if (!isModalOpen || disposed) return;
      engineIdle.setBuffer(buffer);
      engineIdle.setLoop(true);
      engineIdle.setVolume(0.5);
      engineIdle.play();
    });

    engineAccel = new THREE.Audio(listener);
    audioLoader.load("/assets/audio/JagSound.mp4", (buffer) => {
      if (!isModalOpen || disposed) return;
      engineAccel.setBuffer(buffer);
      engineAccel.setLoop(true);
      engineAccel.setVolume(0.6);
    });

    ambientSound = new THREE.Audio(listener);
    audioLoader.load("/assets/audio/CitySoundEffect.mp3", (buffer) => {
      if (!isModalOpen || disposed) return;
      ambientSound.setBuffer(buffer);
      ambientSound.setLoop(true);
      ambientSound.setVolume(0.3);
      ambientSound.play();
    });

    const keysPressed: Record<string, boolean> = {
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false,
    };

    const keyDownHandler = (e: KeyboardEvent) => {
      if (e.key in keysPressed) keysPressed[e.key] = true;
    };
    const keyUpHandler = (e: KeyboardEvent) => {
      if (e.key in keysPressed) keysPressed[e.key] = false;
    };

    window.addEventListener("keydown", keyDownHandler);
    window.addEventListener("keyup", keyUpHandler);

    // TOUCH CONTROLS (mobile)
    const setKey = (key: keyof typeof keysPressed, value: boolean) => {
      keysPressed[key] = value;
    };

    const accelBtn = document.getElementById("mobile-accelerate");
    const leftBtn = document.getElementById("mobile-left");
    const rightBtn = document.getElementById("mobile-right");

    accelBtn?.addEventListener("touchstart", () => setKey("ArrowUp", true));
    accelBtn?.addEventListener("touchend", () => setKey("ArrowUp", false));
    leftBtn?.addEventListener("touchstart", () => setKey("ArrowLeft", true));
    leftBtn?.addEventListener("touchend", () => setKey("ArrowLeft", false));
    rightBtn?.addEventListener("touchstart", () => setKey("ArrowRight", true));
    rightBtn?.addEventListener("touchend", () => setKey("ArrowRight", false));

    // Vitesse dynamique
    let currentSpeed = 0;
    const maxSpeed = 0.4;
    const acceleration = 0.01;
    const deceleration = 0.02;
    const rotationSpeed = 0.08;

    const animate = () => {
      requestAnimationFrame(animate);

      if (jaguar) {
        if (keysPressed.ArrowUp) {
          currentSpeed = Math.min(currentSpeed + acceleration, maxSpeed);
          jaguar.translateZ(currentSpeed);
        } else {
          currentSpeed = Math.max(currentSpeed - deceleration, 0);
          if (currentSpeed > 0) jaguar.translateZ(currentSpeed);
        }

        if (keysPressed.ArrowLeft) jaguar.rotation.y += rotationSpeed;
        if (keysPressed.ArrowRight) jaguar.rotation.y -= rotationSpeed;

        // Accel dynamique
        if (engineAccel && keysPressed.ArrowUp) {
          if (!engineAccel.isPlaying) engineAccel.play();
        } else {
          if (engineAccel && engineAccel.isPlaying) engineAccel.stop();
        }

        const localOffset = new THREE.Vector3(0, 0.1, -0.25);
        const worldOffset = localOffset
          .clone()
          .applyMatrix4(jaguar.matrixWorld);
        camera.position.lerp(worldOffset, 0.25);
        camera.lookAt(jaguar.position);
      }

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEscape);

    // CLEANUP
    return () => {
      isModalOpen = false;
      disposed = true;

      renderer.dispose();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleEscape);
      window.removeEventListener("keydown", keyDownHandler);
      window.removeEventListener("keyup", keyUpHandler);
      container.remove();

      engineIdle?.isPlaying && engineIdle.stop();
      engineAccel?.isPlaying && engineAccel.stop();
      ambientSound?.isPlaying && ambientSound.stop();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content-banner">
          <h1>🚧 En construction !</h1>
          <button onClick={onClose}>Quitter le Showroom ❌</button>
        </div>

        {/* Touch Controls */}
        <div className="touch-controls">
          <button id="mobile-accelerate">Avancer ⏫</button>
          <button id="mobile-left">Gauche ⬅️</button>
          <button id="mobile-right">Droite ➡️</button>
        </div>
      </div>
    </div>
  );
};
