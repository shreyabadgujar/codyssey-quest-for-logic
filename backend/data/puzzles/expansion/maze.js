const { maze } = require("./build");

module.exports = [
  maze({
    island:4, id:"surveyors-switchback", title:"The Surveyor’s Switchback", tier:"Medium", tags:["Grid search","Shortest paths","Gate state"],
    story:"The ridge surveyor dropped a sample at C and locked the lower bridge. The summit keeper wants the sample and proof the switch was activated.",
    objective:"Activate a, collect C, and reach X with minimum energy.",
    grid:["S.~..X",".##.#.","aA.C.."], switches:{a:1}, gates:{A:1}, checkpoints:{C:2}, required:3, weights:{"~":4}, budget:13, cost:10,
    hints:["The two downward steps reach the switch without crossing rough ground.","The switch costs one extra action before the gate opens.","After taking the lower bridge, keep moving toward C and then the summit."],
    explanation:"Go down twice, activate a, and take the lower corridor through C. Reach the summit with five east steps and two north steps. These nine movements and one activation cost ten. The coordinate distances through the switch give a lower bound of nine movements, and this route meets it without rough ground.",
  }),
  maze({
    island:6, id:"tidal-cut", title:"The Tidal Cut", tier:"Hard", tags:["State-expanded graphs","Route planning","Gate dependencies"],
    story:"The bridgekeeper has to certify both sluices and deliver the receipt at C. Opening one gate early may force an extra crossing of the river cut.",
    objective:"Activate a and b, collect C, and reach X with minimum energy.",
    grid:["S..#..X",".#aA#..","..#.#C.","bB....."], switches:{a:1,b:2}, gates:{A:1,B:2}, checkpoints:{C:4}, required:7, weights:{}, budget:24, cost:20,
    hints:["Both switches are compulsory, even if you can bypass a gate.","Compare visiting the bottom-left switch before climbing to a with the reverse order.","After both switches, approach C from the lower corridor and head north toward X."],
    explanation:"The best route visits a from the upper corridor, then returns to the left edge to reach b and traverses the lower corridor toward C. The eighteen moves and two activations cost twenty. A shortest-path state must include both switch flags and the receipt flag because the same tile can have different legal continuations.",
  }),
  maze({
    island:9, id:"two-key-frontier", title:"The Two-Key Frontier", tier:"Expert", tags:["State-space optimization","Bitmask DP","Weighted routing"],
    story:"Two key switches and two survey tokens define the vault’s frontier. The short upper route has costly stone, while a longer approach can reuse an already opened passage.",
    objective:"Activate a and b, collect C and D, and reach X with minimum energy.",
    grid:["S~aA..X",".#.#.#.","bB.C.D.","..#.#.."], switches:{a:1,b:2}, gates:{A:1,B:2}, checkpoints:{C:4,D:8}, required:15, weights:{"~":4}, budget:20, cost:16,
    hints:["A state needs your position and four objective flags.","Try reaching the two switches without entering the expensive upper tile.","After both switches, use the middle corridor to collect both tokens before approaching X."],
    explanation:"Reaching b down the left edge opens B. From the middle lane, reach a by the ordinary tile below it. Return through the middle lane for C and D, then approach X from the right edge. Fourteen moves and two activations cost sixteen. Revisiting the same junction with a different flag set is useful. Searching only by position would incorrectly discard that possibility.",
  }),
];

