import { DIFFICULTIES } from "../game/constants.js";

// Brass pips instead of coloured badges.
export default function DifficultyIndicator({ difficulty = "apprentice" }) {
  const n = DIFFICULTIES.indexOf(difficulty) + 1;
  return (
    <span className="inline-flex items-center gap-1 annotation text-sm" aria-label={`Difficulty: ${difficulty}`}>
      {DIFFICULTIES.map((d, i) => (
        <span key={d} className="inline-block w-2.5 h-2.5 rotate-45"
          style={{ border: "1px solid rgb(var(--c-ink))", background: i < n ? "rgb(var(--c-brass))" : "transparent" }} />
      ))}
      <span className="ml-1">{difficulty}</span>
    </span>
  );
}
