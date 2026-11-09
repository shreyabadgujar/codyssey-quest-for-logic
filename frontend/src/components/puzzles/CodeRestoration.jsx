export function CodeRestoration({data,draft,edit}) {
  const fragments=Array.from({length:data.slots},(_,i)=>draft.fragments?.[i]||"");
  const trace=Array.from({length:data.questions.length},(_,i)=>draft.trace?.[i]||"");
  const choose=(index,id)=>edit({...draft,fragments:fragments.map((item,i)=>index===i?id:item)});
  const setTrace=(index,text)=>edit({...draft,trace:trace.map((item,i)=>index===i?text:item)},true);
  return <div className="pz-mechanic pz-code">
    <div className="pz-overline">Blueprint · fit the missing fragments</div>
    <div className="pz-source">
      {data.template.split("\n").map((line,i)=><div key={i}><span className="pz-line-number">{i+1}</span><code>{line.split(/(\[\d+\])/).map((token,t)=>{
        const slot=/^\[(\d+)\]$/.exec(token);
        if (!slot) return token;
        const index=Number(slot[1])-1;
        return <mark key={t}>{data.choices.find(choice=>choice.id===fragments[index])?.label || token}</mark>;
      })}</code></div>)}
    </div>
    <div className="pz-code-inputs">{fragments.map((fragment,i)=><label className="pz-field" key={i}>Fragment {i+1}
      <select value={fragment} onChange={event=>choose(i,event.target.value)}><option value="">Choose a fragment</option>
        {data.choices.map(choice=><option key={choice.id} value={choice.id}>{choice.label}</option>)}
      </select></label>)}</div>
    <div className="pz-overline">Scribe’s notes · record the trace</div>
    <div className="pz-code-inputs">{data.questions.map((question,i)=><label className="pz-field" key={question}>{question}<input maxLength={80} value={trace[i]} onChange={event=>setTrace(i,event.target.value)} /></label>)}</div>
  </div>;
}
