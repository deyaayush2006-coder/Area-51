import AnimatedContent from "./AnimatedContent.jsx";
import BriefingPanel from "./BriefingPanel.jsx";
import ClassifiedText from "./ClassifiedText.jsx";
import CountUp from "./CountUp.jsx";

// Numeric stats roll like an odometer (CountUp); the text one decrypts instead
const STATS = [
  { label: "Established", count: { to: 1955 } },
  { label: "Size", count: { to: 38400, separator: ",", prefix: "~", suffix: " acres" } },
  { label: "Nearest City", count: { to: 83, prefix: "Las Vegas, ~", suffix: "mi" } },
  { label: "Controlling Branch", text: "U.S. Air Force" },
];

const FAQS = [
  {
    q: "Is Area 51 open to visitors?",
    a: "No. It is an active restricted military installation. Trespassing is a federal offense, and the perimeter is monitored and enforced.",
  },
  {
    q: "Why is it associated with UFOs?",
    a: "Decades of unexplained aircraft sightings near the base were, in many cases, later attributed to classified stealth and reconnaissance aircraft being tested in secrecy.",
  },
  {
    q: "Can you see it from public land?",
    a: "Distant views are possible from a few points like Tikaboo Peak, tens of miles away — close approaches are restricted and marked by warning signage.",
  },
  {
    q: "What does the government say today?",
    a: "The CIA has acknowledged the base's existence and its role in Cold War-era aircraft testing, though most current operations remain classified.",
  },
];

export default function Facts() {
  return (
    <section id="facts" className="border-t border-steel bg-panel/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-2xl mb-12">
          <p className="eyebrow mb-3">Briefing // 04</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
            <ClassifiedText text="Quick Intel" />
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          {STATS.map((s) => (
            <div key={s.label} className="hud-panel hud-corners rounded-sm p-5 text-center">
              <p className="font-display text-lg md:text-xl font-bold text-cyan-bright">
                {s.count ? <CountUp mode="roll" duration={2.2} {...s.count} /> : <ClassifiedText text={s.text} />}
              </p>
              <p className="mt-1 font-mono text-[10px] tracking-widest uppercase text-ink-muted">
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <AnimatedContent className="grid md:grid-cols-2 gap-5" distance={40} duration={0.7} stagger={0.1}>
          {FAQS.map((f) => (
            <BriefingPanel key={f.q} title={f.q}>
              <p className="text-ink-muted text-sm leading-relaxed">{f.a}</p>
            </BriefingPanel>
          ))}
        </AnimatedContent>
      </div>
    </section>
  );
}
