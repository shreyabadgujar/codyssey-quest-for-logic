import { useState } from "react";
import { Compass, PawPrint } from "lucide-react";
import { equipmentArtwork } from "../data/equipmentArtwork.js";
import { AvatarArtwork } from "./AvatarArtwork.jsx";
import { PortraitFrame } from "./PortraitFrame.jsx";

const placement = {
  "explorer-01": { pin: { left: "65%", top: "49%" }, companion: { bottom: "9%" } },
  "explorer-02": { pin: { left: "64%", top: "51%" }, companion: { bottom: "8%" } },
  "explorer-03": { pin: { left: "63%", top: "45%" }, companion: { bottom: "8%" } },
  "explorer-04": { pin: { left: "64%", top: "44%" }, companion: { bottom: "9%" } },
};

export function EquippedPortrait({ avatar, equipment }) {
  const { frame, background, pin, companion } = equipment;
  const [failedAssets, setFailedAssets] = useState({});
  if (!frame && !background && !pin && !companion) {
    return <div className="mx-auto max-w-48"><AvatarArtwork avatar={avatar} /></div>;
  }

  const offsets = placement[avatar.id] ?? placement["explorer-01"];
  const backgroundArt = background && equipmentArtwork(background);
  const pinArt = pin && equipmentArtwork(pin);
  const companionArt = companion && equipmentArtwork(companion);
  const usable = asset => asset && !failedAssets[asset];
  const fail = asset => setFailedAssets(previous => ({ ...previous, [asset]: true }));

  return (
    <div className="relative isolate mx-auto max-w-sm overflow-hidden border border-ink/25 bg-parchment-light px-3 py-4"
      role="group" aria-label={`${avatar.name} with equipment`}>
      {usable(backgroundArt) && (
        <img src={backgroundArt} alt={background.name} onError={() => fail(backgroundArt)}
          className="absolute inset-0 -z-10 h-full w-full object-cover" />
      )}
      <PortraitFrame frame={frame} className="mx-auto w-[62%] max-w-48">
        <AvatarArtwork avatar={avatar} layered />
        {pin && (
          <span role="img" aria-label={pin.name} style={offsets.pin}
            className="absolute grid aspect-square w-[14%] -translate-x-1/2 -translate-y-1/2 place-items-center">
            {usable(pinArt)
              ? <img src={pinArt} alt="" className="absolute inset-0 h-full w-full object-contain drop-shadow" onError={() => fail(pinArt)} />
              : <Compass className="h-full w-full text-brass-light" aria-hidden="true" />}
          </span>
        )}
      </PortraitFrame>
      {companion && (
        <span role="img" aria-label={companion.name} style={offsets.companion}
          className="absolute right-[2%] grid aspect-square w-[27%] max-w-24 place-items-end">
          {usable(companionArt)
            ? <img src={companionArt} alt="" className="absolute inset-0 h-full w-full object-contain object-bottom drop-shadow" onError={() => fail(companionArt)} />
            : <PawPrint className="mx-auto h-1/2 w-1/2 text-olive-dark" aria-hidden="true" />}
        </span>
      )}
    </div>
  );
}
