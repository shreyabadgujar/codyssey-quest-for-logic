const portraits = ["01", "02", "03", "04"];

export function DetectiveBoard({ data, draft, edit }) {
  const pins = draft.evidence || [];
  const excluded = draft.eliminated || [];
  const toggle = (values, id) => values.includes(id) ? values.filter(value => value !== id) : [...values, id];
  return <div className="pz-mechanic pz-board">
    <div className="pz-overline">Suspect portraits</div>
    <div className="pz-suspects">
      {data.suspects.map((s,index) => <article key={s.id} data-excluded={excluded.includes(s.id)}>
        <img className="pz-suspect-photo" src={"/assets/avatars/explorer-"+portraits[index % portraits.length]+".webp"} alt="" width="44" height="44"/>
        <button aria-pressed={draft.suspect === s.id} onClick={() => edit({ ...draft, suspect: s.id, eliminated: excluded.filter(id => id !== s.id) })}>{s.name}</button>
        <dl>{s.values.map((value, index) => <div key={data.columns[index]}><dt>{data.columns[index]}</dt><dd>{value}</dd></div>)}</dl>
        <button className="pz-quiet" aria-pressed={excluded.includes(s.id)} onClick={() => edit({ ...draft, suspect: draft.suspect === s.id ? "" : draft.suspect, eliminated: toggle(excluded,s.id) })}>Rule out {s.name}</button>
      </article>)}
    </div>
    <div className="pz-overline">Pinned evidence</div>
    <div className="pz-evidence">
      {data.evidence.map((e,index) => <button key={e.id} aria-pressed={pins.includes(e.id)} onClick={() => edit({ ...draft, evidence: toggle(pins,e.id) })}>
        <small>Record {String(index+1).padStart(2,"0")}</small><strong>{e.title}</strong><span>{e.text}</span>
      </button>)}
    </div>
    <div className="pz-readout" aria-live="polite">
      <strong>Deduction link:</strong>
      <div className="pz-thread">
        {pins.map(id => <span key={id}>{data.evidence.find(e => e.id === id).title}</span>)}
        {!pins.length && <span>No records pinned</span>}
        <i aria-hidden="true"/><span>{data.suspects.find(s => s.id === draft.suspect)?.name || "Suspect unassigned"}</span>
        <small>({pins.length}/{data.links} links)</small>
      </div>
    </div>
  </div>;
}
