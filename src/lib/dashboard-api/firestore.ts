import { getDashboardApiConfig, type DashboardApiConfig } from "./config";
import { ApiError } from "./http";

type FirestoreValue = {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string;
  doubleValue?: number;
  timestampValue?: string;
  stringValue?: string;
  bytesValue?: string;
  referenceValue?: string;
  geoPointValue?: unknown;
  arrayValue?: { values?: FirestoreValue[] };
  mapValue?: { fields?: Record<string, FirestoreValue> };
};

interface FirestoreDocument {
  name: string;
  fields?: Record<string, FirestoreValue>;
  createTime?: string;
  updateTime?: string;
}

interface TokenCache {
  value: string;
  expiresAt: number;
}

interface FirestoreGlobal {
  __dashboardFirestoreToken?: TokenCache;
}

function base64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64(value: string): ArrayBuffer {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes.buffer;
}

function privateKeyBytes(privateKey: string): ArrayBuffer {
  const body = privateKey
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "");
  return decodeBase64(body);
}

async function createServiceJwt(config: DashboardApiConfig): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const encoder = new TextEncoder();
  const header = base64Url(encoder.encode(JSON.stringify({ alg: "RS256", typ: "JWT" })));
  const claims = base64Url(
    encoder.encode(
      JSON.stringify({
        iss: config.firebase.clientEmail,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600,
      }),
    ),
  );
  const unsignedJwt = `${header}.${claims}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    privateKeyBytes(config.firebase.privateKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    encoder.encode(unsignedJwt),
  );

  return `${unsignedJwt}.${base64Url(new Uint8Array(signature))}`;
}

async function getAccessToken(): Promise<string> {
  const runtime = globalThis as unknown as FirestoreGlobal;
  const cached = runtime.__dashboardFirestoreToken;
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.value;

  const serviceJwt = await createServiceJwt(getDashboardApiConfig());
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: serviceJwt,
  });
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    console.error("[Dashboard API] Falha ao obter token do Firebase:", await response.text());
    throw new ApiError(
      503,
      "datastore_unavailable",
      "Não foi possível autenticar no banco de dados.",
    );
  }

  const result = (await response.json()) as { access_token?: unknown; expires_in?: unknown };
  if (typeof result.access_token !== "string") {
    throw new ApiError(
      503,
      "datastore_unavailable",
      "O banco de dados não retornou uma credencial válida.",
    );
  }

  const expiresIn = typeof result.expires_in === "number" ? result.expires_in : 3000;
  runtime.__dashboardFirestoreToken = {
    value: result.access_token,
    expiresAt: Date.now() + expiresIn * 1000,
  };
  return result.access_token;
}

function documentUrl(path = ""): string {
  const projectId = getDashboardApiConfig().firebase.projectId;
  return `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents${path}`;
}

async function firestoreFetch(path: string, init?: RequestInit): Promise<Response> {
  const accessToken = await getAccessToken();
  return fetch(documentUrl(path), {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      ...(init?.headers ?? {}),
    },
  });
}

function decodeValue(value: FirestoreValue): unknown {
  if ("nullValue" in value) return null;
  if (typeof value.booleanValue === "boolean") return value.booleanValue;
  if (typeof value.integerValue === "string") return Number(value.integerValue);
  if (typeof value.doubleValue === "number") return value.doubleValue;
  if (typeof value.timestampValue === "string") return value.timestampValue;
  if (typeof value.stringValue === "string") return value.stringValue;
  if (typeof value.bytesValue === "string") return value.bytesValue;
  if (typeof value.referenceValue === "string") return value.referenceValue;
  if (value.arrayValue) return (value.arrayValue.values ?? []).map(decodeValue);
  if (value.mapValue) return decodeFields(value.mapValue.fields ?? {});
  return null;
}

function decodeFields(fields: Record<string, FirestoreValue>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, decodeValue(value)]),
  );
}

function encodeValue(value: unknown): FirestoreValue {
  if (value === null) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") {
    if (!Number.isFinite(value))
      throw new ApiError(400, "invalid_value", "Números devem ser finitos.");
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) return { arrayValue: { values: value.map(encodeValue) } };
  if (typeof value === "object") {
    return { mapValue: { fields: encodeFields(value as Record<string, unknown>) } };
  }
  throw new ApiError(400, "invalid_value", "O registro contém um tipo de dado não suportado.");
}

function encodeFields(value: object): Record<string, FirestoreValue> {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encodeValue(item)]));
}

export function entityFromDocument<T extends object>(
  document: FirestoreDocument,
): T & { id: string } {
  const id = document.name.split("/").at(-1);
  if (!id)
    throw new ApiError(
      502,
      "invalid_datastore_response",
      "O banco retornou um documento inválido.",
    );
  return { ...decodeFields(document.fields ?? {}), id } as T & { id: string };
}

export async function getDocument<T extends object>(
  collection: string,
  id: string,
): Promise<(T & { id: string }) | null> {
  const response = await firestoreFetch(
    `/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
  );
  if (response.status === 404) return null;
  if (!response.ok)
    throw new ApiError(
      503,
      "datastore_unavailable",
      "Não foi possível consultar o banco de dados.",
    );
  return entityFromDocument<T>((await response.json()) as FirestoreDocument);
}

export async function listDocuments<T extends object>(
  collection: string,
): Promise<Array<T & { id: string }>> {
  const documents: Array<T & { id: string }> = [];
  let pageToken: string | undefined;

  do {
    const query = new URLSearchParams({ pageSize: "100" });
    if (pageToken) query.set("pageToken", pageToken);
    const response = await firestoreFetch(`/${encodeURIComponent(collection)}?${query.toString()}`);
    if (!response.ok)
      throw new ApiError(
        503,
        "datastore_unavailable",
        "Não foi possível consultar o banco de dados.",
      );
    const result = (await response.json()) as {
      documents?: FirestoreDocument[];
      nextPageToken?: string;
    };
    documents.push(...(result.documents ?? []).map(entityFromDocument<T>));
    pageToken = result.nextPageToken;
  } while (pageToken);

  return documents;
}

export async function createDocument<T extends object>(
  collection: string,
  fields: T,
): Promise<T & { id: string }> {
  const response = await firestoreFetch(`/${encodeURIComponent(collection)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ fields: encodeFields(fields) }),
  });
  if (!response.ok) {
    console.error("[Dashboard API] Falha ao criar documento:", await response.text());
    throw new ApiError(503, "datastore_unavailable", "Não foi possível salvar no banco de dados.");
  }
  return entityFromDocument<T>((await response.json()) as FirestoreDocument);
}
