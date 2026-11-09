import { useState } from "react";
import { Award, Lock } from "lucide-react";
import CoinDisplay from "./CoinDisplay.jsx";

export default function AchievementBadge({ achievement, compact = false }) {
  const { name, description, condition, icon, unlocked, available, progress, reward, status } = achievement;
  const [failedIcon, setFailedIcon] = useState(null);
  const Emblem = available === false || !condition ? Lock : Award;
  const finish = unlocked ? "border-brass text-olive-dark" : "border-ink/30 text-sepia";
  return (
    <article className={`folio flex flex-col gap-2 text-center ${compact ? "p-2" : "p-4"} ${finish}`}>
      <div className={`mx-auto grid place-items-center rounded-full border-4 border-double bg-parchment-light shadow-paper ${compact ? "h-12 w-12" : "h-20 w-20"} ${finish}`}>
        {icon && failedIcon !== icon
          ? <img src={icon} alt="" className={`h-full w-full rounded-full object-contain p-1 ${unlocked ? "" : "saturate-50 opacity-70"}`}
              onError={() => setFailedIcon(icon)} />
          : <Emblem size={compact ? 22 : 30} aria-hidden="true" />}
      </div>
      <h3 className={compact ? "text-sm text-ink" : "text-xl text-ink"}>{name}</h3>
      {!compact && <>
        <p className="annotation text-xs">{unlocked ? "Unlocked" : !available ? "Unavailable" : status === "in-progress" ? "In Progress" : "Locked"}</p>
        <p className="text-sm text-ink">{description || "This entry stays sealed until you earn it."}</p>
        {condition && <p className="annotation text-sm">{condition}</p>}
        {achievement.unavailable && <p className="text-xs">{achievement.unavailable}</p>}
        {progress && <div className="space-y-1">
          <progress aria-label={name + " progress"} className="block h-2 w-full accent-olive-dark" value={progress.current} max={progress.target} />
          <p className="annotation text-xs">{progress.current} / {progress.target}</p>
        </div>}
        {reward && <div className="mt-auto border-t border-ink/15 pt-2 text-sm">
          {reward.coins ? <CoinDisplay coins={reward.coins} size={17} /> : reward.title ? "Title · " + reward.title : "Exclusive badge"}
        </div>}
      </>}
    </article>
  );
}
