import { Link } from "react-router-dom";
import { EQUIPMENT_SLOTS } from "../hooks/useAvatarItems.js";

export function AvatarEquipment({ items, disabled }) {
  return (
    <section className="folio space-y-3" aria-labelledby="explorer-equipment">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="explorer-equipment" className="text-2xl">Explorer’s Equipment</h2>
          <p className="annotation text-sm">Choose from your inventory. The same equipment follows each explorer.</p>
        </div>
        <Link className="btn-ghost py-1 text-sm no-underline" to="/shop">Visit the Trading Post</Link>
      </div>
      {items.loading && <p role="status">Opening your equipment inventory…</p>}
      {items.loadError && <div className="space-y-2">
        <p role="alert">{items.loadError}</p>
        <button className="btn-ghost" type="button" onClick={items.retry}>Retry equipment</button>
      </div>}
      {!items.loading && !items.loadError && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {EQUIPMENT_SLOTS.map(({ id, label }) => {
            const owned = items.owned.filter(item => item.slot === id);
            const equipped = items.equipped[id];
            return (
              <div key={id} className="min-w-0 border border-ink/25 bg-parchment-light/40 p-3">
                <label className="block">
                  <span className="font-display">{label}</span>
                  <select className="field mt-1 p-2 text-sm" value={equipped?.id ?? ""}
                    disabled={disabled || Boolean(items.savingSlot) || owned.length === 0}
                    onChange={event => items.save(id, event.target.value || null)}>
                    <option value="">None equipped</option>
                    {owned.map(item => <option value={item.id} key={item.id}>{item.name}</option>)}
                  </select>
                </label>
                <p className="annotation mt-1 text-xs">
                  {items.savingSlot === id ? "Saving…" : equipped ? "Equipped · " + owned.length + " owned" : owned.length + " owned"}
                </p>
              </div>
            );
          })}
        </div>
      )}
      {items.notice && <p role="status" className="text-sm text-olive-dark">{items.notice}</p>}
      {items.saveError && <p role="alert" className="text-sm text-oxblood">{items.saveError}</p>}
    </section>
  );
}
