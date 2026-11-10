import { useState } from "react";
import { Compass } from "lucide-react";
import { getIslandArtwork, ISLANDS } from "../data/islands.js";

export function ExpeditionAtlas() {
  const [activeIsland, setActiveIsland] = useState(ISLANDS[0]);
  return (
    <div className="entry-atlas">
      <ul className="entry-atlas-index" aria-label="Islands of Ætheria">
        {ISLANDS.map((island, index) => (
          <li key={island.id}>
            <button type="button" aria-pressed={island.id === activeIsland.id} aria-controls="entry-atlas-plate"
              onClick={() => setActiveIsland(island)}>
              <span className="entry-atlas-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span>{island.name}<small>{island.topic}</small></span>
            </button>
          </li>
        ))}
      </ul>
      <figure id="entry-atlas-plate" className="entry-atlas-plate" aria-live="polite">
        <img key={activeIsland.id} src={getIslandArtwork(activeIsland.id).illustration} alt=""
          loading="lazy" width={800} height={550} />
        <figcaption>
          <Compass size={27} strokeWidth={1.3} aria-hidden="true" />
          <div>
            <p className="entry-eyebrow">{activeIsland.topic}</p>
            <h3>{activeIsland.name}</h3>
            <p>{activeIsland.tagline}</p>
          </div>
        </figcaption>
      </figure>
    </div>
  );
}
