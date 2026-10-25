import AnimatedContent from "./AnimatedContent.jsx";
import BriefingPanel from "./BriefingPanel.jsx";
import ClassifiedText from "./ClassifiedText.jsx";

function FeedFrame({ children, label, code }) {
  return (
    <div className="relative rounded-sm overflow-hidden border border-steel bg-panel-raised group">
      <div className="aspect-[4/3] w-full">{children}</div>
      <div className="absolute inset-0 scanline-overlay opacity-60 pointer-events-none" />
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-redalert animate-blip-pulse" />
        <span className="font-mono text-[9px] tracking-widest text-redalert/90">REC</span>
      </div>
      <div className="absolute top-2 right-2 font-mono text-[9px] tracking-widest text-ink-muted">
        {code}
      </div>
      <div className="absolute bottom-2 left-2 font-mono text-[10px] tracking-widest text-cyan-bright/90 bg-void/50 px-1.5 py-0.5 rounded-sm">
        {label}
      </div>
    </div>
  );
}

function HangarSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e2a4d" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky1)" />
      <ellipse cx="200" cy="230" rx="260" ry="60" fill="#0b1526" />
      <rect x="120" y="150" width="160" height="70" fill="#101f38" stroke="#28527f" strokeWidth="1.5" />
      <path d="M120 150 L200 100 L280 150 Z" fill="#0e2a4d" stroke="#28527f" strokeWidth="1.5" />
      <rect x="185" y="180" width="30" height="40" fill="#030712" />
      <line x1="0" y1="228" x2="400" y2="228" stroke="#1c3a5e" strokeWidth="2" strokeDasharray="10 8" />
      {[40, 90, 310, 360].map((x) => (
        <circle key={x} cx={x} cy={155} r={2.5} fill="#5eead4" opacity="0.8" />
      ))}
    </svg>
  );
}

function RadarArraySVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="300" fill="#050b14" />
      {[...Array(6)].map((_, i) => (
        <circle key={i} cx="200" cy="240" r={20 + i * 22} fill="none" stroke="#1c3a5e" strokeWidth="1" />
      ))}
      <line x1="200" y1="240" x2="200" y2="60" stroke="#28527f" strokeWidth="3" />
      <ellipse cx="200" cy="90" rx="70" ry="26" fill="#101f38" stroke="#38bdf8" strokeWidth="1.5" transform="rotate(-15 200 90)" />
      <circle cx="200" cy="240" r="6" fill="#34d399" opacity="0.9" />
      <circle cx="200" cy="240" r="130" fill="none" stroke="#34d399" strokeWidth="0.5" opacity="0.4" strokeDasharray="4 6" />
    </svg>
  );
}

function DesertSignSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="sky2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e2a4d" />
          <stop offset="60%" stopColor="#0b1526" />
          <stop offset="100%" stopColor="#030712" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky2)" />
      <polygon points="0,210 130,150 250,205 400,160 400,300 0,300" fill="#0b1526" />
      <line x1="200" y1="300" x2="200" y2="120" stroke="#28527f" strokeWidth="6" />
      <rect x="150" y="100" width="100" height="45" fill="#101f38" stroke="#f87171" strokeWidth="2" />
      <text x="200" y="120" textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#f87171" letterSpacing="1">
        WARNING
      </text>
      <text x="200" y="134" textAnchor="middle" fontFamily="monospace" fontSize="6.5" fill="#f87171" letterSpacing="0.5">
        RESTRICTED AREA
      </text>
      <path d="M0 300 L400 300 L260 245 L140 245 Z" fill="#0e2a4d" />
    </svg>
  );
}

function AnomalySVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="glow1" cx="50%" cy="35%" r="50%">
          <stop offset="0%" stopColor="#5eead4" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#5eead4" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sky3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#030712" />
          <stop offset="100%" stopColor="#0b1526" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill="url(#sky3)" />
      {[...Array(40)].map((_, i) => (
        <circle
          key={i}
          cx={(i * 53) % 400}
          cy={(i * 97) % 180}
          r={i % 5 === 0 ? 1.6 : 0.9}
          fill="#e6f1ff"
          opacity={0.3 + (i % 4) * 0.15}
        />
      ))}
      <circle cx="200" cy="110" r="90" fill="url(#glow1)" />
      <ellipse cx="200" cy="110" rx="34" ry="10" fill="#0e2a4d" stroke="#34d399" strokeWidth="1.5" />
      <ellipse cx="200" cy="104" rx="16" ry="9" fill="#101f38" stroke="#34d399" strokeWidth="1" />
      <polygon points="0,260 400,260 400,300 0,300" fill="#030712" />
      <polygon points="0,260 150,225 260,255 400,235 400,260" fill="#0b1526" />
    </svg>
  );
}

const ITEMS = [
  { Svg: HangarSVG, label: "HANGAR COMPLEX — SECTOR 4", code: "CAM-04A" },
  { Svg: RadarArraySVG, label: "PERIMETER RADAR ARRAY", code: "CAM-12C" },
  { Svg: DesertSignSVG, label: "GROOM LAKE ROAD, MM 17", code: "CAM-07B" },
  { Svg: AnomalySVG, label: "UNIDENTIFIED AERIAL PHENOMENON", code: "CAM-19X" },
];

export default function Gallery() {
  return (
    <section id="gallery" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 scroll-mt-16">
      <div className="max-w-2xl mb-4">
        <p className="eyebrow mb-3">Briefing // 03</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
          <ClassifiedText text="Visual Archive" />
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Reconstructed surveillance-style renderings of the facility and surrounding terrain —
          illustrative, not verified photographic evidence.
        </p>
      </div>

      {/* Feeds "power on" like CRT monitors: blur + scale up as they scroll in */}
      <AnimatedContent
        className="grid sm:grid-cols-2 gap-5 mt-10"
        distance={24}
        scale={0.96}
        blur={8}
        duration={0.8}
        stagger={0.12}
      >
        {ITEMS.map(({ Svg, label, code }) => (
          <FeedFrame key={label} label={label} code={code}>
            <Svg />
          </FeedFrame>
        ))}
      </AnimatedContent>

      <BriefingPanel className="mt-8" title="A note on this archive" tag="EDITORIAL">
        <p className="text-ink-muted text-sm leading-relaxed">
          These panels are original stylized illustrations built for this briefing terminal, not
          scanned photographs — real archival imagery of the base is scarce, tightly controlled,
          and largely restricted for good reason. Treat them as artistic reconstructions in the
          spirit of the subject.
        </p>
      </BriefingPanel>
    </section>
  );
}
