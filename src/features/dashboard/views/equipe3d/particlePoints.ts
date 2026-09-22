import * as THREE from "three";

/**
 * Rasteriza uma letra num canvas offscreen e amostra pontos dentro do
 * glifo (alpha > limiar) pra usar como posições de repouso das partículas.
 * Retorna um plano XY centrado em (0,0), com um leve jitter em Z pra dar volume.
 */
export function sampleLetterPoints(letter: string, count: number, height = 2.6): Float32Array {
  const res = 256;
  const canvas = document.createElement("canvas");
  canvas.width = res;
  canvas.height = res;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, res, res);
  ctx.fillStyle = "#fff";
  ctx.font = `900 ${res * 0.82}px Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(letter, res / 2, res * 0.56);

  const { data } = ctx.getImageData(0, 0, res, res);
  const candidates: number[] = [];
  for (let y = 0; y < res; y++) {
    for (let x = 0; x < res; x++) {
      if (data[(y * res + x) * 4 + 3] > 128) candidates.push(x, y);
    }
  }

  const positions = new Float32Array(count * 3);
  const n = candidates.length / 2;
  for (let i = 0; i < count; i++) {
    const pick = n ? Math.floor(Math.random() * n) : 0;
    const x = n ? candidates[pick * 2] : res / 2;
    const y = n ? candidates[pick * 2 + 1] : res / 2;
    const jx = x + (Math.random() - 0.5) * 1.4;
    const jy = y + (Math.random() - 0.5) * 1.4;
    const nx = (jx / res - 0.5) * height;
    const ny = -(jy / res - 0.5) * height;
    // volume bem mais profundo — a letra é um bloco 3D de partículas, não um plano fino
    const nz = (Math.random() - 0.5) * height * 0.55;
    positions[i * 3] = nx;
    positions[i * 3 + 1] = ny;
    positions[i * 3 + 2] = nz;
  }
  return positions;
}

/** Sprite circular suave (glow) usado como textura de cada ponto. */
export function createDotTexture(): THREE.CanvasTexture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.3, "rgba(255,255,255,0.9)");
  grad.addColorStop(0.6, "rgba(255,255,255,0.45)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
