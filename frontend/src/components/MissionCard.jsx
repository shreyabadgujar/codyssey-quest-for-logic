import { Link } from "react-router-dom";
import { Lock, CheckCircle2, Compass, ArrowRight } from "lucide-react";
import DifficultyIndicator from "./DifficultyIndicator.jsx";
import CoinDisplay from "./CoinDisplay.jsx";

export default function MissionCard({ mission, status = "locked" }) {
  const isLocked = status === "locked";
  const isCompleted = status === "completed";
  const isUnlocked = status === "unlocked";

  return (
    <div
      className={`folio transition-all duration-300 ${
        isCompleted
          ? "border-olive/60 bg-olive/5 shadow-paper"
          : isUnlocked
          ? "border-brass hover:shadow-lift"
          : "opacity-65 border-ink/20 bg-parchment-dark/15"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-ink/15">
        <div className="flex items-center gap-2.5">
          {isCompleted ? (
            <div className="w-6 h-6 rounded-full bg-olive-dark text-parchment-light flex items-center justify-center shrink-0 shadow-xs">
              <CheckCircle2 size={15} />
            </div>
          ) : isUnlocked ? (
            <div className="w-6 h-6 rounded-full bg-brass text-parchment-light flex items-center justify-center shrink-0 shadow-xs">
              <Compass size={15} />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-parchment-dark border border-ink/40 text-sepia flex items-center justify-center shrink-0">
              <Lock size={13} />
            </div>
          )}

          <div>
            <h3 className="font-display text-base sm:text-lg text-ink font-semibold leading-tight">
              Case {mission.level}: {mission.title}
            </h3>
            <div className="flex items-center gap-3 mt-0.5">
              <DifficultyIndicator difficulty={mission.difficulty} />
              <span className="annotation text-xs text-sepia">
                {isCompleted ? "Solved & Recorded" : isUnlocked ? "Awaiting Deduction" : `Requires Case ${mission.level - 1}`}
              </span>
            </div>
          </div>
        </div>

        {/* Rewards pill */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto text-xs">
          <span className="text-olive-dark font-display font-medium">+{mission.xp || 50} XP</span>
          <CoinDisplay coins={mission.coins || 25} size={15} />
        </div>
      </div>

      {/* Clue teaser / Case synopsis */}
      {mission.clue && (
        <div className="pt-2 text-xs font-body text-ink/80 italic">
          <span className="annotation not-italic font-semibold text-sepia mr-1.5">Archival Note:</span>
          "{mission.clue}"
        </div>
      )}

      {/* Action footer */}
      <div className="pt-3 mt-1 flex items-center justify-end">
        {isCompleted ? (
          <Link
            to={`/missions/${mission.id}`}
            className="btn-ghost text-xs py-1 px-3 no-underline inline-flex items-center gap-1.5 text-olive-dark"
          >
            Review Solution
          </Link>
        ) : isUnlocked ? (
          <Link
            to={`/missions/${mission.id}`}
            className="btn-brass text-xs py-1.5 px-4 no-underline inline-flex items-center gap-1.5 font-semibold"
          >
            <span>Open Case File</span>
            <ArrowRight size={14} />
          </Link>
        ) : (
          <span className="annotation text-xs text-sepia flex items-center gap-1">
            <Lock size={12} /> Case Sealed
          </span>
        )}
      </div>
    </div>
  );
}

