import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ClassifiedText from "./ClassifiedText.jsx";

gsap.registerPlugin(ScrollTrigger);

const EVENTS = [
  { year: "1955", text: "Lockheed test pilot Tony LeVier lands on the Groom Lake bed, selecting it as the U-2 test site." },
  { year: "1958", text: "The surrounding land is annexed into the Nevada Test Site, sealing off the area from public maps." },
  { year: "1962", text: "The A-12 OXCART, forerunner to the SR-71 Blackbird, begins flight testing at the base." },
  { year: "1974", text: "The F-117 Nighthawk stealth fighter program (\"Have Blue\") begins covert development on-site." },
  { year: "1989", text: "Bob Lazar publicly claims to have worked reverse-engineering an alien craft at a nearby site, igniting mainstream UFO interest in the base." },
  { year: "1995", text: "President Clinton exempts the site from environmental disclosure laws, reinforcing its secrecy." },
  { year: "2013", text: "A declassified CIA history of the U-2 program officially names \"Area 51\" for the first time." },
  { year: "2019", text: "The \"Storm Area 51\" internet event draws thousands of curious visitors to the perimeter, mostly for the spectacle." },
];

export default function Timeline() {
  const trackRef = useRef(null);
  const lineRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      // Glowing line fills the track in step with scroll position
      gsap.fromTo(
        lineRef.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: trackRef.current, start: "top 70%", end: "bottom 70%", scrub: true },
        }
      );
      gsap.utils.toArray("li", trackRef.current).forEach((item) => {
        gsap.from(item, {
          opacity: 0,
          x: -24,
          duration: 0.6,
          ease: "power3.out",
          scrollTrigger: { trigger: item, start: "top 85%", once: true },
        });
      });
    }, trackRef);
    return () => ctx.revert();
  }, []);

  return (
    <section id="timeline" className="border-y border-steel bg-panel/40 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow mb-3">Briefing // 02</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
            <ClassifiedText text="Declassification Timeline" />
          </h2>
          <p className="mt-4 text-ink-muted leading-relaxed">
            A chronological record — from the base's founding to its slow, partial emergence
            into public record.
          </p>
        </div>

        <div ref={trackRef} className="relative ml-2">
          <span
            ref={lineRef}
            aria-hidden="true"
            className="absolute left-0 top-0 h-full w-px origin-top bg-cyan-bright shadow-[0_0_8px_1px_rgba(103,232,249,0.7)]"
          />
          <ol className="border-l border-steel-light/50">
            {EVENTS.map((e) => (
              <li key={e.year} className="relative pl-8 pb-10 last:pb-0">
                <span className="absolute -left-[7px] top-1 w-3.5 h-3.5 rounded-full bg-void border-2 border-cyan-bright shadow-[0_0_10px_2px_rgba(103,232,249,0.5)]" />
                <span className="font-mono text-cyan-bright text-sm tracking-widest">{e.year}</span>
                <p className="mt-1 text-ink-muted text-sm md:text-base leading-relaxed max-w-2xl">
                  {e.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
