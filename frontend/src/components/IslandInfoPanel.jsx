import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { X, Lock, CheckCircle2, Compass, Award, ChevronDown, ChevronUp } from "lucide-react";
import { useProgression } from "../game/progression.js";
import { getIsland } from "../services/gameService.js";
import CoinDisplay from "./CoinDisplay.jsx";

export default function IslandInfoPanel({ island: metadata, onClose, initialCollapsed = false }) {
  const [published,setPublished]=useState(null);
  useEffect(()=>{let active=true;setPublished(null);if(metadata)getIsland(metadata.id).then(data=>{if(active)setPublished(data);}).catch(()=>{});return()=>{active=false;};},[metadata?.id]);
  const island=metadata?{...metadata,...published}:null;
  const [imgError, setImgError] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const progress = useProgression(island?.id);
  const location = useLocation();

  if (!island) return null;

  const isCurrentIslandPage = location.pathname === `/islands/${island.id}`;
  const totalLevels = island.totalLevels || 5;
  const completedCount = progress.completedCount || 0;
  const unlockedLevels = progress.unlocked || [1];
  const completedLevels = progress.completed || [];


  return (
    <aside
      className={`folio relative flex flex-col w-full shadow-lift overflow-hidden transition-all duration-200 ${
        isCollapsed ? "h-auto max-h-full" : "h-full min-h-0 max-h-full"
      }`}
      style={{
        border: "2px solid rgb(var(--c-ink))",
        outline: "2px solid rgb(var(--c-brass) / 0.8)",
        outlineOffset: "-6px",
        padding: 0,
      }}
    >
      {/* Pinned Dossier Header (Always visible and accessible) */}
      <div className="shrink-0 flex items-start justify-between gap-2 border-b border-ink/30 p-3 bg-parchment/95 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/assets/decorations/wax-seal.webp"
            alt=""
            width={28}
            height={28}
            className="w-7 h-7 object-contain drop-shadow shrink-0"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
          <div className="min-w-0">
            <span className="annotation text-xs text-sepia block truncate">
              Case Journal • Region {island.order}
            </span>
            <h2 className="font-display text-lg sm:text-xl text-ink leading-tight truncate">
              {island.name}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="btn-ghost p-1 text-ink hover:text-sepia rounded-full"
            aria-label={isCollapsed ? "Expand Dossier" : "Collapse Dossier"}
            title={isCollapsed ? "Expand Dossier" : "Collapse Dossier"}
          >
            {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          {/* Close button if provided */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost p-1 text-ink hover:text-oxblood shrink-0 rounded-full"
              aria-label="Close Journal"
              title="Close Journal"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Internal Scrollable Dossier Body (Scrolls cleanly without moving the outer page) */}
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3.5 space-y-4 overscroll-contain custom-parchment-scrollbar">
            {/* Island Hero Illustration */}
            <div
              className="relative rounded-sm overflow-hidden border border-ink/60 shadow-paper shrink-0"
              style={{
                aspectRatio: "16 / 10",
                background: "rgb(var(--c-parchment-light))",
              }}
            >
              {!imgError ? (
                <img
                  src={island.image}
                  alt={island.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-sepia p-4 text-center">
                  <Compass size={36} className="mb-2 text-brass" />
                  <span className="font-display text-sm">{island.name} Illustration</span>
                </div>
              )}
              <div className="absolute bottom-2 left-2 px-2.5 py-1 paper text-xs font-display border border-ink/40 rounded-sm shadow-sm">
                DSA Topic: <span className="text-olive-dark font-bold">{island.topic}</span>
              </div>
            </div>

            {/* Mystery Introduction Lore */}
            <div>
              <p className="annotation text-xs text-brass-dark uppercase tracking-wider mb-1">
                {island.tagline || "The Forgotten Lands"}
              </p>
              <p className="font-body text-sm text-ink/90 leading-relaxed italic bg-parchment-light/40 p-2.5 rounded-sm border border-ink/10">
                "{island.description}"
              </p>
            </div>

            {/* Expedition Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-sm paper border border-ink/20">
                <div className="font-display text-lg text-ink font-semibold">{totalLevels}</div>
                <div className="annotation text-[11px] text-sepia">Missions</div>
              </div>
              <div className="p-2 rounded-sm paper border border-ink/20">
                <div className="font-display text-lg text-olive-dark font-semibold">{completedCount}</div>
                <div className="annotation text-[11px] text-sepia">Cleared</div>
              </div>
              <div className="p-2 rounded-sm paper border border-ink/20">
                <div className="font-display text-lg text-brass font-semibold">
                  {totalLevels - completedCount}
                </div>
                <div className="annotation text-[11px] text-sepia">Unsolved</div>
              </div>
            </div>

            {/* Rewards Overview */}
            <div className="p-3 rounded-sm bg-parchment-light/60 border border-ink/30 space-y-1.5 text-xs">
              <div className="font-display text-sepia font-semibold flex items-center gap-1.5">
                <Award size={15} className="text-brass" /> Island Completion Trophy:
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink font-medium">
                  {island.completionReward?.artifact || "Ancient Relic"}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-olive-dark font-bold">+{island.completionReward?.xp || 200} XP</span>
                  <CoinDisplay coins={island.completionReward?.coins || 100} size={15} />
                </div>
              </div>
            </div>

            {/* Mission Cases Progression Ladder */}
            <div>
              <h3 className="font-display text-sm tracking-wide text-ink mb-2 flex items-center justify-between">
                <span>Mission Logs:</span>
                <span className="annotation text-xs text-sepia font-normal">Level 1 Unlocked</span>
              </h3>
              <ol className="list-none p-0 m-0 space-y-2">
                {island.levels?.map((lvl) => {
                  const isDone = completedLevels.includes(lvl.level);
                  const isUnlocked = unlockedLevels.includes(lvl.level);

                  return (
                    <li
                      key={lvl.level}
                      className={`p-2.5 rounded-sm border transition-all text-xs flex items-center justify-between gap-2 ${
                        isDone
                          ? "bg-olive/10 border-olive/50 text-olive-dark"
                          : isUnlocked
                          ? "paper border-brass text-ink shadow-sm"
                          : "opacity-50 border-ink/20 bg-parchment-dark/20 text-sepia"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isDone ? (
                          <CheckCircle2 size={16} className="text-olive-dark shrink-0" aria-label="Completed" />
                        ) : isUnlocked ? (
                          <Compass size={16} className="text-brass shrink-0" aria-label="Available" />
                        ) : (
                          <Lock size={16} className="text-sepia shrink-0" aria-label="Locked" />
                        )}
                        <div>
                          <div className="font-display font-medium">
                            Case {lvl.level}: {lvl.title}
                          </div>
                          <div className="annotation text-[10px] text-sepia capitalize">
                            {lvl.difficulty} • +{lvl.xp} XP
                          </div>
                        </div>
                      </div>

                      <div>
                        {isDone ? (
                          <span className="annotation text-[10px] text-olive-dark font-semibold">Solved</span>
                        ) : isUnlocked ? (
                          <Link
                            to={published ? `/missions/${lvl.id}` : `/islands/${island.id}`}
                            className="btn-brass text-[10px] py-1 px-2 no-underline"
                          >
                            Investigate
                          </Link>
                        ) : (
                          <span className="annotation text-[10px] text-sepia">Locked</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Pinned Dossier Action Footer (Always accessible at bottom of panel) */}
          <div className="shrink-0 p-3 pt-2.5 border-t border-ink/30 flex flex-col gap-2 bg-parchment/95">
            {!isCurrentIslandPage ? (
              <Link
                to={`/islands/${island.id}`}
                className="btn-brass justify-center text-center no-underline py-2 w-full text-xs sm:text-sm font-semibold tracking-wide"
              >
                Chart Course to Island &rarr;
              </Link>
            ) : (
              <div className="text-center annotation text-xs text-olive-dark font-semibold py-0.5">
                ✦ Official {island.name} Archival Record ✦
              </div>
            )}

          </div>
        </>
      )}
    </aside>
  );
}

