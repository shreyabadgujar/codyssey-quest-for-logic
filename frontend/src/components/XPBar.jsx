// props: xp, xpToNext, level, compact
export default function XPBar({ xp = 0, xpToNext = 100, level = 1, compact = false, className = "" }) {
  const pct = Math.min(100, Math.round((xp / (xpToNext || 1)) * 100));

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`} title={`Rank ${level} Explorer • ${xp} / ${xpToNext} XP`}>
        <span className="font-display text-xs text-sepia tracking-wider shrink-0">Rank {level}</span>
        <div
          className="w-24 h-2.5 rounded-sm overflow-hidden relative shadow-inner"
          style={{
            border: "1px solid rgb(var(--c-ink) / 0.6)",
            background: "rgb(var(--c-parchment-light) / 0.8)",
          }}
        >
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              background: "linear-gradient(to right, rgb(var(--c-olive)), rgb(var(--c-gold)))",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`} aria-label={`Level ${level}, ${xp} of ${xpToNext} XP`}>
      <div className="flex justify-between items-baseline">
        <span className="font-display text-sm tracking-wide text-ink">Explorer Rank {level}</span>
        <span className="annotation text-xs text-sepia">{xp} / {xpToNext} XP</span>
      </div>
      <div
        className="h-3.5 rounded-sm overflow-hidden p-0.5 shadow-inner"
        style={{
          border: "1px solid rgb(var(--c-ink))",
          background: "rgb(var(--c-parchment-light) / 0.8)",
        }}
      >
        <div
          className="h-full rounded-sm transition-all duration-500 ease-out"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(to right, rgb(var(--c-olive)), rgb(var(--c-gold)))",
            boxShadow: "0 0 4px rgb(var(--c-gold) / 0.5)",
          }}
        />
      </div>
    </div>
  );
}

