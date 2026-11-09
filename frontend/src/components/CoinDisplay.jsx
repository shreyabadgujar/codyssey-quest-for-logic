import { useState } from "react";
import { Coins } from "lucide-react";
import { formatNumber } from "../utils/format.js";

export default function CoinDisplay({ coins = 0, size = 20, className = "" }) {
  const [imgError, setImgError] = useState(false);

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-display text-brass tracking-wider ${className}`}
      title={`${formatNumber(coins)} Gold Coins`}
    >
      {!imgError ? (
        <img
          src="/assets/treasures/gold-coin.webp"
          alt="Gold coin"
          width={size}
          height={size}
          className="inline-block object-contain drop-shadow-sm select-none"
          style={{ width: size, height: size }}
          onError={() => setImgError(true)}
        />
      ) : (
        <Coins size={size} aria-hidden />
      )}
      <span className="font-semibold text-ink">{formatNumber(coins)}</span>
    </span>
  );
}

