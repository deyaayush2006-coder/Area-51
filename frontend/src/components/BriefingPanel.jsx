import SpotlightCard from "./SpotlightCard.jsx";

// The corner brackets live on the outer wrapper because SpotlightCard clips its overflow
export default function BriefingPanel({ eyebrow, title, children, className = "", tag }) {
  return (
    <div className={`relative hud-corners ${className}`}>
      <SpotlightCard
        className="hud-panel rounded-sm p-6 md:p-8 h-full"
        spotlightColor="#67e8f9"
        intensity={0.12}
        spotlightSize={280}
        borderGlow={0.9}
        // Only light up while the pointer is on this card; the default 80px proximity woke every card on every mouse move
        proximity={0}
        style={{
          "--spotlight-card-surface": "rgb(11 21 38 / 0.9)",
          "--spotlight-card-border": "transparent",
          "--spotlight-card-shadow": "none",
        }}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
            {title && (
              <h3 className="font-display text-xl md:text-2xl font-bold uppercase tracking-wide text-ink-primary">
                {title}
              </h3>
            )}
          </div>
          {tag && (
            <span className="shrink-0 font-mono text-[10px] tracking-widest uppercase text-radar border border-radar/40 rounded-full px-2.5 py-1 bg-radar/10">
              {tag}
            </span>
          )}
        </div>
        {children}
      </SpotlightCard>
    </div>
  );
}
