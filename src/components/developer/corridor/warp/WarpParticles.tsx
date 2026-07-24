import React from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface WarpParticlesProps {
  width: number;
  height: number;
  colorA: THREE.ColorRepresentation;
  colorB: THREE.ColorRepresentation;
  desktopCount: number;
  mobileCount: number;
  intensity: number;
}

const seededValue = (index: number, salt: number) => {
  const value = Math.sin(index * 91.731 + salt * 17.147) * 43758.5453;
  return value - Math.floor(value);
};

export const WarpParticles: React.FC<WarpParticlesProps> = ({
  width,
  height,
  colorA,
  colorB,
  desktopCount,
  mobileCount,
  intensity,
}) => {
  const count = React.useMemo(
    () =>
      typeof window !== "undefined" && (window.innerWidth < 720 || window.devicePixelRatio > 2)
        ? mobileCount
        : desktopCount,
    [desktopCount, mobileCount]
  );
  const positionAttributeRef = React.useRef<THREE.BufferAttribute>(null);
  const sizeAttributeRef = React.useRef<THREE.BufferAttribute>(null);
  const opacityAttributeRef = React.useRef<THREE.BufferAttribute>(null);
  const particleData = React.useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    const visualSeeds = new Float32Array(count);
    const seeds = new Float32Array(count * 5);
    const firstColor = new THREE.Color(colorA);
    const secondColor = new THREE.Color(colorB);
    const mixedColor = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const offset = index * 5;
      seeds[offset] = seededValue(index, 1) * Math.PI * 2;
      seeds[offset + 1] = 0.72 + seededValue(index, 2) * 0.62;
      seeds[offset + 2] = seededValue(index, 3);
      seeds[offset + 3] = 0.035 + seededValue(index, 4) * 0.045;
      seeds[offset + 4] = seededValue(index, 5);
      visualSeeds[index] = seededValue(index, 7);
      sizes[index] = 0.42 + seededValue(index, 8) * 0.32;
      opacities[index] = 0;

      mixedColor.copy(firstColor).lerp(secondColor, seededValue(index, 6));
      colors[index * 3] = mixedColor.r;
      colors[index * 3 + 1] = mixedColor.g;
      colors[index * 3 + 2] = mixedColor.b;
    }

    return { positions, colors, sizes, opacities, visualSeeds, seeds };
  }, [colorA, colorB, count]);
  const material = React.useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: intensity },
        },
        vertexShader: /* glsl */ `
          attribute float aSize;
          attribute float aOpacity;
          attribute float aSeed;

          varying vec3 vColor;
          varying float vOpacity;
          varying float vSeed;

          void main() {
            vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
            vColor = color;
            vOpacity = aOpacity;
            vSeed = aSeed;
            gl_PointSize = aSize * (190.0 / max(1.0, -viewPosition.z));
            gl_Position = projectionMatrix * viewPosition;
          }
        `,
        fragmentShader: /* glsl */ `
          precision highp float;

          uniform float uTime;
          uniform float uIntensity;

          varying vec3 vColor;
          varying float vOpacity;
          varying float vSeed;

          float softBlob(vec2 point, vec2 center, vec2 stretch, float radius) {
            vec2 delta = (point - center) * stretch;
            return 1.0 - smoothstep(radius * 0.22, radius, length(delta));
          }

          void main() {
            vec2 uv = gl_PointCoord * 2.0 - 1.0;
            float angle = vSeed * 6.2831853 + sin(uTime * 0.24 + vSeed * 9.0) * 0.34;
            float cosine = cos(angle);
            float sine = sin(angle);
            uv = mat2(cosine, -sine, sine, cosine) * uv;

            float body = softBlob(uv, vec2(0.0, -0.08), vec2(0.82, 1.18), 0.82);
            float upperWisp = softBlob(
              uv,
              vec2(0.17 + sin(vSeed * 17.0) * 0.08, 0.28),
              vec2(1.22, 1.72),
              0.62
            );
            float sideWisp = softBlob(
              uv,
              vec2(-0.26, 0.04 + cos(vSeed * 13.0) * 0.1),
              vec2(1.58, 1.08),
              0.48
            );
            float hollow = softBlob(
              uv,
              vec2(0.04, -0.06),
              vec2(1.2, 1.35),
              0.31
            );
            float turbulence =
              sin(uv.y * 10.0 + uv.x * 7.0 + uTime * 0.65 + vSeed * 20.0) *
              sin(uv.x * 8.0 - uTime * 0.42);
            float smoke = max(body * 0.68, max(upperWisp * 0.72, sideWisp * 0.52));
            smoke *= 0.82 + turbulence * 0.18;
            smoke -= hollow * 0.16;
            smoke = smoothstep(0.035, 0.72, smoke);

            float edgeFade = 1.0 - smoothstep(0.68, 1.0, length(uv));
            float alpha = smoke * edgeFade * vOpacity * uIntensity;
            if (alpha < 0.008) discard;

            vec3 coldSmoke = mix(vec3(0.035, 0.055, 0.075), vColor * 0.72, smoke);
            gl_FragColor = vec4(coldSmoke, alpha * 0.58);
          }
        `,
        transparent: true,
        depthWrite: false,
        vertexColors: true,
        blending: THREE.NormalBlending,
      }),
    [intensity]
  );

  React.useEffect(() => () => material.dispose(), [material]);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime;
    const { positions, sizes, opacities, seeds } = particleData;
    material.uniforms.uTime.value = time;
    material.uniforms.uIntensity.value = intensity;

    for (let index = 0; index < count; index += 1) {
      const seedOffset = index * 5;
      const positionOffset = index * 3;
      const baseAngle = seeds[seedOffset];
      const startRadius = seeds[seedOffset + 1];
      const phase = (seeds[seedOffset + 2] + time * seeds[seedOffset + 3]) % 1;
      const verticalSeed = seeds[seedOffset + 4];
      const radius = THREE.MathUtils.lerp(startRadius, 0.055, phase);
      const angle = baseAngle + time * 0.24 + phase * 3.7;
      const lifeFade = Math.sin(Math.PI * phase);
      const inhaleFade = THREE.MathUtils.smoothstep(1 - phase, 0.02, 0.28);

      positions[positionOffset] = Math.cos(angle) * radius * width;
      positions[positionOffset + 1] =
        Math.sin(angle) * radius * height * 0.54 +
        Math.sin(time * 0.8 + baseAngle) * 0.06 +
        (verticalSeed - 0.5) * 0.18;
      positions[positionOffset + 2] =
        0.12 + Math.sin(angle * 1.7 + phase * Math.PI) * 0.16;
      sizes[index] =
        (0.38 + seeds[seedOffset + 4] * 0.34) *
        (0.72 + lifeFade * 0.5);
      opacities[index] = lifeFade * inhaleFade * (0.34 + seeds[seedOffset + 4] * 0.28);
    }

    if (positionAttributeRef.current) {
      positionAttributeRef.current.needsUpdate = true;
    }
    if (sizeAttributeRef.current) {
      sizeAttributeRef.current.needsUpdate = true;
    }
    if (opacityAttributeRef.current) {
      opacityAttributeRef.current.needsUpdate = true;
    }
  });

  return (
    <points material={material} renderOrder={24} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute
          ref={positionAttributeRef}
          attach="attributes-position"
          args={[particleData.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleData.colors, 3]}
        />
        <bufferAttribute
          ref={sizeAttributeRef}
          attach="attributes-aSize"
          args={[particleData.sizes, 1]}
        />
        <bufferAttribute
          ref={opacityAttributeRef}
          attach="attributes-aOpacity"
          args={[particleData.opacities, 1]}
        />
        <bufferAttribute
          attach="attributes-aSeed"
          args={[particleData.visualSeeds, 1]}
        />
      </bufferGeometry>
    </points>
  );
};
