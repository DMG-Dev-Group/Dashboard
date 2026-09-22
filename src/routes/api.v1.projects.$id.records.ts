import { createFileRoute } from "@tanstack/react-router";
import { requireServiceAuthorization } from "@/lib/dashboard-api/auth";
import { ApiError, errorResponse, handleOptions, json, readJson } from "@/lib/dashboard-api/http";
import {
  addProjectRecord,
  listProjectRecords,
  type ProjectRecordType,
} from "@/lib/dashboard-api/projects";

const RECORD_TYPES = new Set<ProjectRecordType>([
  "summary",
  "decision",
  "task",
  "requirement",
  "question",
  "note",
  "attachment",
]);

type RecordRequest = {
  type?: unknown;
  content?: unknown;
  workstream?: unknown;
  attachments?: unknown;
  source?: {
    mode?: unknown;
    requestedBy?: unknown;
    requestId?: unknown;
  };
};

function requiredText(value: unknown, field: string, maximum: number): string {
  if (typeof value !== "string" || value.trim().length === 0 || value.trim().length > maximum) {
    throw new ApiError(
      400,
      "invalid_record",
      `${field} deve ser um texto de até ${maximum} caracteres.`,
    );
  }
  return value.trim();
}

function parseAttachments(
  value: unknown,
): Array<{ url: string; name?: string; mimeType?: string }> | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value) || value.length > 10) {
    throw new ApiError(400, "invalid_record", "attachments deve conter no máximo 10 anexos.");
  }

  return value.map((attachment) => {
    if (!attachment || typeof attachment !== "object") {
      throw new ApiError(400, "invalid_record", "Cada anexo deve ser um objeto válido.");
    }
    const candidate = attachment as Record<string, unknown>;
    const url = requiredText(candidate.url, "attachments[].url", 2_000);
    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.protocol !== "https:") throw new Error("protocol");
    } catch {
      throw new ApiError(400, "invalid_record", "attachments[].url deve usar HTTPS.");
    }
    const name =
      candidate.name === undefined
        ? undefined
        : requiredText(candidate.name, "attachments[].name", 300);
    const mimeType =
      candidate.mimeType === undefined
        ? undefined
        : requiredText(candidate.mimeType, "attachments[].mimeType", 150);
    return { url, name, mimeType };
  });
}

function parseRecord(projectId: string, body: unknown) {
  if (!body || typeof body !== "object") {
    throw new ApiError(400, "invalid_record", "O corpo deve ser um objeto JSON.");
  }

  const record = body as RecordRequest;
  if (typeof record.type !== "string" || !RECORD_TYPES.has(record.type as ProjectRecordType)) {
    throw new ApiError(400, "invalid_record", "type não é um tipo de registro permitido.");
  }

  const source = record.source;
  if (!source || typeof source !== "object") {
    throw new ApiError(400, "invalid_record", "source é obrigatório.");
  }
  const rawMode = source.mode;
  if (rawMode !== "explicit_request" && rawMode !== "approved_proposal") {
    throw new ApiError(
      400,
      "invalid_record",
      "source.mode deve ser explicit_request ou approved_proposal.",
    );
  }
  const mode: "explicit_request" | "approved_proposal" = rawMode;
  const requestId = requiredText(source.requestId, "source.requestId", 200);

  return {
    projectId,
    type: record.type as ProjectRecordType,
    content: requiredText(record.content, "content", 12_000),
    workstream:
      record.workstream === undefined
        ? undefined
        : requiredText(record.workstream, "workstream", 300),
    attachments: parseAttachments(record.attachments),
    source: {
      system: "kevin" as const,
      mode,
      requestedBy: requiredText(source.requestedBy, "source.requestedBy", 200),
      requestId,
    },
  };
}

export const Route = createFileRoute("/api/v1/projects/$id/records")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        try {
          requireServiceAuthorization(request);
          return json(request, { data: await listProjectRecords(params.id) });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      POST: async ({ request, params }) => {
        try {
          requireServiceAuthorization(request);
          const body = await readJson(request);
          const result = await addProjectRecord(parseRecord(params.id, body));
          return json(request, { data: result.record }, { status: result.created ? 201 : 200 });
        } catch (error) {
          return errorResponse(request, error);
        }
      },
      OPTIONS: async ({ request }) => handleOptions(request),
    },
  },
});
