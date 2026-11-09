const point = (index, count, radius) => [150 + Math.sin(2*Math.PI*index/count)*radius,150-Math.cos(2*Math.PI*index/count)*radius];
export function CipherDecoder({ data, draft, edit }) {
  const wheel = draft.wheel || 0;
  const mapping = draft.mapping || {};
  const rotate = direction => edit({ ...draft, wheel:(wheel+direction+data.ring.length)%data.ring.length });
  const match = data.ring[(data.alphabet.indexOf(data.calibration.letter)+wheel)%data.ring.length] === data.calibration.glyph;
  return <div className="pz-mechanic pz-cipher">
    <div className="pz-wheel-wrap">
      <svg viewBox="0 0 300 300" className="pz-wheel" role="img" aria-label="Decoder wheel with letters on the outside and rotatable symbols inside">
        <circle className="pz-wheel-disc" cx="150" cy="150" r="145"/>
        <circle cx="150" cy="150" r="139"/><circle cx="150" cy="150" r="135"/><circle cx="150" cy="150" r="105"/><circle cx="150" cy="150" r="61"/><circle cx="150" cy="150" r="52"/>
        <path className="pz-wheel-engraving" d="M150 91l8 20 18 13 33 26-33 26-18 13-8 20-8-20-18-13-33-26 33-26 18-13Z"/>
        {data.alphabet.map((letter,i) => {
          const [x,y]=point(i,data.ring.length,139),[tx,ty]=point(i,data.ring.length,131);
          return <line key={letter} className="pz-wheel-engraving" x1={x} y1={y} x2={tx} y2={ty}/>;
        })}
        {data.alphabet.map((letter,i) => {
          const [x,y]=point(i,data.ring.length,121);
          const [sx,sy]=point(i,data.ring.length,82);
          const glyph=data.ring[(i+wheel)%data.ring.length];
          return <g key={letter} className={letter===data.calibration.letter ? "pz-index-mark" : ""}>
            <text x={x} y={y}>{letter}</text><text x={sx} y={sy}>{glyph}</text>
          </g>;
        })}
        <text x="150" y="144">INDEX</text><text x="150" y="169">{String(wheel).padStart(2,"0")}</text>
      </svg>
      <div className="pz-buttons"><button onClick={() => rotate(-1)}>↶ Left</button><button onClick={() => rotate(1)}>↷ Right</button></div>
      <p className="pz-readout">Calibrate {data.calibration.glyph} → {data.calibration.letter} · {match ? "Aligned" : "Searching"}</p>
      <details><summary>Read wheel pairs as text</summary><p>{data.alphabet.map((letter,i) => letter + " ↔ " + data.ring[(i+wheel)%data.ring.length]).join(" · ")}</p></details>
    </div>
    <div className="pz-cipher-console">
      <div className="pz-overline">Inscribed fragments</div>
      <ol className="pz-packets">{data.groups.map((group,index) => <li key={index}><span>{group.join(" ")}</span><code>{group.map(symbol => mapping[symbol] || "·").join(" ")}</code></li>)}</ol>
      <p>{data.reading}</p>
      <div className="pz-mapping">{data.symbols.map(symbol => <label key={symbol}>{symbol}
        <select aria-label={"Map " + symbol} value={mapping[symbol] || ""} onChange={event => edit({ ...draft, mapping: {...mapping,[symbol]:event.target.value} })}>
          <option value="">—</option>{data.alphabet.map(letter => <option key={letter}>{letter}</option>)}
        </select>
      </label>)}</div>
      <label className="pz-field">Recovered transmission<input value={draft.message || ""} maxLength={80} onChange={event => edit({ ...draft,message:event.target.value.replace(/[^a-zA-Z ]/g,"") },true)} /></label>
    </div>
  </div>;
}
