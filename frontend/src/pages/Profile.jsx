import { useEffect, useRef, useState } from "react";
import { Compass } from "lucide-react";
import { ExpeditionLedger } from "../components/ExpeditionLedger.jsx";
import { ProfileActivity } from "../components/ProfileActivity.jsx";
import { ProfileHonours } from "../components/ProfileHonours.jsx";
import { ProfileInventory } from "../components/ProfileInventory.jsx";
import { ProfileShowcase } from "../components/ProfileShowcase.jsx";
import { resolveAvatar } from "../data/avatars.js";
import { useAuth } from "../hooks/useAuth.js";
import { getProfileJournal } from "../services/gameService.js";
import "../styles/profile.css";

function wardrobeSignature(user) {
  return JSON.stringify([
    user?.avatar?.base,
    Object.entries(user?.avatar?.equipped ?? {}).sort(),
    [...(user?.inventory ?? [])].sort(),
  ]);
}

export default function Profile() {
  const { token, user, setUser } = useAuth();
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

  useEffect(() => {
    function refreshAfterWardrobeChange(event) {
      if (event.key !== "codyssey_user" || !event.oldValue || !event.newValue ||
          localStorage.getItem("codyssey_token") !== token) return;
      try {
        const previous = JSON.parse(event.oldValue);
        const updated = JSON.parse(event.newValue);
        if (previous?._id === updated?._id && wardrobeSignature(previous) !== wardrobeSignature(updated)) {
          setAttempt(value => value + 1);
        }
      } catch {
        // Ignore malformed storage values. The journal API supplies the profile.
      }
    }
    window.addEventListener("storage", refreshAfterWardrobeChange);
    return () => window.removeEventListener("storage", refreshAfterWardrobeChange);
  }, [token]);

  const player = journal && (user ?? journal.player);
  const avatar = resolveAvatar(player?.avatar);
  const savedEquipment = journal?.inventory.equipped ?? [];
  const equippedIds = player?.avatar?.equipped ?? Object.fromEntries(savedEquipment.map(item => [item.slot, item.id]));
  const equipment = Object.fromEntries([...(journal?.inventory.owned ?? []), ...savedEquipment]
    .filter(item => String(equippedIds[item.slot] ?? "") === item.id)
    .map(item => [item.slot, item]));

  if (!journal) return (
    <section className="ec-chronicle">
      <header className="ec-notice paper">
        <p className="ec-kicker"><Compass size={18} aria-hidden="true" /> Personal expedition hall</p>
        <h1>Explorer’s Chronicle</h1>
        {error ? <><p role="alert">{error}</p><button className="ec-link" type="button" onClick={() => setAttempt(value => value + 1)}>Retry journal</button></>
          : <p role="status">Retrieving your expedition journal…</p>}
      </header>
    </section>
  );

  return (
    <section className="ec-chronicle">
      <ProfileShowcase player={player} avatar={avatar} equipment={equipment} title={journal.achievements.titles.at(-1)} />
      <ExpeditionLedger stats={journal.stats} expeditions={journal.expeditions} player={player} />
      <div className="ec-cabinets">
        <ProfileHonours achievements={journal.achievements} />
        <ProfileInventory inventory={journal.inventory} equipment={equipment} />
      </div>
      <ProfileActivity activity={journal.activity} />
    </section>
  );
}
