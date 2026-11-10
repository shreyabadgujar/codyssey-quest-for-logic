import { Check, Compass, LockKeyhole, Navigation } from "lucide-react";

const labels = { open: "Open for expedition", current: "Current expedition", complete: "Island fully charted", locked: "Locked" };
const seals = { open: Compass, complete: Check, current: Navigation, locked: LockKeyhole };

export default function IslandMarker({ island, position, isSelected, isCurrent, onSelect, progress }) {
  const { x, y } = position;
  const { completedCount, totalLevels } = progress;
  const status = progress.isCompleted ? "complete" : isCurrent ? "current" : progress.unlocked.length ? "open" : "locked";
  const Seal = seals[status];

  return (
    <div className="wm-marker" data-island={island.id} data-status={status} data-selected={isSelected}
      style={{ left: `${x}%`, top: `${y}%` }}>
      <button type="button" className="wm-marker-button" aria-pressed={isSelected}
        aria-label={`${island.name}, ${island.topic}. ${completedCount} of ${totalLevels} missions complete. ${labels[status]}.`}
        onClick={() => onSelect(island)}>
        <span className="wm-nameplate">
          <span className="wm-marker-seal" aria-hidden="true"><Seal /></span>
          <span className="wm-nameplate-text">
            <span>{island.name}</span>
            <span className="wm-pips" aria-hidden="true">
              {Array.from({ length: totalLevels }, (_, index) => <span key={index} data-complete={index < completedCount} />)}
            </span>
          </span>
        </span>
      </button>
    </div>
  );
}
