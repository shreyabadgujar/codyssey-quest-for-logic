// days: array of booleans for the last N days. TODO: real calendar from GET /users/me.
export default function StreakCalendar({ days = [] }) {
  return (
    <div className="grid grid-cols-7 gap-1" aria-label="Daily streak">
      {days.map((done, i) => (
        <span key={i} className="aspect-square" style={{ border: "1px solid rgb(var(--c-ink) / 0.7)", background: done ? "rgb(var(--c-brass))" : "transparent" }} />
      ))}
    </div>
  );
}
