import { Link } from "react-router-dom";
import { motion } from "motion/react";
import CompassRose from "../components/ui/CompassRose.jsx";
import OrnateFrame from "../components/ui/OrnateFrame.jsx";
import ArtPlaceholder from "../components/ui/ArtPlaceholder.jsx";

// Skeleton landing page demonstrating the Aetherian Cartography identity.
export default function Landing() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] items-center">
      <div>
        <p className="annotation">The Archipelago of Ætheria &amp; the Forbidden Isles</p>
        <div className="cartouche my-4">
          <h1 style={{ fontSize: "var(--text-3xl)" }}>Codyssey</h1>
          <p className="annotation">Quest for Logic</p>
        </div>
        <p className="max-w-prose" style={{ fontSize: "var(--text-lg)" }}>
          Ten islands hold ten unsolved mysteries. Read the case, write the code that cracks it,
          and follow each clue to the object hidden on the map.
        </p>
        <hr className="rule-ornate max-w-xs" />
        <div className="flex flex-wrap gap-3">
          <Link to="/register" className="btn-brass no-underline">Begin Your Quest</Link>
          <Link to="/map" className="btn-ghost no-underline">Unfold the Map</Link>
        </div>
      </div>

      <OrnateFrame>
        <motion.div className="relative overflow-hidden rounded-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <img
            src="/assets/maps/aetheria-map.webp"
            alt="The Grand Illustrated Map of Ætheria"
            className="w-full h-80 object-cover rounded-sm shadow-paper hover:scale-105 transition-transform duration-700 select-none"
          />
          <div className="absolute inset-0 bg-ink/10 pointer-events-none" />
          <CompassRose size={110} className="absolute -right-3 -bottom-3 drop-shadow-lift" />
        </motion.div>
      </OrnateFrame>
    </div>
  );
}
