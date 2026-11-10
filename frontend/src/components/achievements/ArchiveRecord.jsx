import { ArrowUp, Award, Check, LockKeyhole, Sparkles } from "lucide-react";
import CoinDisplay from "../CoinDisplay.jsx";
import { ArchiveEmblem } from "./ArchiveEmblem.jsx";
import { recordedDate, statusLabel, statusOf } from "./archivePresentation.js";

function ArchiveRewards({ reward, earned }) {
  if (!reward?.coins && !reward?.xp && !reward?.title && !reward?.badge) return null;

  return <section className="aa-rewards" aria-label={earned ? "Rewards earned" : "Rewards"}>
    <h3 className="aa-kicker">{earned ? "Rewards earned" : "Rewards on completion"}</h3>
    <ul>
      {reward.coins > 0 && <li><CoinDisplay coins={reward.coins} size={23} /> <span>gold coins</span></li>}
      {reward.xp > 0 && <li><Sparkles size={19} aria-hidden="true" /> <strong>{reward.xp} XP</strong></li>}
      {reward.title && <li><Award size={19} aria-hidden="true" /> <span>Title · <strong>{reward.title}</strong></span></li>}
      {reward.badge && <li><Award size={19} aria-hidden="true" /> <span>Exclusive badge</span></li>}
    </ul>
  </section>;
}

export function ArchiveRecord({ item, chapter, recordRef, onReturn }) {
  const { Icon } = chapter;
  const date = recordedDate(item.unlockedAt);
  const state = statusOf(item);
  const StateIcon = item.unlocked ? Check : state === "in-progress" ? Icon : LockKeyhole;

  return (
    <aside id="aa-active-record" className="aa-record" data-category={item.category} ref={recordRef} tabIndex={-1} aria-label="Achievement record">
      <button type="button" className="aa-return" onClick={onReturn}><ArrowUp size={15} aria-hidden="true" /> Back to collection</button>
      <div className="aa-record-inner" key={item.key}>
        <div className="aa-exhibit" data-earned={item.unlocked}>
          <p className="aa-kicker"><Icon size={16} aria-hidden="true" /> {chapter.label}</p>
          <ArchiveEmblem item={item} size={168} />
          <span className="aa-record-status" data-status={state}><StateIcon size={14} aria-hidden="true" /> {statusLabel(item)}</span>
        </div>
        <div className="aa-entry-copy">
          <h2>{item.name}</h2>
          {date && <p className="aa-inscribed"><Check size={15} aria-hidden="true" /> Inscribed <time dateTime={item.unlockedAt}>{date}</time></p>}
          <p>{item.description || "This entry stays sealed until you earn it."}</p>
          {item.condition && <section className="aa-condition" aria-label="Unlock condition"><h3 className="aa-kicker">The deed</h3><p>{item.condition}</p></section>}
          {item.unavailable && <p className="aa-unavailable"><LockKeyhole size={15} aria-hidden="true" /> {item.unavailable}</p>}
          {item.progress && <div className="aa-entry-progress">
            <div><span>Progress</span><strong>{item.progress.current} / {item.progress.target}</strong></div>
            <progress className="aa-progress" aria-label={`${item.name} progress`} value={item.progress.current} max={item.progress.target} />
          </div>}
          <ArchiveRewards reward={item.reward} earned={item.unlocked} />
        </div>
      </div>
    </aside>
  );
}
