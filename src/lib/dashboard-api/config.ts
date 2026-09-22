export interface DashboardApiConfig {
  apiKey: string;
  firebase: {
    projectId: string;
    clientEmail: string;
    privateKey: string;
  };
}

type RuntimeBindings = Record<string, unknown>;

interface RuntimeGlobal {
  __dashboardRuntimeEnv?: RuntimeBindings;
  process?: { env?: Record<string, string | undefined> };
}

function readRuntimeValue(name: string): string | undefined {
  const runtime = globalThis as unknown as RuntimeGlobal;
  const boundValue = runtime.__dashboardRuntimeEnv?.[name];

  if (typeof boundValue === "string" && boundValue.length > 0) return boundValue;

  const processValue = runtime.process?.env?.[name];
  return processValue && processValue.length > 0 ? processValue : undefined;
}

function required(name: string): string {
  const value = readRuntimeValue(name);
  if (!value) throw new Error(`Configuração ausente: ${name}`);
  return value;
}

interface ServiceAccount {
  project_id?: unknown;
  client_email?: unknown;
  private_key?: unknown;
}

function firebaseCredentials(): DashboardApiConfig["firebase"] {
  const serializedAccount = readRuntimeValue("FIREBASE_SERVICE_ACCOUNT_JSON");

  if (serializedAccount) {
    let account: ServiceAccount;
    try {
      account = JSON.parse(serializedAccount) as ServiceAccount;
    } catch {
      throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não contém um JSON válido.");
    }

    if (
      typeof account.project_id === "string" &&
      typeof account.client_email === "string" &&
      typeof account.private_key === "string"
    ) {
      return {
        projectId: account.project_id,
        clientEmail: account.client_email,
        privateKey: account.private_key.replace(/\\n/g, "\n"),
      };
    }

    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não possui as credenciais necessárias.");
  }

  return {
    projectId: required("FIREBASE_PROJECT_ID"),
    clientEmail: required("FIREBASE_CLIENT_EMAIL"),
    privateKey: required("FIREBASE_PRIVATE_KEY").replace(/\\n/g, "\n"),
  };
}

export function getDashboardApiConfig(): DashboardApiConfig {
  return {
    apiKey: required("DASHBOARD_API_KEY"),
    firebase: firebaseCredentials(),
  };
}

export function hasDashboardApiConfig(): boolean {
  try {
    getDashboardApiConfig();
    return true;
  } catch {
    return false;
  }
}

export function getAllowedApiOrigin(): string | undefined {
  return readRuntimeValue("DASHBOARD_API_ALLOWED_ORIGIN");
}
