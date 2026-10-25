import AnimatedContent from "./AnimatedContent.jsx";
import BriefingPanel from "./BriefingPanel.jsx";
import ClassifiedText from "./ClassifiedText.jsx";

const CARDS = [
  {
    tag: "1955",
    title: "Origins",
    body: "The CIA selected the Groom Lake dry lakebed to flight-test the U-2 spy plane, choosing it for its remote location and natural runway. Lockheed's Skunk Works built the first test facilities within weeks.",
  },
  {
    tag: "COLD WAR",
    title: "What Was Really Tested",
    body: "Beyond the U-2, the site later hosted the A-12 OXCART and SR-71 Blackbird programs, along with early stealth aircraft like the F-117 Nighthawk — all developed in extreme secrecy.",
  },
  {
    tag: "2013",
    title: "Official Acknowledgment",
    body: "Through a Freedom of Information Act request, the CIA formally acknowledged the base's existence and name for the first time, confirming decades of its role in aerial reconnaissance testing.",
  },
  {
    tag: "TODAY",
    title: "Current Status",
    body: "The facility remains an active, restricted military installation under Edwards Air Force Base. It is not open to the public, and the airspace above it is permanently restricted.",
  },
];

export default function About() {
  return (
    <section id="about" className="max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-28 scroll-mt-16">
      <div className="max-w-2xl mb-12">
        <p className="eyebrow mb-3">Briefing // 01</p>
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase tracking-wide">
          <ClassifiedText text="What Is Area 51?" />
        </h2>
        <p className="mt-4 text-ink-muted leading-relaxed">
          Officially designated Homey Airport / Groom Lake, Area 51 is a highly classified U.S.
          Air Force facility roughly 83 miles north of Las Vegas. For decades the government
          would not confirm it existed — a silence that let real experimental-aircraft testing
          and UFO speculation grow side by side.
        </p>
      </div>

      <AnimatedContent className="grid sm:grid-cols-2 gap-5" distance={40} duration={0.7} stagger={0.1}>
        {CARDS.map((c) => (
          <BriefingPanel key={c.title} eyebrow={c.tag} title={c.title}>
            <p className="text-ink-muted text-sm leading-relaxed">{c.body}</p>
          </BriefingPanel>
        ))}
      </AnimatedContent>
    </section>
  );
}
