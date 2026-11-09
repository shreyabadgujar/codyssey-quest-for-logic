import { useEffect, useState } from "react";
import { useAuth } from "./useAuth.js";
import { equipAvatarItem, getShopItems } from "../services/gameService.js";

export const EQUIPMENT_SLOTS = [
  { id: "frame", label: "Frames" },
  { id: "background", label: "Backgrounds" },
  { id: "pin", label: "Decorative Pins" },
  { id: "companion", label: "Companions" },
];

export function useAvatarItems() {
  const { user, token, setUser } = useAuth();
  const [catalogue, setCatalogue] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [reload, setReload] = useState(0);
  const [savingSlot, setSavingSlot] = useState("");
  const [notice, setNotice] = useState("");
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let active = true;
    setCatalogue(null);
    setLoadError("");
    getShopItems().then(items => {
      if (active) setCatalogue(items);
    }).catch(() => {
      if (active) setLoadError("The equipment catalogue could not be loaded.");
    });
    return () => { active = false; };
  }, [token, reload]);

  const ids = new Set(user?.inventory ?? []);
  const owned = (catalogue ?? []).filter(item => ids.has(item.id));
  const equipped = Object.fromEntries(EQUIPMENT_SLOTS.flatMap(({ id }) => {
    const item = owned.find(entry => entry.slot === id && entry.id === user?.avatar?.equipped?.[id]);
    return item ? [[id, item]] : [];
  }));

  async function save(slot, itemId) {
    if (savingSlot) return;
    setSavingSlot(slot);
    setNotice("");
    setSaveError("");
    try {
      const updated = await equipAvatarItem(slot, itemId);
      if (localStorage.getItem("codyssey_token") !== token) return;
      setUser(updated);
      const item = owned.find(entry => entry.id === itemId);
      setNotice(item ? `${item.name} equipped.` : "Item unequipped.");
    } catch (error) {
      setSaveError(error.message || "Equipment could not be saved.");
    } finally {
      setSavingSlot("");
    }
  }

  return { owned, equipped, loadError, loading: catalogue === null && !loadError,
    retry: () => setReload(value => value + 1), save, savingSlot, notice, saveError };
}
