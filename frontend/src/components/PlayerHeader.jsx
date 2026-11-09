import { Link } from "react-router-dom";
import { LogOut, Compass } from "lucide-react";
import { useAuth } from "../hooks/useAuth.js";
import { useProgression } from "../game/progression.js";
import AvatarPreview from "./AvatarPreview.jsx";
import CoinDisplay from "./CoinDisplay.jsx";
import XPBar from "./XPBar.jsx";
import { getRankProgress } from "../game/rankProgress.js";

export default function PlayerHeader() {
  const { user, logout } = useAuth();
  const overall = useProgression();

  if (!user) return null;

  const { xp, level, xpToNext } = getRankProgress(user.xp);
  const coins = user.coins || 0;

  return (
    <div
      className="paper w-full px-4 py-2.5 flex flex-wrap items-center justify-between gap-4 border-b border-ink/40 shadow-sm"
      style={{
        borderBottom: "2px solid rgb(var(--c-brass) / 0.6)",
      }}
    >
      {/* Left: Player Identity & XP */}
      <div className="flex items-center gap-3">
        <Link to="/profile" title="View Explorer Profile" className="no-underline">
          <AvatarPreview avatar={user.avatar} size={42} />
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="font-display font-medium text-ink hover:text-sepia no-underline text-base leading-tight"
            >
              {user.username}
            </Link>
            <span className="annotation text-xs text-sepia">
              Rank {level}
            </span>
          </div>
          <XPBar xp={xp} xpToNext={xpToNext} level={level} compact />
        </div>
      </div>

      {/* Middle: Expedition Stats & Coins */}
      <div className="flex items-center gap-4 text-xs sm:text-sm">
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-parchment-light/60 border border-ink/20"
          title="Islands Charted"
        >
          <Compass size={16} className="text-olive-dark shrink-0" aria-hidden />
          <span className="font-display text-ink">
            {overall.completedIslands} / {overall.totalIslands} Islands
          </span>
          <span className="text-sepia font-note text-xs">
            ({overall.completedCases} cases)
          </span>
        </div>

        <CoinDisplay coins={coins} size={18} />
      </div>

      {/* Right: Explorer Quick Profile & Session Action */}
      <div className="flex items-center gap-2">
        <Link
          to="/profile"
          className="btn-ghost text-xs py-1 px-2.5 no-underline inline-flex items-center gap-1 text-ink"
          title="View Explorer Dossier"
        >
          <span>Dossier</span>
        </Link>
        <button
          onClick={logout}
          className="btn-ghost text-xs py-1 px-2.5 text-oxblood hover:bg-oxblood/10 inline-flex items-center gap-1"
          title="Leave Journal"
        >
          <LogOut size={14} aria-hidden />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </div>
  );
}
