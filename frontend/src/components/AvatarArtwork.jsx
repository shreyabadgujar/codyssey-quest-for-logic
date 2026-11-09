import { useState } from "react";
import { Compass } from "lucide-react";

export function AvatarArtwork({ avatar, layered = false }) {
  const [failedId, setFailedId] = useState(null);
  return (
    <span className={`block aspect-[2/3] overflow-hidden ${layered ? "" : "border border-ink/50 bg-parchment-light"}`}>
      {failedId === avatar.id
        ? <span className="grid h-full place-content-center justify-items-center gap-2 p-2 text-center text-sepia">
            <Compass size={24} aria-hidden="true" />
            <span className="annotation text-xs">Illustration unavailable</span>
          </span>
        : <img src={avatar.src} alt="" width={184} height={276} draggable={false}
            className="h-full w-full object-contain" onError={() => setFailedId(avatar.id)} />}
    </span>
  );
}
