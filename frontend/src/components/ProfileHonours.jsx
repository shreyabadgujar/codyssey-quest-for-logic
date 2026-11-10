import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Award, LockKeyhole } from "lucide-react";
import { ArchiveEmblem } from "./achievements/ArchiveEmblem.jsx";
import { statusLabel } from "./achievements/archivePresentation.js";
import { journalDate } from "../utils/journalDate.js";

export function ProfileHonours({ achievements }) {
  const { items, recent, summary } = achievements;
  const [showLocked, setShowLocked] = useState(false);
  const [featuredKey, setFeaturedKey] = useState(null);
  const earned = items.filter(item => item.unlocked)
    .sort((a, b) => (Date.parse(b.unlockedAt) || 0) - (Date.parse(a.unlockedAt) || 0));
  const featured = earned.find(item => item.key === featuredKey) ?? recent[0] ?? earned[0];
  const exhibit = featured ?? items.find(item => item.available && item.category !== "hidden");
  const locked = items.filter(item => !item.unlocked);
  const visible = showLocked ? locked : earned;

  return (
    <section className="ec-sheet ec-honours" aria-labelledby="ec-honours-title">
      <div className="ec-section-heading">
        <div><p className="ec-kicker"><Award size={17} aria-hidden="true" /> Medals and milestones</p><h2 id="ec-honours-title">Hall of Honours</h2></div>
        <Link className="ec-text-link" to="/achievements">View archive <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className="ec-honour-progress">
        <p><strong>{summary.unlocked} / {summary.total}</strong> honours earned</p><span>{summary.percent}%</span>
        <progress className="ec-progress" aria-label="Achievement completion" value={summary.percent} max={100} />
      </div>
      {exhibit && <div className="ec-featured" data-earned={exhibit.unlocked} key={exhibit.key}>
        <ArchiveEmblem item={exhibit} size={122} className="ec-medal" />
        <div><p className="ec-kicker">{featured ? "Featured distinction" : "First distinction"}</p><h3>{exhibit.name}</h3>
          <p>{featured ? exhibit.description : exhibit.condition}</p>
          {featured?.unlockedAt && <time dateTime={featured.unlockedAt}>Earned {journalDate(featured.unlockedAt)}</time>}
        </div>
      </div>}
      <div className="ec-switches" role="group" aria-label="Honour collection">
        <button type="button" aria-pressed={!showLocked} onClick={() => setShowLocked(false)}>Earned <span>{earned.length}</span></button>
        <button type="button" aria-pressed={showLocked} onClick={() => setShowLocked(true)}>Still to earn <span>{locked.length}</span></button>
      </div>
      {visible.length ? <ul className={showLocked ? "ec-locked-list" : "ec-medal-shelf"}>
        {visible.map(item => <li key={item.key}>
          {showLocked ? <div className="ec-locked-entry">
            <ArchiveEmblem item={item} size={46} className="ec-medal" />
            <div><h3>{item.name}</h3><p>{statusLabel(item)}{item.progress ? ` · ${item.progress.current} / ${item.progress.target}` : ""}</p></div>
            <LockKeyhole size={16} aria-hidden="true" />
          </div> : <button type="button" className="ec-medal-option" aria-label={`Feature ${item.name}`} aria-pressed={featured?.key === item.key} onClick={() => setFeaturedKey(item.key)}>
            <ArchiveEmblem item={item} size={62} className="ec-medal" /><strong>{item.name}</strong>
            {item.unlockedAt && <time dateTime={item.unlockedAt}>{journalDate(item.unlockedAt)}</time>}
          </button>}
        </li>)}
      </ul> : <p className="ec-empty">{showLocked ? "Every honour is recorded in your chronicle." : "Your first earned medal will take its place here."}</p>}
    </section>
  );
}
