import React, { useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import './JaguarModel.scss';
import { Showroom } from '../../components/Showroom/Showroom';

export const JaguarModel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  useEffect(() => {

    // --------------------[SCENE]-------------------- //

    const container = document.createElement('div');
    const footer = document.querySelector('footer .logoContainer')
    container.className = 'jaguar-showroom';
    footer?.appendChild(container);

    const renderer = new THREE.WebGLRenderer({
       antialias: true,
       alpha: true
      });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(45, 150 / 75, 0.1, 1000);
    camera.position.set(0, 0.5, 2);
    camera.position.y += 0.1; // Augmentez cette valeur pour monter la vue de la caméra
    camera.lookAt(0, 0, 0); // Assurez-vous que la caméra est bien orientée vers le centre  de la scène


    // --------------------[LIGHTS]-------------------- //

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(0, 5, 0);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    scene.add(directionalLight.target);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Ajout de points lumineux
    const pointLights = [
      new THREE.PointLight(0xffffff, 0.7),
      new THREE.PointLight(0xffffff, 0.7),
      new THREE.PointLight(0xffffff, 0.5)
    ];
    pointLights[0].position.set(-2, 1, 2);
    pointLights[1].position.set(2, 1, 2);
    pointLights[2].position.set(0, 1, -2);
    pointLights.forEach(light => scene.add(light));

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.2);
    hemiLight.position.set(0, 5, 0);
    scene.add(hemiLight);


    // --------------------[LOADER]-------------------- //

    const loader = new GLTFLoader();
    loader.load(
      '/assets/models/Jaguar/scene.gltf',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(15, 15, 15);
        model.rotation.x = Math.PI;
        model.rotation.z = Math.PI;
        model.rotation.y = Math.PI / 2;

        model.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            node.castShadow = true;
            node.receiveShadow = true;
            node.material = new THREE.MeshPhysicalMaterial({
              color: (node.material as THREE.MeshStandardMaterial).color,
              roughness: 0.2,
              metalness: 0.8,
              clearcoat: 1.0,
              clearcoatRoughness: 0.1,
            });
          }
        });
        scene.add(model);

        // Animation du modèle
        const animate = () => {
          requestAnimationFrame(animate);
          model.rotation.y += 0.0040;
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => console.error('Erreur lors du chargement du modèle :', error)
    );

    // Ouvrir la modale au clic sur le conteneur
    container.onclick = openModal;

    // Cleanup à la fin
    return () => {
      renderer.dispose();
      footer?.removeChild(container);
    };
  }, []);

  return (
    <>
      {isOpen && <Showroom isOpen={isOpen} onClose={closeModal} />}
    </>
  );
};
