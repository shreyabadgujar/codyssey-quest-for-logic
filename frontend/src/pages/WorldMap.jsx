import { useState, useMemo } from "react";
import { useJournalOverlay } from "../hooks/useJournalOverlay.js";
import { createPortal } from "react-dom";
import { ISLANDS } from "../data/islands.js";
import IslandMarker from "../components/IslandMarker.jsx";
import IslandInfoPanel from "../components/IslandInfoPanel.jsx";
import OrnateFrame from "../components/ui/OrnateFrame.jsx";
import { useProgression, getIslandProgress } from "../game/progression.js";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { MapExplorer } from "../components/MapExplorer.jsx";
import { getExplorerPosition } from "../game/explorerPosition.js";

export default function WorldMap() {
  const [selectedIslandId, setSelectedIslandId] = useState(null);
  const [mapError, setMapError] = useState(false);
  const overall = useProgression();
  const { user } = useAuth();
  const explorerPosition = getExplorerPosition(ISLANDS, getIslandProgress);

  useJournalOverlay(Boolean(selectedIslandId), () => setSelectedIslandId(null), true);

  const selectedIsland = useMemo(
    () => ISLANDS.find((i) => i.id === selectedIslandId) || null,
    [selectedIslandId]
  );

  // Generate unique nautical voyage trade routes between islands
  const tradeRoutes = useMemo(() => {
    const routeSet = new Set();
    const connections = [];

    ISLANDS.forEach((source) => {
      source.routes?.forEach((targetId) => {
        const target = ISLANDS.find((i) => i.id === targetId);
        if (target) {
          const key = [source.id, target.id].sort().join("<->");
          if (!routeSet.has(key)) {
            routeSet.add(key);
            connections.push({
              id: key,
              from: source.mapPosition,
              to: target.mapPosition,
              active: selectedIslandId === source.id || selectedIslandId === target.id,
            });
          }
        }
      });
    });

    return connections;
  }, [selectedIslandId]);

  return (
    <div className="space-y-4">
      {/* Map Plaque Cartouche & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl sm:text-3xl text-ink leading-tight">
              The Archipelago of Ætheria
            </h1>
            <span className="annotation text-xs sm:text-sm text-sepia hidden md:inline">
              Ten Realms of Logic
            </span>
          </div>
          <p className="annotation text-xs sm:text-sm text-sepia mt-0.5">
            Click any island marker to open its mission journal and chart your next voyage.
          </p>
        </div>

        {/* Quick Map Legend / Status */}
        <div className="flex items-center gap-2 text-xs">
          <div className="paper px-3 py-1.5 rounded-sm border border-ink/40 flex items-center gap-2 shadow-xs">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-olive-dark shadow-xs" />
            <span className="font-display text-ink">
              {overall.completedIslands} / {overall.totalIslands} Islands Cleared
            </span>
          </div>
          {selectedIslandId && (
            <button
              onClick={() => setSelectedIslandId(null)}
              className="btn-ghost text-xs py-1 px-2.5 text-sepia hover:text-ink inline-flex items-center gap-1"
            >
              <RotateCcw size={13} />
              <span>Deselect</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Map Centerpiece (Full Width, never squished) */}
      <div className="w-full">
        <OrnateFrame className="overflow-hidden">
          {/* Aspect Ratio Box matching aetheria-map.webp (1456 x 1144 = 182 / 143) */}
          <div
            className="relative w-full rounded-sm overflow-hidden select-none"
            style={{
              aspectRatio: "1456 / 1144",
              background: "rgb(var(--c-parchment-dark))",
            }}
          >
            {/* Map Image */}
            {!mapError ? (
              <img
                src="/assets/maps/aetheria-map.webp"
                alt="World Map of Ætheria"
                className="w-full h-full object-contain pointer-events-none select-none"
                onError={() => setMapError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-oxblood bg-oxblood/10">
                <AlertCircle size={40} className="mb-2" />
                <h3 className="font-display text-lg">World Map Asset Missing</h3>
                <p className="annotation text-xs mt-1 max-w-sm">
                  Could not load <code>/assets/maps/aetheria-map.webp</code>. Please verify the file exists in the public directory.
                </p>
              </div>
            )}

            {/* SVG Nautical Voyage Dotted Paths Layer */}
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="absolute inset-0 w-full h-full pointer-events-none z-0"
            >
              <defs>
                <filter id="route-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="rgb(42, 27, 18)" floodOpacity="0.4" />
                </filter>
              </defs>
              {tradeRoutes.map((route) => {
                // Calculate slight curve between islands for hand-drawn look
                const midX = (route.from.x + route.to.x) / 2 + (route.from.y - route.to.y) * 0.08;
                const midY = (route.from.y + route.to.y) / 2 + (route.to.x - route.from.x) * 0.08;
                const d = `M ${route.from.x} ${route.from.y} Q ${midX} ${midY} ${route.to.x} ${route.to.y}`;

                return (
                  <path
                    key={route.id}
                    d={d}
                    fill="none"
                    stroke={route.active ? "rgb(var(--c-brass))" : "rgb(var(--c-sepia) / 0.45)"}
                    strokeWidth={route.active ? "0.6" : "0.35"}
                    strokeDasharray={route.active ? "1.5, 1.5" : "1.2, 1.8"}
                    filter="url(#route-glow)"
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>

            {/* Animated Sea Galleon Ship Asset */}
            <div
              className="absolute pointer-events-none z-5 transition-transform duration-1000 hidden sm:block"
              style={{
                left: "14%",
                top: "84%",
                width: "7.5%",
                transform: "translate(-50%, -50%)",
              }}
              title="The Explorer's Galleon"
            >
              <img
                src="/assets/decorations/ship.webp"
                alt="Galleon"
                className="w-full h-auto drop-shadow-md animate-pulse"
                style={{ animationDuration: "4s" }}
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>

            {!mapError && user && <MapExplorer avatar={user.avatar} position={explorerPosition} />}

            {/* Interactive Island Markers */}
            {ISLANDS.map((island) => {
              const islandProgress = getIslandProgress(island.id);
              return (
                <IslandMarker
                  key={island.id}
                  island={island}
                  isSelected={selectedIslandId === island.id}
                  onSelect={(isl) => setSelectedIslandId(isl.id)}
                  progress={islandProgress}
                />
              );
            })}

            {/* Top Banner Plaque Overlay */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 pointer-events-none select-none hidden sm:block">
              <span className="cartouche text-xs py-1 px-4 text-ink shadow-paper opacity-90 border border-ink/40">
                ARCHIPELAGO DE ÆTHERIA
              </span>
            </div>
          </div>
        </OrnateFrame>
      </div>

      {/* Floating Viewport-Anchored Island Journal Panel via React Portal */}
      {selectedIsland &&
        createPortal(
          <div
            className="fixed inset-0 z-50 pointer-events-none"
            role="region"
            aria-label="Island Journal"
          >
            {/* Desktop & Mobile: Anchored fixed floating panel */}
            <div
              className="journal-viewport pointer-events-auto fixed left-3 sm:left-6 lg:left-8 w-[calc(100vw-24px)] sm:w-[420px] max-w-[420px] shadow-lift animate-fade-in"
            >
              <IslandInfoPanel
                key={selectedIsland.id}
                island={selectedIsland}
                onClose={() => setSelectedIslandId(null)}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}


