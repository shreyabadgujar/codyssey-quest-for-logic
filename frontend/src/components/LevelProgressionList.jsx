import MissionCard from "./MissionCard.jsx";

// levels: array of { id, level, title, difficulty, status } from GET /islands/:id
export default function LevelProgressionList({ levels = [] }) {
  if (!levels.length) return <p className="annotation">No cases have been filed for this island yet.</p>;
  return (
    <ol className="grid gap-4 list-none p-0">
      {levels.map((l) => <li key={l.id}><MissionCard mission={l} status={l.status} /></li>)}
    </ol>
  );
}
