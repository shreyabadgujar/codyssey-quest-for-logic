import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useJournalOverlay } from "../hooks/useJournalOverlay.js";
import { useParams, Link } from "react-router-dom";
import { ISLANDS } from "../data/islands.js";
import IslandInfoPanel from "../components/IslandInfoPanel.jsx";
import LevelProgressionList from "../components/LevelProgressionList.jsx";
import { getIsland } from "../services/gameService.js";
import { Map, ArrowLeft, AlertCircle, BookOpen } from "lucide-react";

export default function IslandDetails() {
  const { islandId } = useParams();
  const metadata = ISLANDS.find((i) => i.id === islandId);
  const [published,setPublished] = useState(null);
  const [loadError,setLoadError] = useState("");
  const island = metadata ? {...metadata,...published} : null;
  useEffect(()=>{
    let active=true;setPublished(null);setLoadError("");
    getIsland(islandId).then(data=>{if(active)setPublished(data);}).catch(error=>{if(active)setLoadError(error.message);});
    return ()=>{active=false;};
  },[islandId]);
  const containerRef = useRef(null);
  const [panelLeft, setPanelLeft] = useState(null);
  const [mobileDossierOpen, setMobileDossierOpen] = useState(false);
  useJournalOverlay(mobileDossierOpen, () => setMobileDossierOpen(false));

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const closeOnDesktop = () => { if (desktop.matches) setMobileDossierOpen(false); };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  // Measure container left edge to anchor desktop fixed panel pixel-perfectly
  useEffect(() => {
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPanelLeft(rect.left);
      }
    };
    updatePosition();
    window.addEventListener("resize", updatePosition);
    return () => window.removeEventListener("resize", updatePosition);
  }, []);

  if (!island) {
    return (
      <div className="folio text-center py-12 max-w-lg mx-auto space-y-4">
        <AlertCircle size={40} className="mx-auto text-oxblood" />
        <h2 className="font-display text-2xl text-ink">Uncharted Waters</h2>
        <p className="annotation text-sepia">No island with coordinates "{islandId}" appears on the grand sea chart.</p>
        <Link to="/map" className="btn-brass no-underline inline-flex items-center gap-2">
          <Map size={16} /> Return to World Map
        </Link>
      </div>
    );
  }

  // Combine static level data with current progression status
  const levelsWithStatus = published?.levels || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-display">
        <Link to="/map" className="btn-ghost py-1 px-2.5 no-underline inline-flex items-center gap-1.5 text-sepia hover:text-ink">
          <ArrowLeft size={14} /> Back to Map
        </Link>
        <span className="text-sepia">/</span>
        <span className="text-ink font-semibold">{island.name}</span>
      </div>

      {/* Main Container: Fixed Left Journal Panel + Scrolling Mission Column */}
      <div ref={containerRef} className="flex flex-col lg:flex-row gap-8 items-start relative pt-1">
        {/* Desktop Left Spacer: Reserves space in document flow so missions align cleanly */}
        <div className="hidden lg:block lg:w-[410px] xl:w-[440px] shrink-0" aria-hidden="true" />

        {/* Desktop Viewport-Anchored Fixed Journal Dossier (Never moves or shifts when scrolling missions) */}
        {createPortal(<div
          className="journal-viewport hidden lg:block fixed z-20 w-[410px] xl:w-[440px] shadow-lift animate-fade-in"
          style={{
            left: panelLeft !== null ? `${panelLeft}px` : "max(1rem, calc((100vw - 1152px) / 2 + 1rem))",
          }}
        >
          <IslandInfoPanel key={island.id} island={island} />
        </div>, document.body)}

        {/* Mobile/Tablet Compact Header with Dossier Modal Trigger */}
        <div className="lg:hidden w-full paper p-3 border border-ink/40 rounded-sm flex items-center justify-between gap-3 shadow-paper">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src="/assets/decorations/wax-seal.webp"
              alt=""
              width={24}
              height={24}
              className="w-6 h-6 object-contain drop-shadow shrink-0"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
            <div className="min-w-0">
              <span className="font-display text-sm text-ink block leading-tight truncate">
                {island.name} Dossier
              </span>
              <span className="annotation text-xs text-sepia truncate block">
                {island.topic} • {island.totalLevels} Archival Cases
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileDossierOpen(true)}
            className="btn-brass text-xs py-1.5 px-3 inline-flex items-center gap-1.5 shrink-0"
          >
            <BookOpen size={14} />
            <span>Open Dossier</span>
          </button>
        </div>

        {/* Mobile/Tablet Dismissible Dossier Sheet */}
        {mobileDossierOpen && createPortal(
          <div
            className="journal-viewport fixed inset-x-0 z-50 flex items-start justify-center px-3 bg-ink/60 backdrop-blur-xs animate-fade-in"
            onClick={() => setMobileDossierOpen(false)}
          >
            <div
              className="w-full max-w-md h-full min-h-0 shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <IslandInfoPanel island={island} onClose={() => setMobileDossierOpen(false)} />
            </div>
          </div>, document.body
        )}

        {/* Right Column: Mission Progression List (Scrolls freely on page without moving the left dossier) */}
        <div className="flex-1 w-full space-y-4 min-w-0">
          <div className="folio p-4 border-b">
            <h3 className="font-display text-xl text-ink">Archival Investigation Cases</h3>
            <p className="annotation text-xs text-sepia">
              Solve each case sequentially to gather clues, discover hidden objects, and unlock the next frontier.
            </p>
          </div>

          {loadError?<p role="alert" className="folio">{loadError}</p>:!published?<p role="status">Loading case files…</p>:<LevelProgressionList levels={levelsWithStatus} />}
        </div>
      </div>
    </div>
  );
}

