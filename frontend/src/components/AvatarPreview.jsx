import { useState } from "react";
import { User } from "lucide-react";
import { resolveAvatar } from "../data/avatars.js";

export default function AvatarPreview({ avatar, size = 64, className = "" }) {
  const [failedId, setFailedId] = useState(null);
  const equipped = resolveAvatar(avatar);

  return (
    <div
      className={`relative rounded-full overflow-hidden shrink-0 select-none ${className}`}
      style={{
        width: size,
        height: size,
        border: "2px solid rgb(var(--c-brass))",
        boxShadow: "0 0 0 1px rgb(var(--c-ink) / 0.8), var(--shadow-paper)",
        background: "rgb(var(--c-parchment-light))",
      }}
    >
      {equipped && failedId !== equipped.id ? (
        <img
          src={equipped.src}
          alt={equipped.name}
          width={size}
          height={size}
          className="w-full h-full object-cover object-top"
          onError={() => setFailedId(equipped.id)}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-sepia">
          <User size={size * 0.6} />
        </div>
      )}
    </div>
  );
}

