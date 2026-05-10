import { useEffect, useRef, useState } from "react";

interface Props {
  disabled?: boolean;
  streaming?: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}

export function Composer({ disabled, streaming, onSend, onStop }: Props) {
  const [value, setValue] = useState("");
  const taRef = useRef<HTMLTextAreaElement>(null);
  const lastSentRef = useRef<string>("");

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    if (!disabled && !streaming) el.focus();
  }, [disabled, streaming]);

  const send = () => {
    const text = value.trim();
    if (!text || disabled) return;
    lastSentRef.current = text;
    onSend(text);
    setValue("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
      e.preventDefault();
      send();
      return;
    }
    if (e.key === "Escape" && streaming) {
      e.preventDefault();
      onStop();
      return;
    }
    if (e.key === "ArrowUp" && value === "" && lastSentRef.current) {
      e.preventDefault();
      setValue(lastSentRef.current);
    }
  };

  return (
    <div className="border-t border-rim bg-ground/80 backdrop-blur-[2px]">
      <div className="px-3 sm:px-6 lg:px-10 py-3 sm:py-4">
        <div className="flex items-end gap-2 sm:gap-3">
          <span className="label pb-2.5 select-none text-amber">›</span>
          <textarea
            ref={taRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={disabled ? "Initializing..." : "Ask anything researchable."}
            rows={1}
            disabled={disabled}
            className="flex-1 resize-none bg-transparent font-mono text-body text-loud placeholder:text-quiet outline-none disabled:opacity-50"
            style={{ minHeight: "1.65em", maxHeight: "240px" }}
          />
          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              className="h-10 sm:h-9 px-3 bg-surface border border-rim hover:border-amber text-loud font-mono text-meta transition-colors duration-120 shrink-0"
            >
              <span className="label text-amber">Stop</span>
              <span className="meta ml-2 text-quiet hidden sm:inline">Esc</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={send}
              disabled={disabled || value.trim().length === 0}
              className="h-10 sm:h-9 px-3 bg-amber text-void font-mono text-meta font-medium hover:bg-amber-dim transition-colors duration-120 disabled:bg-rim disabled:text-quiet disabled:cursor-not-allowed shrink-0"
            >
              <span className="label !tracking-wider !text-void disabled:!text-quiet">Send</span>
              <span className="meta ml-2 text-void/60 hidden sm:inline">⌘↵</span>
            </button>
          )}
        </div>
        <div className="mt-1.5 sm:mt-2 flex items-center gap-4 pl-5">
          <span className="label hidden sm:inline">Mono input · markdown out · ⌘↵ send · Esc cancel · ↑ recall</span>
          <span className="label sm:hidden">↑ recall · Enter send</span>
        </div>
      </div>
    </div>
  );
}
