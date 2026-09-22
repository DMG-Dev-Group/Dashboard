import type { Evento, Projeto } from "@/lib/store/types";
import { ApiError } from "./http";
import { createDocument, getDocument, listDocuments } from "./firestore";

export type ProjectRecordType =
  | "summary"
  | "decision"
  | "task"
  | "requirement"
  | "question"
  | "note"
  | "attachment";

export interface ProjectRecord {
  id: string;
  projectId: string;
  type: ProjectRecordType;
  content: string;
  workstream?: string;
  attachments?: Array<{ url: string; name?: string; mimeType?: string }>;
  source: {
    system: "kevin";
    mode: "explicit_request" | "approved_proposal";
    requestedBy: string;
    requestId: string;
  };
  createdAt: string;
}

export interface ProjectReference {
  id: string;
  nome: string;
  aliases: string[];
  workstreams: string[];
}

export interface ProjectDetail extends ProjectReference {
  tipo?: Projeto["tipo"];
  clienteId?: Projeto["clienteId"];
  resp?: Projeto["resp"];
  status: Projeto["status"];
  progresso: Projeto["progresso"];
  valor?: Projeto["valor"];
  stack?: Projeto["stack"];
  repo?: Projeto["repo"];
  url?: Projeto["url"];
  desc?: Projeto["desc"];
  notas?: Projeto["notas"];
  todos?: Projeto["todos"];
}

function normalized(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function projectReference(
  project: Projeto & { aliases?: unknown; frentes?: unknown },
): ProjectReference {
  const workstreams = stringArray(project.frentes);
  return {
    id: project.id,
    nome: project.nome,
    aliases: stringArray(project.aliases),
    workstreams,
  };
}

function projectDetail(project: Projeto & { aliases?: unknown; frentes?: unknown }): ProjectDetail {
  return {
    ...projectReference(project),
    tipo: project.tipo,
    clienteId: project.clienteId,
    resp: project.resp,
    status: project.status,
    progresso: project.progresso,
    valor: project.valor,
    stack: project.stack,
    repo: project.repo,
    url: project.url,
    desc: project.desc,
    notas: project.notas,
    todos: project.todos,
  };
}

export async function listProjects(query?: string): Promise<ProjectReference[]> {
  const projects = await listDocuments<Projeto & { aliases?: unknown; frentes?: unknown }>(
    "projetos",
  );
  const reference = normalized(query ?? "");
  const candidates = projects.map(projectReference);

  if (!reference) return candidates;

  return candidates.filter((project) =>
    [project.nome, ...project.aliases, ...project.workstreams].some((value) =>
      normalized(value).includes(reference),
    ),
  );
}

export async function getProject(projectId: string): Promise<ProjectDetail> {
  const project = await getDocument<Projeto & { aliases?: unknown; frentes?: unknown }>(
    "projetos",
    projectId,
  );
  if (!project) throw new ApiError(404, "project_not_found", "Projeto não encontrado.");
  return projectDetail(project);
}

export async function resolveProject(reference: string): Promise<ProjectReference[]> {
  const projects = await listProjects();
  const needle = normalized(reference);
  if (!needle)
    throw new ApiError(400, "invalid_project_reference", "Informe a referência do projeto.");

  const exact = projects.filter((project) =>
    [project.nome, ...project.aliases, ...project.workstreams].some(
      (value) => normalized(value) === needle,
    ),
  );
  if (exact.length > 0) return exact;

  return projects.filter((project) =>
    [project.nome, ...project.aliases, ...project.workstreams].some((value) => {
      const candidate = normalized(value);
      return candidate.includes(needle) || needle.includes(candidate);
    }),
  );
}

export async function listProjectRecords(projectId: string): Promise<ProjectRecord[]> {
  await getProject(projectId);
  const records = await listDocuments<ProjectRecord>("registrosProjeto");
  return records
    .filter((record) => record.projectId === projectId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function addProjectRecord(
  input: Omit<ProjectRecord, "id" | "createdAt">,
): Promise<{ record: ProjectRecord; created: boolean }> {
  await getProject(input.projectId);
  const existingRecords = await listDocuments<ProjectRecord>("registrosProjeto");
  const existingRecord = existingRecords.find(
    (record) => record.source?.requestId === input.source.requestId,
  );
  if (existingRecord) {
    const sameRecord =
      existingRecord.projectId === input.projectId &&
      existingRecord.type === input.type &&
      existingRecord.content === input.content;
    if (sameRecord) return { record: existingRecord, created: false };
    throw new ApiError(
      409,
      "idempotency_conflict",
      "source.requestId já foi usado para registrar outra informação.",
    );
  }

  const createdAt = new Date().toISOString();
  const record = await createDocument<Omit<ProjectRecord, "id">>("registrosProjeto", {
    ...input,
    createdAt,
  });
  await createDocument("atividades", {
    tipo: "kevin",
    texto: `Kevin registrou ${input.type} no projeto ${input.projectId}.`,
    ts: Date.now(),
    origem: "kevin",
    projetoId: input.projectId,
    registroId: record.id,
  });
  return { record, created: true };
}

export async function listTodayCalendarEvents(
  date: string,
): Promise<Array<Evento & { id: string }>> {
  const events = await listDocuments<Evento>("eventos");
  return events.filter(
    (event) => event.data === date && (event.tipo === "reuniao" || event.tipo === "entrega"),
  );
}
