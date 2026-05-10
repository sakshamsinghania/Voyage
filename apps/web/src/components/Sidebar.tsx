import type { SessionSummary } from "../lib/api";
import { useAuth } from "../lib/auth";
import { formatTime } from "../lib/format";

interface Props {
  sessions: SessionSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  status: "ok" | "loading" | "error";
  modelLabel: string;
}

export function Sidebar({ sessions, activeId, onSelect, onNew, onDelete, status, modelLabel }: Props) {
  const { user, signOut } = useAuth();
  return (
    <aside className="hidden md:flex flex-col w-[260px] shrink-0 bg-ground border-r border-rim">
      <header className="flex items-center justify-between px-4 h-12 border-b border-rim">
        <span className="font-mono text-title font-semibold tracking-tight text-loud">
          voyage
          <span className="text-amber">.</span>
        </span>
        <span className="label text-quiet">v0.1</span>
      </header>

      <button
        type="button"
        onClick={onNew}
        className="mx-3 mt-3 mb-2 h-9 px-3 flex items-center justify-between bg-surface hover:bg-rim border border-rim text-loud font-mono text-meta transition-colors duration-120"
      >
        <span className="flex items-center gap-2">
          <span className="text-amber">+</span> New session
        </span>
        <span className="label text-quiet">⌘N</span>
      </button>

      <div className="px-4 pt-2 pb-1 label">Sessions</div>

      <nav className="flex-1 overflow-y-auto px-2 pb-3">
        {sessions.length === 0 ? (
          <div className="px-2 py-3 font-mono text-meta text-quiet">No sessions</div>
        ) : (
          <ul className="space-y-px">
            {sessions.map((s) => {
              const active = s.id === activeId;
              return (
                <li key={s.id}>
                  <div
                    className={`group flex items-center gap-2 px-2 py-1.5 cursor-pointer transition-colors duration-120 ${
                      active
                        ? "bg-surface text-loud"
                        : "text-quiet hover:bg-surface hover:text-loud"
                    }`}
                    onClick={() => onSelect(s.id)}
                  >
                    <span
                      className={`font-mono text-meta w-3 ${
                        active ? "text-amber" : "text-rim group-hover:text-quiet"
                      }`}
                      aria-hidden
                    >
                      {active ? "▸" : "·"}
                    </span>
                    <span className="flex-1 truncate text-meta">{s.title}</span>
                    <span className="meta shrink-0">{formatTime(s.updated_at)}</span>
                    <button
                      type="button"
                      aria-label="Delete session"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete "${s.title}"?`)) onDelete(s.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-quiet hover:text-amber transition-opacity duration-120 font-mono text-meta px-1"
                    >
                      ×
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </nav>

      <footer className="border-t border-rim px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="label">Status</span>
          <span className="meta flex items-center gap-1.5">
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full ${
                status === "ok"
                  ? "bg-amber"
                  : status === "loading"
                    ? "bg-quiet animate-pulse"
                    : "bg-amber-deep"
              }`}
              aria-hidden
            />
            {status === "ok" ? "Online" : status === "loading" ? "Connecting" : "Offline"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="label">Model</span>
          <span className="meta truncate max-w-[140px]" title={modelLabel}>{modelLabel}</span>
        </div>
        {user && (
          <div className="flex items-center justify-between pt-1.5 border-t border-rim mt-1.5">
            <span className="meta truncate max-w-[160px]" title={user.email}>
              {user.email}
            </span>
            <button
              type="button"
              onClick={signOut}
              className="label text-quiet hover:text-amber transition-colors duration-120"
            >
              Sign out
            </button>
          </div>
        )}
      </footer>
    </aside>
  );
}
