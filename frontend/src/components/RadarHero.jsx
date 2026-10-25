import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import ClassifiedText from "./ClassifiedText.jsx";
import Magnet from "./Magnet.jsx";

const BLIPS = [
  { x: 62, y: 38, label: "HANGAR 18" },
  { x: 30, y: 60, label: "RUNWAY 14L" },
  { x: 70, y: 72, label: "PERIMETER" },
  { x: 42, y: 28, label: "UNKNOWN" },
];

export default function RadarHero({ onNavigate }) {
  const radarRef = useRef(null);

  // anime.js: sonar ping rings expanding out of each contact, staggered around the scope
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pings = animate(radarRef.current.querySelectorAll("[data-ping]"), {
      scale: [1, 7],
      opacity: [0.9, 0],
      duration: 1800,
      delay: stagger(450),
      loop: true,
      loopDelay: 600,
      ease: "outQuad",
    });
    return () => pings.revert();
  }, []);

  return (
    <section className="relative overflow-hidden border-b border-steel grid-bg">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-void/40 to-void" />

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 md:pt-24 md:pb-28 grid md:grid-cols-2 gap-12 items-center">
        {/* Left: copy */}
        <div className="animate-fade-up">
          <p className="eyebrow mb-4">37.235°N, 115.811°W &nbsp;•&nbsp; NEVADA TEST AND TRAINING RANGE</p>
          <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight text-ink-primary text-glow">
            <ClassifiedText text={"AREA 51"} speed={90} />
          </h1>
          <p className="font-mono text-cyan-bright/90 text-sm md:text-base mt-3 tracking-wide">
            <ClassifiedText
              text="[ RESTRICTED ACCESS TERMINAL — GROOM LAKE FACILITY ]"
              sequential={false}
              maxIterations={18}
              encryptedClassName="text-cyan-bright/40"
            />
          </p>
          <p className="mt-6 text-ink-muted text-base md:text-lg leading-relaxed max-w-lg">
            A once-secret U.S. Air Force flight-test facility hidden inside a dry lakebed in the
            Nevada desert — where real Cold War stealth programs and decades of UFO folklore
            occupy the same patch of restricted airspace. Browse the declassified archive below,
            then leave your own transmission.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Magnet padding={60} magnetStrength={4}>
              <button
                onClick={() => onNavigate("access")}
                className="font-mono text-xs tracking-widest uppercase bg-cyan-bright/10 border border-cyan-bright text-cyan-bright px-5 py-3 rounded-sm hover:bg-cyan-bright/20 transition-colors"
              >
                &gt; Leave Feedback
              </button>
            </Magnet>
            <Magnet padding={60} magnetStrength={4}>
              <button
                onClick={() => onNavigate("about")}
                className="font-mono text-xs tracking-widest uppercase border border-steel-light text-ink-muted px-5 py-3 rounded-sm hover:text-ink-primary hover:border-ink-muted transition-colors"
              >
                View Briefing
              </button>
            </Magnet>
          </div>
        </div>

        {/* Right: radar signature element */}
        <div className="relative aspect-square max-w-md mx-auto w-full animate-fade-up [animation-delay:150ms]" aria-hidden="true" ref={radarRef}>
          <div className="absolute inset-0 rounded-full border border-steel-light/60" />
          <div className="absolute inset-[12%] rounded-full border border-steel-light/40" />
          <div className="absolute inset-[24%] rounded-full border border-steel-light/30" />
          <div className="absolute inset-[36%] rounded-full border border-steel-light/20" />
          <div className="absolute inset-0 rounded-full border-2 border-cyan-bright/20" />

          {/* crosshairs */}
          <div className="absolute inset-0 flex items-center">
            <div className="w-full h-px bg-steel-light/40" />
          </div>
          <div className="absolute inset-0 flex justify-center">
            <div className="h-full w-px bg-steel-light/40" />
          </div>

          {/* rotating sweep */}
          <div className="absolute inset-0 rounded-full overflow-hidden animate-radar-spin origin-center">
            <div
              className="absolute inset-0"
              style={{
                background:
                  "conic-gradient(from 0deg, rgba(52,211,153,0.55), transparent 28%)",
              }}
            />
          </div>

          {/* blips */}
          {BLIPS.map((b, i) => (
            <div
              key={b.label}
              className="absolute flex flex-col items-center animate-blip-pulse"
              style={{ left: `${b.x}%`, top: `${b.y}%`, animationDelay: `${i * 0.4}s` }}
            >
              <span className="relative w-1.5 h-1.5">
                <span className="absolute inset-0 rounded-full bg-radar shadow-[0_0_8px_2px_rgba(52,211,153,0.8)]" />
                <span data-ping className="absolute inset-0 rounded-full border border-radar opacity-0" />
              </span>
              <span className="mt-1 font-mono text-[9px] tracking-wider text-radar/80 whitespace-nowrap">
                {b.label}
              </span>
            </div>
          ))}

          <div className="absolute inset-0 flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-cyan-bright shadow-[0_0_12px_4px_rgba(103,232,249,0.6)]" />
          </div>

          <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-widest text-ink-muted whitespace-nowrap">
            SWEEP RANGE: 40MI &nbsp;|&nbsp; CONTACTS: {BLIPS.length}
          </p>
        </div>
      </div>
    </section>
  );
}
