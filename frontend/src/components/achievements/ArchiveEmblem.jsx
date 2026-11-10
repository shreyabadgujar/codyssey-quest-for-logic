import { useState } from "react";
import { isSealed } from "./archivePresentation.js";

const directory = "/assets/achievements/archive/";
const seal = directory + "sealed-entry.webp";

export function ArchiveEmblem({ item, size, className = "" }) {
  const [failed, setFailed] = useState(null);
  const sealed = isSealed(item);
  const asset = sealed ? seal : directory + encodeURIComponent(item.key) + ".webp";
  const source = failed === asset ? item.icon ?? seal : asset;

  return <img className={`aa-emblem ${className}`} data-sealed={sealed} data-earned={item.unlocked}
    src={source} width={size} height={size} alt="" draggable={false} onError={() => setFailed(asset)} />;
}
