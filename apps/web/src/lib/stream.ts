import type { Message } from "./api";

export type ChatEvent =
  | { type: "user_message"; payload: Message }
  | { type: "delta"; payload: { text: string } }
  | { type: "done"; payload: Message }
  | { type: "error"; payload: { message: string } };

export interface StreamHandle {
  cancel: () => void;
  done: Promise<void>;
}

/**
 * POST /api/chat with SSE response. Native EventSource is GET-only, so we use fetch + ReadableStream.
 * Parses event/data pairs per the SSE spec.
 */
export function streamChat(
  body: { session_id: string; content: string },
  on: (event: ChatEvent) => void
): StreamHandle {
  const ctrl = new AbortController();

  const done = (async () => {
    let res: Response;
    try {
      res = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify(body),
        signal: ctrl.signal,
      });
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      on({ type: "error", payload: { message: (e as Error).message } });
      return;
    }

    if (!res.ok || !res.body) {
      const msg = await res.text().catch(() => `${res.status}`);
      on({ type: "error", payload: { message: msg || `HTTP ${res.status}` } });
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";

    try {
      while (true) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        buf += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = findEventBoundary(buf)) >= 0) {
          const boundaryLen = buf[sep] === "\r" ? 4 : 2; // \r\n\r\n vs \n\n
          const raw = buf.slice(0, sep);
          buf = buf.slice(sep + boundaryLen);
          const evt = parseSse(raw);
          if (evt) on(evt);
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        on({ type: "error", payload: { message: (e as Error).message } });
      }
    }
  })();

  return { cancel: () => ctrl.abort(), done };
}

function findEventBoundary(buf: string): number {
  const lf = buf.indexOf("\n\n");
  const crlf = buf.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function parseSse(raw: string): ChatEvent | null {
  let event = "message";
  const dataLines: string[] = [];
  for (const line of raw.split("\n")) {
    if (!line || line.startsWith(":")) continue;
    if (line.startsWith("event:")) event = line.slice(6).trim();
    else if (line.startsWith("data:")) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  let payload: unknown;
  try {
    payload = JSON.parse(dataLines.join("\n"));
  } catch {
    return null;
  }
  switch (event) {
    case "user_message":
      return { type: "user_message", payload: payload as Message };
    case "delta":
      return { type: "delta", payload: payload as { text: string } };
    case "done":
      return { type: "done", payload: payload as Message };
    case "error":
      return { type: "error", payload: payload as { message: string } };
    default:
      return null;
  }
}
