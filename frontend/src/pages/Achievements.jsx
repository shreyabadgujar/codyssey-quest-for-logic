import { useState } from "react";
import AchievementBadge from "../components/AchievementBadge.jsx";
import CoinDisplay from "../components/CoinDisplay.jsx";
import { useAchievements } from "../hooks/useAchievements.js";

const categories = [["all", "All"], ["exploration", "Exploration"], ["coding", "Coding & Logic"], ["collection", "Collection"], ["hidden", "Hidden"]];
const statuses = [["all", "All"], ["unlocked", "Unlocked"], ["in-progress", "In Progress"], ["locked", "Locked"]];

export default function Achievements() {
  const { result, error, retry } = useAchievements();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const summary = result?.summary;
  const visible = result?.items.filter(item =>
    (category === "all" || category === item.category) && (status === "all" || status === item.status));

  return (
    <section className="space-y-5">
      <header className="folio space-y-3">
        <p className="annotation text-sm">The explorer’s record</p>
        <h1 className="text-3xl sm:text-4xl">The Hall of Accomplishments</h1>
        <p>Every badge records a deed from your expedition. Explore the honours you’ve earned and the entries still sealed.</p>
        {summary && <dl className="grid grid-cols-2 gap-3 border-t border-ink/20 pt-3 sm:grid-cols-4">
          <div><dt className="annotation text-xs">Unlocked</dt><dd className="font-display text-xl">{summary.unlocked} / {summary.total}</dd></div>
          <div><dt className="annotation text-xs">Available</dt><dd className="font-display text-xl">{summary.available}</dd></div>
          <div><dt className="annotation text-xs">Overall completion</dt><dd className="font-display text-xl">{summary.percent}%</dd></div>
          <div><dt className="annotation text-xs">Achievement coins earned</dt><dd><CoinDisplay coins={summary.coinsEarned} /></dd></div>
        </dl>}
        {summary?.titles.length > 0 && <p className="annotation">Earned titles · {summary.titles.join(" · ")}</p>}
      </header>
      {!result && !error && <p className="folio" role="status">Opening the achievement journal…</p>}
      {error && <div className="folio space-y-2"><p role="alert">{error}</p><button type="button" className="btn-ghost" onClick={retry}>Retry</button></div>}
      {result && <>
        <nav className="flex flex-wrap gap-2" aria-label="Achievement categories">
          {categories.map(([id, label]) => <button key={id} type="button" aria-pressed={category === id}
            className={`${category === id ? "btn-brass" : "btn-ghost"} px-3 py-1 text-sm`} onClick={() => setCategory(id)}>{label}</button>)}
        </nav>
        <label className="flex max-w-xs items-center gap-2">
          <span className="annotation shrink-0">Status</span>
          <select className="field p-2 text-sm" value={status} onChange={event => setStatus(event.target.value)}>
            {statuses.map(([id, label]) => <option value={id} key={id}>{label}</option>)}
          </select>
        </label>
        {visible.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map(item => <AchievementBadge key={item.key} achievement={item} />)}
        </div> : <p className="folio">No achievements match these filters.</p>}
      </>}
    </section>
  );
}
