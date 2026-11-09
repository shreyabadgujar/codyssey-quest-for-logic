const { makeBank } = require("./missionBank");
const nums=s=>s.trim().split(/\s+/).map(Number);
const max="1 ≤ n ≤ 20000, 0 ≤ m ≤ 40000. Vertices are numbered 1 through n. No self-loops or duplicate edges.";
function read({directed, query=false, weighted=false}) {
  return [
    "    int n,m;cin>>n>>m;"+(query?"int source,target;cin>>source>>target;":"")+
      "\n    vector<vector<pair<int,long long>>> graph(n+1);\n    for(int i=0;i<m;i++){int u,v;long long w=1;cin>>u>>v;"+(weighted?"cin>>w;":"")+"graph[u].push_back({v,w});"+(directed?"":"graph[v].push_back({u,w});")+"}\n    // Process the graph.",
    "        int n=in.nextInt(),m=in.nextInt();"+(query?"int source=in.nextInt(),target=in.nextInt();":"")+
      "\n        List<List<long[]>> graph=new ArrayList<>();for(int i=0;i<=n;i++)graph.add(new ArrayList<>());\n        for(int i=0;i<m;i++){int u=in.nextInt(),v=in.nextInt();long w="+(weighted?"in.nextLong()":"1")+";graph.get(u).add(new long[]{v,w});"+(directed?"":"graph.get(v).add(new long[]{u,w});")+"}\n        // Process the graph.",
    "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,m=next(tokens),next(tokens)\n"+(query?"source,target=next(tokens),next(tokens)\n":"")+
      "graph=[[] for _ in range(n+1)]\nfor _ in range(m):\n    u,v=next(tokens),next(tokens)\n    w="+(weighted?"next(tokens)":"1")+"\n    graph[u].append((v,w))\n"+(directed?"":"    graph[v].append((u,w))\n")+"# Process the graph.",
  ];
}
const refs=(head,...bodies)=>head.map((s,i)=>s.split(/\n[ ]*(?:\/\/|#) /)[0]+"\n"+bodies[i]);
const undirected=read({directed:false}), directed=read({directed:true});
const hops=read({directed:true,query:true}), weighted=read({directed:true,query:true,weighted:true});
function parse(s,query=false,weights=false) {
  const a=nums(s),[n,m,source,target]=a,offset=query?4:2,width=weights?3:2;
  return {n,m,source,target,edges:Array.from({length:m},(_,i)=>[a[offset+i*width],a[offset+i*width+1],weights?a[offset+i*width+2]:1])};
}
function shortest(s,weights=false) {
  const {n,source,target,edges}=parse(s,true,weights);
  const dist=Array(n+1).fill(Infinity);dist[source]=0;
  for(let pass=1;pass<n;pass++)for(const [u,v,w] of edges)dist[v]=Math.min(dist[v],dist[u]+w);
  if(!Number.isFinite(dist[target]))return weights?"-1 0":"-1";
  if(!weights)return String(dist[target]);
  const count=Array(n+1).fill(0);count[source]=1;
  for(const u of Array.from({length:n},(_,i)=>i+1).sort((u,v)=>dist[u]-dist[v])) {
    if(!Number.isFinite(dist[u]))break;
    for(const [from,v,w] of edges)if(from===u&&dist[u]+w===dist[v])count[v]=(count[v]+count[u])%1000000007;
  }
  return dist[target]+" "+count[target];
}
const N=20000;
const ring=Array.from({length:N},(_,i)=>[[i+1,(i+1)%N+1],[i+1,(i+2)%N+1]]).flat();
const ringInput=ring.map(e=>e.join(" ")).join("\n")+"\n";
const dag=ring.filter(([u,v])=>u<v).concat([[1,4],[2,5],[3,6]]);
const dagInput=dag.map(e=>e.join(" ")).join("\n")+"\n";
const ids=Array.from({length:N},(_,i)=>i+1).join(" ");
module.exports=makeBank({
  slug:"graphbound-kingdom",name:"Graphbound Kingdom",topic:"Graphs",order:9,
  description:"Trace the citadels' roads and recover the route through the kingdom.",
  image:"/assets/islands/graphbound-kingdom.webp",mapPosition:{x:84,y:53},
  completionReward:{coins:600,xp:1200,artifact:"The Astrolabe of Dijkstra"},
},[
  {
    title:"The Citadel Road Census",intro:"The road book lists every bridge once. Each citadel needs a count of all bridges touching it, including roads recorded in the opposite direction.",
    statement:"For each vertex of a simple undirected graph, print its degree, the number of incident edges. Include zero for isolated vertices.",
    input:"First line: n m. Then m lines of endpoints u v. Each line is one undirected edge.",
    output:"n degrees separated by spaces in order of vertex ID.",constraints:max,
    samples:[["5 3\n1 3\n2 3\n4 2\n","1 2 2 1 0","Vertices 2 and 3 each touch two roads. Vertex 5 touches none."],["1 0\n","0","An isolated vertex has degree zero."]],
    hints:["An undirected bridge has two endpoints.","Store a counter or adjacency list for each vertex.","Each input edge adds one to each endpoint's degree."],
    editorial:"Initialize every degree to zero. For an edge (u,v), increment degree[u] and degree[v]. The two increments count the edge exactly once for each incident vertex. No other degree changes, so after all edges every counter is correct. If building adjacency lists, place each endpoint in the other's list and print list lengths. Allocate counters even for IDs that never appear in an edge.",
    time:"O(n+m)",space:"O(n) with counters, O(n+m) with adjacency lists",starter:undirected,
    reference:refs(undirected,
      '    for(int v=1;v<=n;v++)cout<<graph[v].size()<<" ";',
      '        StringBuilder out=new StringBuilder();for(int v=1;v<=n;v++)out.append(graph.get(v).size()).append(" ");System.out.print(out);',
      'print(*(len(row) for row in graph[1:]))'),
    oracle:s=>{const {n,edges}=parse(s);return Array.from({length:n},(_,i)=>edges.filter(e=>e[0]===i+1||e[1]===i+1).length).join(" ");},
    hidden:["2 1\n2 1\n","4 2\n1 2\n3 4\n",[N+" "+ring.length+"\n"+ringInput,Array(N).fill(4).join(" ")]],
    clue:"Under the busiest bridge counter is a red enamel road badge.",treasure:"Red Enamel Road Badge",
  },
  {
    title:"The Fewest Beacon Relays",intro:"The watch sends a warning over one-way links. Find how many relays the quickest possible route requires.",
    statement:"In a directed unweighted graph, find the minimum number of edges needed to travel from S to T. If no directed route exists print -1. When S=T the answer is zero.",
    input:"First line: n m S T. Then m directed edges u v, meaning u to v.",output:"One integer, the minimum hop count or -1.",
    constraints:max+" 1 ≤ S,T ≤ n.",
    samples:[["5 5 1 5\n1 2\n2 3\n3 5\n1 4\n4 5\n","2","Route 1→4→5 needs two relays, fewer than the route through 2 and 3."],["3 2 3 1\n1 2\n2 3\n","-1","The listed links go away from 1, and 3 has no outgoing link."]],
    hints:["Every edge has the same cost.","Process vertices in increasing distance from the source.","Use a FIFO queue and mark a vertex when enqueuing it, assigning distance parent+1."],
    editorial:"Build outgoing adjacency lists and run breadth-first search. Initially only S is discovered at distance zero. A FIFO queue processes all distance-d vertices before any at d+1. Therefore the first discovery of a neighbor gives a shortest route, and it can be marked immediately. Use -1 for undiscovered vertices. Do not add reverse links. Cycles do not cause repeated work because each vertex enters the queue once.",
    time:"O(n+m)",space:"O(n+m)",starter:hops,
    reference:refs(hops,
      '    vector<int> dist(n+1,-1);queue<int> q;dist[source]=0;q.push(source);\n    while(!q.empty()){int u=q.front();q.pop();for(auto [v,w]:graph[u])if(dist[v]<0){dist[v]=dist[u]+1;q.push(v);}}cout<<dist[target];',
      '        int[] dist=new int[n+1];Arrays.fill(dist,-1);ArrayDeque<Integer> q=new ArrayDeque<>();dist[source]=0;q.add(source);\n        while(!q.isEmpty()){int u=q.remove();for(long[] edge:graph.get(u)){int v=(int)edge[0];if(dist[v]<0){dist[v]=dist[u]+1;q.add(v);}}}System.out.print(dist[target]);',
      'from collections import deque\ndist=[-1]*(n+1)\ndist[source]=0\nq=deque([source])\nwhile q:\n    u=q.popleft()\n    for v,_ in graph[u]:\n        if dist[v]<0:\n            dist[v]=dist[u]+1\n            q.append(v)\nprint(dist[target])'),
    oracle:shortest,
    hidden:["1 0 1 1\n","4 4 1 4\n1 2\n2 1\n2 3\n3 4\n",[N+" "+ring.length+" 1 "+N+"\n"+ringInput,"10000"]],
    clue:"The last relay cabinet hides a silver beacon coupler.",treasure:"Silver Beacon Coupler",
  },
  {
    title:"The Districts Cut Off",intro:"The flood broke the kingdom into districts. List their populations so the governor can allocate rescue boats.",
    statement:"Find the connected components of the undirected road graph. Output their sizes in nondecreasing order. A vertex with no road is a component of size one.",
    input:"First line: n m. Then m undirected edges u v.",output:"First line: component count. Second line: the component sizes in nondecreasing order.",
    constraints:max,
    samples:[["6 3\n1 2\n2 3\n5 6\n","3\n1 2 3","The groups are {4}, {5,6}, and {1,2,3}."],["3 0\n","3\n1 1 1","Without roads, each vertex is its own component."]],
    hints:["One traversal from a vertex finds its entire district.","Start a new traversal only at an unvisited vertex.","Use an explicit stack, mark on push, and sort the collected sizes."],
    editorial:"Sweep vertices in ID order. When a vertex is unvisited, start an iterative depth-first search and count the vertices it marks. A search can reach only its component by definition. Every vertex in that component has a path from the start, so the search eventually marks it. A global visited array ensures no later search counts that component again. Record each size and sort the sizes. Cycles and long chains are safe with marking on push and an explicit stack.",
    time:"O(n+m+c log c) for c components",space:"O(n+m)",starter:undirected,
    reference:refs(undirected,
      '    vector<int> seen(n+1),sizes;for(int start=1;start<=n;start++)if(!seen[start]){vector<int> todo{start};seen[start]=1;int count=0;while(!todo.empty()){int u=todo.back();todo.pop_back();count++;for(auto [v,w]:graph[u])if(!seen[v]){seen[v]=1;todo.push_back(v);}}sizes.push_back(count);}\n    sort(sizes.begin(),sizes.end());cout<<sizes.size()<<"\\n";for(int size:sizes)cout<<size<<" ";',
      '        boolean[] seen=new boolean[n+1];List<Integer> sizes=new ArrayList<>();ArrayDeque<Integer> todo=new ArrayDeque<>();\n        for(int start=1;start<=n;start++)if(!seen[start]){todo.push(start);seen[start]=true;int count=0;while(!todo.isEmpty()){int u=todo.pop();count++;for(long[] edge:graph.get(u)){int v=(int)edge[0];if(!seen[v]){seen[v]=true;todo.push(v);}}}sizes.add(count);}\n        Collections.sort(sizes);StringBuilder out=new StringBuilder().append(sizes.size()).append("\\n");for(int size:sizes)out.append(size).append(" ");System.out.print(out);',
      'seen=[False]*(n+1)\nsizes=[]\nfor start in range(1,n+1):\n    if seen[start]:\n        continue\n    todo=[start]\n    seen[start]=True\n    count=0\n    while todo:\n        u=todo.pop()\n        count+=1\n        for v,_ in graph[u]:\n            if not seen[v]:\n                seen[v]=True\n                todo.append(v)\n    sizes.append(count)\nprint(len(sizes))\nprint(*sorted(sizes))'),
    oracle:s=>{const {n,edges}=parse(s),labels=Array.from({length:n+1},(_,i)=>i);for(const [u,v] of edges){const a=labels[u],b=labels[v];for(let i=1;i<=n;i++)if(labels[i]===b)labels[i]=a;}const sizes=[...new Set(labels.slice(1))].map(id=>labels.slice(1).filter(x=>x===id).length).sort((a,b)=>a-b);return sizes.length+"\n"+sizes.join(" ");},
    hidden:["1 0\n","5 5\n1 2\n2 3\n3 1\n3 4\n4 5\n",[N+" "+ring.length+"\n"+ringInput,"1\n20000"]],
    clue:"On the isolated district's map pin sits a pewter relief crest.",treasure:"Pewter Relief Crest",
  },
  {
    title:"The Gate Opening Order",intro:"A gate may open only after its prerequisite gates. The steward requires the smallest legal sequence of gate IDs, or proof the orders contradict each other.",
    statement:"Find the lexicographically smallest topological order of a directed graph. Edge u→v requires u before v. If no full order exists, print IMPOSSIBLE.",
    input:"First line: n m. Then m directed prerequisites u v.",output:"n IDs in the requested order on one line, or IMPOSSIBLE.",
    constraints:max,
    samples:[["5 3\n2 4\n1 4\n4 5\n","1 2 3 4 5","Initially 1,2,3 are available. Opening the smallest available gate at each step yields this order."],["3 3\n1 2\n2 3\n3 1\n","IMPOSSIBLE","Each gate depends on another in the cycle."]],
    hints:["A gate is eligible when no remaining prerequisite points into it.","Track remaining indegrees as gates are removed.","Use a min-heap for eligible gates. If fewer than n are emitted, a directed cycle remains."],
    editorial:"Count indegrees and place every zero-indegree vertex in a min-heap. Pop the smallest eligible ID, remove its outgoing edges, and enqueue newly eligible vertices. The heap holds exactly the legal choices for the next position. Choosing its smallest element gives the smallest possible next ID and cannot prevent completion in an acyclic remainder, so the sequence is lexicographically smallest. If processing stops early, every remaining vertex has an incoming edge from the remainder. Following predecessors must eventually revisit a vertex, proving a cycle. Disconnected gates are handled by the initial heap.",
    time:"O(m+n log n)",space:"O(n+m)",starter:directed,
    reference:refs(directed,
      '    vector<int> indeg(n+1),order;for(int u=1;u<=n;u++)for(auto [v,w]:graph[u])indeg[v]++;\n    priority_queue<int,vector<int>,greater<int>> ready;for(int v=1;v<=n;v++)if(!indeg[v])ready.push(v);\n    while(!ready.empty()){int u=ready.top();ready.pop();order.push_back(u);for(auto [v,w]:graph[u])if(--indeg[v]==0)ready.push(v);}\n    if((int)order.size()!=n)cout<<"IMPOSSIBLE";else for(int v:order)cout<<v<<" ";',
      '        int[] indeg=new int[n+1];for(int u=1;u<=n;u++)for(long[] e:graph.get(u))indeg[(int)e[0]]++;\n        PriorityQueue<Integer> ready=new PriorityQueue<>();for(int v=1;v<=n;v++)if(indeg[v]==0)ready.add(v);\n        StringBuilder out=new StringBuilder();int count=0;while(!ready.isEmpty()){int u=ready.remove();count++;out.append(u).append(" ");for(long[] e:graph.get(u)){int v=(int)e[0];if(--indeg[v]==0)ready.add(v);}}System.out.print(count==n?out:"IMPOSSIBLE");',
      'from heapq import heapify,heappush,heappop\nindeg=[0]*(n+1)\nfor row in graph:\n    for v,_ in row:\n        indeg[v]+=1\nready=[v for v in range(1,n+1) if not indeg[v]]\nheapify(ready)\norder=[]\nwhile ready:\n    u=heappop(ready)\n    order.append(u)\n    for v,_ in graph[u]:\n        indeg[v]-=1\n        if not indeg[v]:\n            heappush(ready,v)\nif len(order)==n:\n    print(*order)\nelse:\n    print("IMPOSSIBLE")'),
    oracle:s=>{const {n,edges}=parse(s),left=new Set(Array.from({length:n},(_,i)=>i+1)),out=[];while(left.size){const u=[...left].find(v=>!edges.some(([a,b])=>b===v&&left.has(a)));if(!u)return "IMPOSSIBLE";out.push(u);left.delete(u);}return out.join(" ");},
    hidden:["1 0\n","5 4\n1 3\n3 2\n4 5\n5 4\n","6 3\n3 1\n4 1\n2 5\n",[N+" "+dag.length+"\n"+dagInput,ids]],
    clue:"The first unlocked gate bears a brass prerequisite tablet.",treasure:"Brass Prerequisite Tablet",
  },
  {
    title:"The Many Quickest Couriers",intro:"Several routes may deliver a sealed dispatch at the same earliest time. The archivist needs both that time and the number of fastest routes.",
    statement:"In a positively weighted directed graph, find the shortest distance from S to T and count routes of that distance modulo 1000000007. A route is distinguished by its vertex sequence. When S=T, the empty route has distance zero and counts once.",
    input:"First line: n m S T. Then m lines u v w for an edge from u to v of weight w.",
    output:"Print distance and count separated by a space, or -1 0 when T is unreachable.",
    constraints:max+" 1 ≤ S,T ≤ n and 1 ≤ w ≤ 10^9.",
    samples:[["4 5 1 4\n1 2 2\n1 3 1\n2 4 2\n3 4 3\n1 4 7\n","4 2","Both 1→2→4 and 1→3→4 cost 4, less than the direct cost 7."],["3 1 1 3\n2 3 2\n","-1 0","No edge leaves S, so T cannot be reached."]],
    hints:["Use a priority queue for shortest distances.","When relaxing to a smaller distance, replace the path count. When relaxing to an equal distance, add it.","Strictly positive weights mean every shortest-path predecessor is settled before its successor."],
    editorial:"Run Dijkstra using 64-bit distances and a min-heap. Initialize S with distance zero and count one. Ignore stale heap entries. When relaxing u→v improves dist[v], replace its count by count[u] because all previous paths are too long. When it ties, add count[u] modulo 1000000007. These contributions have different last edges and count disjoint paths. Positive weights ensure every predecessor on a shortest path has smaller distance and contributes before v is processed. Dijkstra's ordering therefore makes each propagated count complete. If T remains at infinity, print -1 0. The zero-edge path at S is never tied by a positive cycle.",
    time:"O((n+m) log(n+m))",space:"O(n+m)",starter:weighted,
    reference:refs(weighted,
      '    const long long INF=LLONG_MAX,mod=1000000007;vector<long long>d(n+1,INF),ways(n+1);\n    using Entry=pair<long long,int>;priority_queue<Entry,vector<Entry>,greater<Entry>> heap;d[source]=0;ways[source]=1;heap.push({0,source});\n    while(!heap.empty()){auto [dist,u]=heap.top();heap.pop();if(dist!=d[u])continue;for(auto [v,w]:graph[u]){long long cand=dist+w;if(cand<d[v]){d[v]=cand;ways[v]=ways[u];heap.push({cand,v});}else if(cand==d[v])ways[v]=(ways[v]+ways[u])%mod;}}\n    if(d[target]==INF)cout<<"-1 0";else cout<<d[target]<<" "<<ways[target];',
      '        long[] d=new long[n+1],ways=new long[n+1];Arrays.fill(d,Long.MAX_VALUE);\n        PriorityQueue<long[]> heap=new PriorityQueue<>(Comparator.comparingLong((long[] a)->a[0]));d[source]=0;ways[source]=1;heap.add(new long[]{0,source});\n        while(!heap.isEmpty()){long[] item=heap.remove();long dist=item[0];int u=(int)item[1];if(dist!=d[u])continue;for(long[] edge:graph.get(u)){int v=(int)edge[0];long cand=dist+edge[1];if(cand<d[v]){d[v]=cand;ways[v]=ways[u];heap.add(new long[]{cand,v});}else if(cand==d[v])ways[v]=(ways[v]+ways[u])%1000000007;}}\n        System.out.print(d[target]==Long.MAX_VALUE?"-1 0":d[target]+" "+ways[target]);',
      'from heapq import heappush,heappop\nd=[float("inf")]*(n+1)\nways=[0]*(n+1)\nd[source],ways[source]=0,1\nheap=[(0,source)]\nwhile heap:\n    dist,u=heappop(heap)\n    if dist!=d[u]:\n        continue\n    for v,w in graph[u]:\n        candidate=dist+w\n        if candidate<d[v]:\n            d[v],ways[v]=candidate,ways[u]\n            heappush(heap,(candidate,v))\n        elif candidate==d[v]:\n            ways[v]=(ways[v]+ways[u])%1000000007\nprint(-1,0) if d[target]==float("inf") else print(d[target],ways[target])'),
    oracle:s=>shortest(s,true),
    hidden:["1 0 1 1\n","4 4 1 4\n1 2 1000000000\n2 3 1000000000\n3 4 1000000000\n1 3 1000000000\n","5 6 1 5\n1 2 1\n1 3 1\n2 4 2\n3 4 2\n4 5 1\n2 5 3\n",[N+" "+ring.length+" 1 "+N+"\n"+ring.map(e=>e.join(" ")+" 1").join("\n")+"\n","10000 10000"]],
    clue:"At the convergence of the fastest routes waits the courier's astrolabe.",treasure:"Courier's Astrolabe",
  },
]);
