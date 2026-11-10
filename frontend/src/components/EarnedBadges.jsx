import { ArrowRight, Compass, Feather } from "lucide-react";
import { Link } from "react-router-dom";
import { useAchievements } from "../hooks/useAchievements.js";
import { ArchiveEmblem } from "./achievements/ArchiveEmblem.jsx";
import { chapters, recordedDate } from "./achievements/archivePresentation.js";
import "../styles/earned-honours.css";

export function EarnedBadges() {
  const { result, error, retry } = useAchievements({ live: true });
  const summary = result?.summary;
  const [featured, ...otherHonours] = (result?.items ?? [])
    .filter(item => item.unlocked)
    .sort((a, b) => (Date.parse(b.unlockedAt) || 0) - (Date.parse(a.unlockedAt) || 0))
    .slice(0, 4);
  const date = recordedDate(featured?.unlockedAt);
  const chapter = chapters.find(entry => entry.id === featured?.category);

  return (
    <section className="eh-cabinet" aria-labelledby="eh-heading">
      <header className="eh-header">
        <div>
          <p className="eh-kicker"><Compass size={16} aria-hidden="true" /> The Ætherian Archive</p>
          <h2 id="eh-heading">Earned Honours</h2>
          <p>Distinctions recorded in your expedition journal.</p>
        </div>
        <Link to="/achievements" className="eh-archive-link">Hall of Accomplishments <ArrowRight size={17} aria-hidden="true" /></Link>
      </header>

      {error && <div className="eh-notice"><p role="alert">{error}</p><button type="button" onClick={retry}>Retry</button></div>}
      {!result && !error && <p className="eh-notice" role="status">Reading your badges…</p>}
      {summary && <>
        <div className="eh-ledger">
          <div className="eh-tally">
            <p className="eh-kicker">Collection record</p>
            <p role="status"><strong>{summary.unlocked}</strong> of {summary.total} achievements unlocked</p>
            {summary.total > 0 && <progress aria-label="Achievement collection progress" value={summary.unlocked} max={summary.total} />}
          </div>
          {summary.titles.length > 0 && <p className="eh-titles"><span className="eh-kicker">Earned titles</span>{summary.titles.join(" · ")}</p>}
        </div>
        {featured ? (
          <div className="eh-display" data-has-shelf={otherHonours.length > 0}>
            <article className="eh-feature">
              <div className="eh-feature-art"><ArchiveEmblem item={featured} size={148} /></div>
              <div className="eh-feature-copy">
                <p className="eh-kicker">Latest honour</p>
                <h3>{featured.name}</h3>
                <p>{featured.description}</p>
                {(chapter || date) && <div className="eh-inscription">
                  {chapter && <span>{chapter.label}</span>}
                  {date && <time dateTime={featured.unlockedAt}>{date}</time>}
                </div>}
              </div>
            </article>
            {otherHonours.length > 0 && (
              <ul className="eh-shelf" aria-label="Other recently earned honours">
                {otherHonours.map(item => <li key={item.key}>
                  <ArchiveEmblem item={item} size={64} />
                  <h3>{item.name}</h3>
                </li>)}
              </ul>
            )}
          </div>
        ) : <div className="eh-empty">
          <Feather size={29} strokeWidth={1.35} aria-hidden="true" />
          <div><h3>Your collection awaits</h3><p>Close your first coding case to earn your first honour.</p></div>
        </div>}
      </>}
    </section>
  );
}
