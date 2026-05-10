import { useCallback, useEffect, useRef, useState } from "react";
import { api, type Message, type SessionSummary } from "./lib/api";
import { streamChat, type StreamHandle } from "./lib/stream";
import { Sidebar } from "./components/Sidebar";
import { Conversation } from "./components/Conversation";
import { Composer } from "./components/Composer";
import { Rail } from "./components/Rail";

type Status = "ok" | "loading" | "error";

export default function App() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [model, setModel] = useState<string>("…");
  const streamRef = useRef<StreamHandle | null>(null);

  // Initial load
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [list, h] = await Promise.all([api.listSessions(), api.health()]);
        if (cancelled) return;
        setStatus("ok");
        setModel(h.model);
        setSessions(list);
        if (list.length > 0) await selectSession(list[0].id);
      } catch (e) {
        if (cancelled) return;
        setStatus("error");
        setError((e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectSession = useCallback(async (id: string) => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setStreamingId(null);
    setActiveId(id);
    setMessages([]);
    setError(null);
    try {
      const detail = await api.getSession(id);
      setMessages(detail.messages);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const newSession = useCallback(async () => {
    try {
      const s = await api.createSession();
      setSessions((prev) => [{ ...s }, ...prev.filter((p) => p.id !== s.id)]);
      setActiveId(s.id);
      setMessages([]);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);

  const deleteSession = useCallback(
    async (id: string) => {
      try {
        await api.deleteSession(id);
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (id === activeId) {
          setActiveId(null);
          setMessages([]);
        }
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [activeId]
  );

  const send = useCallback(
    async (text: string) => {
      let sessionId = activeId;
      if (!sessionId) {
        try {
          const s = await api.createSession();
          setSessions((prev) => [s, ...prev]);
          setActiveId(s.id);
          sessionId = s.id;
        } catch (e) {
          setError((e as Error).message);
          return;
        }
      }

      const tempUserId = `user-${Date.now()}`;
      const tempAssistantId = `streaming-${Date.now()}`;
      setStreamingId(tempAssistantId);
      setError(null);

      // Optimistic user message + assistant placeholder
      setMessages((prev) => [
        ...prev,
        {
          id: tempUserId,
          role: "user",
          content: text,
          created_at: new Date().toISOString(),
        },
        {
          id: tempAssistantId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      streamRef.current = streamChat({ session_id: sessionId, content: text }, (evt) => {
        if (evt.type === "user_message") {
          // Replace optimistic user message with server version
          setMessages((prev) =>
            prev.map((m) => (m.id === tempUserId ? evt.payload : m))
          );
        } else if (evt.type === "delta") {
          setMessages((prev) => {
            const next = prev.slice();
            const last = next[next.length - 1];
            if (last && last.id === tempAssistantId) {
              next[next.length - 1] = { ...last, content: last.content + evt.payload.text };
            }
            return next;
          });
        } else if (evt.type === "done") {
          setMessages((prev) => {
            const next = prev.slice();
            const idx = next.findIndex((m) => m.id === tempAssistantId);
            if (idx >= 0) next[idx] = evt.payload;
            return next;
          });
          setStreamingId(null);
          // Refresh sessions list (title may have updated)
          api.listSessions().then(setSessions).catch(() => {});
        } else if (evt.type === "error") {
          setError(evt.payload.message);
          setStreamingId(null);
          setMessages((prev) => prev.filter((m) => m.id !== tempAssistantId && m.id !== tempUserId));
        }
      });
    },
    [activeId]
  );

  const stop = useCallback(() => {
    streamRef.current?.cancel();
    streamRef.current = null;
    setStreamingId(null);
    setMessages((prev) => {
      const next = prev.slice();
      const last = next[next.length - 1];
      if (last && last.role === "assistant" && last.id.startsWith("streaming-")) {
        next[next.length - 1] = {
          ...last,
          id: `stopped-${Date.now()}`,
          content: last.content + (last.content ? "\n\n_Stopped._" : "_Stopped._"),
          model: model,
          latency_ms: null,
        };
      }
      return next;
    });
  }, [model]);

  // Global keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        newSession();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [newSession]);

  return (
    <div className="flex h-full bg-void text-loud">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={selectSession}
        onNew={newSession}
        onDelete={deleteSession}
        status={status}
        modelLabel={model}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-ground">
        <header className="h-12 shrink-0 border-b border-rim px-6 lg:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <span className="label shrink-0">Session</span>
            <span className="font-mono text-meta text-loud truncate">
              {activeId
                ? sessions.find((s) => s.id === activeId)?.title ?? "Loading…"
                : "No session"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="label">{streamingId ? "Streaming" : "Idle"}</span>
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                streamingId ? "bg-amber animate-pulse" : "bg-rim"
              }`}
              aria-hidden
            />
          </div>
        </header>

        <Conversation
          messages={messages}
          streamingId={streamingId}
          error={error}
          onDismissError={() => setError(null)}
        />

        <Composer
          disabled={status !== "ok"}
          streaming={streamingId !== null}
          onSend={send}
          onStop={stop}
        />
      </main>

      <Rail />
    </div>
  );
}
