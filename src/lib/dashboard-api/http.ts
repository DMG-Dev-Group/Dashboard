import { getAllowedApiOrigin } from "./config";

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

function apiHeaders(request: Request, extra?: HeadersInit): Headers {
  const headers = new Headers(extra);
  headers.set("cache-control", "no-store");
  headers.set("vary", "origin");

  const allowedOrigin = getAllowedApiOrigin();
  const requestOrigin = request.headers.get("origin");
  if (allowedOrigin && requestOrigin === allowedOrigin) {
    headers.set("access-control-allow-origin", allowedOrigin);
    headers.set("access-control-allow-headers", "authorization, content-type, x-request-id");
    headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  }

  return headers;
}

export function json(request: Request, body: unknown, init?: ResponseInit): Response {
  return Response.json(body, {
    ...init,
    headers: apiHeaders(request, init?.headers),
  });
}

export function noContent(request: Request): Response {
  return new Response(null, { status: 204, headers: apiHeaders(request) });
}

export function errorResponse(request: Request, error: unknown): Response {
  const requestId = request.headers.get("x-request-id") ?? crypto.randomUUID();

  if (error instanceof ApiError) {
    return json(
      request,
      { error: { code: error.code, message: error.message, requestId } },
      { status: error.status },
    );
  }

  console.error("[Dashboard API]", requestId, error);
  return json(
    request,
    { error: { code: "internal_error", message: "Erro interno da API.", requestId } },
    { status: 500 },
  );
}

export async function readJson(request: Request): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(length) && length > 1_000_000) {
    throw new ApiError(413, "payload_too_large", "O corpo da requisição excede 1 MB.");
  }

  try {
    return await request.json();
  } catch {
    throw new ApiError(400, "invalid_json", "O corpo da requisição deve ser um JSON válido.");
  }
}

export function handleOptions(request: Request): Response {
  return noContent(request);
}
