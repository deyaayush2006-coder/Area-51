import Navbar from "./components/Navbar.jsx";
import RadarHero from "./components/RadarHero.jsx";
import About from "./components/About.jsx";
import Timeline from "./components/Timeline.jsx";
import Gallery from "./components/Gallery.jsx";
import Facts from "./components/Facts.jsx";
import FeedbackConsole from "./components/FeedbackConsole.jsx";
import Footer from "./components/Footer.jsx";
import ScanlineOverlay from "./components/ScanlineOverlay.jsx";
import FaultyTerminal from "./components/FaultyTerminal.jsx";

export default function App() {
  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Site-wide CRT glyph field behind everything; half-res dpr keeps the GPU cost down */}
      <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none" aria-hidden="true">
        <FaultyTerminal
          tint="#5eead4"
          glyphs="characters"
          scale={1.4}
          brightness={0.55}
          timeScale={0.4}
          scanlineIntensity={0.4}
          curvature={0.12}
          mouseStrength={0.3}
          vignette={0.5}
          dpr={0.5}
        />
      </div>
      <ScanlineOverlay />
      <Navbar onNavigate={scrollTo} />
      <main className="flex-1">
        <RadarHero onNavigate={scrollTo} />
        <About />
        <Timeline />
        <Gallery />
        <Facts />
        <FeedbackConsole />
      </main>
      <Footer />
    </div>
  );
}
