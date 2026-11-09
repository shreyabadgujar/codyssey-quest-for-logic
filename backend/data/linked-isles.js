const { makeBank } = require("./missionBank");
const ints = input => input.trim().split(/\s+/).map(Number);
const table = {
  input: "First line: n h. Second line: n integers next[1] through next[n]. The integers are node IDs. ID 0 represents null, and h is the head ID.",
  starter: [
    '    int n, head; cin >> n >> head;\n    vector<int> next(n + 1);\n    for (int i=1; i<=n; ++i) cin >> next[i];\n    // Process the linked chain from head.',
    '        int n=in.nextInt(), head=in.nextInt();\n        int[] next=new int[n+1];\n        for (int i=1; i<=n; i++) next[i]=in.nextInt();\n        // Process the linked chain from head.',
    'tokens=iter(map(int, sys.stdin.buffer.read().split()))\nn, head=next(tokens), next(tokens)\nlinks=[0]+[next(tokens) for _ in range(n)]\n# Process the linked chain from head.',
  ],
};
const tableReference = (cpp, java, python) => [
  table.starter[0].split("    //")[0] + cpp,
  table.starter[1].split("        //")[0] + java,
  table.starter[2].split("# Process")[0] + python,
];
function trail(input) {
  const [n, head, ...values] = ints(input);
  const links = [0, ...values];
  const visited = [];
  const seen = new Map();
  let node = head;
  while (node && !seen.has(node)) {
    seen.set(node, visited.length);
    visited.push(node);
    node = links[node];
  }
  return { visited, entry: node, length: node ? visited.length - seen.get(node) : 0 };
}
const count = 20000;
const longChain = Array.from({ length: count }, (_, i) => i + 1);
const terminating = longChain.slice(1).concat(0).join(" ");
const island = {
  slug: "linked-isles", name: "Linked Isles", topic: "Linked Lists", order: 3,
  description: "Trace the surviving rope bridges and restore the missing convoy links.",
  image: "/assets/islands/linked-isles.webp", mapPosition: { x: 41, y: 50 },
  completionReward: { xp: 500, coins: 250, artifact: "The Silver Link of Continuity" },
};
module.exports = makeBank(island, [
  {
    title: "The Headkeeper's Route", intro: "The harbour registry lists bridge endpoints out of order. The headkeeper's note gives the first post. Follow the actual bridges to recover the itinerary.",
    statement: "Starting at h, follow successor IDs until null. Output the node IDs visited in that order. Some recorded nodes may be unreachable. The chain reachable from h is guaranteed acyclic.",
    input: table.input, output: "The reachable IDs separated by spaces, or -1 for an empty chain.",
    constraints: "1 ≤ n ≤ 20000. 0 ≤ h, next[i] ≤ n. Only the chain reachable from h is guaranteed acyclic.",
    samples: [["5 3\n0 5 2 4 1\n","3 2 5 1","Starting at 3 leads to 2, then 5, then 1 and null. Post 4 is unreachable."],["1 0\n1\n","-1","A null head visits nothing, even though a record exists."]],
    hints: ["The order of registry entries is unrelated to bridge order.", "Use the current ID to look up its successor.", "Start at h and print each current ID before moving to next[current]. Stop at 0."],
    editorial: "Treat the successor table as linked nodes addressed by ID. Start at h. At every step the current node is exactly the next unreported reachable node, so printing it and following its link extends the answer by one correct entry. The reachable chain is acyclic and therefore reaches null after at most n steps. If h is null, print -1 instead. Unreachable records never affect the walk.",
    time: "O(n) including reading the table", space: "O(n) for the links", starter: table.starter,
    reference: tableReference(
      '    if (!head) cout << -1;\n    for (int node=head; node; node=next[node]) cout << node << " ";',
      '        StringBuilder answer=new StringBuilder();\n        if (head==0) answer.append(-1);\n        for (int node=head; node!=0; node=next[node]) answer.append(node).append(" ");\n        System.out.print(answer);',
      'answer=[]\nwhile head:\n    answer.append(head)\n    head=links[head]\nprint(*answer if answer else [-1])'),
    oracle: input => trail(input).visited.join(" ") || "-1",
    hidden: ["1 1\n0\n","4 4\n0 0 1 3\n",["20000 1\n"+terminating+"\n",longChain.join(" ")]],
    clue: "Look beneath the last bridge's mooring ring for the headkeeper's brass route pin.", treasure: "Brass Route Pin",
  },
  {
    title: "The Spliced Mooring Line", intro: "A saboteur tampered with a line of mooring posts. Replay the harbour master's repair log to determine which posts remain in the line.",
    statement: "Initially the line contains IDs 1 through n in order. Process q operations. Operation 1 p inserts node n+j immediately after p, where j is the 1-based operation number. Operation 2 p removes the node immediately after p. The permanent sentinel 0 precedes the first node and is never printed. Each p names the sentinel or a currently present node. Every deletion has a successor to remove.",
    input: "First line: n q. Each of the next q lines contains a type (1 or 2) and p.",
    output: "The final IDs from the head, separated by spaces, or -1 if the line is empty.",
    constraints: "0 ≤ n,q ≤ 20000. IDs created by distinct insertions are unique. Operations meet the stated predecessor and deletion guarantees.",
    samples: [["3 3\n1 1\n2 0\n1 3\n","4 2 3 6","Insert 4 after 1, remove 1 after the sentinel, then insert 6 after 3."],["0 2\n1 0\n2 0\n","-1","The only inserted node is removed again."]],
    hints: ["The operation gives the predecessor, so searching for it is unnecessary.", "Represent each node by an ID and store its next link in an indexed table.", "Insert by linking the new node to the old successor before changing the predecessor. Delete by bypassing the successor."],
    editorial: "Create a successor table containing the initial chain and sentinel. On insertion after p, store next[p] in the new node's successor, then set next[p] to that node. The old suffix is preserved and the new node appears at exactly the requested location. On deletion, set next[p] to next[next[p]], bypassing precisely one node. No live link to that node remains because this is a singly linked line. The sentinel makes changes at the head identical to other operations. After all updates, traverse from next[0]. This avoids shifting many elements on every operation.",
    time: "O(n+q)", space: "O(n+q)", starter: [
      '    int n,q; cin>>n>>q;\n    // Read q pairs type and predecessor, then print the final list.',
      '        int n=in.nextInt(), q=in.nextInt();\n        // Read q pairs type and predecessor, then print the final list.',
      'tokens=iter(map(int, sys.stdin.buffer.read().split()))\nn,q=next(tokens),next(tokens)\n# Read q pairs type and predecessor, then print the final list.',
    ],
    reference: [
      '    int n,q;cin>>n>>q;vector<int> next(n+q+1);\n    for(int i=0;i<n;i++)next[i]=i+1;\n    for(int j=1;j<=q;j++){\n        int op,p;cin>>op>>p;\n        if(op==1){next[n+j]=next[p];next[p]=n+j;}\n        else next[p]=next[next[p]];\n    }\n    if(!next[0])cout<<-1;\n    for(int i=next[0];i;i=next[i])cout<<i<<" ";',
      '        int n=in.nextInt(),q=in.nextInt();int[] next=new int[n+q+1];\n        for(int i=0;i<n;i++)next[i]=i+1;\n        for(int j=1;j<=q;j++){\n            int op=in.nextInt(),p=in.nextInt();\n            if(op==1){next[n+j]=next[p];next[p]=n+j;}else next[p]=next[next[p]];\n        }\n        StringBuilder answer=new StringBuilder();\n        if(next[0]==0)answer.append(-1);\n        for(int i=next[0];i!=0;i=next[i])answer.append(i).append(" ");\n        System.out.print(answer);',
      'tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,q=next(tokens),next(tokens)\nlinks=list(range(1,n+1))+[0]*(q+1)\nfor j in range(1,q+1):\n    op,p=next(tokens),next(tokens)\n    if op==1:\n        links[n+j],links[p]=links[p],n+j\n    else:\n        links[p]=links[links[p]]\nanswer=[]\ni=links[0]\nwhile i:\n    answer.append(i)\n    i=links[i]\nprint(*answer if answer else [-1])',
    ],
    oracle: input => { const [n,q,...ops]=ints(input), line=[0,...Array.from({length:n},(_,i)=>i+1)]; for(let j=0;j<q;j++){const offset=line.indexOf(ops[2*j+1])+1; if(ops[2*j]===1)line.splice(offset,0,n+j+1);else line.splice(offset,1);} return line.slice(1).join(" ")||"-1"; },
    hidden: ["0 0\n", "4 3\n2 2\n1 2\n2 6\n", ["20000 20000\n"+"2 0\n".repeat(20000),"-1"]],
    clue: "Inside the sentinel post's hinged cap is a silver splicing hook.", treasure: "Silver Splicing Hook",
  },
  {
    title: "The Reversed Rope Crossing", intro: "A section of bridge rope was threaded backward during repairs. Restore the middle section while leaving both outside segments in their original order.",
    statement: "The input values form a singly linked list in input order. Reverse the nodes from position L through R, inclusive, and print the resulting values. Positions are 1-based. Values may repeat.",
    input: "First line: n L R. Second line: n signed values.", output: "Print the n values in their new traversal order, separated by spaces.",
    constraints: "1 ≤ n ≤ 20000. 1 ≤ L ≤ R ≤ n. Each value is between -10^9 and 10^9.",
    samples: [["5 2 4\n9 -2 4 4 7\n","9 4 4 -2 7","Only positions 2–4 are reversed."],["3 1 3\n1 2 3\n","3 2 1","The reversed segment includes both ends."]],
    hints: ["Locate the predecessor of the reversed segment before changing any links.", "Reverse the selected links one at a time while saving the next unprocessed node.", "The former first node becomes the segment tail. Attach it to the suffix and attach the predecessor to the new first node."],
    editorial: "Use a sentinel before the head and locate the predecessor of position L. Record the original first node, which will become the tail. Walk R-L+1 nodes, saving each successor before redirecting its link toward the already reversed prefix. After k iterations that prefix contains exactly the first k selected nodes in reverse order and the saved successor starts the remainder. Set the old first node's link to the untouched suffix and the predecessor's link to the reversed prefix. The sentinel handles L=1, and a null suffix handles R=n. Equal values do not affect rewiring.",
    time: "O(n)", space: "O(n) for list representation, O(1) auxiliary for the reversal", starter: [
      '    int n,l,r;cin>>n>>l>>r;vector<int>a(n+1);\n    for(int i=1;i<=n;i++)cin>>a[i];\n    // Reverse the selected links.',
      '        int n=in.nextInt(),l=in.nextInt(),r=in.nextInt();int[] a=new int[n+1];\n        for(int i=1;i<=n;i++)a[i]=in.nextInt();\n        // Reverse the selected links.',
      'tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,l,r=next(tokens),next(tokens),next(tokens)\na=[0]+[next(tokens) for _ in range(n)]\n# Reverse the selected links.',
    ],
    reference: [
      '    int n,l,r;cin>>n>>l>>r;vector<int>a(n+1),next(n+1);\n    for(int i=1;i<=n;i++)cin>>a[i];\n    for(int i=0;i<n;i++)next[i]=i+1;\n    int tail=l,node=l,prev=0;\n    for(int i=l;i<=r;i++){int following=next[node];next[node]=prev;prev=node;node=following;}\n    next[tail]=node;next[l-1]=prev;\n    for(int i=next[0];i;i=next[i])cout<<a[i]<<" ";',
      '        int n=in.nextInt(),l=in.nextInt(),r=in.nextInt();int[] a=new int[n+1],next=new int[n+1];\n        for(int i=1;i<=n;i++)a[i]=in.nextInt();\n        for(int i=0;i<n;i++)next[i]=i+1;\n        int node=l,prev=0;\n        for(int i=l;i<=r;i++){int following=next[node];next[node]=prev;prev=node;node=following;}\n        next[l]=node;next[l-1]=prev;\n        StringBuilder answer=new StringBuilder();\n        for(int i=next[0];i!=0;i=next[i])answer.append(a[i]).append(" ");\n        System.out.print(answer);',
      'tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,l,r=next(tokens),next(tokens),next(tokens)\na=[0]+[next(tokens) for _ in range(n)]\nlinks=list(range(1,n+1))+[0]\nnode,prev=l,0\nfor _ in range(l,r+1):\n    following=links[node]\n    links[node]=prev\n    prev,node=node,following\nlinks[l],links[l-1]=node,prev\nanswer=[]\ni=links[0]\nwhile i:\n    answer.append(a[i])\n    i=links[i]\nprint(*answer)',
    ],
    oracle: input => { const [n,l,r,...a]=ints(input);return [...a.slice(0,l-1),...a.slice(l-1,r).reverse(),...a.slice(r)].join(" "); },
    hidden: ["1 1 1\n-1000000000\n","5 3 3\n5 1 5 -8 0\n","5 3 5\n1 2 3 4 5\n",["20000 1 20000\n"+longChain.join(" ")+"\n",[...longChain].reverse().join(" ")]],
    clue: "Under the knot that changed ends lies a bronze rope compass.", treasure: "Bronze Rope Compass",
  },
  {
    title: "The Midspan Rendezvous", intro: "Two couriers must meet at the midpoint of a bridge chain, but the registry includes unused bridges. Identify the rendezvous post on the actual route.",
    statement: "Report the middle node of the acyclic chain reachable from h. If the reachable length is even, choose the second of the two middle nodes. For an empty chain, output 0. Do not include unreachable records.",
    input: table.input, output: "One integer, the selected node ID or 0.",
    constraints: "1 ≤ n ≤ 20000. 0 ≤ h, next[i] ≤ n. The chain reachable from h is acyclic.",
    samples: [["5 4\n0 1 3 2 0\n","2","The route is 4, 2, 1. Its middle is 2."],["4 2\n3 4 0 1\n","1","The route is 2, 4, 1, 3. Of the two middle nodes, choose 1."]],
    hints: ["n is the table size and may not be the route length.", "Advance one pointer twice as fast as the other.", "Start both pointers at h. While fast and its successor exist, advance slow once and fast twice."],
    editorial: "Initialize slow and fast to the head. In each iteration move slow one edge and fast two, as long as both fast steps are possible. After k iterations, slow is at zero-based index k and fast is at index 2k or null. For a chain of length m the loop runs floor(m/2) times, leaving slow at the unique middle when m is odd and the second middle when m is even. A null head skips the loop. The technique uses one pass without computing the reachable length in advance.",
    time: "O(n) including the input table", space: "O(n) for links, O(1) auxiliary", starter: table.starter,
    reference: tableReference(
      '    int slow=head,fast=head;\n    while(fast&&next[fast]){slow=next[slow];fast=next[next[fast]];}\n    cout<<slow;',
      '        int slow=head,fast=head;\n        while(fast!=0&&next[fast]!=0){slow=next[slow];fast=next[next[fast]];}\n        System.out.print(slow);',
      'slow=fast=head\nwhile fast and links[fast]:\n    slow=links[slow]\n    fast=links[links[fast]]\nprint(slow)'),
    oracle: input => { const {visited}=trail(input);return String(visited[Math.floor(visited.length/2)]||0); },
    hidden: ["1 0\n0\n","1 1\n0\n","5 1\n2 3 4 5 0\n",["20000 1\n"+terminating+"\n","10001"]],
    clue: "The midpoint post has a hollow socket holding a courier's pewter pass.", treasure: "Pewter Courier Pass",
  },
  {
    title: "The Endless Mooring Circuit", intro: "A courier kept passing the same post and never reached port. Find the first post of the loop and how many crossings it takes to return there.",
    statement: "Follow successors starting at h. If the reachable walk enters a cycle, print the first node on that cycle encountered from h and the number of nodes in the cycle. If the walk reaches null, print 0 0. A node pointing to itself is a cycle of length one.",
    input: table.input, output: "Two integers: entry node ID and cycle length, or 0 0.",
    constraints: "1 ≤ n ≤ 20000. 0 ≤ h, next[i] ≤ n. Unreachable cycles must be ignored.",
    samples: [["5 1\n3 5 4 2 4\n","4 3","The walk is 1, 3, 4, 2, 5, 4. The cycle starts at 4 and has three nodes."],["3 1\n2 0 3\n","0 0","The walk reaches null after 2. The self-loop at node 3 is unreachable."]],
    hints: ["A revisit identifies a cycle, but the first meeting of two walkers need not be its entry.", "Use Floyd's slow and fast pointers. After meeting, restart one at h and advance both by one step.", "The next meeting gives the entry. Make one full lap from it to count nodes."],
    editorial: "Move slow one edge and fast two edges until they meet or fast reaches null. In a reachable cycle the relative distance changes by one each step, so they meet. If slow traveled t edges at the meeting, fast traveled 2t, making t a multiple of the cycle length. Let a be the distance from head to the cycle entry. The meeting lies t-a steps along the cycle from entry, so moving another a steps from the meeting lands at entry. Move one pointer from h and the other from the meeting at equal speeds to find it. Count its cycle by walking until it returns. This covers self-loops, heads already on the cycle, and empty or terminating paths.",
    time: "O(n)", space: "O(n) for links, O(1) auxiliary with Floyd's algorithm", starter: table.starter,
    reference: tableReference(
      '    int slow=head,fast=head;\n    while(fast&&next[fast]){\n        slow=next[slow];fast=next[next[fast]];\n        if(slow!=fast)continue;\n        int entry=head;while(entry!=slow){entry=next[entry];slow=next[slow];}\n        int length=1;for(int node=next[entry];node!=entry;node=next[node])length++;\n        cout<<entry<<" "<<length;return 0;\n    }\n    cout<<"0 0";',
      '        int slow=head,fast=head;\n        while(fast!=0&&next[fast]!=0){\n            slow=next[slow];fast=next[next[fast]];\n            if(slow!=fast)continue;\n            int entry=head;while(entry!=slow){entry=next[entry];slow=next[slow];}\n            int length=1;for(int node=next[entry];node!=entry;node=next[node])length++;\n            System.out.print(entry+" "+length);return;\n        }\n        System.out.print("0 0");',
      'slow=fast=head\nwhile fast and links[fast]:\n    slow=links[slow]\n    fast=links[links[fast]]\n    if slow!=fast:\n        continue\n    entry=head\n    while entry!=slow:\n        entry,slow=links[entry],links[slow]\n    length,node=1,links[entry]\n    while node!=entry:\n        length+=1\n        node=links[node]\n    print(entry,length)\n    break\nelse:\n    print("0 0")'),
    oracle: input => { const {entry,length}=trail(input);return entry+" "+length; },
    hidden: ["1 1\n1\n","4 0\n2 3 4 2\n","4 3\n2 1 4 3\n",["20000 1\n"+longChain.slice(1).concat(10001).join(" ")+"\n","10001 10000"]],
    clue: "At the first looping post, recover the silver link set into the stone.", treasure: "Silver Loop Link",
  },
]);
