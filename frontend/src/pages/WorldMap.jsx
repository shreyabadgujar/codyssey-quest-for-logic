import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Compass, LockKeyhole, Maximize2, Minimize2, Navigation, RotateCcw } from "lucide-react";
import IslandInfoPanel from "../components/IslandInfoPanel.jsx";
import IslandMarker from "../components/IslandMarker.jsx";
import { MapExplorer } from "../components/MapExplorer.jsx";
import WorldMapTerrain from "../components/WorldMapTerrain.jsx";
import OrnateFrame from "../components/ui/OrnateFrame.jsx";
import { ISLANDS } from "../data/islands.js";
import { chartPosition, STARTING_BERTH, WORLD_MAP_LAYOUT } from "../data/worldMapLayout.js";
import { getExplorerPosition } from "../game/explorerPosition.js";
import { getIslandProgress, useProgression } from "../game/progression.js";
import { useAuth } from "../hooks/useAuth.js";
import { useJournalOverlay } from "../hooks/useJournalOverlay.js";
import "../styles/world-map.css";

export default function WorldMap() {
  const [selectedIslandId, setSelectedIslandId] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [tabAppearance, setTabAppearance] = useState(null);
  const overall = useProgression();
  const { user } = useAuth();
  const userId = user?._id;
  const explorer = tabAppearance && tabAppearance._id === userId ? tabAppearance : user;
  const { label } = getExplorerPosition(ISLANDS, getIslandProgress);
  const currentIsland = ISLANDS.find(island => island.name === label);
  const berth = currentIsland ? WORLD_MAP_LAYOUT[currentIsland.id].berth : STARTING_BERTH;
  const selectedIsland = ISLANDS.find(island => island.id === selectedIslandId);

  useJournalOverlay(Boolean(selectedIslandId), () => setSelectedIslandId(null), true);

  useEffect(() => {
    function syncExplorer(event) {
      if (event.key !== "codyssey_user" || !event.newValue || !userId) return;
      try {
        const { _id, avatar, inventory } = JSON.parse(event.newValue);
        if (_id === userId) setTabAppearance({ _id, avatar, inventory });
      } catch {
        // Keep the authenticated explorer if a storage update is malformed.
      }
    }
    window.addEventListener("storage", syncExplorer);
    return () => window.removeEventListener("storage", syncExplorer);
  }, [userId]);

  return (
    <div className="wm-page">
      <header className="wm-heading">
        <div>
          <p className="wm-kicker"><Compass size={15} aria-hidden="true" /> The Grand Sea Chart</p>
          <h1>The Archipelago of Ætheria</h1>
          <p className="annotation text-xs sm:text-sm">Follow the sea lanes to an island and open its expedition journal.</p>
        </div>
        <div className="wm-status">
          <span className="wm-clear-count"><Check size={15} aria-hidden="true" /> {overall.completedIslands} / {overall.totalIslands} Islands Cleared</span>
          {selectedIslandId && <button type="button" onClick={() => setSelectedIslandId(null)} className="btn-ghost text-xs py-1 px-2.5"><RotateCcw size={13} /> Deselect</button>}
        </div>
      </header>

      <OrnateFrame className="wm-frame">
        <div className="wm-viewport" id="world-map-chart" data-expanded={expanded}>
          <div className="wm-chart">
            <WorldMapTerrain selectedIslandId={selectedIslandId} />
            {explorer && <MapExplorer user={explorer} position={{ ...chartPosition(berth), label }} />}
            {ISLANDS.map(island => <IslandMarker key={island.id} island={island}
              position={chartPosition(WORLD_MAP_LAYOUT[island.id].label)}
              isSelected={selectedIslandId === island.id} isCurrent={currentIsland?.id === island.id}
              onSelect={() => setSelectedIslandId(island.id)} progress={getIslandProgress(island.id)} />)}
          </div>
        </div>
        <div className="wm-chart-footer">
          <p className="wm-location"><Navigation size={15} aria-hidden="true" /> Explorer at <strong>{label}</strong></p>
          <button type="button" className="wm-zoom btn-ghost" aria-controls="world-map-chart" aria-pressed={expanded}
            onClick={() => setExpanded(value => !value)}>
            {expanded ? <Minimize2 size={14} aria-hidden="true" /> : <Maximize2 size={14} aria-hidden="true" />}
            {expanded ? "Whole chart" : "Enlarge chart"}
          </button>
          <p className="wm-pan-note" hidden={!expanded}>Swipe across the chart to explore.</p>
        </div>
      </OrnateFrame>
      <ul className="wm-legend" aria-label="Island marker legend">
        <li><Compass size={15} aria-hidden="true" /> Open</li>
        <li><Navigation size={15} aria-hidden="true" /> Current expedition</li>
        <li><Check size={15} aria-hidden="true" /> Charted</li>
        <li><LockKeyhole size={15} aria-hidden="true" /> Locked</li>
      </ul>

      {selectedIsland && createPortal(
        <div className="fixed inset-0 z-50 pointer-events-none" role="region" aria-label="Island Journal">
          <div className="journal-viewport pointer-events-auto fixed left-3 sm:left-6 lg:left-8 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] shadow-lift animate-fade-in">
            <IslandInfoPanel key={selectedIsland.id} island={selectedIsland} onClose={() => setSelectedIslandId(null)} />
          </div>
        </div>, document.body
      )}
    </div>
  );
}
