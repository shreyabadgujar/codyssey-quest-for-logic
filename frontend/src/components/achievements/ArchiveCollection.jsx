import { BookOpen, Check, LockKeyhole } from "lucide-react";
import { ArchiveEmblem } from "./ArchiveEmblem.jsx";
import { chapters, isSealed, statusLabel, statusOf, statuses } from "./archivePresentation.js";

export function ArchiveCollection({ items, total, category, status, selected, onCategory, onStatus, onSelect, collectionRef }) {
  return (
    <section className="aa-collection" ref={collectionRef} tabIndex={-1} aria-labelledby="aa-collection-title">
      <div className="aa-collection-heading">
        <div><p className="aa-kicker"><BookOpen size={17} aria-hidden="true" /> Index of honours</p><h2 id="aa-collection-title">The Collection</h2></div>
        <p className="aa-count" role="status">{items.length} of {total} records</p>
      </div>
      <div className="aa-filters">
        <nav aria-label="Achievement categories">
          {[{ id: "all", label: "All honours" }, ...chapters].map(({ id, label }) => (
            <button key={id} type="button" data-category={id} aria-pressed={category === id} onClick={() => onCategory(id)}>{label}</button>
          ))}
        </nav>
        <label><span>Status</span><select value={status} onChange={event => onStatus(event.target.value)}>
          {statuses.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select></label>
      </div>
      {items.length === 0 && <p className="aa-empty">No achievements match these filters.</p>}
      {chapters.map(({ id, chapter, label, note, Icon }) => {
        const entries = items.filter(item => item.category === id);
        if (!entries.length) return null;
        return (
          <section className="aa-chapter" data-category={id} key={id} aria-labelledby={`aa-${id}`}>
            <header>
              <span className="aa-chapter-icon"><Icon size={22} aria-hidden="true" /></span>
              <div><p className="aa-kicker">{label}</p><h3 id={`aa-${id}`}>{chapter}</h3><p className="aa-chapter-note">{note}</p></div>
              <span className="aa-chapter-total">{entries.length}</span>
            </header>
            <ul className="aa-shelf">
              {entries.map((item, index) => (
                <li key={item.key}>
                  <button type="button" className="aa-medal" aria-controls="aa-active-record" aria-pressed={selected === item.key}
                    aria-label={`${item.name}${isSealed(item) ? ` ${index + 1}` : ""}, ${statusLabel(item)}`} onClick={() => onSelect(item.key)}>
                    <span className="aa-medal-art"><ArchiveEmblem item={item} size={80} /></span>
                    <span className="aa-medal-copy">
                      <strong>{item.name}</strong>
                      <span className="aa-medal-status" data-status={statusOf(item)}>
                        {item.unlocked ? <Check size={13} aria-hidden="true" /> : isSealed(item) && <LockKeyhole size={12} aria-hidden="true" />} {statusLabel(item)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}
