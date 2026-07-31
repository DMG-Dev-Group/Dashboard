import * as THREE from "three";

/**
 * Gera a textura da letra gigante (marca d'água) desenhando num canvas 2D
 * offscreen — sem depender de carregar fontes externas (Text3D exigiria um
 * .json de fonte; isso funciona 100% offline com a fonte do sistema).
 */
export function createLetterTexture(letter: string, color = "rgba(255,90,90,0.16)"): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, size, size);
  ctx.font = `900 ${size * 0.9}px Georgia, "Times New Roman", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(letter, size / 2, size * 0.58);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/** Textura pequena com o texto de um chip de stack (ex.: "React"). */
export function createChipTexture(label: string): THREE.CanvasTexture {
  const w = 512;
  const h = 160;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);

  const radius = 40;
  ctx.beginPath();
  ctx.moveTo(radius, 4);
  ctx.arcTo(w - 4, 4, w - 4, h - 4, radius);
  ctx.arcTo(w - 4, h - 4, 4, h - 4, radius);
  ctx.arcTo(4, h - 4, 4, 4, radius);
  ctx.arcTo(4, 4, w - 4, 4, radius);
  ctx.closePath();
  ctx.fillStyle = "rgba(15,4,4,0.82)";
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "rgba(255,77,79,0.55)";
  ctx.stroke();

  ctx.font = `700 64px Geist, Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffe4e4";
  ctx.fillText(label, w / 2, h / 2 + 4);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/** Textura com nome + idade, desenhada nítida (2x) pra ficar legível gravada no vidro. */
export function createLabelTexture(name: string, age: string): THREE.CanvasTexture {
  const w = 900;
  const h = 260;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, w, h);
  ctx.textAlign = "center";

  ctx.font = `700 34px Geist Mono, ui-monospace, monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.42)";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`// ${name.toLowerCase()}`, w / 2, 56);

  ctx.font = `900 92px Geist, Arial, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(name, w / 2, 160);

  ctx.font = `600 32px Geist Mono, ui-monospace, monospace`;
  ctx.fillStyle = "rgba(255,255,255,0.38)";
  ctx.fillText(age, w / 2, 212);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}
