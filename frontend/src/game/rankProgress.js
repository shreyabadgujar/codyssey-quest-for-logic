const XP_PER_RANK = 100;

export function getRankProgress(totalXp) {
  const total = Number.isFinite(totalXp) ? Math.max(0, totalXp) : 0;
  return { level: Math.floor(total / XP_PER_RANK) + 1, xp: total % XP_PER_RANK, xpToNext: XP_PER_RANK };
}
