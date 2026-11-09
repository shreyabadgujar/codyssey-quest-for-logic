const { detective } = require("./build");

module.exports = [
  detective({
    island:1, id:"vanishing-link", title:"The Vanishing Link", tier:"Hard", tags:["Linked lists","Pointer rewiring","Reachability"],
    story:"The ferry route once ran A→B→C→D→E→end. Four dockhands wrote repair notes, but only one note reproduces the surviving links and bears the harbour stamp.",
    objective:"Identify the repair author by applying each profile’s pointer writes to the original route. A write changes only the named node’s successor.",
    columns:["Pointer writes","Stamp"], suspect:"ione",
    suspects:[
      ["ione","Ione","A→C; B→D; C→B","Copper"], ["fen","Fen","A→C; B→E; C→B","Copper"],
      ["nell","Nell","A→B; B→D; D→C; C→E","Copper"], ["vale","Vale","A→C; B→D; C→B","Lead"],
    ],
    evidence:[
      ["visit","Harbour departure","The first plank reached after A was C.",["ione","fen","vale"]],
      ["full","Keeper’s count","Starting from A, the route visited all five planks exactly once, then ended.",["ione","nell","vale"]],
      ["stamp","Harbour stamp","The signed repair used copper.",["ione","fen","nell"]],
      ["wind","Wind register","The weather vane was replaced last winter."],
    ],
    hints:["Apply writes to the named successor fields, keeping D→E unchanged.","Trace from A all the way to the terminator. A correct first hop can still leave a plank unreachable.","Two dossiers have the full route. The stamp distinguishes them."],
    explanation:"Ione and Vale produce A→C→B→D→E. Fen sends B directly to E and loses D. Nell keeps a full chain but its first hop is B. The copper stamp selects Ione. Following links from the head is a better integrity check than confirming that every node still has a successor field.",
  }),
  detective({
    island:3, id:"stable-sand-seal", title:"The Stable Sand Seal", tier:"Medium", tags:["Stable sorting","Tie handling"],
    story:"Four wagons arrived in order I, J, K, L. Their priority numbers were 2, 1, 2, 1. A legitimate roll sorts by ascending priority and keeps arrival order within each tie.",
    objective:"Select the clerk whose roll matches both witnessed tie groups and the wax seal.",
    columns:["Filed roll","Wax"], suspect:"rill",
    suspects:[
      ["rill","Rill","J L I K","Green"], ["sava","Sava","L J I K","Green"],
      ["tenn","Tenn","J L K I","Green"], ["wren","Wren","J L I K","Red"],
    ],
    evidence:[
      ["first","First pair","The priority-1 wagons appeared in arrival order before the others.",["rill","tenn","wren"]],
      ["second","Second pair","Among the priority-2 wagons, the earlier arrival still came first.",["rill","sava","wren"]],
      ["wax","Cracked seal","The wax was green.",["rill","sava","tenn"]],
      ["sand","Sand report","All wagons carried the same sand."],
    ],
    hints:["Group by number before comparing the wagon IDs.","For priority 1, compare J and L. For priority 2, compare I and K.","Once the stable roll is known, compare the two matching seals."],
    explanation:"Priority 1 puts J and L before the other group. J came before L and I came before K, so the stable roll is J L I K. The green seal selects Rill. Stable sorting preserves the original relative order only within equal-key groups.",
  }),
  detective({
    island:4, id:"false-summit-ledger", title:"The False Summit Ledger", tier:"Expert", tags:["Binary search","Lower bound","Loop invariants"],
    story:"A summit ledger has sorted readings [2,4,4,4,7,9,9,11,13]. Find the first index whose reading is at least 9. The instrument uses zero-based half-open bounds [lo, hi), starts at [0, 9), and probes floor((lo+hi)/2). A reading below 9 sets lo to mid+1. Otherwise set hi to mid. Stop when lo equals hi.",
    objective:"Find the signed log whose first update, returned index, and complete probe count agree with the instrument.",
    columns:["Bounds after first probe","Return index","Total probes"], suspect:"nera",
    suspects:[
      ["nera","Nera","[5, 9)","5","4"], ["orin","Orin","[4, 9)","5","4"],
      ["rhea","Rhea","[5, 9)","6","4"], ["tavi","Tavi","[5, 9)","5","3"],
    ],
    evidence:[
      ["opening","Opening cylinder","Recompute the interval after the first probe at index 4.",["nera","rhea","tavi"]],
      ["boundary","Boundary requirement","The return must be the first acceptable index, even when equal readings repeat.",["nera","orin","tavi"]],
      ["ticks","Counter requirement","The total must include every probe through the final update that makes the bounds equal.",["nera","orin","rhea"]],
      ["snow","Snow report","The readings were taken before noon."],
    ],
    hints:["The first probe reads 7, so index 4 can be excluded.","The next probes are to the left of the upper bound, even after finding a 9.","Write down the probed indices 4, 7, 6, and 5. The final equality is not itself a fifth probe."],
    explanation:"Probe 4 reads 7, leaving [5,9). Probe 7 reads 11, leaving [5,7). Probe 6 reads 9, leaving [5,6). Probe 5 reads 9, leaving [5,5). Four probes return index 5. Nera’s log matches all three records. For a lower bound, equality narrows the upper bound so earlier duplicates remain candidates.",
  }),
  detective({
    island:5, id:"ancestors-alibi", title:"The Ancestor’s Alibi", tier:"Hard", tags:["Trees","Preorder traversal","Lowest common ancestor"],
    story:"A family tree has root A. A’s children are B then C. B’s children are D then E. C’s only child is F. The archive numbers nodes in zero-based preorder, visiting children left to right.",
    objective:"Find the keeper whose record correctly describes B’s subtree, the nearest shared ancestor of D and E, and F’s visit index.",
    columns:["Inclusive interval of B","D/E shared ancestor","Index of F"], suspect:"alva",
    suspects:[
      ["alva","Alva","1–3","B","5"], ["bryn","Bryn","1–2","B","5"],
      ["cael","Cael","1–3","A","5"], ["dara","Dara","1–3","B","4"],
    ],
    evidence:[
      ["subtree","Subtree stamp","B’s interval includes B and every descendant, but no node from C’s branch.",["alva","cael","dara"]],
      ["ancestor","Shared keeper","The shared ancestor is the deepest node that lies above both D and E.",["alva","bryn","dara"]],
      ["visit","Preorder stamp","F’s index counts every node visited before it, including its parent.",["alva","bryn","cael"]],
      ["ink","Ink order","The archive purchased one bottle of ink."],
    ],
    hints:["Write preorder by completing B’s branch before C’s.","The deepest common ancestor of siblings is their parent.","F follows C and sits at the very end of this preorder."],
    explanation:"Preorder is A,B,D,E,C,F. B’s subtree occupies indices 1 through 3 inclusive, the deepest common ancestor of D and E is B, and F is at index 5. Only Alva matches. Preorder makes an entire subtree contiguous, which is useful for subtree range queries.",
  }),
  detective({
    island:6, id:"sealed-circuit", title:"The Sealed Circuit", tier:"Expert", tags:["Directed reachability","Strong connectivity","Edge deletion"],
    story:"The old canal chart lists A→B, B→A, B→C, C→D, D→C, and D→E. Four pilots logged closures at the night shift. The investigators need the pilot whose edits explain both the surviving delivery and the broken return circuit.",
    objective:"Remove each profile’s listed directed edges, then identify the edit that matches the two reachability tests and shift.",
    columns:["Removed edges","Shift"], suspect:"ida",
    suspects:[
      ["ida","Ida","D→C","Night"], ["jor","Jor","D→C and D→E","Night"],
      ["kitt","Kitt","B→A","Night"], ["luz","Luz","D→C","Day"],
    ],
    evidence:[
      ["delivery","Delivery receipt","A can still reach E.",["ida","kitt","luz"]],
      ["circuit","Broken circuit","C can still reach D, but D cannot reach C.",["ida","jor","luz"]],
      ["shift","Tide clock","Only the night shift had access.",["ida","jor","kitt"]],
      ["cargo","Cargo docket","The delivery held grain."],
    ],
    hints:["Arrows are one-way. Check A→B→C→D→E after each edit.","Break the return from D without cutting the forward C→D edge.","The two pilots with the same edit have different shifts."],
    explanation:"Removing D→C preserves A→B→C→D→E while splitting the C/D strongly connected component. Jor also deletes the only edge to E. Kitt leaves the C/D return intact. Ida and Luz have the correct edit, but Ida worked at night. Strong connectivity requires a route in both directions.",
  }),
];

