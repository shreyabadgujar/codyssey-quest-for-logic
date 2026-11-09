const { entry } = require("./entry");
const op = (id, label, action, value, index) => ({id,label,action,value,index});
function workshop(i,id,title,tier,story,type,initial,target,observations,limit,ops,witness,hints,explanation,instructions="") {
  return entry(i,id,title,tier,"workshop",story,"Rebuild the target memory and reproduce the exact sensor readings.",
    "Run operations and inspect the memory after each step. Reads and removals append a sensor reading; insertions do not. Use zero-based indices and no more than " + limit + " operations. " + instructions,
    { type,initial,target,observations,limit,ops }, { witness },hints,explanation);
}
module.exports = [
  workshop(0,"duplicate-trail","The Duplicate Trail","Hard",
    "An array recorder has an echo. The second copy arrived before the real item, and the audit trail must prove which element was removed.",
    "array",[4,7,4,9],[7,8,4,9],[4,2],3,[
      op("d0","Delete index 0","delete",null,0),op("d2","Delete index 2","delete",null,2),
      op("s4","Search for 4","search",4),op("i1","Insert 8 at index 1","insert",8,1),op("i2","Insert 8 at index 2","insert",8,2),
    ],["d0","i1","s4"],["Search returns the first matching index.","Deleting the later copy would leave 4 at the beginning.","Insert the replacement before producing the search reading."],
    "Delete index 0 to log 4. Inserting 8 at index 1 shifts the remaining 4 to index 2. Searching only after the insertion produces the required second reading."),
  workshop(2,"forgotten-stack","The Forgotten Stack","Medium",
    "An emergency release tried to pop before the protective plate was installed. Restore a short stack program from its remaining instructions.",
    "stack",[],[5],[8,2],5,[
      op("p2","Push 2","push",2),op("p5","Push 5","push",5),op("p8","Push 8","push",8),op("pop","Pop top","pop"),
    ],["p5","p2","p8","pop","pop"],["A pop cannot start from empty.","The final 5 must never be popped.","Remember that the last item pushed is the first removed."],
    "One valid repair pushes 5, 2, 8 and then pops twice. This emits 8 then 2 and preserves the base plate. With two pops and one item left, at least three pushes are necessary."),
  workshop(2,"royal-waiting-line","The Royal Waiting Line","Easy",
    "Two audience tickets were scanned, but the royal clerk lost the replacement ticket. Reconstruct the queue while preserving arrival order.",
    "queue",[6,3],[9],[6,3],3,[
      op("serve","Dequeue front","dequeue"),op("q9","Enqueue 9","enqueue",9),op("q3","Enqueue 3","enqueue",3),
    ],["q9","serve","serve"],["A new ticket joins the rear.","The ticket at the front is always served first.","Serve both original tickets and leave 9 waiting."],
    "Serving twice produces 6 then 3. Ticket 9 can enter before, between, or after the two serves, because it joins at the rear."),
  workshop(4,"lost-map-index","The Lost Map Index","Hard",
    "A map index is stored as a chain of links. The repair log must locate the existing marker before another index shift makes the audit useless.",
    "list",[11,15,21,30],[11,13,21,31,30],[2,15],4,[
      op("head","Insert 13 at link 1","insert",13,1),op("end","Insert 31 at link 3","insert",31,3),
      op("del1","Delete link 1","delete",null,1),op("del2","Delete link 2","delete",null,2),
      op("find","Find first 21","search",21),
    ],["find","head","del2","end"],["The first reading is an index, not a node value.","Searching the original chain finds 21 at link 2.","If you insert 13 first, the old 15 is now at link 2."],
    "Search first for index 2. Insert 13 at index 1, remove the shifted 15 at index 2, then insert 31 immediately before 30. The target adds two nodes and removes one, leaving only one operation for search."),
  workshop(5,"family-portrait","The Family Portrait","Expert",
    "The lineage instrument expects a binary search tree, not a sorted list. A misplaced ancestor changes every search beneath it.",
    "tree",[8,4,12],[8,4,12,null,6,10,null,null,null,5],["8→4→6→5","4→5→6→8→10→12"],5,[
      op("i6","Insert 6","insert",6),op("i5","Insert 5","insert",5),op("i10","Insert 10","insert",10),
      op("s5","Search for 5","search",5),op("walk","Traverse in order","traverse"),op("i3","Insert 3","insert",3),
    ],["i6","i5","s5","i10","walk"],["Smaller values go left, larger values go right.","5 must appear beneath 6; inserting 5 first changes the tree shape.","The final traversal must include 10, but the search path need not."],
    "6 is the right child of 4 and 5 is the left child of 6. Independently, 10 is the left child of 12. The search follows 8, 4, 6, 5; in-order traversal then emits the sorted keys.",
    "Tree memory is shown in level order; dashes denote empty child positions. Search reports visited keys. Traversal is left–root–right."),
];
