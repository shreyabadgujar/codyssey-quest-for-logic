import { useState } from "react";
import { Bird, Compass, Feather, Frame, PawPrint, Trees } from "lucide-react";
import { equipmentArtwork } from "../data/equipmentArtwork.js";
import { PortraitFrame } from "./PortraitFrame.jsx";

const emblems = { owl: Bird, fox: PawPrint, raven: Feather };

export function ShopArtwork({ item, portrait }) {
  const [failedAssets, setFailedAssets] = useState({});
  const canShow = (path) => path && !failedAssets[path];
  const markFailed = (path) => setFailedAssets(previous => ({ ...previous, [path]: true }));
  const Icon = emblems[item.visual] ?? (item.slot === "background" ? Trees : Compass);
  const asset = equipmentArtwork(item);

  return (
    <span aria-hidden="true" className="relative grid aspect-[16/10] place-items-center overflow-hidden border border-ink/30 bg-parchment-light">
      {item.slot === "frame" ? (
        <PortraitFrame frame={item} className="w-[35%]">
          {canShow(portrait)
            ? <img src={portrait} alt="" className="h-full w-full object-contain" onError={() => markFailed(portrait)} />
            : portrait && <Frame className="absolute inset-0 m-auto text-sepia" size={28} />}
        </PortraitFrame>
      ) : (
        <>
          {canShow(asset)
            ? <img src={asset} alt="" onError={() => markFailed(asset)}
                className={item.slot === "background" ? "absolute inset-0 h-full w-full object-cover" : "absolute inset-0 m-auto h-[78%] w-[74%] object-contain drop-shadow"} />
            : <span className="grid aspect-square w-[33%] max-w-28 place-items-center rounded-full border-4 border-double border-brass bg-parchment text-olive-dark">
                <Icon size={30} />
              </span>}
          {item.slot === "background" && canShow(portrait) && (
            <img src={portrait} alt="" className="absolute bottom-0 right-2 h-[76%] object-contain"
              onError={() => markFailed(portrait)} />
          )}
        </>
      )}
    </span>
  );
}
