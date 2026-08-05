/**
 * Sem Firebase Storage configurado no projeto — imagens de notas/tarefas
 * viram data URL (comprimida) guardada direto no documento. Por isso o
 * limite é conservador: precisa caber com folga no limite de 1MiB por
 * documento do Firestore.
 */
const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.82;
const MAX_DATA_URL_BYTES = 700_000;

export class ImagemMuitoGrandeError extends Error {
  constructor() {
    super("Imagem muito grande mesmo após compressão — tente uma imagem menor.");
    this.name = "ImagemMuitoGrandeError";
  }
}

export function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o arquivo"));
    reader.onload = () => {
      img.onerror = () => reject(new Error("Arquivo não é uma imagem válida"));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas indisponível"));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        if (dataUrl.length > MAX_DATA_URL_BYTES) {
          reject(new ImagemMuitoGrandeError());
          return;
        }
        resolve(dataUrl);
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function extrairImagemDoClipboard(e: ClipboardEvent | React.ClipboardEvent): File | null {
  const items = e.clipboardData?.items;
  if (!items) return null;
  for (const item of Array.from(items)) {
    if (item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) return file;
    }
  }
  return null;
}

export function extrairImagensDoDrop(e: DragEvent | React.DragEvent): File[] {
  const files = e.dataTransfer?.files;
  if (!files) return [];
  return Array.from(files).filter((f) => f.type.startsWith("image/"));
}
