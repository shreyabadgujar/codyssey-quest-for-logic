import { useEffect, useRef, useState } from "react";
import { Check, Compass, Frame, MapPin, PawPrint, Trees } from "lucide-react";
import CoinDisplay from "../components/CoinDisplay.jsx";
import { ShopArtwork } from "../components/ShopArtwork.jsx";
import { ShopItem } from "../components/ShopItem.jsx";
import { resolveAvatar } from "../data/avatars.js";
import { useAuth } from "../hooks/useAuth.js";
import { getProfile, getShopItems, purchaseItem } from "../services/gameService.js";

const categories = [
  { id: "frame", label: "Frames", Icon: Frame },
  { id: "background", label: "Backgrounds", Icon: Trees },
  { id: "pin", label: "Decorative Pins", Icon: MapPin },
  { id: "companion", label: "Companions", Icon: PawPrint },
];

export default function Shop() {
  const { user, token, setUser } = useAuth();
  const [catalogue, setCatalogue] = useState(null);
  const [category, setCategory] = useState(categories[0]);
  const [selectedId, setSelectedId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [purchaseError, setPurchaseError] = useState("");
  const [notice, setNotice] = useState("");
  const [buying, setBuying] = useState(false);
  const purchaseLock = useRef(false);
  const preview = useRef(null);
  const updateProfile = useRef(setUser);
  updateProfile.current = setUser;

  useEffect(() => {
    let active = true;
    setCatalogue(null);
    setLoadError("");
    Promise.all([getShopItems(), getProfile()]).then(([items, profile]) => {
      if (!active || localStorage.getItem("codyssey_token") !== token) return;
      updateProfile.current(profile);
      setCatalogue(items);
    }).catch(error => {
      if (active) setLoadError(error.message || "The catalogue is unavailable. Try again shortly.");
    });
    return () => { active = false; };
  }, [token, reload]);

  const items = catalogue?.filter(item => item.slot === category.id) ?? [];
  const selected = items.find(item => item.id === selectedId) ?? items[0];
  const inventory = new Set(user?.inventory ?? []);
  const balance = user?.coins ?? 0;
  const portrait = resolveAvatar(user?.avatar)?.src;
  const owned = selected && inventory.has(selected.id);
  const shortfall = selected ? selected.price - balance : 0;

  function selectItem(item) {
    setSelectedId(item.id);
    setPurchaseError("");
    setNotice("");
    if (window.matchMedia("(max-width: 1023px)").matches) preview.current?.scrollIntoView({ block: "start" });
  }

  async function buy() {
    if (!selected || owned || shortfall > 0 || purchaseLock.current) return;
    purchaseLock.current = true;
    setBuying(true);
    setNotice("");
    setPurchaseError("");
    try {
      const updated = await purchaseItem(selected.id);
      if (localStorage.getItem("codyssey_token") !== token) return;
      updateProfile.current(updated);
      setNotice(`${selected.name} added to your inventory.`);
    } catch (error) {
      setPurchaseError(error.message || "Your purchase could not be completed.");
      if (["ITEM_ALREADY_OWNED", "INSUFFICIENT_COINS", "BALANCE_CHANGED"].includes(error.code)) {
        const updated = await getProfile().catch(() => null);
        if (updated && localStorage.getItem("codyssey_token") === token) updateProfile.current(updated);
      }
    } finally {
      purchaseLock.current = false;
      setBuying(false);
    }
  }

  return (
    <section className="space-y-5">
      <header className="paper flex flex-wrap items-center justify-between gap-4 border border-ink/40 p-5 sm:p-6">
        <div>
          <p className="annotation flex items-center gap-2 text-sm"><Compass size={17} aria-hidden="true" /> Ætherian outfitter</p>
          <h1 className="mt-1 text-3xl">Trading Post</h1>
          <p className="mt-2">Browse fittings, chartwork, and companions for your expedition.</p>
        </div>
        <div className="border border-ink/30 bg-parchment-light/60 px-4 py-2">
          <p className="annotation text-xs">Your coin purse</p>
          <CoinDisplay coins={balance} size={23} />
        </div>
      </header>
      {loadError && (
        <div className="folio space-y-3">
          <p role="alert" className="text-oxblood">{loadError}</p>
          <button type="button" className="btn-ghost" onClick={() => setReload(value => value + 1)}>Retry catalogue</button>
        </div>
      )}
      {!catalogue && !loadError && <p className="folio" role="status">Unpacking the outfitter’s catalogue…</p>}
      {catalogue && (
        <>
          <nav aria-label="Shop categories" className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {categories.map(entry => (
              <button key={entry.id} type="button" aria-pressed={category.id === entry.id} disabled={buying}
                className={category.id === entry.id ? "btn-brass px-3 text-sm sm:text-base" : "btn-ghost px-3 text-sm sm:text-base"}
                onClick={() => { setCategory(entry); setSelectedId(null); setNotice(""); setPurchaseError(""); }}>
                <entry.Icon size={17} className="shrink-0" aria-hidden="true" /> {entry.label}
              </button>
            ))}
          </nav>
          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
            {selected && (
              <aside ref={preview} aria-label="Item preview"
                className="folio min-w-0 space-y-3 p-4 lg:col-start-2 lg:row-start-1"
                style={{ scrollMarginTop: "calc(var(--navigation-height, 0px) + 1rem)" }}>
                <p className="annotation text-xs">{category.label} · Item preview</p>
                <h2 className="text-2xl">{selected.name}</h2>
                <ShopArtwork key={selected.id} item={selected} portrait={portrait} />
                <p>{selected.description}</p>
                <p className="annotation text-sm">Purchases go to your inventory. Your equipment stays as it is.</p>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <CoinDisplay coins={selected.price} />
                  <button type="button" className="btn-brass" disabled={buying || owned || shortfall > 0} onClick={buy}>
                    {owned ? <><Check size={17} aria-hidden="true" /> Owned</> : buying ? "Purchasing…" : "Purchase"}
                  </button>
                </div>
                {!owned && shortfall > 0 && <p className="text-sm text-oxblood">You need {shortfall} more {shortfall === 1 ? "coin" : "coins"} to buy this item.</p>}
                {notice && <p role="status" className="border border-olive bg-parchment-light/60 p-2 text-sm text-olive-dark">{notice}</p>}
                {purchaseError && <p role="alert" className="border border-oxblood bg-parchment-light/60 p-2 text-sm text-oxblood">{purchaseError}</p>}
              </aside>
            )}
            <section aria-label={category.label} className="min-w-0 lg:col-start-1 lg:row-start-1">
              <h2 className="mb-3 text-xl">{category.label}</h2>
              {items.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map(item => (
                    <ShopItem key={item.id} item={item} category={category.label} owned={inventory.has(item.id)}
                      selected={item.id === selected.id} onSelect={() => { if (!buying) selectItem(item); }} />
                  ))}
                </div>
              ) : <p className="folio">The outfitter has no items in this category yet.</p>}
            </section>
          </div>
        </>
      )}
    </section>
  );
}
