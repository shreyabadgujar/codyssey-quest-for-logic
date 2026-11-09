import { useState } from "react";
import { equipmentArtwork } from "../data/equipmentArtwork.js";

const finishes = {
  gold: "border-brass",
  silver: "border-sea",
  royal: "border-brass-light",
};

export function PortraitFrame({ frame, children, className = "" }) {
  const [failedAsset, setFailedAsset] = useState(null);
  const asset = frame && equipmentArtwork(frame);
  const hasArt = asset && asset !== failedAsset;

  return (
    <span className={`relative block aspect-[2/3] ${className}`}>
      <span className={`absolute ${frame ? "inset-[8%]" : "inset-0"}`}>{children}</span>
      {frame && (hasArt
        ? <img src={asset} alt={frame.name} onError={() => setFailedAsset(asset)}
            className="pointer-events-none absolute inset-0 h-full w-full object-contain" />
        : <span role="img" aria-label={frame.name} className={`pointer-events-none absolute inset-0 border-[6px] border-double ${finishes[frame.visual] ?? finishes.gold}`} />)}
    </span>
  );
}
