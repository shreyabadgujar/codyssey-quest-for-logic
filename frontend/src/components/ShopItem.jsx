import CoinDisplay from "./CoinDisplay.jsx";
import { ShopArtwork } from "./ShopArtwork.jsx";

export function ShopItem({ item, category, owned, selected, onSelect }) {
  return (
    <button type="button" onClick={onSelect} aria-pressed={selected} aria-label={`Preview ${item.name}`}
      className={`folio h-full min-w-0 space-y-2 p-3 text-left transition-shadow hover:shadow-lift ${selected ? "ring-2 ring-brass" : ""}`}>
      <ShopArtwork item={item} />
      <span className="annotation block text-xs">{category}</span>
      <span className="block font-display text-lg leading-tight">{item.name}</span>
      <span className="block text-sm leading-snug">{item.description}</span>
      <span className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <CoinDisplay coins={item.price} size={17} />
        <span className={`annotation text-xs ${owned ? "text-olive-dark" : ""}`}>{owned ? "Owned" : selected ? "Selected" : "Available"}</span>
      </span>
    </button>
  );
}
