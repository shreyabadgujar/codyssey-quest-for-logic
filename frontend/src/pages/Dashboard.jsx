import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { ISLANDS } from "../data/islands.js";
import { useProgression, getIslandProgress } from "../game/progression.js";
import PlayerProfileSummary from "../components/PlayerProfileSummary.jsx";
import CoinDisplay from "../components/CoinDisplay.jsx";
import { Map, Compass, ChevronRight } from "lucide-react";
import { EarnedBadges } from "../components/EarnedBadges.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const overall = useProgression();


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Player Profile & Stats */}
      {user && <PlayerProfileSummary player={user} />}

      {/* Hero Map Callout Banner */}
      <div
        className="folio relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6"
        style={{
          border: "2px solid rgb(var(--c-ink))",
          outline: "2px solid rgb(var(--c-brass))",
          outlineOffset: "-6px",
          background: "linear-gradient(135deg, rgb(var(--c-parchment-light)), rgb(var(--c-parchment)))",
        }}
      >
        <div className="space-y-3 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <span className="cartouche text-xs py-1 px-3 text-ink">The Grand Sea Chart</span>
            <span className="annotation text-xs text-sepia">10 Realms Await</span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl text-ink leading-tight">
            Unfold the Map of Ætheria
          </h2>
          <p className="font-body text-sm md:text-base text-ink/80 leading-relaxed">
            Ten islands hold fifty algorithmic mysteries. Sail from the zero-indexed coral reefs of Array Archipelago to the chrono-crystalline rifts of Dynamic Programming.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/map" className="btn-brass no-underline text-base py-2.5 px-6 inline-flex items-center gap-2 shadow-lift">
              <Map size={18} />
              <span>Open Interactive World Map</span>
              <ChevronRight size={18} />
            </Link>
            <span className="annotation text-xs text-sepia">
              {overall.completedCases} of {overall.totalCases} mysteries deciphered ({overall.percentage}%)
            </span>
          </div>
        </div>

        {/* Map Thumbnail Preview */}
        <div className="relative w-full max-w-xs md:w-72 shrink-0 rounded-sm overflow-hidden border-2 border-ink shadow-lift rotate-1 hover:rotate-0 transition-transform">
          <img
            src="/assets/maps/aetheria-map.webp"
            alt="World Map Preview"
            className="w-full h-auto object-cover"
          />
          <div className="absolute inset-0 bg-ink/10 pointer-events-none" />
          <div className="absolute bottom-2 right-2 bg-parchment-light/90 px-2 py-0.5 rounded-sm text-[10px] font-display border border-ink/40">
            Ætheria Chart
          </div>
        </div>
      </div>

      {/* Expeditions Grid: 10 Islands */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-ink/30 pb-2">
          <div>
            <h2 className="font-display text-xl text-ink">Active Island Expeditions</h2>
            <p className="annotation text-xs text-sepia">Level 1 of every island is unlocked and ready for investigation.</p>
          </div>
          <Link to="/map" className="btn-ghost text-xs py-1 px-3 no-underline inline-flex items-center gap-1">
            <Compass size={14} /> View on Map
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {ISLANDS.map((island) => {
            const p = getIslandProgress(island.id);
            const isCompleted = p.isCompleted;

            return (
              <div
                key={island.id}
                className={`folio p-3 flex flex-col justify-between transition-all duration-300 hover:shadow-lift ${
                  isCompleted ? "border-olive-dark bg-olive/5" : ""
                }`}
                style={{ minHeight: "260px" }}
              >
                <div>
                  {/* Island Thumbnail */}
                  <div
                    className="relative rounded-sm overflow-hidden mb-2.5 border border-ink/40"
                    style={{ aspectRatio: "16 / 11" }}
                  >
                    <img
                      src={island.image}
                      alt={island.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {isCompleted && (
                      <div className="absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md">
                        <img
                          src="/assets/decorations/wax-seal.webp"
                          alt="Completed"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 px-1.5 py-0.5 paper text-[10px] font-display border border-ink/30 rounded-xs">
                      {island.topic}
                    </div>
                  </div>

                  <h3 className="font-display text-sm font-semibold text-ink leading-snug">
                    {island.name}
                  </h3>
                  <p className="annotation text-[11px] text-sepia line-clamp-2 mt-0.5">
                    {island.tagline || island.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-ink/20 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="annotation text-[11px] text-sepia">Cleared:</span>
                    <span className="font-display font-medium text-ink">
                      {p.completedCount} / {island.totalLevels} Cases
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full bg-parchment-dark/50 rounded-full overflow-hidden border border-ink/20">
                    <div
                      className="h-full bg-olive-dark transition-all duration-300"
                      style={{ width: `${(p.completedCount / island.totalLevels) * 100}%` }}
                    />
                  </div>

                  <Link
                    to={`/islands/${island.id}`}
                    className="btn-brass text-xs py-1 px-2.5 w-full justify-center no-underline mt-1"
                  >
                    {isCompleted ? "Revisit Island" : "Explore Cases"}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <EarnedBadges />
    </div>
  );
}

