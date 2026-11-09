import { useState } from "react";
import { Check, Compass } from "lucide-react";

export default function IslandMarker({
  island,
  isSelected = false,
  onSelect,
  progress = { completedCount: 0, totalLevels: 5, isCompleted: false },
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);

  const { x, y } = island.mapPosition;
  const isCompleted = progress.isCompleted;
  const completedCount = progress.completedCount || 0;
  const totalLevels = progress.totalLevels || 5;

  const handleClick = (e) => {
    e.preventDefault();
    if (onSelect) onSelect(island);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (onSelect) onSelect(island);
    }
  };

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform select-none"
      style={{ left: `${x}%`, top: `${y}%` }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Floating Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2.5 paper text-center z-30 pointer-events-none rounded-sm shadow-lift border border-ink/80 animate-fade-in"
          style={{
            outline: "1px solid rgb(var(--c-brass) / 0.8)",
            outlineOffset: "-3px",
          }}
        >
          <div className="font-display text-sm font-semibold text-ink leading-tight">
            {island.name}
          </div>
          <div className="annotation text-xs text-sepia mt-0.5">
            {island.topic}
          </div>
          <div className="text-[11px] text-olive-dark font-body mt-1">
            {isCompleted ? "✦ Island Fully Charted" : `${completedCount} of ${totalLevels} Cases Solved`}
          </div>
          <div className="annotation text-[10px] text-brass-dark mt-1">
            Click to inspect journal
          </div>
        </div>
      )}

      {/* Main Interactive Button */}
      <button
        type="button"
        role="button"
        aria-label={`${island.name}, ${island.topic}. ${completedCount} of ${totalLevels} missions complete.`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`relative group flex flex-col items-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-brass transition-all duration-300 ${
          isSelected ? "scale-110 z-20" : "hover:scale-105"
        }`}
      >
        {/* Pulsing Selection Ring */}
        {isSelected && (
          <span
            className="absolute -inset-2 rounded-full border-2 border-brass animate-ping pointer-events-none opacity-75"
            aria-hidden
          />
        )}

        {/* Circular Medallion Frame */}
        <div
          className={`relative rounded-full overflow-hidden transition-all duration-300 ${
            isSelected
              ? "ring-4 ring-brass shadow-lift"
              : "ring-2 ring-ink/80 hover:ring-brass hover:shadow-paper"
          }`}
          style={{
            width: "50px",
            height: "50px",
            background: "rgb(var(--c-parchment-light))",
            boxShadow: isSelected
              ? "0 0 12px rgb(var(--c-gold)), var(--shadow-lift)"
              : "var(--shadow-paper)",
          }}
        >
          {!imgError ? (
            <img
              src={`/assets/islands/atlas/markers/${island.id}.webp`}
              alt=""
              width={50}
              height={50}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-olive text-parchment-light">
              <Compass size={24} />
            </div>
          )}

          {/* Inner Vignette Shading */}
          <div
            className="absolute inset-0 pointer-events-none rounded-full"
            style={{
              boxShadow: "inset 0 0 8px rgb(42 27 18 / 0.5)",
            }}
          />
        </div>

        {/* Completed Wax Seal Badge */}
        {isCompleted && (
          <div
            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md select-none"
            title="Island Completed"
          >
            <img
              src="/assets/decorations/wax-seal.webp"
              alt="Completed Seal"
              width={20}
              height={20}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <Check size={11} className="absolute text-parchment-light stroke-[3]" />
          </div>
        )}

        {/* Selection Indicator Beacon */}
        {isSelected && (
          <div
            className="w-0 h-0 border-x-4 border-x-transparent border-t-6 border-t-brass mt-0.5 animate-bounce"
            aria-hidden
          />
        )}

        {/* Island Name Plaque */}
        <div
          className={`mt-1 px-1.5 py-0.5 rounded-sm paper border text-center transition-colors w-max max-w-[125px] sm:max-w-[140px] ${
            isSelected
              ? "border-brass bg-parchment-light font-bold ring-1 ring-brass/60"
              : "border-ink/70 group-hover:border-brass"
          }`}
          style={{
            boxShadow: "var(--shadow-paper)",
          }}
        >
          <span className="font-display text-[10px] sm:text-[11px] text-ink block leading-tight whitespace-normal break-words">
            {island.name}
          </span>

          {/* Progress Pips (5 dots) */}
          <div className="flex items-center justify-center gap-1 mt-0.5" aria-hidden>
            {Array.from({ length: totalLevels }).map((_, i) => (
              <span
                key={i}
                className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${
                  i < completedCount
                    ? "bg-olive-dark shadow-xs"
                    : "bg-parchment-dark/70 border border-ink/40"
                }`}
              />
            ))}
          </div>
        </div>
      </button>
    </div>
  );
}

