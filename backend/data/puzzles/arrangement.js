const { entry } = require("./entry");
function table(i, id, title, tier, story, goal, energy, rows, witness, value, hints, explanation) {
  return entry(i,id,title,tier,"arrangement",story,goal,
    "Add pieces from the manifest, set their compass orientations, and order the activation sequence. Every listed prerequisite must already be installed; starred pieces are mandatory. Total energy may not exceed the budget.",
    { energy, items: rows.map(([id,name,cost,requires,rotation,mandatory,value=0]) => ({id,name,cost,requires,rotation,mandatory,value})) },
    { value, witness },hints,explanation);
}
module.exports = [
  table(0,"merchants-inventory","The Merchant's Inventory","Medium",
    "A merchant's cargo carousel refuses to weigh sealed crates. Only the old manifest describes what must be powered before the seal can close.",
    "Calibrate and seal the manifest within 8 energy.",8,[
      ["seal","Harbor seal",2,["ledger","scale"],180,true],["scale","Balance tray",2,["base"],90,true],
      ["lamp","Decorative lantern",2,["base"],null,false],["ledger","Ledger reader",2,["base"],0,true],
      ["base","Counterweight base",2,[],0,true],
    ],[["base",0],["ledger",0],["scale",90],["seal",180]],0,
    ["The base has no prerequisite.","Ledger and scale can run in either order.","The mandatory four pieces use all 8 energy."],
    "The base powers both reader and tray, which are independent. The seal depends on both and faces south. Either reader/tray order is legal; adding the lantern overspends the budget."),
  table(1,"broken-chain","Reconnect the Broken Chain","Hard",
    "A storm tore the tidal chain from its anchor. Each link can be sealed only after the connections it protects have been welded.",
    "Close the chain and balance the tide lock with 11 energy.",11,[
      ["lock","Tide lock",2,["fork","return"],270,true],["fork","Fork link",2,["anchor"],90,true],
      ["buffer","Spare shunt",2,["fork"],0,false],["return","Return link",3,["fork","brace"],180,true],
      ["brace","Side brace",2,["anchor"],270,true],["anchor","Keel anchor",2,[],0,true],
    ],[["anchor",0],["fork",90],["brace",270],["return",180],["lock",270]],0,
    ["Start at the only unsupported link.","The return needs both branches before it can be welded.","The spare shunt cannot fit the energy budget."],
    "Anchor first; fork and brace can follow in either order. Return joins the two branches before the tide lock seals them. This is a topological order of the dependency graph."),
  table(3,"merchants-bargain","The Merchant's Bargain","Expert",
    "The sand market offers competing trade modules for one dry-dock rig. Dealers quote individual yields, but several bids share tooling.",
    "Install the broker core and obtain the maximum total trade yield with 10 energy.",10,[
      ["broker","Broker core",2,[],0,true],["silk","Silk lot",5,["broker"],90,false,10],
      ["tool","Stamping tool",2,["broker"],180,false,0],["spice","Spice lot",3,["tool"],270,false,7],
      ["ink","Ink lot",3,["tool"],90,false,7],["salt","Salt lot",3,["broker"],0,false,3],
    ],[["broker",0],["tool",180],["spice",270],["ink",90]],14,
    ["Reserve 2 energy for the broker.","Evaluate the tool as a shared cost for both lots.","Compare silk plus salt with the two tool-dependent lots."],
    "Silk plus salt yields 13. The tool, spice and ink cost 8 together and yield 14. Any tool bundle with silk cannot add a tool-dependent lot within the budget."),
  table(5,"missing-branch","The Missing Branch","Hard",
    "A fractured family archive has two sides. Reattaching a leaf before its parent would overwrite its lineage.",
    "Reconnect every ancestral joint and finish with the family seal.",13,[
      ["seal","Family seal",2,["fern","ivy","oak"],0,true],["oak","Oak leaf",2,["east"],90,true],
      ["fern","Fern leaf",1,["west"],180,true],["ivy","Ivy leaf",1,["west"],270,true],
      ["west","Western branch",2,["root"],270,true],["east","Eastern branch",2,["root"],90,true],
      ["root","Root stone",3,[],0,true],
    ],[["root",0],["west",270],["fern",180],["east",90],["oak",90],["ivy",270],["seal",0]],0,
    ["A node can be installed as soon as its parent exists.","The two branches may be interleaved.","The seal is the only piece that waits for leaves from both sides."],
    "Every legal repair respects parent-before-child order and closes with the seal. The branch orders can interleave; following a single prescribed traversal is unnecessary."),
  table(9,"treasure-budget","The Treasure Budget","Expert",
    "The holds will flood in thirteen power cycles. A heavy idol looks tempting, but lighter relics share the same pressure rig.",
    "Keep the life pump installed and recover the maximum salvage value with 13 energy.",13,[
      ["pump","Life pump",2,[],0,true],["idol","Basalt idol",8,["pump"],180,false,18],
      ["rig","Pressure rig",3,["pump"],270,false],["lens","Pearl lens",4,["rig"],90,false,11],
      ["core","Signal core",4,["rig"],180,false,12],["coin","Coin chest",3,["pump"],90,false,4],
      ["chart","Tidal chart",2,["pump"],0,false,3],
    ],[["pump",0],["rig",270],["lens",90],["core",180]],23,
    ["The pump is a fixed cost.","Price the rig only once when taking both relics.","Compare the idol with its best affordable add-on."],
    "The idol and coin chest yield 22. Rig, lens and core use all 11 optional energy and yield 23; any bundle with only one pressure relic is worth less."),
];
