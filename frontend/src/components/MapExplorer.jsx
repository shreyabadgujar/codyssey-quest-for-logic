import { useState } from "react";
import { Compass } from "lucide-react";
import { resolveAvatar } from "../data/avatars.js";

export function MapExplorer({ avatar, position }) {
  const equipped = resolveAvatar(avatar);
  const [failedId, setFailedId] = useState(null);
  if (!equipped) return null;

  return (
    <div className="map-explorer" style={{ left: `${position.x}%`, top: `${position.y}%` }}
      role="img" aria-label={`${equipped.name} at ${position.label}`}>
      <span className="map-explorer-shadow" aria-hidden="true" />
      <span className="map-explorer-pole" aria-hidden="true" />
      <span className="map-explorer-pennant" aria-hidden="true">
        {failedId === equipped.id
          ? <Compass className="h-full w-full p-1 text-ink" />
          : <img src={equipped.mapSrc} alt="" draggable={false} onError={() => setFailedId(equipped.id)} />}
      </span>
    </div>
  );
}
