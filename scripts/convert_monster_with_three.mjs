import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

globalThis.FileReader = class {
  result = null;
  onloadend = null;
  onerror = null;

  readAsArrayBuffer(blob) {
    blob
      .arrayBuffer()
      .then((buffer) => {
        this.result = buffer;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.onerror?.(error);
      });
  }

  readAsDataURL(blob) {
    blob
      .arrayBuffer()
      .then((buffer) => {
        this.result = `data:${blob.type || "application/octet-stream"};base64,${Buffer.from(buffer).toString("base64")}`;
        this.onloadend?.({ target: this });
      })
      .catch((error) => {
        this.onerror?.(error);
      });
  }
};

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SOURCE_FBX = resolve(ROOT, "public/assets/characters/monster-mutant-7/monster_mutant_7.fbx");
const OUTPUT_GLB = resolve(ROOT, "public/assets/characters/monster-mutant-7/monster_mutant_7.glb");

const log = (message, payload) => {
  if (payload === undefined) {
    console.log(`[monster-glb] ${message}`);
    return;
  }
  console.log(`[monster-glb] ${message}`, payload);
};

const sourceBytes = await readFile(SOURCE_FBX);
const loader = new FBXLoader();
const model = loader.parse(
  sourceBytes.buffer.slice(sourceBytes.byteOffset, sourceBytes.byteOffset + sourceBytes.byteLength),
  pathToFileURL(dirname(SOURCE_FBX)).href
);
const animations = model.animations ?? [];

log("FBX parsed", {
  objects: model.children.length,
  animations: animations.length,
});

animations.forEach((clip, index) => {
  log(`clip ${index}`, {
    name: clip.name,
    duration: Number(clip.duration.toFixed(3)),
    tracks: clip.tracks.length,
  });
});

let meshCount = 0;
let skinnedMeshCount = 0;
const runtimeMaterial = new THREE.MeshStandardMaterial({
  name: "MonsterRuntimeSkin1",
  color: "#ffe8dc",
  roughness: 0.58,
  metalness: 0.04,
});

model.traverse((child) => {
  if (!child.isMesh) return;
  meshCount += 1;
  if (child.isSkinnedMesh) skinnedMeshCount += 1;
  child.material = runtimeMaterial;
  child.castShadow = true;
  child.receiveShadow = true;
});

log("Meshes prepared", { meshCount, skinnedMeshCount });

const exporter = new GLTFExporter();
const result = await exporter.parseAsync(model, {
  binary: true,
  animations,
  onlyVisible: false,
  trs: false,
});

const buffer = Buffer.from(result);
await writeFile(OUTPUT_GLB, buffer);

log("GLB exported", {
  output: OUTPUT_GLB,
  sizeMB: Number((buffer.byteLength / 1024 / 1024).toFixed(2)),
});
