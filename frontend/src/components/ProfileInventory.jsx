import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Gem } from "lucide-react";
import { ShopArtwork } from "./ShopArtwork.jsx";
import { journalDate } from "../utils/journalDate.js";

const slotNames = { frame: "Frames", background: "Backgrounds", pin: "Decorative Pins", companion: "Companions" };

export function ProfileInventory({ inventory, equipment }) {
  const [slot, setSlot] = useState("all");
  const owned = [...(inventory.owned ?? inventory.ownedPreview ?? [])].sort((a, b) => a.slot.localeCompare(b.slot) || a.name.localeCompare(b.name));
  const slots = [...new Set(owned.map(item => item.slot))];
  const visible = slot === "all" ? owned : owned.filter(item => item.slot === slot);
  const purchases = new Map(inventory.recent.map(item => [item.id, item.at]));

  return (
    <section className="ec-sheet ec-inventory" aria-labelledby="ec-inventory-title">
      <div className="ec-section-heading">
        <div><p className="ec-kicker"><Gem size={17} aria-hidden="true" /> Expedition keepsakes</p><h2 id="ec-inventory-title">The Curio Cabinet</h2></div>
        <Link className="ec-text-link" to="/shop">Trading Post <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </div>
      <div className="ec-inventory-controls">
        <p><strong>{inventory.count}</strong> owned <span>·</span> <strong>{Object.keys(equipment).length}</strong> equipped</p>
        {slots.length > 1 && <label>Show <select value={slot} onChange={event => setSlot(event.target.value)}>
          <option value="all">All keepsakes</option>
          {slots.map(value => <option value={value} key={value}>{slotNames[value] ?? value}</option>)}
        </select></label>}
      </div>
      {visible.length ? <ul className="ec-curios">
        {visible.map(item => {
          const equipped = equipment[item.slot]?.id === item.id;
          const at = purchases.get(item.id);
          return <li key={item.id} data-equipped={equipped}>
            <ShopArtwork item={item} />
            <div className="ec-curio-copy"><h3>{item.name}</h3><p>{equipped ? <><Check size={13} aria-hidden="true" /> Equipped</> : "Owned"}</p>
              {at && <time dateTime={at}>{journalDate(at)}</time>}
            </div>
          </li>;
        })}
      </ul> : <div className="ec-empty"><p>{inventory.count ? "There are no items to show in this selection." : "Your cabinet is ready for its first keepsake."}</p></div>}
      <Link className="ec-text-link ec-cabinet-link" to="/avatar">Open wardrobe <ArrowUpRight size={15} aria-hidden="true" /></Link>
    </section>
  );
}
