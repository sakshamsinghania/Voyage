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

const base = "/api";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  listSessions: () => fetch(`${base}/sessions`).then(json<SessionSummary[]>),
  getSession: (id: string) => fetch(`${base}/sessions/${id}`).then(json<SessionDetail>),
  createSession: (title?: string) =>
    fetch(`${base}/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(json<SessionDetail>),
  renameSession: (id: string, title: string) =>
    fetch(`${base}/sessions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(json<SessionSummary>),
  deleteSession: (id: string) =>
    fetch(`${base}/sessions/${id}`, { method: "DELETE" }).then((r) => {
      if (!r.ok) throw new Error(`${r.status}`);
    }),
  health: () => fetch(`${base}/health`).then(json<{ status: string; model: string }>),
};
