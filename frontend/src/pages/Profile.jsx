import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EquippedPortrait } from "../components/EquippedPortrait.jsx";
import { ExpeditionLedger } from "../components/ExpeditionLedger.jsx";
import PlayerProfileSummary from "../components/PlayerProfileSummary.jsx";
import { ProfileActivity } from "../components/ProfileActivity.jsx";
import { ProfileHonours } from "../components/ProfileHonours.jsx";
import { ProfileInventory } from "../components/ProfileInventory.jsx";
import { resolveAvatar } from "../data/avatars.js";
import { useAuth } from "../hooks/useAuth.js";
import { getProfileJournal } from "../services/gameService.js";

export default function Profile() {
  const { token, setUser } = useAuth();
  const syncUser = useRef(setUser);
  syncUser.current = setUser;
  const [journal, setJournal] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setJournal(null);
    setError("");
    getProfileJournal().then(data => {
      if (!active || localStorage.getItem("codyssey_token") !== token) return;
      setJournal(data);
      syncUser.current(data.player);
    }).catch(failure => {
      if (active) setError(failure.message || "Your expedition journal could not be opened.");
    });
    return () => { active = false; };
  }, [token, attempt]);

  const player = journal?.player;
  const avatar = resolveAvatar(player?.avatar);
  const equipment = Object.fromEntries((journal?.inventory.equipped ?? []).map(item => [item.slot, item]));
  const portrait = player && avatar ? (
    <div className="w-full max-w-64 shrink-0 sm:w-56">
      <EquippedPortrait avatar={avatar} equipment={equipment} />
      <p className="annotation mt-2 text-center text-sm">{avatar.name}</p>
    </div>
  ) : null;
  return (
    <section className="space-y-5">
      <header className="paper space-y-2 border border-ink/30 p-4 sm:p-6">
        <p className="annotation flex items-center gap-2 text-sm"><Compass size={17} aria-hidden="true" /> Personal expedition journal</p>
        <h1 className="text-3xl sm:text-4xl">Explorer’s Profile</h1>
        <p>The cases you’ve solved, the shores you’ve explored, and the keepsakes you’ve brought home.</p>
      </header>
      {error ? <div className="folio space-y-2">
        <p role="alert" className="text-oxblood">{error}</p>
        <button className="btn-ghost" type="button" onClick={() => setAttempt(value => value + 1)}>Retry journal</button>
      </div> : !journal ? <p role="status" className="folio">Retrieving your expedition journal…</p> : <>
        <PlayerProfileSummary player={player} portrait={portrait} title={journal.achievements.titles.at(-1)}>
          <Link className="btn-ghost mt-2 px-3 py-1 text-sm no-underline" to="/avatar">Customize explorer</Link>
        </PlayerProfileSummary>
        <ExpeditionLedger stats={journal.stats} expeditions={journal.expeditions} player={player} />
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <ProfileHonours achievements={journal.achievements} />
          <ProfileInventory inventory={journal.inventory} />
        </div>
        <ProfileActivity activity={journal.activity} />
      </>}
    </section>
  );
}
