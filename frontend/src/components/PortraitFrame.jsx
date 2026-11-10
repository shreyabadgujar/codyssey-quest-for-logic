import { useState } from "react";
import { equipmentArtwork } from "../data/equipmentArtwork.js";

const finishes = {
  gold: "border-brass",
  silver: "border-sea",
  royal: "border-brass-light",
};

export function PortraitFrame({ frame, children, className = "", foreground = false }) {
  const [failedAsset, setFailedAsset] = useState(null);
  const asset = frame && equipmentArtwork(frame);
  const hasArt = asset && asset !== failedAsset;
  const overlay = `pointer-events-none absolute inset-0 ${foreground ? "z-20" : ""}`;

  return (
    <span className={`relative block aspect-[2/3] ${className}`}>
      <span className={`absolute ${frame ? "inset-[8%]" : "inset-0"}`}>{children}</span>
      {frame && (hasArt
        ? <img src={asset} alt={frame.name} onError={() => setFailedAsset(asset)}
            className={`${overlay} h-full w-full object-contain`} />
        : <span role="img" aria-label={frame.name} className={`${overlay} border-[6px] border-double ${finishes[frame.visual] ?? finishes.gold}`} />)}
    </span>
  );
}
