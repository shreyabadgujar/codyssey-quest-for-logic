const { test } = require("node:test");
const assert = require("node:assert/strict");
const { bank, byId, playable } = require("../data/puzzles");
const expansion = require("../data/puzzles/expansion");
const arrayExpansion = require("../data/puzzles/arrayArchipelago");
const { WEIGHTS, selectPuzzle, assignments, milestoneReached } = require("../services/puzzleSelectionService");
const { validate, shortestRoute, workshopStep, detectiveCandidates } = require("../services/puzzleValidationService");
const { checkedDraft } = require("../services/puzzleService");

test("60 complete records include six puzzles per island and never serialize solution data", () => {
  assert.equal(bank.length, 60);
  assert.equal(byId.size, 60);
  assert.equal(expansion.length, 27);
  assert.equal(arrayExpansion.length, 3);
  const count = key => bank.reduce((m,p)=>m.set(p[key],(m.get(p[key])||0)+1),new Map());
  const islands = count("island");
  assert.equal(islands.size, 10);
  for (const [island, total] of islands) {
    assert.equal(total, 6);
    assert.deepEqual([...expansion, ...arrayExpansion].filter(p => p.island === island).map(p => p.difficulty).sort(), ["Expert", "Hard", "Medium"]);
  }
  assert.equal(count("mechanic").size, 6);
  assert.equal(new Set(bank.filter(p => p.island === "array-archipelago").map(p => p.mechanic)).size, 6);
  assert.equal(new Set(bank.map(p => p.title)).size, 60);
  assert.ok([...expansion, ...arrayExpansion].every(p => p.tags.length >= 2 && new Set(p.tags).size === p.tags.length));
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
  const rows=assignments("a",120,[],()=>0.52);
  assert.equal(rows.length,60);
  assert.deepEqual(new Set(rows.map(row=>row.puzzleId)),new Set(byId.keys()));
  for (const [i,row] of rows.entries()) {
    assert.equal(row.milestone,(i+1)*2);
    if (!i) continue;
    const previous=byId.get(rows[i-1].puzzleId).mechanic;
    if (previous===byId.get(row.puzzleId).mechanic) {
      assert.ok(rows.slice(i).every(other=>byId.get(other.puzzleId).mechanic===previous));
    }
  }
  assert.deepEqual(assignments("a",122,rows),[]);
  assert.equal(assignments("a",87,[],()=>0.52).length,43);
  assert.equal(milestoneReached(62),true);
  assert.equal(milestoneReached(86),true);
  assert.equal(milestoneReached(87),false);
  assert.equal(milestoneReached(120),true);
  assert.equal(milestoneReached(122),false);
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
  "vanishing-link": ([writes, seal]) => {
    const next = { A:"B", B:"C", C:"D", D:"E", E:null };
    for (const write of writes.split("; ")) {
      const [from, to] = write.split("→");
      next[from] = to;
    }
    const route = [];
    for (let node = "A"; node && !route.includes(node); node = next[node]) route.push(node);
    return route[1] === "C" && route.length === 5 && next[route.at(-1)] === null && seal === "Copper";
  },
  "stable-sand-seal": ([roll, seal]) => {
    const stable = [["I",2],["J",1],["K",2],["L",1]].sort((a,b) => a[1]-b[1]).map(row=>row[0]).join(" ");
    return roll === stable && seal === "Green";
  },
  "false-summit-ledger": ([bounds, index, probes]) => {
    const a = [2,4,4,4,7,9,9,11,13];
    const seen = [];
    let lo = 0, hi = a.length;
    while (lo < hi) {
      const mid = Math.floor((lo+hi)/2);
      if (a[mid] < 9) lo = mid+1;
      else hi = mid;
      seen.push("["+lo+", "+hi+")");
    }
    return bounds === seen[0] && Number(index) === a.findIndex(x=>x>=9) && Number(probes) === seen.length;
  },
  "ancestors-alibi": ([interval, ancestor, index]) => {
    const tree = { A:["B","C"], B:["D","E"], C:["F"], D:[], E:[], F:[] };
    const visit = node => [node,...tree[node].flatMap(visit)];
    const order = visit("A"), subtree = visit("B");
    const deepest = order.filter(node=>["D","E"].every(child=>visit(node).includes(child))).at(-1);
    return interval === order.indexOf("B")+"–"+order.indexOf(subtree.at(-1)) && ancestor === deepest && Number(index) === order.indexOf("F");
  },
  "sealed-circuit": ([removed, shift]) => {
    const edges = ["A→B","B→A","B→C","C→D","D→C","D→E"].filter(edge=>!removed.split(" and ").includes(edge));
    const reach = (source,target) => {
      const seen = new Set([source]);
      for (const node of seen) for (const [from,to] of edges.map(edge=>edge.split("→"))) {
        if (node === from) seen.add(to);
      }
      return seen.has(target);
    };
    return reach("A","E") && reach("C","D") && !reach("D","C") && shift === "Night";
  },
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
  "bisection-strip":"BOUNDATNINTH","mirror-dispatch":"RETURNATROOT","diagonal-vines":"PREFIXEND",
  "castaway-spindle":"HIDETHECHART",
};
for (const puzzle of bank.filter(p=>p.mechanic==="cipher")) test(puzzle.id+": calibrated key and independent transposition",()=>{
  const { data }=puzzle;
  const wheel=data.ring.indexOf(data.calibration.glyph);
  const map=Object.fromEntries(data.symbols.map(g=>[g,data.alphabet[(data.ring.indexOf(g)-wheel+data.ring.length)%data.ring.length]]));
  const decoded=data.groups.map(group=>group.map(g=>map[g]));
  const width=decoded[0].length;
  const indexes=decoded.flatMap((row,r)=>row.map((_,c)=>[r,c]));
  // In the 12-slot spindle the four residue classes each visit rows 0, 2, 1.
  const score=([r,c])=>({
    reverse:(decoded.length-1-r)*100+c,
    alternating:r*100+(r%2 ? decoded[r].length-1-c : c),
    columns:c*100+r,rail:c*100+r,
    rotate:((r-wheel+decoded.length*10)%decoded.length)*100+c,
    diagonal:(r+c)*100+r,
    "outside-in":(c<Math.ceil(width/2)?2*c:2*(width-1-c)+1)*100+r,
    "mirror-columns":(width-1-c)*100+((width-1-c)%2===0?decoded.length-1-r:r),
    "stride-cycles":c*3+[0,2,1][r],
  })[data.mode];
  const message=indexes.sort((a,b)=>score(a)-score(b)).map(([r,c])=>decoded[r][c]).join("");
  assert.equal(message,transmissions[puzzle.id]);
  assert.equal(message,puzzle.solution.answer);
  const draft={wheel,mapping:map,message};
  assert.equal(validate(puzzle,checkedDraft(puzzle,draft)),"correct");
  assert.equal(validate(puzzle,{...draft,wheel:(wheel+1)%data.ring.length}),"incorrect");
  if (data.mode === "stride-cycles") {
    assert.equal(validate(puzzle,{...draft,message:decoded.flat().join("")}),"incorrect");
    assert.equal(validate(puzzle,{...draft,message:message.slice(0,3)}),"incorrect");
  }
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
    const unique = new Map();
    for (const state of frontier) for (const op of data.ops) {
      const next = workshopStep(data.type, state, op);
      if (next?.observations.every((value, i) => value === data.observations[i])) unique.set(JSON.stringify(next), next);
    }
    frontier = [...unique.values()];
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
function traceFerryman() {
  const left = "ABJK", right = "CDEJK";
  const a = [...left,null,...right], b = [...right,null,...left];
  const meeting = a.findIndex((node,i) => node === b[i]);
  return [a[meeting], String(meeting), a[6]+b[6]];
}
function traceBells() {
  const a = [5,5,2,6,3,6];
  const answers = a.map((height,i)=>a.findIndex((next,j)=>j>i&&next>height));
  const candidates = a.slice(4).map((height,i)=>({height,index:i+4}));
  return [answers.join(","), candidates.filter(item=>item.height<=a[3]).map(item=>item.index).join(",")];
}
function traceTribunal() {
  const records = [["A",2],["B",1],["C",2],["D",1],["E",3]];
  const sorted = [...records].sort((a,b)=>a[1]-b[1]);
  return [[1,2,3].map(key=>records.filter(row=>row[1]<=key).length).join(","),
    [...records].reverse().map(row=>sorted.indexOf(row)+1).join(","), sorted.map(row=>row[0]).join("")];
}
function traceLanterns() {
  const edges = [["A","B",2],["B","C",1],["B","D",3],["D","E",2]];
  function walk(node, parent, distance = 0) {
    return [distance,...edges.flatMap(([a,b,w]) => {
      const next = a===node ? b : b===node ? a : null;
      return next && next!==parent ? walk(next,node,distance+w) : [];
    })];
  }
  const cost = node => walk(node,null).reduce((a,b)=>a+b,0);
  return [[walk("B","A").length,walk("D","B").length].join(","),
    ["A","B","D","E"].map(cost).join(","), [..."ABCDE"].sort((a,b)=>cost(a)-cost(b))[0]];
}
function traceFork() {
  const leaves = [];
  const visit = n => {
    if (n < 2) { leaves.push(n); return [n]; }
    return [n,...visit(n-1),...visit(n-2)];
  };
  return [visit(3).join(","),String(leaves.length)];
}
function traceBrokenLedger() {
  const readings = [-4,3,-6,5,-2,4,-8,6,2,-1];
  const keep = [], drop = [];
  for (let end = 0; end < readings.length; end++) {
    const intact = [], bypassed = [];
    for (let start = 0; start <= end; start++) {
      const total = readings.slice(start, end+1).reduce((sum, reading) => sum+reading, 0);
      intact.push(total);
      for (let skip = start+1; skip <= end; skip++) bypassed.push(total-readings[skip]);
    }
    keep.push(Math.max(...intact));
    if (end) drop.push(Math.max(...bypassed));
  }
  return [keep.join(","), drop.join(","), String(Math.max(...keep,...drop))];
}
const traces={"sandstorm-sort":traceMerge,"recursion-mirror":()=>traceWrap(3),"tower-of-echoes":traceHanoi,
  "unwinding-spell":traceTotals,"palindrome-gate":tracePalindrome,"two-handed-ferryman":traceFerryman,
  "bell-between-towers":traceBells,"equal-key-tribunal":traceTribunal,"rerooted-lanterns":traceLanterns,"forked-echo":traceFork,
  "broken-tide-ledger":traceBrokenLedger};
for (const puzzle of bank.filter(p=>p.mechanic==="code")) test(puzzle.id+": independently simulated execution and wrong repair",()=>{
  const trace=traces[puzzle.id]();
  assert.deepEqual(trace,puzzle.solution.trace);
  assert.equal(validate(puzzle,{...puzzle.solution,trace}),"correct");
  assert.equal(validate(puzzle,{...puzzle.solution,fragments:puzzle.solution.fragments.toReversed(),trace}),"incorrect");
  assert.equal(validate(puzzle,{...puzzle.solution,trace:trace.slice(0,-1)}),"incomplete");
});
