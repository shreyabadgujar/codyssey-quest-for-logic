import { Archive, Scroll } from "lucide-react";

function simulate(data, ids) {
  const cells=[...data.initial], notes=[];
  const find = value => {
    const path=[];
    let index=0;
    while (cells[index] != null) {
      path.push(cells[index]);
      if (cells[index]===value) break;
      index=2*index+(value<cells[index]?1:2);
    }
    return {path,index};
  };
  const walk=index=>cells[index]==null?[]:[...walk(index*2+1),cells[index],...walk(index*2+2)];
  let invalid=null;
  for (const [i,id] of ids.entries()) {
    const {action,value,index}=data.ops.find(op=>op.id===id);
    if (["push","enqueue"].includes(action)) cells.push(value);
    if (action==="pop") cells.length ? notes.push(cells.pop()) : invalid=i;
    if (action==="peek") cells.length ? notes.push(cells.at(-1)) : invalid=i;
    if (action==="duplicate") cells.length ? cells.push(cells.at(-1)) : invalid=i;
    if (action==="swap") {
      if (cells.length < 2) invalid=i;
      else {
        const last = cells.length - 1;
        [cells[last], cells[last - 1]] = [cells[last - 1], cells[last]];
      }
    }
    if (action==="dequeue") cells.length ? notes.push(cells.shift()) : invalid=i;
    if (action==="delete") index<cells.length ? notes.push(cells.splice(index,1)[0]) : invalid=i;
    if (action==="insert" && data.type!=="tree") index<=cells.length ? cells.splice(index,0,value) : invalid=i;
    if (action==="insert" && data.type==="tree") {
      const slot=find(value).index;
      if (cells[slot]!=null || slot>=31) invalid=i;
      else { while (cells.length<=slot) cells.push(null); cells[slot]=value; }
    }
    if (action==="search") notes.push(data.type==="tree" ? find(value).path.join("→") : cells.indexOf(value));
    if (action==="traverse") notes.push(walk(0).join("→"));
    if (invalid!=null) break;
  }
  return {cells,notes,invalid};
}
function Memory({cells,type}) {
  if (type==="tree") {
    const height=Math.max(1,Math.floor(Math.log2(cells.length||1))+1);
    const point=i=>{
      const level=Math.floor(Math.log2(i+1)), count=2**level;
      return [(i-count+1+0.5)*420/count,level*46+22];
    };
    return <svg className="pz-tree" viewBox={"0 0 420 "+(height*46)} role="img" aria-label={"Tree level order: "+cells.map(n=>n??"empty").join(", ")}>
      {cells.map((n,i)=>{
        if (n==null) return null;
        const [x,y]=point(i), [px,py]=point(Math.floor((i-1)/2));
        return <g key={i}>{i>0 && <line x1={px} y1={py+12} x2={x} y2={y-12}/>}<circle cx={x} cy={y} r={13}/><text x={x} y={y}>{n}</text></g>;
      })}
    </svg>;
  }
  return <div className={"pz-memory pz-memory-"+type}>{cells.length ? cells.map((cell,i)=>
    <span key={i+":"+cell} className="pz-cell"><small>{type==="stack"&&i===cells.length-1 ? "TOP" : type==="queue"&&i===0 ? "FRONT" : i}</small>{cell}</span>) : <span>Empty</span>}</div>;
}
export function StructureWorkshop({data,draft,edit}) {
  const ids=draft.operations || [];
  const current=simulate(data,ids);
  return <div className="pz-mechanic pz-workshop">
    <div className="pz-memory-duo">
      <section><h3><Archive aria-hidden="true"/> Live {data.type}</h3><Memory cells={current.cells} type={data.type}/><p>Sensor: <strong>{current.notes.join(" | ")||"—"}</strong></p></section>
      <section><h3><Scroll aria-hidden="true"/> Target {data.type}</h3><Memory cells={data.target} type={data.type}/><p>Expected sensor: <strong>{data.observations.join(" | ")}</strong></p></section>
    </div>
    <p className="pz-readout" role="status">{current.invalid==null ? "Memory stable" : "Invalid operation at step "+(current.invalid+1)} · {ids.length}/{data.limit} operations</p>
    <div className="pz-overline">Workshop tools</div>
    <div className="pz-buttons">{data.ops.map(op=><button key={op.id} disabled={ids.length>=data.limit || current.invalid!=null}
      onClick={()=>edit({operations:[...ids,op.id]})}>{op.label}</button>)}</div>
    <div className="pz-overline">Steps recorded</div>
    <ol className="pz-operations">{ids.map((id,i)=><li key={i}>{data.ops.find(op=>op.id===id).label}</li>)}</ol>
    <button disabled={!ids.length} onClick={()=>edit({operations:ids.slice(0,-1)})}>Undo operation</button>
  </div>;
}
