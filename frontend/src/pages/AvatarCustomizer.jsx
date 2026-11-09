import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Compass } from "lucide-react";
import { AvatarArtwork } from "../components/AvatarArtwork.jsx";
import { AvatarEquipment } from "../components/AvatarEquipment.jsx";
import { EquippedPortrait } from "../components/EquippedPortrait.jsx";
import { useAvatarItems } from "../hooks/useAvatarItems.js";
import { AVATARS, resolveAvatar } from "../data/avatars.js";
import { useAuth } from "../hooks/useAuth.js";
import { equipAvatar } from "../services/gameService.js";

export default function AvatarCustomizer() {
  const { user, token, setUser, profileError } = useAuth();
  const items = useAvatarItems();
  const [selectedId, setSelectedId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const equipped = resolveAvatar(user?.avatar);
  const preview = AVATARS.find(avatar => avatar.id === selectedId) ?? equipped;
  const isEquipped = preview?.id === equipped?.id;

  async function save() {
    if (!user || !preview || saving || items.savingSlot || isEquipped) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const updated = await equipAvatar(preview.id);
      if (localStorage.getItem("codyssey_token") !== token) return;
      setUser(updated);
      setNotice(`${preview.name} equipped.`);
    } catch (failure) {
      setError(failure.message || "The wardrobe could not save your choice. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-5">
      <header className="paper border border-ink/40 p-4 sm:p-6">
        <p className="annotation text-sm flex items-center gap-2"><Compass size={17} aria-hidden="true" /> Expedition outfitting</p>
        <h1 className="mt-1 text-3xl text-ink">Explorer Wardrobe</h1>
        <p className="mt-2 max-w-prose">Choose the explorer whose colors you’ll carry across Ætheria.</p>
      </header>
      {!user && <p className="folio" role={profileError ? "alert" : "status"}>
        {profileError ? "Your profile could not be loaded. Reopen your journal to try again." : "Retrieving your explorer profile…"}
      </p>}
      {user && !preview && <p className="folio">No explorer illustrations are available.</p>}
      {user && preview && (
        <div className="grid gap-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] items-start">
          <article className="folio space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div><p className="annotation text-sm">Character sheet</p><h2 className="text-2xl">{preview.name}</h2></div>
              <span className="annotation text-sm text-olive-dark">{isEquipped ? "Equipped" : "Preview"}</span>
            </div>
            <EquippedPortrait key={preview.id} avatar={preview} equipment={items.equipped} />
            <p>{preview.description}</p>
            <p className="annotation text-sm">Currently equipped: {equipped?.name ?? "None"}</p>
            <div className="flex flex-wrap gap-2">
              <button className="btn-brass" type="button" onClick={save} disabled={saving || Boolean(items.savingSlot) || isEquipped}>
                {saving ? "Equipping…" : isEquipped ? "Equipped" : "Equip avatar"}
              </button>
              <Link to="/map" className="btn-ghost no-underline">View world map</Link>
            </div>
            {notice && <p role="status" className="text-olive-dark">{notice}</p>}
            {error && <p role="alert" className="text-oxblood">{error}</p>}
          </article>
          <fieldset className="folio min-w-0" disabled={saving}>
            <legend className="cartouche px-4 py-1 text-lg">Available explorers</legend>
            <div className="grid grid-cols-2 gap-3">
              {AVATARS.map(avatar => {
                const selected = avatar.id === preview.id;
                const worn = avatar.id === equipped?.id;
                return (
                  <label key={avatar.id} className="relative block cursor-pointer">
                    <input type="radio" name="explorer-avatar" value={avatar.id} checked={selected} className="peer sr-only"
                      onChange={() => { setSelectedId(avatar.id); setError(""); setNotice(""); }} />
                    <span className={`block paper border p-2 transition motion-safe:hover:-translate-y-0.5 peer-focus-visible:ring-2 peer-focus-visible:ring-ink ${selected ? "border-brass ring-2 ring-brass" : "border-ink/40"}`}>
                      <span className="block mx-auto max-w-32"><AvatarArtwork avatar={avatar} /></span>
                      <span className="block mt-2 font-display leading-tight">{avatar.name}</span>
                      <span className="flex min-h-6 flex-wrap items-center gap-x-2 annotation text-xs">
                        {selected && <span>Selected</span>}
                        {worn && <span className="inline-flex items-center gap-1 text-olive-dark"><Check size={13} aria-hidden="true" /> Equipped</span>}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        </div>
      )}
      {user && <AvatarEquipment items={items} disabled={saving} />}
    </section>
  );
}
