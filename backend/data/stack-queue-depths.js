const { makeBank } = require("./missionBank");
const nums = s => s.trim().split(/\s+/).map(Number);
const input = (a, k) => a.length + (k === undefined ? "" : " " + k) + "\n" + a.join(" ") + "\n";
const n = 20000;
const arrayStarter = [
  "    int n; cin >> n; vector<long long> a(n);\n    for (auto &x : a) cin >> x;\n    // Compute your answer.",
  "        int n=in.nextInt(); long[] a=new long[n];\n        for(int i=0;i<n;i++) a[i]=in.nextLong();\n        // Compute your answer.",
  "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn=next(tokens)\na=[next(tokens) for _ in range(n)]\n# Compute your answer.",
];
const tokenStarter = ["    string s; cin >> s;\n    // Check the seal.", "        String s=in.next();\n        // Check the seal.", "s=sys.stdin.readline().strip()\n# Check the seal."];
const queueStarter = ["    int q; cin >> q;\n    // Read q commands and process the queue.", "        int q=in.nextInt();\n        // Read q commands and process the queue.", "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nq=next(tokens)\n# Read q commands and process the queue."];
module.exports = makeBank({
  slug:"stack-queue-depths",name:"Stack & Queue Depths",topic:"Stacks & Queues",order:4,
  description:"Recover the citadel's records by managing the order of cargo and patrols.",
  image:"/assets/islands/stack-queue-depths.webp",mapPosition:{x:37,y:81},
  completionReward:{coins:300,xp:600,artifact:"The Brass Plumb-Line of LIFO"},
}, [
  {
    title:"The Last Docket", intro:"A lift descends one docket at a time. The repair log records new dockets and cancellations, but the top docket's number was erased.",
    statement:"Start with an empty stack. Each nonzero event pushes that signed docket number. Each zero pops the top if the stack is nonempty. Report the final size and top.",
    input:"First line: n. Second line: n signed events.", output:"Print size and top separated by one space, using EMPTY in place of the top when size is zero.",
    constraints:"1 ≤ n ≤ 20000. Each event is between -10^9 and 10^9. Popping an empty stack has no effect.",
    samples:[["6\n4 -2 0 8 0 6\n","2 6","Both -2 and 8 are canceled. The final dockets are 4 then 6."],["3\n0 7 0\n","0 EMPTY","The first cancellation has no effect, and the last removes 7."]],
    hints:["A cancellation affects the most recent surviving docket.","Keep surviving dockets in a stack.","After processing all events, read the stack size and inspect its last element only when nonempty."],
    editorial:"Use the end of an array as the top. Push a nonzero value at that end and remove the last entry on zero when possible. The array always represents the surviving dockets from oldest to newest because every event changes only its final entry. After the scan its length is the size and its final entry is the top. Guard against empty cancellation and an empty final state.",
    time:"O(n)",space:"O(n)",starter:arrayStarter,
    reference:[
      '    int n; cin>>n; vector<long long> stack;\n    while(n--){long long x;cin>>x;if(x)stack.push_back(x);else if(!stack.empty())stack.pop_back();}\n    cout<<stack.size()<<" "<<(stack.empty()?"EMPTY":to_string(stack.back()));',
      '        int n=in.nextInt(); ArrayDeque<Long> stack=new ArrayDeque<>();\n        for(int i=0;i<n;i++){long x=in.nextLong();if(x!=0)stack.push(x);else if(!stack.isEmpty())stack.pop();}\n        System.out.print(stack.size()+" "+(stack.isEmpty()?"EMPTY":stack.peek()));',
      'a=list(map(int,sys.stdin.buffer.read().split()))[1:]\nstack=[]\nfor x in a:\n    if x:\n        stack.append(x)\n    elif stack:\n        stack.pop()\nprint(len(stack), stack[-1] if stack else "EMPTY")',
    ],
    oracle:s=>{const reversed=[];let cancels=0;for(const x of nums(s).slice(1).reverse()){if(x===0)cancels++;else if(cancels)cancels--;else reversed.push(x);}return reversed.length+" "+(reversed[0]??"EMPTY");},
    hidden:["1\n-9\n","2\n0 0\n",[input(Array(n).fill(-1000000000)),n+" -1000000000"]],
    clue:"Search below the last docket rail for the lead lift key.",treasure:"Lead Lift Key",
  },
  {
    title:"The First Broken Seal",intro:"A seal's brackets record nested locks. Point the locksmith to the first closing symbol that cannot match the lock on top.",
    statement:"Check the nesting of parentheses, square brackets, and braces. Print the 1-based index of the first closing bracket that lacks an opening bracket of the same type at the top of the stack. If all closes are valid but openings remain, print n+1. If the seal is balanced, print 0.",
    input:"One line containing n bracket characters and no spaces.",output:"One integer according to the rule above.",
    constraints:"1 ≤ n ≤ 100000. The alphabet is ( ) [ ] { }.",
    samples:[["([)]\n","3","The third character tries to close a parenthesis while a square bracket is on top."],["{[]}\n","0","All brackets close in reverse order of opening."]],
    hints:["Only the most recently opened lock can close next.","Store unmatched opening brackets.","On a closing character, check the top before popping. Also check for leftover openings at the end."],
    editorial:"Push each opening character. Each closing character must match the last unclosed opening, which is the stack top. If the stack is empty or the types differ, the current index is the first failure because all previous characters were checked successfully. Otherwise pop the matching opening. A nonempty stack after the scan indicates missing closing brackets, yielding n+1. An empty stack then means the whole seal is balanced.",
    time:"O(n)",space:"O(n)",starter:tokenStarter,
    reference:[
      '    string s,stack,open="([{",close=")]}";cin>>s;\n    for(int i=0;i<(int)s.size();i++){size_t j=close.find(s[i]);if(j==string::npos)stack+=s[i];else{if(stack.empty()||stack.back()!=open[j]){cout<<i+1;return 0;}stack.pop_back();}}\n    cout<<(stack.empty()?0:s.size()+1);',
      '        String s=in.next(),open="([{",close=")]}";StringBuilder stack=new StringBuilder();\n        for(int i=0;i<s.length();i++){char c=s.charAt(i);int j=close.indexOf(c);if(j<0)stack.append(c);else{int last=stack.length()-1;if(last<0||stack.charAt(last)!=open.charAt(j)){System.out.print(i+1);return;}stack.setLength(last);}}\n        System.out.print(stack.length()==0?0:s.length()+1);',
      's=sys.stdin.readline().strip()\nclosing={")":"(", "]":"[", "}":"{"}\nstack=[]\nfor i,ch in enumerate(s,1):\n    if ch not in closing:\n        stack.append(ch)\n    elif not stack or stack.pop()!=closing[ch]:\n        print(i)\n        break\nelse:\n    print(len(s)+1 if stack else 0)',
    ],
    oracle:s=>{s=s.trim();let pending="";for(let i=0;i<s.length;i++){const c=s[i],j="([{".indexOf(c);if(j>=0)pending=")]}"[j]+pending;else if(c!==pending[0])return String(i+1);else pending=pending.slice(1);}return String(pending?s.length+1:0);},
    hidden:[")\n","([{\n","[]{()})\n",["[".repeat(50000)+"]".repeat(50000)+"\n","0"]],
    clue:"The faulty seal lifts from a copper escutcheon engraved with three brackets.",treasure:"Copper Escutcheon",
  },
  {
    title:"The Higher Watchtower",intro:"Each watchtower needs the nearest taller tower downstream so it can pass the alert without overshooting a relay.",
    statement:"For each position i find the first j>i with height[j]>height[i]. Output j-i, or 0 when no taller tower lies to its right. Equal heights do not qualify.",
    input:"First line: n. Second line: n heights in upstream-to-downstream order.",output:"n space-separated distances.",
    constraints:"1 ≤ n ≤ 20000. -10^9 ≤ height[i] ≤ 10^9. Heights are measured relative to the tide datum.",
    samples:[["5\n4 2 2 6 3\n","3 2 1 0 0","Both height-2 towers relay to the height-6 tower. The height-4 tower uses it too."],["3\n1 2 3\n","1 1 0","Each tower except the last finds a taller immediate neighbor."]],
    hints:["A position waits until its first taller successor appears.","Maintain pending positions on a monotonic stack.","When a new height is strictly larger than the top height, pop that position and set its distance to the current index minus its own."],
    editorial:"Scan left to right with a stack of unresolved indices. Its heights are nonincreasing from bottom to top. When the new height is greater than the top, pop the top and record the distance. The new tower is the first taller one because the popped tower was unresolved until now. Repeat until the top is at least as tall, then push the new position. No deeper pending height can be smaller than a top that remains. Each index is pushed and popped at most once. Leftovers get zero and equality never triggers a pop.",
    time:"O(n)",space:"O(n)",starter:arrayStarter,
    reference:[
      '    int n;cin>>n;vector<long long>a(n);for(auto &x:a)cin>>x;\n    vector<int> pending,distance(n);\n    for(int i=0;i<n;i++){while(!pending.empty()&&a[pending.back()]<a[i]){int j=pending.back();pending.pop_back();distance[j]=i-j;}pending.push_back(i);}\n    for(int d:distance)cout<<d<<" ";',
      '        int n=in.nextInt();long[] a=new long[n];for(int i=0;i<n;i++)a[i]=in.nextLong();\n        int[] stack=new int[n],distance=new int[n];int size=0;\n        for(int i=0;i<n;i++){while(size>0&&a[stack[size-1]]<a[i]){int j=stack[--size];distance[j]=i-j;}stack[size++]=i;}\n        StringBuilder out=new StringBuilder();for(int d:distance)out.append(d).append(" ");System.out.print(out);',
      'a=list(map(int,sys.stdin.buffer.read().split()))[1:]\nstack=[]\ndistance=[0]*len(a)\nfor i,x in enumerate(a):\n    while stack and a[stack[-1]]<x:\n        j=stack.pop()\n        distance[j]=i-j\n    stack.append(i)\nprint(*distance)',
    ],
    oracle:s=>{const a=nums(s).slice(1);return a.map((x,i)=>{for(let j=i+1;j<a.length;j++)if(a[j]>x)return j-i;return 0;}).join(" ");},
    hidden:["1\n-5\n","5\n-5 -5 -4 -6 -3\n",[input(Array.from({length:n},(_,i)=>n-i)),Array(n).fill(0).join(" ")]],
    clue:"At the base of the taller relay sits the bronze signal shutter.",treasure:"Bronze Signal Shutter",
  },
  {
    title:"The Two-Shaft Dispatch",intro:"Two shafts can each hold a stack of tickets. The dispatcher must nevertheless admit couriers in arrival order.",
    statement:"Maintain an initially empty FIFO queue of signed ticket numbers. Command 1 x enqueues x. Command 2 dequeues the oldest ticket and prints it. Command 3 prints the oldest ticket without removing it. Print EMPTY for command 2 or 3 when the queue is empty. If no command produces a result, print NONE.",
    input:"First line: q. The next q lines contain commands in the formats above.",output:"One line per command 2 or 3 in order, or a single line containing NONE.",
    constraints:"1 ≤ q ≤ 20000. -10^9 ≤ x ≤ 10^9. Ticket values may repeat.",
    samples:[["7\n1 -3\n1 5\n3\n2\n1 8\n2\n3\n","-3\n-3\n5\n8","Peeking does not consume -3. Tickets depart in arrival order."],["3\n2\n3\n1 4\n","EMPTY\nEMPTY","Both queries occur before any ticket arrives."]],
    hints:["Incoming and outgoing tickets can live in different stacks.","Only refill the outgoing stack when it is empty.","Transfer all incoming tickets to the outgoing stack, reversing their order. Each ticket transfers at most once."],
    editorial:"Push arrivals onto an incoming stack. The outgoing stack holds older tickets, with the oldest on top. If it becomes empty when queried, pop every incoming ticket and push it onto outgoing. Reversing the incoming batch puts its oldest ticket on top. A peek reads that top, and a dequeue removes it. Never move a newer batch ahead of older tickets. Each ticket is pushed, transferred, and removed at most once, so total processing is linear. Emit EMPTY for empty queries and NONE for an enqueue-only log. A standard deque is also valid.",
    time:"O(q) total",space:"O(q)",starter:queueStarter,
    reference:[
      '    int q;cin>>q;vector<long long> incoming,outgoing;bool printed=false;\n    while(q--){int cmd;cin>>cmd;if(cmd==1){long long x;cin>>x;incoming.push_back(x);continue;}\n        if(outgoing.empty())while(!incoming.empty()){outgoing.push_back(incoming.back());incoming.pop_back();}\n        if(outgoing.empty())cout<<"EMPTY\\n";else{cout<<outgoing.back()<<"\\n";if(cmd==2)outgoing.pop_back();}printed=true;\n    }\n    if(!printed)cout<<"NONE";',
      '        int q=in.nextInt();ArrayDeque<Long> incoming=new ArrayDeque<>(),outgoing=new ArrayDeque<>();StringBuilder out=new StringBuilder();\n        while(q-->0){int cmd=in.nextInt();if(cmd==1){incoming.push(in.nextLong());continue;}\n            if(outgoing.isEmpty())while(!incoming.isEmpty())outgoing.push(incoming.pop());\n            if(outgoing.isEmpty())out.append("EMPTY");else{out.append(outgoing.peek());if(cmd==2)outgoing.pop();}out.append("\\n");\n        }\n        System.out.print(out.length()==0?"NONE":out);',
      'tokens=iter(map(int,sys.stdin.buffer.read().split()))\nincoming,outgoing,answers=[],[],[]\nfor _ in range(next(tokens)):\n    cmd=next(tokens)\n    if cmd==1:\n        incoming.append(next(tokens))\n        continue\n    if not outgoing:\n        outgoing=incoming[::-1]\n        incoming.clear()\n    answers.append(str(outgoing[-1]) if outgoing else "EMPTY")\n    if cmd==2 and outgoing:\n        outgoing.pop()\nprint("\\n".join(answers) if answers else "NONE")',
    ],
    oracle:s=>{const a=nums(s), queue=[], out=[];for(let i=1;i<a.length;){const cmd=a[i++];if(cmd===1)queue.push(a[i++]);else out.push(String((cmd===2?queue.shift():queue[0])??"EMPTY"));}return out.join("\n")||"NONE";},
    hidden:["1\n1 5\n","1\n3\n","8\n1 1\n1 2\n2\n1 3\n3\n2\n2\n2\n",["20000\n"+"1 7\n".repeat(10000)+"2\n".repeat(10000),Array(10000).fill(7).join("\n")]],
    clue:"The outgoing shaft hides a tin dispatch badge under its first step.",treasure:"Tin Dispatch Badge",
  },
  {
    title:"The Steady Ballast Passage",intro:"A convoy can cross safely only if the difference between the heaviest and lightest crate on its contiguous platform stays below the gate's limit.",
    statement:"Find the maximum length of a nonempty contiguous subarray whose largest value minus its smallest value is at most K. Values may be signed. K is nonnegative, so a singleton is always valid.",
    input:"First line: n K. Second line: n signed readings.",output:"One integer, the maximum valid length.",
    constraints:"1 ≤ n ≤ 20000. 0 ≤ K ≤ 2×10^9. -10^9 ≤ a[i] ≤ 10^9.",
    samples:[["5 4\n8 2 4 7 3\n","3","The stretch [4,7,3] has range 4. No length-four stretch fits."],["4 0\n-2 -2 -1 -1\n","2","Only stretches of equal values fit, and the longest runs have length two."]],
    hints:["A window that violates the range limit cannot be fixed by extending it.","Keep two deques of candidate extrema.","Pop dominated indices at the backs, discard expired indices from the fronts, and shrink until max-min ≤ K."],
    editorial:"Maintain decreasing maximum candidates and increasing minimum candidates by value, with indices ordered by arrival. At a new right endpoint, remove candidates from each back that the new value matches or improves. They cannot become useful later because the new index expires later and is at least as extreme. Insert the new index into both deques. While the front values differ by more than K, advance left and remove any front that leaves the window. Each removed start is permanently infeasible for any extension because adding values cannot decrease the range. The retained left is the earliest feasible start, yielding the longest window ending at right. Take the maximum over all right endpoints. Each index enters and leaves each deque once.",
    time:"O(n)",space:"O(n)",starter:[
      "    int n; long long k; cin>>n>>k; vector<long long>a(n);\n    for(auto &x:a) cin>>x;\n    // Find the longest stable window.",
      "        int n=in.nextInt(); long k=in.nextLong(); long[] a=new long[n];\n        for(int i=0;i<n;i++)a[i]=in.nextLong();\n        // Find the longest stable window.",
      "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,k=next(tokens),next(tokens)\na=[next(tokens) for _ in range(n)]\n# Find the longest stable window.",
    ],
    reference:[
      '    int n;long long k;cin>>n>>k;vector<long long>a(n);for(auto &x:a)cin>>x;\n    deque<int> hi,lo;int left=0,best=0;\n    for(int r=0;r<n;r++){\n        while(!hi.empty()&&a[hi.back()]<=a[r])hi.pop_back();while(!lo.empty()&&a[lo.back()]>=a[r])lo.pop_back();hi.push_back(r);lo.push_back(r);\n        while(a[hi.front()]-a[lo.front()]>k){if(hi.front()==left)hi.pop_front();if(lo.front()==left)lo.pop_front();left++;}\n        best=max(best,r-left+1);\n    }cout<<best;',
      '        int n=in.nextInt();long k=in.nextLong();long[] a=new long[n];for(int i=0;i<n;i++)a[i]=in.nextLong();\n        ArrayDeque<Integer> hi=new ArrayDeque<>(),lo=new ArrayDeque<>();int left=0,best=0;\n        for(int r=0;r<n;r++){\n            while(!hi.isEmpty()&&a[hi.peekLast()]<=a[r])hi.removeLast();while(!lo.isEmpty()&&a[lo.peekLast()]>=a[r])lo.removeLast();hi.add(r);lo.add(r);\n            while(a[hi.peekFirst()]-a[lo.peekFirst()]>k){if(hi.peekFirst()==left)hi.removeFirst();if(lo.peekFirst()==left)lo.removeFirst();left++;}\n            best=Math.max(best,r-left+1);\n        }System.out.print(best);',
      'from collections import deque\nn,k,*a=map(int,sys.stdin.buffer.read().split())\nhi,lo=deque(),deque()\nleft=best=0\nfor r,x in enumerate(a):\n    while hi and a[hi[-1]]<=x:\n        hi.pop()\n    while lo and a[lo[-1]]>=x:\n        lo.pop()\n    hi.append(r)\n    lo.append(r)\n    while a[hi[0]]-a[lo[0]]>k:\n        if hi[0]==left:\n            hi.popleft()\n        if lo[0]==left:\n            lo.popleft()\n        left+=1\n    best=max(best,r-left+1)\nprint(best)',
    ],
    oracle:s=>{const [n,k,...a]=nums(s);let best=0;for(let i=0;i<n;i++){let hi=-Infinity,lo=Infinity;for(let j=i;j<n;j++){hi=Math.max(hi,a[j]);lo=Math.min(lo,a[j]);if(hi-lo>k)break;best=Math.max(best,j-i+1);}}return String(best);},
    hidden:["1 0\n0\n","4 1999999999\n-1000000000 1000000000 0 0\n",[input(Array.from({length:n},(_,i)=>i%100),99),String(n)]],
    clue:"Under the platform's balanced ballast weight is the citadel's brass plumb-line.",treasure:"Brass Ballast Plumb-Line",
  },
]);
