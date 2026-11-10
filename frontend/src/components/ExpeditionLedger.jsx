import { Link } from "react-router-dom";
import { Award, BookOpen, ChevronDown, Compass, KeyRound, Sparkles } from "lucide-react";
import { getIslandArtwork } from "../data/islands.js";
import { formatNumber } from "../utils/format.js";

export function ExpeditionLedger({ stats, expeditions, player }) {
  const measures = [
    { label: "Islands explored", value: `${stats.islandsExplored} / ${stats.islandCount}`, Icon: Compass },
    { label: "Coding cases solved", value: formatNumber(stats.missionsCompleted), Icon: BookOpen },
    { label: "Puzzles solved", value: formatNumber(stats.puzzlesSolved), Icon: KeyRound },
    { label: "Lifetime XP", value: formatNumber(player.xp), Icon: Sparkles },
    { label: "Honours earned", value: formatNumber(stats.achievementsUnlocked), Icon: Award },
  ];
  return (
    <section className="ec-ledger" aria-labelledby="ec-ledger-title">
      <h2 id="ec-ledger-title" className="sr-only">Expedition ledger</h2>
      <dl className="ec-ledger-totals">
        {measures.map(({ label, value, Icon }) => <div key={label}>
          <Icon size={19} aria-hidden="true" /><dt>{label}</dt><dd>{value}</dd>
        </div>)}
      </dl>
      {expeditions.length > 0 && <details className="ec-voyage-chart">
        <summary><Compass size={18} aria-hidden="true" /><span>Voyage chart</span><span className="ec-chart-hint">View island progress</span><ChevronDown size={17} aria-hidden="true" /></summary>
        <ul>
          {expeditions.map(island => <li key={island.slug}>
            <Link to={`/islands/${island.slug}`}>
              <img src={getIslandArtwork(island.slug).marker} width={44} height={44} alt="" loading="lazy" />
              <span><strong>{island.name}</strong><small>{island.completed} / {island.total} cases solved</small></span>
            </Link>
            <progress className="ec-progress" aria-label={`${island.name} progress`} value={island.completed} max={island.total || 1} />
          </li>)}
        </ul>
      </details>}
      {stats.missionsCompleted === 0 && <p className="ec-first-voyage">Your first voyage awaits. <Link to="/map">Choose an island to start your chronicle.</Link></p>}
    </section>
  );
}
