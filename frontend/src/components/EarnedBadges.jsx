import { Link } from "react-router-dom";
import { useAchievements } from "../hooks/useAchievements.js";
import AchievementBadge from "./AchievementBadge.jsx";

export function EarnedBadges() {
  const { result, error, retry } = useAchievements();
  const earned = result?.items.filter(item => item.unlocked) ?? [];
  return (
    <section className="folio space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl">Earned honours</h2>
        <Link className="btn-ghost px-2 py-1 text-sm no-underline" to="/achievements">Hall of Accomplishments</Link>
      </div>
      {error ? <p role="alert">{error} <button type="button" className="underline" onClick={retry}>Retry</button></p>
        : !result ? <p role="status">Reading your badges…</p>
        : <>
          <p className="annotation">{result.summary.unlocked} of {result.summary.total} achievements unlocked</p>
          {result.summary.titles.length > 0 && <p className="font-display text-olive-dark">Earned titles · {result.summary.titles.join(" · ")}</p>}
          {earned.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {earned.slice(0, 4).map(item => <AchievementBadge key={item.key} achievement={item} compact />)}
          </div> : <p>Earn badges by completing your expedition’s cases.</p>}
        </>}
    </section>
  );
}
