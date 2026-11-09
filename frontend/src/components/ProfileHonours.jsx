import { Link } from "react-router-dom";
import AchievementBadge from "./AchievementBadge.jsx";
import { journalDate } from "../utils/journalDate.js";

export function ProfileHonours({ achievements }) {
  return (
    <section className="folio space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl">Honours &amp; distinctions</h2>
        <Link to="/achievements" className="btn-ghost px-2 py-1 text-sm no-underline">Hall of Accomplishments</Link>
      </div>
      {achievements.titles.length > 0 && <p className="annotation">Earned titles · {achievements.titles.join(" · ")}</p>}
      {achievements.recent.length ? <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {achievements.recent.map(item => <li key={item.key} className="text-center">
          <AchievementBadge achievement={item} compact />
          {item.unlockedAt && <time className="annotation text-xs" dateTime={item.unlockedAt}>{journalDate(item.unlockedAt)}</time>}
        </li>)}
      </ul> : <p>Your earned badges will appear here after you complete your first case.</p>}
      {achievements.inProgress.length > 0 && <div className="space-y-2 border-t border-ink/20 pt-3">
        <h3 className="text-lg">Honours in reach</h3>
        {achievements.inProgress.map(item => <div key={item.key} className="grid grid-cols-[minmax(0,1fr)_minmax(3rem,1fr)_auto] items-center gap-2">
          <span className="font-display text-sm">{item.name}</span>
          <progress aria-label={item.name + " progress"} className="w-full accent-olive-dark"
            value={item.progress.current} max={item.progress.target} />
          <span className="annotation text-xs">{item.progress.current} / {item.progress.target}</span>
        </div>)}
      </div>}
    </section>
  );
}
