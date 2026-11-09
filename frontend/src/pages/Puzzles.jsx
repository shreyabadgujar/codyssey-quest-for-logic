import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronDown, Compass, Hourglass, Lock, Map, Sparkles } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { listPuzzles } from "../services/puzzleService.js";
import { getMe } from "../services/authService.js";
import { useAuth } from "../hooks/useAuth.js";
import { usePuzzleSession } from "../hooks/usePuzzleSession.js";
import { ISLANDS } from "../data/islands.js";
import { DetectiveBoard } from "../components/puzzles/DetectiveBoard.jsx";
import { ArtifactArrangement } from "../components/puzzles/ArtifactArrangement.jsx";
import { CipherDecoder } from "../components/puzzles/CipherDecoder.jsx";
import { ExpeditionMaze } from "../components/puzzles/ExpeditionMaze.jsx";
import { StructureWorkshop } from "../components/puzzles/StructureWorkshop.jsx";
import { CodeRestoration } from "../components/puzzles/CodeRestoration.jsx";
import { QuestFrame, QuestRibbon, QuestSeal } from "../components/puzzles/QuestOrnaments.jsx";
import "../styles/puzzles.css";

const modes = {
  detective: ["Detective Board", "The Evidence Table", DetectiveBoard],
  arrangement: ["Artifact Arrangement", "The Relic Altar", ArtifactArrangement],
  cipher: ["Cipher Decoder", "The Engraved Dial", CipherDecoder],
  maze: ["Expedition Maze", "The Wayfarer’s Chart", ExpeditionMaze],
  workshop: ["Data Structure Workshop", "The Cartographer’s Stores", StructureWorkshop],
  code: ["Code Restoration", "The Scribe’s Blueprint", CodeRestoration],
};
const islandFor = id => ISLANDS.find(island => island.id === id);
const labels = { available: "Ready to begin", active: "In progress", skipped: "Set aside", completed: "Completed" };
const feedback = {
  incorrect: "The relic remains sealed. Compare your solution with the trial’s conditions and try again.",
  incomplete: "The trial is unfinished. Check the objective and complete the missing steps.",
  invalid: "A move broke the rules of the trial. Revise your steps and try again.",
};

function JournalHeading({ children, eyebrow }) {
  return <header className="pz-journal-heading">
    {eyebrow && <p className="pz-kicker">{eyebrow}</p>}
    <div className="pz-title-ribbon"><QuestRibbon/><h1>{children}</h1></div>
  </header>;
}

function SectionTitle({ children }) {
  return <h3 className="pz-section-title"><QuestSeal/>{children}</h3>;
}

function CoinReward({ coins, credited = false }) {
  return <span className="pz-coin-reward">
    <img src="/assets/treasures/gold-coin.webp" alt="" width="52" height="48"/>
    <span><strong>{coins}</strong> {credited ? "coins earned" : "gold coins"}</span>
  </span>;
}

const catalogueLabels = {
  available: "Available", upcoming: "Upcoming", locked: "Locked", completed: "Completed",
};
const catalogueSeals = { available: Compass, upcoming: Hourglass, locked: Lock, completed: Check };
const normalizeTitle = text => text.trim().toLowerCase().replace(/[‘’]/g, "'");

function QuestStatus({ status }) {
  const Seal = catalogueSeals[status];
  return <span className="pz-status-seal" data-status={status}><Seal size={13} aria-hidden="true"/>{catalogueLabels[status]}</span>;
}

function PuzzleLobby() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const preview = useRef(null);

  useEffect(() => {
    let active = true;
    listPuzzles().then(result => {
      if (active) setData(result);
    }).catch(err => {
      if (active) setError(err);
    });
    return () => { active = false; };
  }, [retry]);

  const catalogue = data?.catalogue ?? [];
  const search = normalizeTitle(query);
  const matching = catalogue.filter(row => (filter === "all" || row.status === filter) &&
    normalizeTitle(row.title).includes(search));
  const selected = matching.find(row => row.puzzleId === (selectedId ?? data?.current?.puzzleId));
  const session = data?.history.find(row => row.id === selected?.sessionId);
  const island = islandFor(selected?.islandId);
  const until = data?.missionsToNext;
  const action = ({ active: "Resume puzzle", skipped: "Revisit trial", completed: "Read completed trial" })[selected?.sessionStatus] ?? "Play puzzle";

  function selectQuest(puzzleId) {
    setSelectedId(puzzleId);
    if (window.matchMedia("(max-width: 47rem)").matches) preview.current?.scrollIntoView({ block: "start" });
  }

  return <div className="pz-shell pz-lobby">
    <QuestFrame/>
    <header className="pz-catalogue-header">
      <JournalHeading eyebrow="The Ætherian expeditions">Quest Journal</JournalHeading>
      {data && <section className="pz-catalogue-progress" aria-label="Next puzzle assignment">
        <QuestSeal elaborate/>
        <div>
          <p><strong>{data.missionsCompleted}</strong> successful coding {data.missionsCompleted === 1 ? "mission" : "missions"} · <strong>{data.history.length}</strong> of {catalogue.length} quests assigned</p>
          <p>{data.exhausted ? "All quests have been assigned." : <><strong>{until} {until === 1 ? "mission" : "missions"} to the next assignment.</strong>{" "}
            {until === 1 ? "One quest will be drawn from the remaining catalogue." : "A quest is drawn after every two successful coding missions."}</>}</p>
        </div>
        <Link to="/map" className="pz-link"><Map size={16}/> World map</Link>
      </section>}
    </header>
    {error ? <div className="pz-catalogue-message pz-readout" role="alert">{error.message} <button onClick={() => { setError(null); setRetry(value => value+1); }}>Retry</button></div> :
      !data ? <p className="pz-catalogue-message" role="status">Turning the pages…</p> : <>
      <nav className="pz-index" id="quest-islands" aria-label="Quest catalogue by island">
        <h2 className="pz-index-title">Island Catalogue</h2>
        <div className="pz-catalogue-filters">
          <label className="pz-field">Search puzzle titles
            <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search the journal"/>
          </label>
          <label className="pz-field">Status
            <select value={filter} onChange={event => setFilter(event.target.value)}>
              <option value="all">All statuses</option>
              {Object.entries(catalogueLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </label>
        </div>
        <p className="pz-note" role="status">{matching.length} of {catalogue.length} quests shown</p>
        <div className="pz-island-list">
          {ISLANDS.map(chapter => {
            const quests = catalogue.filter(row => row.islandId === chapter.id);
            const visible = matching.filter(row => row.islandId === chapter.id);
            return <details key={chapter.id} open className="pz-island-chapter">
              <summary className="pz-index-band">
                <img src={chapter.image} alt="" loading="lazy" width="56" height="44"/>
                <span><span className="pz-island-name">{quests[0]?.islandName ?? chapter.name}</span>
                  <small>{chapter.tagline}</small></span>
                <span className="pz-island-count">{visible.length}/{quests.length}<ChevronDown size={15} aria-hidden="true"/></span>
              </summary>
              {visible.length ? <ul>{visible.map(row => <li key={row.puzzleId}>
                <button className="pz-quest-row" aria-pressed={row.puzzleId === selected?.puzzleId} onClick={() => selectQuest(row.puzzleId)}>
                  <span><strong>{row.title}</strong><small>{row.difficulty}</small></span>
                  <QuestStatus status={row.status}/>
                </button>
              </li>)}</ul> : <p className="pz-index-empty">No quests match these filters.</p>}
            </details>;
          })}
        </div>
      </nav>
      <section ref={preview} className="pz-archive-page" aria-label="Selected quest">
        <QuestSeal className="pz-archive-watermark" elaborate/>
        <QuestSeal className="pz-archive-signet" elaborate/>
        <JournalHeading eyebrow={selected?.islandName ?? "Codyssey · Artifact Archive"}>{selected?.title ?? "An Unopened Chapter"}</JournalHeading>
        <p className="pz-archive-copy">{selected?.synopsis ?? "Beneath the islands of Ætheria lie sealed relics and long-forgotten trials. Choose a quest from the island catalogue to read its entry."}</p>
        <figure className="pz-location">
          <img src={island?.image ?? "/assets/islands/sorting-sands.webp"} alt="" width="288" height="270"/>
          <figcaption>{selected?.islandName ?? "Ruins of the Ætherian isles"}</figcaption>
        </figure>
        {selected && <div className="pz-archive-details">
          <QuestStatus status={selected.status}/>
          <ul className="pz-objectives">
            <li><span aria-hidden="true">✦</span>{modes[selected.mechanic][0]} · {selected.difficulty}</li>
            {session && <li><span aria-hidden="true">◇</span>Coding mission milestone {session.milestone}</li>}
          </ul>
          {selected.status === "upcoming" && <p>One successful coding mission remains before the next draw. This quest is a candidate.</p>}
          {selected.status === "locked" && <p>This trial opens when it is assigned to your journal.</p>}
          {selected.sessionStatus === "skipped" && <p className="pz-note">Set aside. Your notes are ready when you return.</p>}
          {session && <>
            <SectionTitle>Rewards</SectionTitle>
            <div className="pz-reward-strip"><CoinReward coins={selected.status === "completed" ? session.coinsAwarded : session.coins} credited={selected.status === "completed"}/></div>
          </>}
          {selected.sessionId && <Link className="pz-link pz-primary" to={"/puzzles/" + selected.sessionId}>{action} <ArrowRight size={16}/></Link>}
        </div>}
        <a className="pz-link pz-back-to-islands" href="#quest-islands">Back to island catalogue</a>
      </section>
    </>}
  </div>;
}
const findings = {
  detective: (data, draft) => (draft.evidence ?? []).map(id => data.evidence.find(entry => entry.id === id)?.title),
  arrangement: (data, draft) => (draft.steps ?? []).map(step => data.items.find(item => item.id === step.id)?.name),
  cipher: (_, draft) => Object.entries(draft.mapping ?? {}).filter(([, letter]) => letter).map(([glyph, letter]) => glyph+" ↔ "+letter),
  maze: (data, draft) => draft.moves?.length ? [draft.moves.length+" "+(draft.moves.length === 1 ? "step charted" : "steps charted")] : [],
  workshop: (data, draft) => (draft.operations ?? []).map(id => data.ops.find(op => op.id === id)?.label),
  code: (data, draft) => (draft.fragments ?? []).filter(Boolean).map(id => data.choices.find(choice => choice.id === id)?.label),
};

function PuzzleRoom({ id }) {
  const { setUser, token } = useAuth();
  const [profileError, setProfileError] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const { row, draft, error, busy, saving, edit, act, reload } = usePuzzleSession(id, async () => {
    try {
      const player = await getMe();
      if (localStorage.getItem("codyssey_token") === token) setUser(player);
      setProfileError(false);
    } catch { setProfileError(true); }
  });
  const puzzle = row?.puzzle;
  const island = islandFor(puzzle?.island);
  const [mode, chamber, Arena] = puzzle ? modes[puzzle.mechanic] : [];
  const discoveries = puzzle ? findings[puzzle.mechanic](puzzle.data, draft).filter(Boolean) : [];
  const solved = row?.status === "completed";
  return <div className="pz-shell pz-quest" data-mechanic={puzzle?.mechanic}>
    <QuestFrame/>
    <Link className="pz-link pz-back" to="/puzzles">← Quest Journal</Link>
    <JournalHeading eyebrow={puzzle ? island?.name + " · " + mode : "The Ætherian expeditions"}>{puzzle?.title ?? "Opening the Journal"}</JournalHeading>
    {error && <div className="pz-readout pz-feedback" role="alert">{error.message} <button disabled={busy} onClick={reload}>Reload saved state</button></div>}
    {!row && !error && <p className="pz-readout" role="status">Unsealing the page…</p>}
    {row && <div className="pz-room">
      <aside className="pz-brief">
        <h2 className="pz-column-title"><BookOpen size={20}/> Quest Journal</h2>
        <figure className="pz-brief-art"><img src={island?.image ?? "/assets/islands/sorting-sands.webp"} alt="" width="288" height="270"/></figure>
        <p>{puzzle.story}</p>
        <SectionTitle>Objective</SectionTitle><p>{puzzle.objective}</p>
        <SectionTitle>Instructions</SectionTitle><p>{puzzle.instructions}</p>
        <SectionTitle>Hints</SectionTitle>
        {row.hints.length ? <ol className="pz-hints">{row.hints.map(hint => <li key={hint}>{hint}</li>)}</ol> : <p className="pz-note">No hints revealed.</p>}
        <p className="pz-note">Quest status: {labels[row.status]}</p>
      </aside>
      <section className="pz-arena" aria-label={mode}>
        <header className="pz-trial-head"><QuestSeal/><p className="pz-kicker">Ancient Trial</p><h2>{chamber}</h2></header>
        {solved ? <div className="pz-discovery">
          <QuestSeal elaborate className="pz-discovery-seal"/>
          {row.awarded && <div className="pz-discovery-sparks" aria-hidden="true"><span>✧</span><span>✦</span><span>✧</span></div>}
          <img className="pz-discovery-chest" src="/assets/treasures/treasure-chest.webp" alt="" width="120" height="110"/>
          <h3>Relic Unsealed</h3>
          <p role="status">{row.awarded ? "+"+row.awarded+" coins credited" : row.coinsAwarded+" coins previously credited"}</p>
          {row.achievements?.map(achievement => <p key={achievement.key}><Sparkles size={15} aria-hidden="true"/> Achievement unlocked: {achievement.name}</p>)}
          <div className="pz-solution"><SectionTitle>How it works</SectionTitle><p>{row.explanation}</p></div>
          {profileError && <p>Your reward is recorded. Reload to update the balance in the header.</p>}
        </div> : row.status === "active" ?
          <fieldset disabled={busy || Boolean(error)} className="pz-play"><legend className="sr-only">{mode} controls</legend><Arena data={puzzle.data} draft={draft} edit={edit}/></fieldset> :
          <div className="pz-dormant"><QuestSeal elaborate/><img src="/assets/treasures/ancient-scroll.webp" alt="" width="115" height="100"/>
            <p>{row.status === "skipped" ? "Your notes are right where you left them." : "The relic’s inscription is sealed. Open the trial to begin."}</p>
            <button className="pz-primary" disabled={busy || Boolean(error)} onClick={() => act("start")}>{row.status === "skipped" ? "Revisit puzzle" : "Begin trial"}</button>
          </div>}
        {!solved && row.verdict && !saving && <p className="pz-readout pz-feedback" role="status">{feedback[row.verdict]}</p>}
      </section>
      <aside className="pz-support">
        <h2 className="pz-column-title"><Compass size={20}/> Expedition Record</h2>
        <dl className="pz-ledger">
          <div><dt>Difficulty</dt><dd>{puzzle.difficulty}</dd></div>
          <div><dt>Attempts</dt><dd>{row.attempts}</dd></div>
          <div><dt>Hints used</dt><dd>{row.hints.length}/{row.hintTotal}</dd></div>
          <div><dt>Estimated time</dt><dd>{puzzle.minutes} min</dd></div>
          <div><dt>Case milestone</dt><dd>{row.milestone}</dd></div>
          <div><dt>Progress</dt><dd>{labels[row.status]}</dd></div>
        </dl>
        <SectionTitle>{solved ? "Reward Earned" : "Reward"}</SectionTitle>
        <div className="pz-reward-strip"><CoinReward coins={solved ? row.coinsAwarded : puzzle.coins} credited={solved}/></div>
        <SectionTitle>Field Notes</SectionTitle>
        {discoveries.length ? <ul className="pz-findings">{discoveries.map((entry, index) => <li key={index}>{entry}</li>)}</ul> : <p className="pz-note">Your discoveries will appear here.</p>}
        <p className="pz-note" role="status">{saving ? "Saving your notes…" : row.status === "active" && !error ? "Draft saved" : ""}</p>
        <QuestSeal className="pz-record-seal" elaborate/>
      </aside>
    </div>}
    <footer className="pz-controls">
      {row && !solved && <>
        {row.status === "active" && <>
          <button className="pz-primary" disabled={busy || Boolean(error)} onClick={() => act("submit")}>Submit solution</button>
          <button disabled={busy || Boolean(error) || row.hints.length >= row.hintTotal} onClick={() => act("hint")}>Hint</button>
          <button disabled={busy || Boolean(error)} onClick={() => setConfirm("reset")}>Reset</button>
        </>}
        {row.status !== "skipped" && <button disabled={busy || Boolean(error)} onClick={() => setConfirm("skip")}>Skip</button>}
      </>}
      <Link className="pz-link" to="/puzzles">Exit to journal</Link>
      {confirm && <div className="pz-confirm" role="group" aria-label="Confirm puzzle action">
        <span>{confirm === "reset" ? "Clear this attempt? Revealed hints will stay in the journal." : "Set this trial aside? You can revisit it anytime."}</span>
        <button disabled={busy} onClick={() => { void act(confirm); setConfirm(null); }}>Confirm {confirm}</button>
        <button onClick={() => setConfirm(null)}>Cancel</button>
      </div>}
    </footer>
  </div>;
}

export default function Puzzles() {
  const { id } = useParams();
  useLayoutEffect(() => { window.scrollTo(0, 0); }, [id]);
  return id ? <PuzzleRoom key={id} id={id}/> : <PuzzleLobby/>;
}
