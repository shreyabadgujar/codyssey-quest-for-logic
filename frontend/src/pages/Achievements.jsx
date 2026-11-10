import { useEffect, useRef, useState } from "react";
import { ArchiveCollection } from "../components/achievements/ArchiveCollection.jsx";
import { ArchiveIntroduction } from "../components/achievements/ArchiveIntroduction.jsx";
import { ArchiveRecord } from "../components/achievements/ArchiveRecord.jsx";
import { chapters, statusOf } from "../components/achievements/archivePresentation.js";
import { useAchievements } from "../hooks/useAchievements.js";
import "../styles/achievements.css";

export default function Achievements() {
  const { result, error, retry } = useAchievements();
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [selectedKey, setSelectedKey] = useState(null);
  const [focusRecord, setFocusRecord] = useState(false);
  const recordRef = useRef(null);
  const collectionRef = useRef(null);

  const items = result?.items ?? [];
  const latest = items.filter(item => item.unlocked && item.unlockedAt)
    .sort((a, b) => Date.parse(b.unlockedAt) - Date.parse(a.unlockedAt))[0];
  const visible = items.filter(item => (category === "all" || category === item.category) &&
    (status === "all" || status === statusOf(item)));
  const selected = visible.find(item => item.key === selectedKey) ?? visible.find(item => item.key === latest?.key) ?? visible[0];
  const chapter = chapters.find(entry => entry.id === selected?.category);

  function openLatest(key) {
    setCategory("all");
    setStatus("all");
    setSelectedKey(key);
    setFocusRecord(true);
  }

  function selectRecord(key) {
    setSelectedKey(key);
    if (window.matchMedia("(max-width: 54rem)").matches) setFocusRecord(true);
  }

  useEffect(() => {
    if (focusRecord && recordRef.current) {
      recordRef.current.focus({ preventScroll: true });
      recordRef.current.scrollIntoView({ block: "start" });
      setFocusRecord(false);
    }
  }, [focusRecord, selected?.key]);

  function returnToCollection() {
    const activeMedal = collectionRef.current?.querySelector('.aa-medal[aria-pressed="true"]');
    const target = activeMedal ?? collectionRef.current;
    target?.focus({ preventScroll: true });
    target?.scrollIntoView({ block: "center" });
  }

  return (
    <section className="aa-archive">
      <ArchiveIntroduction summary={result?.summary} latest={latest} onOpen={openLatest} />
      {!result && !error && <p className="aa-message paper" role="status">Opening the achievement journal…</p>}
      {error && <div className="aa-message paper"><p role="alert">{error}</p><button type="button" className="btn-ghost" onClick={retry}>Retry</button></div>}
      {result && (
        <div className="aa-catalogue">
          <ArchiveCollection items={visible} total={items.length} category={category} status={status} selected={selected?.key}
            onCategory={setCategory} onStatus={setStatus} onSelect={selectRecord} collectionRef={collectionRef} />
          {selected && chapter && <ArchiveRecord item={selected} chapter={chapter} recordRef={recordRef} onReturn={returnToCollection} />}
        </div>
      )}
    </section>
  );
}
