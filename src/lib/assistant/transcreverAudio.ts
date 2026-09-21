import { createServerFn } from "@tanstack/react-start";

export interface TranscricaoResponse {
  texto: string | null;
  erro: string | null;
}

// Mesmo modelo do chat em askAssistant.ts — o Gemini entende áudio nativamente
// (multimodal) via generateContent, então não precisa de um modelo separado
// tipo o Whisper da Groq. Configurável pelo mesmo motivo (troca sem deploy se
// o Google descontinuar/renomear).
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";

/**
 * Transcreve um áudio curto (comando de voz do Trevor) via compreensão nativa
 * de áudio do Gemini — diferente da Groq (endpoint dedicado de transcrição
 * tipo Whisper, que espera multipart/FormData), o Gemini recebe o áudio
 * inline como base64 dentro do próprio JSON de generateContent, então não
 * precisa reconstruir Blob/FormData no servidor: o base64 que já chega do
 * client vai direto no corpo da requisição.
 */
export const transcreverAudio = createServerFn({ method: "POST" })
  .validator((data: { audioBase64: string; mimeType: string }) => data)
  .handler(async ({ data }): Promise<TranscricaoResponse> => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        texto: null,
        erro: "Trevor ainda não está configurado — falta a GEMINI_API_KEY no servidor.",
      };
    }

    let res: Response;
    try {
      res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Transcreva o áudio a seguir, em português do Brasil. Responda só com o texto transcrito, sem nenhum comentário, formatação ou pontuação extra além da fala em si.",
                  },
                  { inline_data: { mime_type: data.mimeType, data: data.audioBase64 } },
                ],
              },
            ],
          }),
        },
      );
    } catch (err) {
      console.error("[assistant] falha de rede ao transcrever áudio:", err);
      return {
        texto: null,
        erro: "Não consegui falar com o Trevor agora — tenta de novo em instantes.",
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[assistant] Gemini respondeu erro na transcrição:", res.status, errText);
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

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const texto = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return {
      texto: texto || null,
      erro: texto ? null : "Não peguei nada no áudio — tenta falar de novo.",
    };
  });
