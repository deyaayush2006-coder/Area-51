import { useEffect, useState } from "react";
import { animated, useTransition } from "@react-spring/web";
import DecryptedText from "./DecryptedText.jsx";

function useClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

export default function Navbar({ onNavigate }) {
  const time = useClock();
  const stamp = time.toISOString().replace("T", " ").slice(0, 19) + "Z";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuTransition = useTransition(menuOpen, {
    from: { opacity: 0, y: -12 },
    enter: { opacity: 1, y: 0 },
    leave: { opacity: 0, y: -12 },
    config: { tension: 320, friction: 26 },
  });

  const go = (id) => {
    setMenuOpen(false);
    onNavigate(id);
  };

  const links = [
    ["BRIEFING", "about"],
    ["TIMELINE", "timeline"],
    ["ARCHIVE", "gallery"],
    ["INTEL", "facts"],
    ["FEEDBACK", "access"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-steel bg-void/90">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-radar animate-blip-pulse" />
          <span className="font-display font-bold tracking-[0.2em] text-sm md:text-base text-ink-primary">
            <DecryptedText
              text={"AREA 51"}
              animateOn="hover"
              speed={45}
              maxIterations={8}
              characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
              encryptedClassName="text-cyan-bright"
            />
          </span>
          <span className="hidden sm:inline font-mono text-[10px] text-ink-muted tracking-widest">
            // GROOM LAKE ARCHIVE
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 font-mono text-xs tracking-widest text-ink-muted">
          {links.map(([label, id]) => (
            <button
              key={id}
              onClick={() => go(id)}
              className="hover:text-cyan-bright transition-colors"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <span className="hidden lg:block font-mono text-[10px] text-ink-muted">{stamp}</span>
          <button
            onClick={() => go("access")}
            className="font-mono text-[11px] tracking-widest uppercase border border-cyan-bright/50 rounded-sm px-3 py-1.5 text-cyan-bright hover:bg-cyan-bright/10 transition-colors"
          >
            Leave Feedback
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="md:hidden w-9 h-9 flex flex-col items-center justify-center gap-1.5 border border-steel-light rounded-sm text-ink-muted hover:text-cyan-bright transition-colors"
          >
            <span className={`block w-4 h-px bg-current transition-transform ${menuOpen ? "translate-y-[3.5px] rotate-45" : ""}`} />
            <span className={`block w-4 h-px bg-current transition-transform ${menuOpen ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {/* Mobile nav: the desktop link row is hidden below md, so expose it here */}
      {menuTransition(
        ({ opacity, y }, open) =>
          open && (
            <animated.nav
              id="mobile-nav"
              style={{ opacity, transform: y.to((v) => `translateY(${v}px)`) }}
              className="md:hidden absolute inset-x-0 top-full border-y border-steel bg-void/95 px-4 py-2"
            >
              {links.map(([label, id]) => (
                <button
                  key={id}
                  onClick={() => go(id)}
                  className="block w-full text-left py-3 font-mono text-xs tracking-widest text-ink-muted hover:text-cyan-bright transition-colors"
                >
                  &gt; {label}
                </button>
              ))}
            </animated.nav>
          )
      )}
    </header>
  );
}
