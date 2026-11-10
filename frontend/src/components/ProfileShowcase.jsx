import { Link } from "react-router-dom";
import { Compass, Feather } from "lucide-react";
import { getIslandArtwork } from "../data/islands.js";
import { getRankProgress } from "../game/rankProgress.js";
import CoinDisplay from "./CoinDisplay.jsx";
import { EquippedPortrait } from "./EquippedPortrait.jsx";

export function ProfileShowcase({ player, avatar, equipment, title }) {
  const { level: rank, xp, xpToNext } = getRankProgress(player.xp);

  return (
    <header className="ec-showcase" aria-labelledby="chronicle-title">
      <figure className="ec-character">
        {!equipment.background && <img className="ec-character-backdrop" src={getIslandArtwork("array-archipelago").illustration} alt="" />}
        <EquippedPortrait avatar={avatar} equipment={equipment} showcase />
        <figcaption><span>Wardrobe portrait</span><strong>{avatar.name}</strong></figcaption>
      </figure>
      <div className="ec-identity">
        <p className="ec-kicker"><Compass size={19} aria-hidden="true" /> Personal expedition hall</p>
        <h1 id="chronicle-title">Explorer’s Chronicle</h1>
        <div className="ec-nameplate"><Feather size={20} aria-hidden="true" /><p>{player.username}</p></div>
        <p className="ec-title">{title || "Explorer of Ætheria"}</p>
        <p className="ec-introduction">{avatar.description}</p>
        <dl className="ec-identity-stats">
          <div><dt>Level</dt><dd>{player.level ?? rank}</dd></div>
          <div><dt>Explorer rank</dt><dd>{rank}</dd></div>
          <div><dt>Coin purse</dt><dd><CoinDisplay coins={player.coins} size={22} /></dd></div>
        </dl>
        <div className="ec-rank-progress">
          <div><span>Progress to rank {rank + 1}</span><strong>{xp} / {xpToNext} XP</strong></div>
          <progress className="ec-progress" aria-label="Rank progress" value={xp} max={xpToNext} />
        </div>
        {Object.keys(equipment).length === 0 && <p className="ec-title">No cosmetics equipped. Equip owned items in the Wardrobe.</p>}
        <div className="ec-showcase-links">
          <Link className="ec-link ec-link-gold" to="/avatar">Customize explorer</Link>
          <Link className="ec-link ec-link-light" to="/map">View world map</Link>
        </div>
      </div>
    </header>
  );
}
