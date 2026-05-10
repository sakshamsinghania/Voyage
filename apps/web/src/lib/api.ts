export type Role = "user" | "assistant" | "system" | "tool";

export interface Message {
  id: string;
  role: Role;
  content: string;
  model?: string | null;
  input_tokens?: number | null;
  output_tokens?: number | null;
  latency_ms?: number | null;
  created_at: string;
}

export interface SessionSummary {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface SessionDetail extends SessionSummary {
  messages: Message[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

const base = "/api";
const fetchOpts: RequestInit = { credentials: "include" };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      if (body?.detail) detail = body.detail;
    } catch {
      detail = (await res.text().catch(() => res.statusText)) || detail;
    }
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

export class AuthError extends Error {
  constructor() {
    super("auth required");
  }
}

async function jsonAuth<T>(res: Response): Promise<T> {
  if (res.status === 401) throw new AuthError();
  return json<T>(res);
}

export const api = {
  listSessions: () =>
    fetch(`${base}/sessions`, fetchOpts).then(jsonAuth<SessionSummary[]>),
  getSession: (id: string) =>
    fetch(`${base}/sessions/${id}`, fetchOpts).then(jsonAuth<SessionDetail>),
  createSession: (title?: string) =>
    fetch(`${base}/sessions`, {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(jsonAuth<SessionDetail>),
  renameSession: (id: string, title: string) =>
    fetch(`${base}/sessions/${id}`, {
      ...fetchOpts,
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(jsonAuth<SessionSummary>),
  deleteSession: (id: string) =>
    fetch(`${base}/sessions/${id}`, { ...fetchOpts, method: "DELETE" }).then((r) => {
      if (r.status === 401) throw new AuthError();
      if (!r.ok) throw new Error(`${r.status}`);
    }),
  health: () =>
    fetch(`${base}/health`, fetchOpts).then(json<{ status: string; model: string }>),
  me: () => fetch(`${base}/auth/me`, fetchOpts).then(jsonAuth<User>),
  login: (email: string, password: string) =>
    fetch(`${base}/auth/login`, {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(json<User>),
  register: (email: string, password: string) =>
    fetch(`${base}/auth/register`, {
      ...fetchOpts,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    }).then(json<User>),
  logout: () =>
    fetch(`${base}/auth/logout`, { ...fetchOpts, method: "POST" }).then((r) => {
      if (!r.ok && r.status !== 204) throw new Error(`${r.status}`);
    }),
};
