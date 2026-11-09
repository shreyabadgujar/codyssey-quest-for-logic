import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import CoinDisplay from "./CoinDisplay.jsx";

export function ExpeditionLedger({ stats, expeditions, player }) {
  return (
    <section className="folio space-y-4">
      <h2 className="flex items-center gap-2 text-2xl"><Compass size={21} aria-hidden="true" /> Expedition ledger</h2>
      <dl className="grid grid-cols-2 gap-3 border-y border-ink/20 py-3 sm:grid-cols-5">
        <div><dt className="annotation text-xs">Cases solved</dt><dd className="font-display text-lg">{stats.missionsCompleted}</dd></div>
        <div><dt className="annotation text-xs">Islands explored</dt><dd className="font-display text-lg">{stats.islandsExplored} / {stats.islandCount}</dd></div>
        <div><dt className="annotation text-xs">Honours earned</dt><dd className="font-display text-lg">{stats.achievementsUnlocked}</dd></div>
        <div><dt className="annotation text-xs">Lifetime XP</dt><dd className="font-display text-lg">{player.xp}</dd></div>
        <div><dt className="annotation text-xs">Coin purse</dt><dd><CoinDisplay coins={player.coins} /></dd></div>
      </dl>
      {stats.missionsCompleted === 0 && <div className="paper space-y-2 border border-brass p-4">
        <h3 className="text-xl">Your first voyage awaits</h3>
        <p>Choose an island and solve a case to make the first entry in your expedition journal.</p>
        <Link to="/map" className="btn-brass no-underline">Unfold the world map</Link>
      </div>}
      <ul className="divide-y divide-ink/15">
        {expeditions.map(island => (
          <li key={island.slug} className="grid grid-cols-[minmax(0,1fr)_minmax(4rem,1fr)_auto] items-center gap-3 py-2">
            <Link className="font-display text-sm underline-offset-4 hover:underline" to={`/islands/${island.slug}`}>{island.name}</Link>
            <progress aria-label={island.name + " progress"} className="w-full accent-olive-dark"
              value={island.completed} max={island.total || 1} />
            <span className="annotation whitespace-nowrap text-xs">{island.completed} / {island.total}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
