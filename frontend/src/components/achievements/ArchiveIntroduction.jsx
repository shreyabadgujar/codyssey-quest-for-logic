import { ArrowRight, Compass } from "lucide-react";
import CoinDisplay from "../CoinDisplay.jsx";
import { ArchiveEmblem } from "./ArchiveEmblem.jsx";
import { recordedDate } from "./archivePresentation.js";

export function ArchiveIntroduction({ summary, latest, onOpen }) {
  const date = recordedDate(latest?.unlockedAt);
  const age = Date.now() - Date.parse(latest?.unlockedAt);
  const recent = age >= 0 && age < 5 * 60 * 1000;

  return (
    <header className="aa-opening">
      <div className="aa-hero">
        <img className="aa-hero-art" src="/assets/achievements/archive/archive-hero.webp" alt="" fetchPriority="high" />
        <div className="aa-hero-copy">
          <p className="aa-kicker"><Compass aria-hidden="true" size={19} /> The Ætherian Archive</p>
          <h1>The Hall of <span>Accomplishments</span></h1>
          <p>From the first case closed to the last shore charted, every honour records a deed from your expedition.</p>
        </div>
      </div>
      {summary && (
        <div className="aa-ledger">
          <dl className="aa-ledger-stats">
            <div><dt>Honours unlocked</dt><dd>{summary.unlocked} <span>/ {summary.total}</span></dd></div>
            <div><dt>Available honours</dt><dd>{summary.available}</dd></div>
            <div><dt>Archive completion</dt><dd>{summary.percent}%</dd></div>
            <div><dt>Achievement coins earned</dt><dd><CoinDisplay coins={summary.coinsEarned} size={24} /></dd></div>
          </dl>
          <progress className="aa-progress aa-overall" aria-label="Archive completion" max={100} value={summary.percent} />
          {summary.titles.length > 0 && <p className="aa-titles">Earned titles <span>{summary.titles.join(" · ")}</span></p>}
        </div>
      )}
      <p className="sr-only" role="status">{recent && `${latest.name} added to the archive.`}</p>
      {latest && (
        <button type="button" className="aa-latest" data-recent={recent} onClick={() => onOpen(latest.key)}>
          <ArchiveEmblem item={latest} size={54} />
          <span className="aa-latest-text"><span className="aa-kicker">{recent ? "New honour inscribed" : "Latest honour"}</span><strong>{latest.name}</strong></span>
          {date && <time dateTime={latest.unlockedAt}>{date}</time>}
          <ArrowRight size={19} aria-hidden="true" />
        </button>
      )}
    </header>
  );
}
