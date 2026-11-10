import { ArrowDown, ArrowRight, CodeXml, Compass, Map, Puzzle, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { ExpeditionAtlas } from "../components/ExpeditionAtlas.jsx";
import { AVATARS } from "../data/avatars.js";
import { getIslandArtwork } from "../data/islands.js";

const fieldwork = [
  { icon: ScrollText, title: "Read the case", detail: "Start with the story, examine the evidence, and identify the problem behind it." },
  { icon: CodeXml, title: "Write the solution", detail: "Choose a language in the coding lab and submit an algorithm against the mission’s test cases." },
  { icon: Puzzle, title: "Follow the clues", detail: "Track down hidden objects and take on interactive puzzles that unlock as you solve missions." },
];

const milestones = [
  { title: "Apprentice", detail: "Read your first case and build confidence with core data structures." },
  { title: "Journeyman", detail: "Take on harder missions that ask you to combine ideas and refine your algorithms." },
  { title: "Master", detail: "Work through advanced cases across the archipelago and complete your island collection." },
];

export default function Landing() {
  return (
    <div className="entry-landing">
      <section className="entry-hero" aria-labelledby="entry-title">
        <img className="entry-hero-art" src={getIslandArtwork("graphbound-kingdom").illustration}
          alt="" width={800} height={550} fetchPriority="high" />
        <div className="entry-hero-frame" aria-hidden="true" />
        <div className="entry-hero-inner">
          <p className="entry-eyebrow"><Compass size={18} aria-hidden="true" /> The Archipelago of Ætheria</p>
          <h1 id="entry-title">Codyssey <span>Quest for Logic</span></h1>
          <p className="entry-hero-tagline">Every island holds a mystery.<br />Every challenge reveals a secret.</p>
          <p className="entry-hero-description">Explore ten islands, solve data structures and algorithms cases, and follow the evidence to artifacts hidden across Ætheria.</p>
          <div className="entry-actions">
            <Link to="/register" className="entry-button entry-button-gold">Begin Your Expedition <ArrowRight size={18} aria-hidden="true" /></Link>
            <Link to="/map" className="entry-button entry-button-outline"><Map size={17} aria-hidden="true" /> Explore the World</Link>
          </div>
        </div>
        <a className="entry-hero-index" href="#expedition-journal"><ArrowDown size={15} aria-hidden="true" /> Field journal</a>
        <p className="entry-hero-credit" aria-hidden="true">Plate IX <span /> Graphbound Kingdom</p>
      </section>

      <div className="entry-journal" id="expedition-journal">
        <section className="entry-chapter entry-chapter-atlas" aria-labelledby="entry-atlas-title">
          <header className="entry-chapter-heading">
            <p className="entry-eyebrow">01 <span /> The island index</p>
            <h2 id="entry-atlas-title">Explore the Unknown</h2>
            <p>Each island is home to a different branch of DSA. Open an atlas entry to see where your investigation might begin.</p>
          </header>
          <ExpeditionAtlas />
        </section>

        <section className="entry-chapter entry-chapter-cases" aria-labelledby="entry-cases-title">
          <div className="entry-case-copy">
            <header className="entry-chapter-heading">
              <p className="entry-eyebrow">02 <span /> Field investigation</p>
              <h2 id="entry-cases-title">Solve the Mysteries</h2>
            </header>
            <ol className="entry-case-steps">
              {fieldwork.map(({ icon: Icon, title, detail }) => (
                <li key={title}><Icon size={23} strokeWidth={1.5} aria-hidden="true" /><div><h3>{title}</h3><p>{detail}</p></div></li>
              ))}
            </ol>
          </div>
          <figure className="entry-case-plate">
            <img src={getIslandArtwork("recursion-realm").illustration} alt="Nested stone arches lead to a glowing chamber in Recursion Realm"
              width={800} height={550} loading="lazy" />
            <figcaption><span className="entry-eyebrow">Site sketch · Recursion Realm</span><span>How far do the arches go?</span></figcaption>
          </figure>
        </section>

        <section className="entry-chapter entry-chapter-collection" aria-labelledby="entry-collection-title">
          <figure className="entry-collection-plate">
            <img className="entry-collection-portrait" src={AVATARS[1].src} alt="The Wayfinder" loading="lazy" width={420} height={420} />
            <img className="entry-collection-owl" src="/assets/accessories/wardrobe/little-owl.webp" alt="Little Owl companion" loading="lazy" width={160} height={160} />
            <img className="entry-collection-frame" src="/assets/accessories/wardrobe/antique-gold-frame.webp" alt="" loading="lazy" />
            <figcaption>The Wayfinder <span>Expedition outfitting</span></figcaption>
          </figure>
          <div>
            <header className="entry-chapter-heading">
              <p className="entry-eyebrow">03 <span /> The curio cabinet</p>
              <h2 id="entry-collection-title">Collect Your Discoveries</h2>
              <p>Recover island artifacts, earn coins and achievement medals, and outfit your explorer at the Trading Post.</p>
            </header>
            <ul className="entry-relics">
              <li><img src="/assets/treasures/mystery-artifact.webp" alt="" loading="lazy" width={80} height={80} />Island artifacts</li>
              <li><img src="/assets/treasures/gold-coin.webp" alt="" loading="lazy" width={80} height={80} />Gold coins</li>
              <li><img src="/assets/achievements/archive/world-explorer.webp" alt="" loading="lazy" width={80} height={80} />Achievement medals</li>
            </ul>
            <p className="entry-collection-note">Choose your avatar, then make it your own with frames, backgrounds, pins, and companions.</p>
          </div>
        </section>

        <section className="entry-chapter entry-chapter-ranks" aria-labelledby="entry-ranks-title">
          <header className="entry-chapter-heading">
            <p className="entry-eyebrow">04 <span /> The expedition record</p>
            <h2 id="entry-ranks-title">Become a Master Explorer</h2>
            <p>Solve cases to earn XP and unlock the next mission on each island. Your expedition record grows with every discovery.</p>
          </header>
          <ol className="entry-milestones">
            {milestones.map(({ title, detail }, index) => (
              <li key={title}><span aria-hidden="true">{["I", "II", "III"][index]}</span><h3>{title}</h3><p>{detail}</p></li>
            ))}
          </ol>
          <Link to="/register" className="entry-button entry-button-gold">Begin Your Expedition <ArrowRight size={18} aria-hidden="true" /></Link>
        </section>
      </div>
    </div>
  );
}
