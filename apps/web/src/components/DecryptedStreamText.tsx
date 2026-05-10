import { useEffect, useMemo, useRef, useState } from "react";
import { marked } from "marked";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface Props {
  text: string;
  /** ms between reveal frames — lower = faster (default 30) */
  speed?: number;
  /** chars visible in the scramble zone (default 12) */
  scrambleWidth?: number;
}

export function DecryptedStreamText({
  text,
  speed = 30,
  scrambleWidth = 12,
}: Props) {
  const [revealed, setRevealed] = useState(0);
  const [tick, setTick] = useState(0);
  const textRef = useRef(text);
  textRef.current = text;

  useEffect(() => {
    const id = setInterval(() => {
      const len = textRef.current.length;
      setRevealed((r) => {
        if (r >= len) return r;
        const backlog = len - r;
        const step = backlog > 80 ? Math.ceil(backlog * 0.1) : backlog > 30 ? 2 : 1;
        return Math.min(r + step, len);
      });
      setTick((t) => t + 1);
    }, speed);
    return () => clearInterval(id);
  }, [speed]);

  void tick;

  const revealedText = text.slice(0, revealed);

  const html = useMemo(() => {
    if (!revealedText) return "";
    return marked.parse(revealedText) as string;
  }, [revealedText]);

  const scrambleEnd = Math.min(revealed + scrambleWidth, text.length);
  const scrambleZone = text.slice(revealed, scrambleEnd);

  const scrambled = scrambleZone
    .split("")
    .map((c) =>
      c === " " || c === "\n"
        ? c
        : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
    )
    .join("");

  // Inject scramble text inline at end of last HTML block element
  const finalHtml = useMemo(() => {
    if (!scrambled) return html;
    const scrambleSpan = `<span class="decrypt-scramble">${scrambled}</span>`;
    const lastClose = html.lastIndexOf("</");
    if (lastClose >= 0) {
      return html.slice(0, lastClose) + scrambleSpan + html.slice(lastClose);
    }
    return html + scrambleSpan;
  }, [html, scrambled]);

  return (
    <div
      className="agent-md caret"
      dangerouslySetInnerHTML={{ __html: finalHtml }}
    />
  );
}
