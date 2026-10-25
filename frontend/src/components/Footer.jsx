export default function Footer() {
  return (
    <footer className="border-t border-steel bg-void">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-radar animate-blip-pulse" />
          <span className="font-mono text-[11px] tracking-widest text-ink-muted">
            AREA 51 ARCHIVE TERMINAL
          </span>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
          UNITED STATED OF AMERICA // AREA 51 // NEVADA // 37.2350° N, 115.8111° W
        </p>
      </div>
    </footer>
  );
}
