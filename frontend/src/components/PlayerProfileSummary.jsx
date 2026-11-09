import XPBar from "./XPBar.jsx";
import CoinDisplay from "./CoinDisplay.jsx";
import AvatarPreview from "./AvatarPreview.jsx";
import { getRankProgress } from "../game/rankProgress.js";

export default function PlayerProfileSummary({ player, portrait, title, children }) {
  if (!player) return null;

  const { xp, level, xpToNext } = getRankProgress(player.xp);
  const coins = player.coins || 0;

  return (
    <div className="folio flex flex-col sm:flex-row items-start sm:items-center gap-4">
      {portrait ?? <AvatarPreview avatar={player.avatar} size={72} className="shadow-lift" />}
      <div className="flex-1 w-full space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl text-ink font-semibold">{player.username}</h2>
          <CoinDisplay coins={coins} size={20} />
        </div>
        <p className="annotation text-xs text-sepia">{title || "Captain of the Logic Expedition"}</p>
        <XPBar xp={xp} xpToNext={xpToNext} level={level} />
        {children}
      </div>
    </div>
  );
}

