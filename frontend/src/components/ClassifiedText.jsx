import DecryptedText from "./DecryptedText.jsx";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*/<>";

// DecryptedText preset for the terminal theme: scrambles once when scrolled into view
export default function ClassifiedText(props) {
  return (
    <DecryptedText
      animateOn="view"
      sequential
      speed={40}
      characters={GLYPHS}
      encryptedClassName="text-cyan-bright/60"
      {...props}
    />
  );
}
