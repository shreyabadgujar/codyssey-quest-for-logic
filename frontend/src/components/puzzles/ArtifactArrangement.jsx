import { useRef, useState } from "react";
import { Compass, Gem, GripVertical } from "lucide-react";

export function ArtifactArrangement({ data, draft, edit }) {
  const steps = draft.steps || [];
  const [drag, setDrag] = useState(null);
  const [target, setTarget] = useState(null);
  const gesture = useRef(null);
  const items = Object.fromEntries(data.items.map(item => [item.id,item]));
  const used = steps.reduce((sum,step) => sum + items[step.id].cost,0);
  const value = steps.reduce((sum,step) => sum + items[step.id].value,0);
  const put = next => edit({ steps: next });
  function move(from,to) {
    if (from === to || to < 0 || to >= steps.length) return;
    const next = [...steps];
    const [item] = next.splice(from,1);
    next.splice(to,0,item);
    put(next);
  }
  function railIndex(event) {
    const row = document.elementFromPoint(event.clientX,event.clientY)?.closest("[data-rail-index]");
    return row ? Number(row.dataset.railIndex) : null;
  }
  function startDrag(event,index) {
    if (event.button !== 0 || gesture.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = { id:event.pointerId,index };
    setDrag(index);
  }
  function trackDrag(event) {
    if (gesture.current?.id === event.pointerId) setTarget(railIndex(event));
  }
  function endDrag(event,commit) {
    if (gesture.current?.id !== event.pointerId) return;
    const destination = commit ? railIndex(event) : null;
    if (destination !== null) move(gesture.current.index,destination);
    gesture.current = null;
    setDrag(null);
    setTarget(null);
  }
  return <div className="pz-mechanic pz-arrangement">
    <div className="pz-readout">Energy <strong>{used}/{data.energy}</strong>{data.items.some(item => item.value) && <> · Yield <strong>{value}</strong></>}</div>
    <div className="pz-overline">Relic tablets · select to install</div>
    <div className="pz-manifest">{data.items.map(item => <button key={item.id} disabled={steps.some(s => s.id === item.id)} onClick={() => put([...steps,{ id:item.id,turn:0 }])}>
      <strong><Gem className="pz-relic-icon" aria-hidden="true"/>{item.mandatory ? "◆ " : ""}{item.name}</strong>
      <span>{item.cost} energy{item.rotation != null ? " · align " + item.rotation + "°" : ""}{item.value ? " · " + item.value + " yield" : ""}</span>
      <small>{item.requires.length ? "Requires " + item.requires.map(id => items[id].name).join(", ") : "No prerequisites"}</small>
    </button>)}</div>
    <div className="pz-overline">Assembly rail · drag or use Earlier and Later</div>
    {steps.length ? <ol className="pz-rail">{steps.map((step,index) => {
      const item = items[step.id];
      const ready = item.requires.every(id => steps.slice(0,index).some(s => s.id === id)) && (item.rotation == null || item.rotation === step.turn);
      return <li key={step.id} data-rail-index={index} data-dragging={drag===index} data-drop={drag!==index&&target===index}>
        <span className="pz-grip" title="Drag to reorder" aria-hidden="true"
          onPointerDown={event => startDrag(event,index)} onPointerMove={trackDrag} onPointerUp={event => endDrag(event,true)}
          onPointerCancel={event => endDrag(event,false)} onLostPointerCapture={event => endDrag(event,false)}><GripVertical/></span>
        <span className="pz-slot">{index+1}</span><span className="pz-relic-turn" aria-hidden="true"><Compass style={{transform:"rotate("+step.turn+"deg)"}}/></span>
        <strong>{item.name}</strong><small>{step.turn}° · {ready ? "Ready" : "Check prerequisites / rotation"}</small>
        <div className="pz-buttons">
          <button aria-label={"Rotate " + item.name} onClick={() => put(steps.map((s,i) => i === index ? {...s,turn:(s.turn+90)%360} : s))}>Rotate</button>
          <button aria-label={"Move " + item.name + " earlier"} disabled={index === 0} onClick={() => move(index,index-1)}>Earlier</button>
          <button aria-label={"Move " + item.name + " later"} disabled={index === steps.length-1} onClick={() => move(index,index+1)}>Later</button>
          <button aria-label={"Remove " + item.name} onClick={() => put(steps.filter(s => s.id !== step.id))}>Remove</button>
        </div>
      </li>;
    })}</ol> : <p className="pz-empty">Assembly rail empty. Select a manifest piece to begin.</p>}
  </div>;
}
