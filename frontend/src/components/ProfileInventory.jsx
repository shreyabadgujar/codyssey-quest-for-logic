import { Link } from "react-router-dom";
import { journalDate } from "../utils/journalDate.js";

const slotNames = { frame: "Frame", background: "Background", pin: "Decorative pin", companion: "Companion" };

export function ProfileInventory({ inventory }) {
  return (
    <section className="folio space-y-4">
      <h2 className="text-2xl">Explorer’s collection</h2>
      <p className="annotation">{inventory.count} items owned</p>
      <div className="space-y-2">
        <h3 className="text-lg">Equipped cosmetics</h3>
        {inventory.equipped.length ? <ul className="divide-y divide-ink/15">
          {inventory.equipped.map(item => <li key={item.id} className="flex flex-wrap justify-between gap-1 py-1 text-sm">
            <span className="annotation">{slotNames[item.slot] ?? item.slot}</span><span>{item.name}</span>
          </li>)}
        </ul> : <p>No cosmetics equipped.</p>}
      </div>
      <div className="space-y-2 border-t border-ink/20 pt-3">
        <h3 className="text-lg">{inventory.recent.length ? "Recent purchases" : "Owned items"}</h3>
        {(inventory.recent.length ? inventory.recent : inventory.ownedPreview).map(item => (
          <p className="flex flex-wrap justify-between gap-1 text-sm" key={item.id}>
            <span>{item.name}</span>{item.at && <time className="annotation text-xs" dateTime={item.at}>{journalDate(item.at)}</time>}
          </p>
        ))}
        {!inventory.count && <p>Your collection is empty.</p>}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link className="btn-ghost px-2 py-1 text-sm no-underline" to="/shop">Visit the Trading Post</Link>
        <Link className="btn-ghost px-2 py-1 text-sm no-underline" to="/avatar">Open wardrobe</Link>
      </div>
    </section>
  );
}
