import { createServerFn } from "@tanstack/react-start";

export interface TranscricaoResponse {
  texto: string | null;
  erro: string | null;
}

// Mesma lógica do GROQ_MODEL em askAssistant.ts: configurável porque a Groq
// descontinua modelo com frequência. whisper-large-v3-turbo é o modelo de
// transcrição mais rápido da Groq no momento em que isso foi escrito.
const GROQ_WHISPER_MODEL = process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo";

function base64ParaBytes(base64: string): Uint8Array {
  // Evita `Buffer` (só existe em runtime Node) — atob() é global tanto no
  // browser quanto nos runtimes edge/Workers que este app pode rodar.
  const binario = atob(base64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  return bytes;
}

/**
 * Transcreve um áudio curto (comando de voz do Trevor) via Whisper da Groq.
 * Recebe o áudio já em base64 — createServerFn valida os dados como JSON, e
 * mandar multipart/FormData do client pra cá não é suportado, então o
 * blob vira base64 no client e vira Blob de novo aqui pra montar o
 * multipart que a API de transcrição da Groq espera.
 */
export const transcreverAudio = createServerFn({ method: "POST" })
  .validator((data: { audioBase64: string; mimeType: string }) => data)
  .handler(async ({ data }): Promise<TranscricaoResponse> => {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return {
        texto: null,
        erro: "Trevor ainda não está configurado — falta a GROQ_API_KEY no servidor.",
      };
    }

    const form = new FormData();
    // `as ArrayBuffer`: sabemos que nunca é SharedArrayBuffer (o Uint8Array
    // acima foi criado por nós mesmos), mas o tipo de .buffer é o mais amplo
    // ArrayBufferLike, que o TS mais recente não aceita como BlobPart.
    const arquivo = new Blob([base64ParaBytes(data.audioBase64).buffer as ArrayBuffer], {
      type: data.mimeType,
    });
    form.append("file", arquivo, "audio.webm");
    form.append("model", GROQ_WHISPER_MODEL);
    form.append("language", "pt");

    let res: Response;
    try {
      res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
    } catch (err) {
      console.error("[assistant] falha de rede ao transcrever áudio:", err);
      return {
        texto: null,
        erro: "Não consegui falar com o Trevor agora — tenta de novo em instantes.",
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[assistant] Groq respondeu erro na transcrição:", res.status, errText);
      let motivo = errText;
      try {
        const parsed = JSON.parse(errText) as { error?: { message?: string } };
        if (parsed.error?.message) motivo = parsed.error.message;
      } catch {
        // corpo não era JSON — usa o texto cru mesmo
      }
      return {
        texto: null,
        erro: `Trevor não entendeu o áudio (erro ${res.status}): ${motivo || "sem detalhe"}`,
      };
    }

    const json = (await res.json()) as { text?: string };
    const texto = json.text?.trim();
    return {
      texto: texto || null,
      erro: texto ? null : "Não peguei nada no áudio — tenta falar de novo.",
    };
  });
