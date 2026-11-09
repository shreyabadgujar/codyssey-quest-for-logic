import { useState } from "react";
import { Bird, Compass, Feather, Frame, PawPrint, Trees } from "lucide-react";

const emblems = { owl: Bird, fox: PawPrint, raven: Feather };
const frames = {
  gold: "border-brass bg-parchment-dark",
  silver: "border-sea bg-parchment-light",
  royal: "border-brass-light bg-olive-dark",
};

export function ShopArtwork({ item, portrait }) {
  const [failedAssets, setFailedAssets] = useState({});
  const canShow = (path) => path && !failedAssets[path];
  const markFailed = (path) => setFailedAssets(previous => ({ ...previous, [path]: true }));
  const Icon = emblems[item.visual] ?? (item.slot === "background" ? Trees : Compass);

  return (
    <span aria-hidden="true" className="relative grid aspect-[16/10] place-items-center overflow-hidden border border-ink/30 bg-parchment-light">
      {item.slot === "frame" ? (
        <span className={`relative grid aspect-[2/3] h-[84%] place-items-center border-[5px] border-double p-1 shadow-paper ${frames[item.visual] ?? frames.gold}`}>
          {canShow(portrait)
            ? <img src={portrait} alt="" className="h-full w-full object-cover" onError={() => markFailed(portrait)} />
            : <Frame className={item.visual === "royal" ? "text-parchment-light" : "text-sepia"} size={28} />}
        </span>
      ) : (
        <>
          {canShow(item.asset)
            ? <img src={item.asset} alt="" onError={() => markFailed(item.asset)}
                className={item.slot === "background" ? "absolute inset-0 h-full w-full object-cover" : "h-[78%] max-w-[74%] object-contain drop-shadow"} />
            : <span className="grid aspect-square w-[33%] max-w-28 place-items-center rounded-full border-4 border-double border-brass bg-parchment text-olive-dark">
                <Icon size={30} />
              </span>}
          {item.slot === "background" && canShow(portrait) && (
            <img src={portrait} alt="" className="absolute bottom-2 right-2 h-[58%] border-2 border-parchment-light object-contain shadow-lift"
              onError={() => markFailed(portrait)} />
          )}
        </>
      )}
    </span>
  );
}
