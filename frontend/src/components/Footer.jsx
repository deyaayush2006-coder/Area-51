export default function Footer() {
  return (
    <footer className="border-t border-steel bg-void">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-radar animate-blip-pulse" />
          <span className="font-mono text-[11px] tracking-widest text-ink-muted">
            AREA 51 ARCHIVE TERMINAL &nbsp;/&nbsp; BUILD FOR EDUCATIONAL &amp; DEMO PURPOSES
          </span>
        </div>
        <p className="font-mono text-[10px] tracking-widest text-ink-faint uppercase">
          Distribution: Unlimited &nbsp;•&nbsp; Not an official government resource
        </p>
      </div>
    </footer>
  );
}
