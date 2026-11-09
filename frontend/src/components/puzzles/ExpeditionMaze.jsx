const directions = [["N","↑ North",-1,0],["W","← West",0,-1],["S","↓ South",1,0],["E","→ East",0,1]];
function follow(data, moves) {
  let row=data.grid.findIndex(line => line.includes("S")), col=data.grid[row].indexOf("S"), cost=0, flags=0;
  const path=[[row,col]];
  for (const move of moves) {
    if (move==="activate") { const bit=data.switches[data.grid[row][col]]; if (!bit || flags&bit || cost>=data.budget) break; flags|=bit; cost++; continue; }
    const [, , dr, dc]=directions.find(item => item[0]===move);
    row+=dr; col+=dc;
    const tile=data.grid[row][col];
    cost+=data.weights[tile] || 1; flags|=data.checkpoints[tile] || 0;
    path.push([row,col]);
  }
  return {row,col,cost,flags,path};
}
export function ExpeditionMaze({data,draft,edit}) {
  const moves=draft.moves || [];
  const {row,col,cost,flags,path}=follow(data,moves);
  const current=data.grid[row][col];
  function canEnter(r,c) {
    const tile=data.grid[r]?.[c];
    return tile && tile!=="#" && (!data.gates[tile] || (flags & data.gates[tile])) && cost+(data.weights[tile] || 1)<=data.budget;
  }
  const name=tile => tile==="S" ? "Start" : tile==="X" ? "Exit" : tile==="#" ? "Wall" :
    data.switches[tile] ? "Switch " + tile : data.gates[tile] ? "Gate " + tile : data.checkpoints[tile] ? "Checkpoint " + tile : tile==="~" ? "Rough terrain" : "Passage";
  return <div className="pz-mechanic pz-maze">
    <div className="pz-readout" aria-live="polite">Energy <strong>{cost}/{data.budget}</strong> · Row {row+1}, column {col+1} · {name(current)}{current==="X" && (flags&data.required)!==data.required && " · objectives missing"}</div>
    <div className="pz-chart"><div className="pz-grid" style={{gridTemplateColumns:"repeat("+data.grid[0].length+", minmax(0, 1fr))"}}>
      {data.grid.flatMap((line,r) => [...line].map((tile,c) => {
        const direction=directions.find(([, , dr, dc]) => row+dr===r && col+dc===c);
        const kind=data.switches[tile] ? "switch" : data.gates[tile] ? "gate" : data.checkpoints[tile] ? "checkpoint" : undefined;
        const properties={ "data-tile":tile, "data-kind":kind, "data-passed":path.some(([y,x])=>r===y&&c===x), "data-here":row===r&&col===c,
          "aria-label":name(tile)+", row "+(r+1)+", column "+(c+1), title:name(tile)+(tile!=="#" ? " · "+(data.weights[tile]||1)+" energy" : "") };
        const marker=row===r&&col===c ? "◆" : tile==="." ? "·" : tile;
        return direction && canEnter(r,c) ? <button key={r+":"+c} {...properties} onClick={()=>edit({moves:[...moves,direction[0]]})}>{marker}</button> :
          <span key={r+":"+c} {...properties}>{marker}</span>;
      }))}
    </div></div>
    <div className="pz-buttons pz-route-controls">
      {directions.map(([id,label,dr,dc])=><button key={id} disabled={!canEnter(row+dr,col+dc)} onClick={()=>edit({moves:[...moves,id]})}>{label}</button>)}
      <button disabled={!data.switches[current] || Boolean(flags&data.switches[current]) || cost>=data.budget} onClick={()=>edit({moves:[...moves,"activate"]})}>Activate switch</button>
      <button disabled={!moves.length} onClick={()=>edit({moves:moves.slice(0,-1)})}>Undo move</button>
    </div>
    <div className="pz-readout">Objectives: {Object.entries({...data.switches,...data.checkpoints}).map(([tile,bit]) =>
      <span className="pz-objective" key={tile}>{tile} {flags&bit ? "✓" : "○"}{data.required&bit ? "" : " (optional)"}</span>)}</div>
    <p className="pz-small">S start · X exit · # wall · ~ weighted terrain · lowercase switch · uppercase gate/checkpoint</p>
  </div>;
}

