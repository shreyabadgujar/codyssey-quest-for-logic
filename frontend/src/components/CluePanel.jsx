// Shown only after the server confirms the mission is solved.
export default function CluePanel({ clue }) {
  return (
    <section className="folio" aria-label="Story clue">
      <h3 className="text-lg">Clue from the Journal</h3>
      <p className="annotation text-lg">{clue ?? "Solve the case to reveal the next clue."}</p>
    </section>
  );
}
