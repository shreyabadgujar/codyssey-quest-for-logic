import { useState } from "react";

function starPoints(outer, inner, n, offsetDeg) {
  const out = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((i * 180) / n + offsetDeg) * (Math.PI / 180);
    out.push(`${(100 + r * Math.sin(a)).toFixed(1)},${(100 - r * Math.cos(a)).toFixed(1)}`);
  }
  return out.join(" ");
}

export default function CompassRose({ size = 160, className = "" }) {
  const [imgError, setImgError] = useState(false);

  if (!imgError) {
    return (
      <img
        src="/assets/decorations/compass-rose.webp"
        alt="Nautical Compass Rose"
        width={size}
        height={size}
        className={`pointer-events-none select-none drop-shadow-md ${className}`}
        style={{ width: size, height: size, objectFit: "contain" }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} role="img" aria-label="Compass rose">
      <circle cx="100" cy="100" r="94" fill="none" stroke="rgb(var(--c-ink))" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="88" fill="none" stroke="rgb(var(--c-ink))" strokeWidth="0.6" strokeDasharray="2 3" />
      <polygon points={starPoints(78, 22, 8, 0)} fill="rgb(var(--c-sepia) / 0.5)" stroke="rgb(var(--c-ink))" strokeWidth="0.8" />
      <polygon points={starPoints(92, 16, 4, 0)} fill="rgb(var(--c-parchment-light))" stroke="rgb(var(--c-ink))" strokeWidth="1.2" />
      <circle cx="100" cy="100" r="6" fill="rgb(var(--c-brass))" stroke="rgb(var(--c-ink))" />
    </svg>
  );
}

