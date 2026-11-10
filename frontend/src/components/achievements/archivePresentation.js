import { Compass, Gem, KeyRound, ScrollText } from "lucide-react";

export const chapters = [
  { id: "exploration", label: "Exploration", chapter: "Voyages & Discoveries", note: "Honours from the islands and the artifacts they guard.", Icon: Compass },
  { id: "coding", label: "Coding & Logic", chapter: "The Scribe’s Cabinet", note: "Distinctions for cases closed through reason and precision.", Icon: ScrollText },
  { id: "collection", label: "Collection", chapter: "The Relic Vault", note: "A place for treasures brought back from the field.", Icon: Gem },
  { id: "hidden", label: "Hidden", chapter: "Sealed Honours", note: "Some records can only be read once their seals are broken.", Icon: KeyRound },
];

export const statuses = [
  ["all", "All states"], ["unlocked", "Unlocked"], ["in-progress", "In progress"], ["locked", "Locked"], ["unavailable", "Unavailable"],
];

export const statusOf = item => item.available === false && !item.unlocked ? "unavailable" : item.status;
export const statusLabel = item => statuses.find(([id]) => id === statusOf(item))?.[1] ?? "Locked";
export const isSealed = item => item.category === "hidden" && !item.unlocked;

export function recordedDate(value) {
  const date = new Date(value ?? "");
  return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
