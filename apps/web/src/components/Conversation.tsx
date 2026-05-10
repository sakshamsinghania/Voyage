import { useEffect, useLayoutEffect, useRef } from "react";
import type { Message } from "../lib/api";
import { MessageBlock } from "./MessageBlock";

interface Props {
  messages: Message[];
  streamingId: string | null;
  error: string | null;
  onDismissError: () => void;
}

export function Conversation({ messages, streamingId, error, onDismissError }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const streamStarted = useRef(false);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    if (streamingId) {
      if (!streamStarted.current) {
        // Scroll once to show new message, then stop chasing bottom
        el.scrollTop = el.scrollHeight;
        stickToBottom.current = false;
        streamStarted.current = true;
      }
      return;
    }

    streamStarted.current = false;
    if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, streamingId]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
      stickToBottom.current = distance < 64;
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  if (messages.length === 0 && !error) {
    return (
      <div className="flex-1 flex items-end px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
        <div className="max-w-[60ch]">
          <div className="label mb-3 text-amber">Voyage · ready</div>
          <p className="text-head text-loud font-medium tracking-tight">
            What are you researching?
          </p>
          <p className="meta mt-3 text-quiet font-sans">
            Ask a precise question. Output streams in mono. Sessions persist on the left.
            Sources, agents, and tool traces will land in the rail as those layers come online.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
      <div className="min-h-full">
        {messages.map((m) => (
          <MessageBlock key={m.id} message={m} streaming={m.id === streamingId} />
        ))}
        {error && (
          <article className="px-4 sm:px-8 lg:px-12 py-5 bg-surface border-y border-amber-deep/60">
            <header className="flex items-center justify-between mb-2">
              <span className="label text-amber">Error</span>
              <button
                type="button"
                onClick={onDismissError}
                className="label text-quiet hover:text-loud transition-colors min-h-[32px] flex items-center"
              >
                Dismiss
              </button>
            </header>
            <pre className="font-mono text-meta text-loud whitespace-pre-wrap break-words">{error}</pre>
          </article>
        )}
      </div>
    </div>
  );
}
