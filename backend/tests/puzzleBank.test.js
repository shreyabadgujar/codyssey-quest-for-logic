const { test } = require("node:test");
const assert = require("node:assert/strict");
const { bank, byId, playable } = require("../data/puzzles");
const { WEIGHTS, selectPuzzle, assignments } = require("../services/puzzleSelectionService");
const { validate, shortestRoute, workshopStep, detectiveCandidates } = require("../services/puzzleValidationService");
const { checkedDraft } = require("../services/puzzleService");

test("30 complete records, three on each island and five per mechanic; responses never serialize solution data", () => {
  assert.equal(bank.length, 30);
  assert.equal(byId.size, 30);
  const count = key => bank.reduce((m,p)=>m.set(p[key],(m.get(p[key])||0)+1),new Map());
  assert.deepEqual([...count("island").values()],Array(10).fill(3));
  assert.deepEqual([...count("mechanic").values()],Array(6).fill(5));
  for (const p of bank) {
    for (const key of ["title","story","objective","instructions","explanation"]) assert.ok(p[key].length >= 12,p.id);
    assert.equal(new Set(p.hints).size,3,p.id);
    assert.ok(p.coins>0 && p.minutes>0 && p.solution && WEIGHTS[p.difficulty],p.id);
    const view=playable(p);
    for (const key of ["solution","explanation","hints"]) assert.ok(!(key in view),p.id);
    if (p.mechanic==="detective") assert.ok(view.data.evidence.every(e=>!("matches" in e)&&!("required" in e)));
    if (p.mechanic==="cipher") assert.ok(!("alignment" in view.data));
  }
});

test("difficulty uses 5/20/55/20 with all tiers available; weights renormalize as options narrow", () => {
  const counts = {};
  for (let i=0; i<1000; i++) {
    const { difficulty } = selectPuzzle([],()=> (i+0.5)/1000);
    counts[difficulty]=(counts[difficulty]||0)+1;
  }
  assert.deepEqual(counts,{Easy:50,Medium:200,Hard:550,Expert:200});
  assert.equal(selectPuzzle([],()=>0.99,[{...bank[0],inactive:true}]),null);
  assert.equal(selectPuzzle([],()=>0.99,[{...bank[0],solution:null}]),null);
  assert.equal(selectPuzzle([],()=>0.99,[bank[0]]).id,bank[0].id);
});

test("assignments avoid repeats until the pool is exhausted and repeat a mechanic only when necessary", () => {
  const rows=assignments("a",80,[],()=>0.52);
  assert.equal(rows.length,30);
  assert.equal(new Set(rows.map(row=>row.puzzleId)).size,30);
  for (const [i,row] of rows.entries()) {
    assert.equal(row.milestone,(i+1)*2);
    if (!i) continue;
    const previous=byId.get(rows[i-1].puzzleId).mechanic;
    if (previous===byId.get(row.puzzleId).mechanic) {
      assert.ok(rows.slice(i).every(other=>byId.get(other.puzzleId).mechanic===previous));
    }
  }
  assert.deepEqual(assignments("a",80,rows),[]);
  assert.deepEqual(assignments("a",3,[rows[0]]),[]);
  assert.equal(assignments("a",1,[]).length,0);
  assert.equal(assignments("a",2,[]).length,1);
});

const walk = (start, end, removed) => {
  const links = ["A–B","A–C","B–C","B–D","D–E","D–F"].filter(edge=>edge!==removed);
  const nodes = new Set([start]);
  for (let step=0;step<links.length;step++) for (const edge of links) {
    const [a,b]=edge.split("–");
    if(nodes.has(a)||nodes.has(b)) { nodes.add(a); nodes.add(b); }
  }
  return nodes.has(end);
};
const cycle = redirect => {
  const [node,dest]=redirect.split(" → ");
  const path={A:"B",B:"C",C:"D",D:"END",[node]:dest};
  const visited=[];
  let cur="A";
  while(cur!=="END"&&!visited.includes(cur)) {visited.push(cur);cur=path[cur];}
  return [cur, visited.length-visited.indexOf(cur)];
};
const logic = {
  "missing-relic": ([drawers,watch])=>drawers.split(", ").includes("4") && watch==="Dawn",
  "looping-island": ([redirect,stamp])=>cycle(redirect).join(":")==="B:2" && stamp==="Wax",
  "broken-ranking": ([tie,batch,sign])=>tie==="Reverse arrival" && batch==="Eastern" && sign==="Copper",
  "oracles-number": ([level,policy,hour])=>Number(level)===[13,14,15].find(n=>n>=14) && policy==="Ignore 12" && hour==="06",
  "isolated-village": ([road,credential])=>!walk("E","A",road) && walk("F","D",road) && !walk("F","A",road) && credential==="Night",
};
for (const puzzle of bank.filter(p=>p.mechanic==="detective")) test(puzzle.id+": unique conclusion and required evidence",()=>{
  const suspects=puzzle.data.suspects.filter(s=>logic[puzzle.id](s.values)).map(s=>s.id);
  assert.deepEqual(suspects,[puzzle.solution.suspect]);
  assert.deepEqual(detectiveCandidates(puzzle.data),suspects);
  assert.equal(validate(puzzle,puzzle.solution),"correct");
  assert.notEqual(validate(puzzle,{...puzzle.solution,suspect:puzzle.data.suspects.find(s=>s.id!==suspects[0]).id}),"correct");
  assert.equal(validate(puzzle,{...puzzle.solution,evidence:puzzle.solution.evidence.slice(1)}),"incomplete");
});

for (const puzzle of bank.filter(p=>p.mechanic==="arrangement")) test(puzzle.id+": legal witness and independent optimum over all subsets",()=>{
  const { data, solution } = puzzle;
  let optimum=-1;
  for (let mask=0;mask<2**data.items.length;mask++) {
    const selected=data.items.filter((item,i)=>mask&(1<<i));
    const ids=new Set(selected.map(i=>i.id));
    if(data.items.some(i=>i.mandatory&&!ids.has(i.id)) ||
      selected.some(i=>i.requires.some(id=>!ids.has(id))) ||
      selected.reduce((sum,i)=>sum+i.cost,0)>data.energy) continue;
    optimum=Math.max(optimum,selected.reduce((sum,i)=>sum+i.value,0));
  }
  assert.equal(optimum,solution.value);
  const steps=solution.witness.map(([id,turn])=>({id,turn}));
  assert.equal(validate(puzzle,{steps}),"correct");
  assert.equal(validate(puzzle,{steps:steps.toReversed()}),"invalid");
  assert.equal(validate(puzzle,{steps:steps.map((step,i)=>i===0?{...step,turn:90}:step)}),"invalid");
});

const transmissions={
  "messenger-relay":"DOCKTHREE","undo-spell":"RESTORETHEKEY","roots-message":"ROOTISDER",
  "archivists-cipher":"BRINGTHEMAP","scrambled-scroll":"THEVAULTOPEN",
};
for (const puzzle of bank.filter(p=>p.mechanic==="cipher")) test(puzzle.id+": calibrated key and independent transposition",()=>{
  const { data }=puzzle;
  const wheel=data.ring.indexOf(data.calibration.glyph);
  const map=Object.fromEntries(data.symbols.map(g=>[g,data.alphabet[(data.ring.indexOf(g)-wheel+data.ring.length)%data.ring.length]]));
  const decoded=data.groups.map(group=>group.map(g=>map[g]));
  const indexes=decoded.flatMap((row,r)=>row.map((_,c)=>[r,c]));
  const score=([r,c])=>({
    reverse:(decoded.length-1-r)*100+c,
    alternating:r*100+(r%2 ? decoded[r].length-1-c : c),
    columns:c*100+r,rail:c*100+r,
    rotate:((r-wheel+decoded.length*10)%decoded.length)*100+c,
  })[data.mode];
  const message=indexes.sort((a,b)=>score(a)-score(b)).map(([r,c])=>decoded[r][c]).join("");
  assert.equal(message,transmissions[puzzle.id]);
  assert.equal(message,puzzle.solution.answer);
  const draft={wheel,mapping:map,message};
  assert.equal(validate(puzzle,checkedDraft(puzzle,draft)),"correct");
  assert.equal(validate(puzzle,{...draft,wheel:(wheel+1)%data.ring.length}),"incorrect");
});

function energyLayers(data) {
  const start=data.grid.join("").indexOf("S"), width=data.grid[0].length;
  const layers=Array.from({length:data.budget+1},()=>new Set());
  layers[0].add(start+":0");
  for (let energy=0;energy<layers.length;energy++) for (const state of layers[energy]) {
    const [position,flags]=state.split(":").map(Number);
    const r=Math.floor(position/width), c=position%width, tile=data.grid[r][c], bit=data.switches[tile];
    if(tile==="X"&&(flags&data.required)===data.required) return energy;
    if(bit&&!(flags&bit)) layers[energy+1]?.add(position+":"+(flags|bit));
    for(let a=-1;a<=1;a++) for(let b=-1;b<=1;b++) {
      if(Math.abs(a)+Math.abs(b)!==1) continue;
      const target=data.grid[r+a]?.[c+b];
      if(!target||target==="#"||data.gates[target]&&!(flags&data.gates[target])) continue;
      layers[energy+(data.weights[target]||1)]?.add(((r+a)*width+c+b)+":"+(flags|(data.checkpoints[target]||0)));
    }
  }
}
for (const puzzle of bank.filter(p=>p.mechanic==="maze")) test(puzzle.id+": independent cost layers confirm optimal route",()=>{
  const {data,solution}=puzzle;
  const optimal=shortestRoute(data);
  assert.equal(energyLayers(data),solution.cost);
  assert.equal(optimal.cost,solution.cost);
  assert.equal(validate(puzzle,{moves:optimal.moves}),"correct");
  assert.equal(validate(puzzle,{moves:optimal.moves.slice(0,-1)}),"incomplete");
  assert.equal(validate(puzzle,{moves:["N"]}),"invalid");
  const first=optimal.moves[0];
  assert.notEqual(validate(puzzle,{moves:[first,{N:"S",S:"N",E:"W",W:"E"}[first],...optimal.moves]}),"correct");
});

for (const puzzle of bank.filter(p=>p.mechanic==="workshop")) test(puzzle.id+": valid trace and no shorter operation sequence",()=>{
  const {data,solution}=puzzle;
  assert.equal(validate(puzzle,{operations:solution.witness}),"correct");
  assert.notEqual(validate(puzzle,{operations:solution.witness.slice(1)}),"correct");
  const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
  const wanted={cells:data.target,observations:data.observations};
  let frontier=[{cells:data.initial,observations:[]}];
  for(let steps=0;steps<solution.witness.length;steps++){
    assert.ok(!frontier.some(state=>equal(state,wanted)));
    frontier=frontier.flatMap(state=>data.ops.map(op=>workshopStep(data.type,state,op)).filter(Boolean));
  }
  assert.ok(frontier.some(state=>equal(state,wanted)));
});

function traceMerge() {
  const left=[[2,"A"],[5,"B"]],right=[[2,"C"],[3,"D"]],out=[];
  let comparisons=0;
  while(left.length&&right.length){out.push((left[0][0]<=right[0][0]?left:right).shift()); comparisons++;}
  return [[...out,...left,...right].map(([,tag])=>tag).join(""),String(comparisons)];
}
function traceWrap(n) {
  let max=0;
  const wrap=(left,depth)=>{max=Math.max(max,depth);return left ? "("+wrap(left-1,depth+1)+")" : "x";};
  return [wrap(n,1),String(max)];
}
function traceHanoi() {
  const queue=[{pegs:[[3,2,1],[],[]],moves:[]}], seen=new Set();
  for (const {pegs,moves} of queue) {
    if(pegs[2].length===3) return [moves.slice(0,3).join(","),moves[3],String(moves.length)];
    const key=JSON.stringify(pegs);
    if(seen.has(key))continue;
    seen.add(key);
    for(let a=0;a<3;a++)for(let b=0;b<3;b++){
      if(a===b||!pegs[a].length||pegs[a].at(-1)>(pegs[b].at(-1)??Infinity))continue;
      const next=pegs.map(peg=>[...peg]);
      next[b].push(next[a].pop());
      queue.push({pegs:next,moves:[...moves,"ABC"[a]+"ABC"[b]]});
    }
  }
}
function traceTotals() {
  const order=[];
  const total=node=>Array.isArray(node)?(order.push(node.map(total).reduce((a,b)=>a+b,0)),order.at(-1)):node;
  const result=total([[2,5],[3,[1,4]]]);
  return [order.join(","),String(result)];
}
function tracePalindrome() {
  const pairs=str=>Array.from({length:Math.floor(str.length/2)},(_,i)=>str[i]+str.at(-1-i));
  return [pairs("LEVEL").join(","),String(pairs("ABCA").every(pair=>pair[0]===pair[1])),pairs("ABBA").join(",")];
}
const traces={"sandstorm-sort":traceMerge,"recursion-mirror":()=>traceWrap(3),"tower-of-echoes":traceHanoi,
  "unwinding-spell":traceTotals,"palindrome-gate":tracePalindrome};
for (const puzzle of bank.filter(p=>p.mechanic==="code")) test(puzzle.id+": independently simulated execution and wrong repair",()=>{
  const trace=traces[puzzle.id]();
  assert.deepEqual(trace,puzzle.solution.trace);
  assert.equal(validate(puzzle,{...puzzle.solution,trace}),"correct");
  assert.equal(validate(puzzle,{...puzzle.solution,fragments:puzzle.solution.fragments.toReversed(),trace}),"incorrect");
  assert.equal(validate(puzzle,{...puzzle.solution,trace:trace.slice(0,-1)}),"incomplete");
});
