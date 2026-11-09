import { useState } from "react";
import { Bird, Compass, Feather, PawPrint } from "lucide-react";
import { AvatarArtwork } from "./AvatarArtwork.jsx";

const placement = {
  "explorer-01": { pin: "64%", companion: "71%" },
  "explorer-02": { pin: "73%", companion: "70%" },
  "explorer-03": { pin: "61%", companion: "74%" },
  "explorer-04": { pin: "69%", companion: "73%" },
};
const frameFinishes = {
  gold: "border-brass bg-parchment-dark",
  silver: "border-sea bg-parchment-light",
  royal: "border-brass-light bg-olive-dark",
};
const emblems = { owl: Bird, fox: PawPrint, raven: Feather };

export function EquippedPortrait({ avatar, equipment }) {
  const { frame, background, pin, companion } = equipment;
  const [failedAssets, setFailedAssets] = useState({});
  if (!frame && !background && !pin && !companion) {
    return <div className="mx-auto max-w-48"><AvatarArtwork avatar={avatar} /></div>;
  }

  const offsets = placement[avatar.id] ?? { pin: "66%", companion: "72%" };
  const usable = asset => asset && !failedAssets[asset];
  const fail = asset => setFailedAssets(previous => ({ ...previous, [asset]: true }));
  const Companion = emblems[companion?.visual] ?? PawPrint;
  const frameStyle = frame ? frameFinishes[frame.visual] ?? frameFinishes.gold : "";

  return (
    <div className="relative isolate mx-auto max-w-sm overflow-hidden border border-ink/25 bg-parchment-light/40 px-3 py-4"
      role="group" aria-label={`${avatar.name} with equipment`}>
      {background && usable(background.asset) && (
        <img src={background.asset} alt={background.name} onError={() => fail(background.asset)}
          className="absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      <div className={`relative mx-auto w-[62%] max-w-48 ${frame ? "border-[6px] border-double p-1 shadow-paper " + frameStyle : ""}`}
        aria-label={frame?.name}>
        <AvatarArtwork avatar={avatar} />
      </div>
      {pin && (
        <span role="img" aria-label={pin.name} style={{ top: offsets.pin }}
          className="absolute left-[3%] grid aspect-square w-[19%] max-w-16 -translate-y-1/2 place-items-center rounded-full border border-brass bg-parchment p-1 shadow-paper">
          {usable(pin.asset)
            ? <img src={pin.asset} alt="" className="h-full w-full object-contain" onError={() => fail(pin.asset)} />
            : <Compass className="h-2/3 w-2/3 text-sepia" aria-hidden="true" />}
        </span>
      )}
      {companion && (
        <span role="img" aria-label={companion.name} style={{ top: offsets.companion }}
          className="absolute right-[3%] grid aspect-square w-[18%] max-w-16 -translate-y-1/2 place-items-center rounded-full border-4 border-double border-brass bg-parchment text-olive-dark shadow-paper">
          <Companion className="h-3/5 w-3/5" aria-hidden="true" />
        </span>
      )}
    </div>
  );
}
