import { useMemo } from "react";
import { marked } from "marked";
import type { Message } from "../lib/api";
import { formatMs, formatTokens, formatTime } from "../lib/format";
import { DecryptedStreamText } from "./DecryptedStreamText";
marked.setOptions({ gfm: true, breaks: false });

interface Props {
  message: Message;
  streaming?: boolean;
}

export function MessageBlock({ message, streaming }: Props) {
  if (message.role === "user") {
    return (
      <article className="px-8 lg:px-12 py-5 border-b border-rim/60">
        <header className="flex items-center gap-3 mb-2">
          <span className="label">You</span>
          <span className="meta">{formatTime(message.created_at)}</span>
        </header>
        <div className="text-body text-loud whitespace-pre-wrap max-w-[75ch]">
          {message.content}
        </div>
      </article>
    );
  }

  if (message.role === "tool") {
    return (
      <article className="px-8 lg:px-12 py-4 bg-surface/40 border-b border-rim/60">
        <header className="flex items-center gap-3 mb-1">
          <span className="label text-amber-dim">Tool</span>
          <span className="meta">{formatTime(message.created_at)}</span>
        </header>
        <pre className="font-mono text-meta text-loud overflow-x-auto">{message.content}</pre>
      </article>
    );
  }

  const html = useMemo(() => {
    if (!message.content) return "";
    return marked.parse(message.content) as string;
  }, [message.content]);

  return (
    <article className="px-8 lg:px-12 py-6 border-b border-rim/60">
      <header className="flex items-center gap-3 mb-3">
        <span className="label text-amber">Voyage</span>
        <span className="meta">{formatTime(message.created_at)}</span>
        {streaming && <span className="label text-amber animate-pulse">Streaming</span>}
      </header>

      {streaming ? (
        message.content ? (
          <DecryptedStreamText text={message.content} speed={100} />
        ) : (
          <div className="flex items-center gap-2 text-quiet">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber animate-pulse" />
            <span className="font-mono text-meta">Thinking…</span>
          </div>
        )
      ) : message.content ? (
        <div
          className="agent-md"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : null}

      {!streaming && (
        <footer className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-quiet">
          <span className="meta">{message.model ?? "—"}</span>
          <span className="meta">{formatTokens(message.input_tokens, message.output_tokens)}</span>
          <span className="meta">{formatMs(message.latency_ms)}</span>
        </footer>
      )}
    </article>
  );
}
