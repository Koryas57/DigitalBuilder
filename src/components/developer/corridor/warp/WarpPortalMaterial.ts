import * as THREE from "three";

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uDistortion;

  varying vec2 vUv;
  varying float vWarp;

  void main() {
    vUv = uv;
    vec3 transformed = position;
    vec2 centeredUv = uv - 0.5;
    float edgeWeight = smoothstep(0.08, 0.72, length(centeredUv * vec2(1.0, 0.78)));
    float ripple =
      sin(centeredUv.y * 18.0 + uTime * 1.7) *
      cos(centeredUv.x * 13.0 - uTime * 1.25);
    vWarp = ripple;
    transformed.z += ripple * 0.035 * uDistortion * edgeWeight;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uIntensity;
  uniform float uHover;
  uniform vec2 uResolution;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uDistortion;
  uniform float uPulse;
  uniform float uLayer;

  varying vec2 vUv;
  varying float vWarp;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0)), f.x),
      f.y
    );
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 4; i++) {
      value += amplitude * noise(p);
      p = rotation * p * 2.03 + 7.17;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    float aspectInfluence = clamp(uResolution.x / max(uResolution.y, 1.0), 0.65, 2.0);
    p.x *= mix(1.0, 0.96, aspectInfluence * 0.1);

    float radius = length(p);
    float angle = atan(p.y, p.x);
    float swirl = angle + (1.0 - radius) * 2.4 + uTime * 0.34;
    vec2 twisted = vec2(cos(swirl), sin(swirl)) * radius;

    float coarseNoise = fbm(twisted * 3.2 + vec2(uTime * 0.18, -uTime * 0.14));
    float fineNoise = fbm(p * 8.0 - vec2(uTime * 0.28, uTime * 0.21));
    float organicRadius =
      0.79 +
      (coarseNoise - 0.5) * 0.20 * uDistortion +
      sin(angle * 5.0 + uTime * 0.9) * 0.035 +
      vWarp * 0.018;
    float sdf = organicRadius - radius;
    float inside = smoothstep(-0.055, 0.06, sdf);
    float edge = 1.0 - smoothstep(0.018, 0.16, abs(sdf));
    float outerFade = smoothstep(-0.15, 0.045, sdf);
    float colorMix = clamp(coarseNoise * 0.75 + fineNoise * 0.32 + sin(angle * 3.0) * 0.08, 0.0, 1.0);
    vec3 energyColor = mix(uColorA, uColorB, colorMix);
    float pulse = 0.82 + uPulse * 0.18 + uHover * 0.14;

    vec3 color;
    float alpha;

    if (uLayer < 0.5) {
      float depthGlow = pow(max(0.0, 1.0 - radius / max(organicRadius, 0.001)), 2.2);
      float movingDepth = fbm(twisted * 5.0 - uTime * 0.22);
      color = vec3(0.0015, 0.002, 0.004);
      color += energyColor * depthGlow * movingDepth * 0.035;
      alpha = inside * (0.955 - edge * 0.18);
    } else if (uLayer < 1.5) {
      float tornEdge = edge * (0.64 + fineNoise * 0.82);
      float filament = pow(max(0.0, sin(swirl * 7.0 - uTime * 2.1) * 0.5 + 0.5), 7.0);
      color = energyColor * (1.45 + fineNoise * 1.2 + uHover * 0.45);
      alpha = outerFade * (tornEdge + filament * edge * 0.42) * pulse;
    } else {
      float spiralA = pow(max(0.0, sin(swirl * 5.0 - radius * 19.0 + uTime * 1.5) * 0.5 + 0.5), 9.0);
      float spiralB = pow(max(0.0, sin(swirl * -3.0 - radius * 13.0 - uTime) * 0.5 + 0.5), 12.0);
      float innerFade = inside * smoothstep(0.05, 0.72, radius);
      color = mix(uColorB, uColorA, fineNoise) * (0.48 + uHover * 0.25);
      alpha = innerFade * (spiralA * 0.22 + spiralB * 0.12) * pulse;
    }

    alpha *= uIntensity;
    if (alpha < 0.008) discard;
    gl_FragColor = vec4(color * uIntensity, clamp(alpha, 0.0, 1.0));
  }
`;

export type WarpMaterialLayer = "core" | "rim" | "distortion";

const layerValue: Record<WarpMaterialLayer, number> = {
  core: 0,
  rim: 1,
  distortion: 2,
};

export const createWarpPortalMaterial = (
  layer: WarpMaterialLayer,
  colorA: THREE.ColorRepresentation,
  colorB: THREE.ColorRepresentation,
  intensity: number,
  distortion: number
) => {
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uHover: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
      uDistortion: { value: distortion },
      uPulse: { value: 0 },
      uLayer: { value: layerValue[layer] },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: layer === "core" ? THREE.NormalBlending : THREE.AdditiveBlending,
  });

  material.toneMapped = false;
  return material;
};
