interface Section {
  label: string;
  empty: string;
  count?: number;
}

const SECTIONS: Section[] = [
  {
    label: "Sources",
    empty: "Citations appear here when retrieval is enabled.",
  },
  {
    label: "Agents",
    empty: "Active agent runs and their state.",
  },
  {
    label: "Tools",
    empty: "Tool calls and results.",
  },
];

export function Rail() {
  return (
    <aside className="hidden xl:flex flex-col w-[320px] shrink-0 bg-ground border-l border-rim">
      <header className="h-12 px-4 border-b border-rim flex items-center justify-between">
        <span className="label">Context</span>
        <span className="meta text-quiet">v1 · inert</span>
      </header>

      <div className="flex-1 overflow-y-auto">
        {SECTIONS.map((s, i) => (
          <section key={s.label} className={i > 0 ? "border-t border-rim" : ""}>
            <header className="px-4 pt-4 pb-2 flex items-center justify-between">
              <span className="label">{s.label}</span>
              <span className="meta text-rim">0</span>
            </header>
            <p className="px-4 pb-4 text-meta text-quiet font-sans leading-relaxed max-w-[40ch]">
              {s.empty}
            </p>
          </section>
        ))}
      </div>

      <footer className="border-t border-rim px-4 py-3">
        <span className="label">Reserved</span>
        <p className="meta text-quiet mt-1.5 font-sans leading-relaxed">
          Three seams ready: retriever, tool registry, agent runner. Wire any without changing routes.
        </p>
      </footer>
    </aside>
  );
}
