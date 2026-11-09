const { makeBank } = require("./missionBank");
const ints=s=>s.trim().split(/\s+/).map(Number);
const limits="1 ≤ n ≤ 20000. IDs are 1 through n, root is valid, and 0 means no child. The records form one valid binary tree rooted at root, with every node reachable.";
const input="First line: n root. Then n lines, one per node ID in ascending order, containing leftChild rightChild.";
const read = (parameter="", keyed=false) => {
  const cpp=parameter?"long long "+parameter+";cin>>"+parameter+";":"";
  const java=parameter?"long "+parameter+"=in.nextLong();":"";
  const py=parameter?parameter+"=next(tokens)\n":"";
  return [
    "    int n,root;cin>>n>>root;"+cpp+"\n    vector<array<int,2>> child(n+1);"+(keyed?"vector<long long> key(n+1);":"")+"\n    for(int i=1;i<=n;i++){cin>>child[i][0]>>child[i][1];"+(keyed?"cin>>key[i];":"")+"}\n    // Process the tree.",
    "        int n=in.nextInt(),root=in.nextInt();"+java+"\n        int[][] child=new int[n+1][2];"+(keyed?"long[] key=new long[n+1];":"")+"\n        for(int i=1;i<=n;i++){child[i][0]=in.nextInt();child[i][1]=in.nextInt();"+(keyed?"key[i]=in.nextLong();":"")+"}\n        // Process the tree.",
    "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,root=next(tokens),next(tokens)\n"+py+
      (keyed?"rows=[(0,0,0)]+[(next(tokens),next(tokens),next(tokens)) for _ in range(n)]\nchild=[row[:2] for row in rows]\nkey=[row[2] for row in rows]\n":"child=[(0,0)]+[(next(tokens),next(tokens)) for _ in range(n)]\n")+"# Process the tree.",
  ];
};
const tree=read(), bst=read("target",true), lca=read("queries");
const refs=(starter,...bodies)=>starter.map((code,i)=>code.split(/\n[ ]*(?:\/\/|#) /)[0]+"\n"+bodies[i]);
function parse(s,offset=2,width=2) {
  const values=ints(s),[n,root,parameter]=values;
  const child=[[0,0]];
  for(let i=0;i<n;i++) child.push(values.slice(offset+i*width,offset+(i+1)*width));
  return { n,root,parameter,child,extra:values.slice(offset+n*width) };
}
const N=20000;
const line=Array.from({length:N},(_,i)=>"0 "+(i===N-1?0:i+2)).join("\n")+"\n";
const chain=N+" 1\n"+line;
const plain="5 1\n2 3\n4 5\n0 0\n0 0\n0 0\n";
module.exports=makeBank({
  slug:"tree-of-secrets",name:"Tree of Secrets",topic:"Trees & BST",order:8,
  description:"Follow the branching archive and recover the histories hidden among its roots.",
  image:"/assets/islands/tree-of-secrets.webp",mapPosition:{x:68,y:34},
  completionReward:{coins:500,xp:1000,artifact:"The Root-Crown of Balance"},
},[
  {
    title:"The Inorder Archive",intro:"A registrar wrote one record per bough. Read them in the order expected by the archive door.",
    statement:"Print the inorder traversal of the binary tree: visit the left subtree, the current node, and then the right subtree. Print each node's ID.",
    input,output:"A line of n space-separated node IDs in inorder.",constraints:limits,
    samples:[[plain,"4 2 5 1 3","The left subtree yields 4,2,5 before root 1 and its right child 3."],["1 1\n0 0\n","1","A single root is the whole traversal."]],
    hints:["At a node, the left subtree must finish first.","A stack can remember nodes whose left subtree is in progress.","Push the left spine, then pop a node, emit it and enter its right subtree."],
    editorial:"Keep a stack of nodes waiting for their left subtrees to finish. Descend left, pushing each node until null. The top node's left subtree is now finished, so emit it and start traversing its right subtree. This exactly implements the recursive left-node-right order, while explicit storage handles a chain too deep for the language call stack. Each node is pushed and popped once. Missing children simply end the current descent.",
    time:"O(n)",space:"O(n) for links plus O(height) traversal stack",starter:tree,
    reference:refs(tree,
      '    vector<int> pending;int node=root;\n    while(node||!pending.empty()){while(node){pending.push_back(node);node=child[node][0];}node=pending.back();pending.pop_back();cout<<node<<" ";node=child[node][1];}',
      '        ArrayDeque<Integer> pending=new ArrayDeque<>();StringBuilder out=new StringBuilder();int node=root;\n        while(node!=0||!pending.isEmpty()){while(node!=0){pending.push(node);node=child[node][0];}node=pending.pop();out.append(node).append(" ");node=child[node][1];}System.out.print(out);',
      'pending=[]\nnode=root\nout=[]\nwhile node or pending:\n    while node:\n        pending.append(node)\n        node=child[node][0]\n    node=pending.pop()\n    out.append(node)\n    node=child[node][1]\nprint(*out)'),
    oracle:s=>{const {root,child}=parse(s);const visit=i=>i?[...visit(child[i][0]),i,...visit(child[i][1])]:[];return visit(root).join(" ");},
    hidden:["2 2\n0 0\n1 0\n","3 3\n0 0\n0 0\n2 1\n",[chain,Array.from({length:N},(_,i)=>i+1).join(" ")]],
    clue:"After the last record, lift the copper leaf stamp from the archive hinge.",treasure:"Copper Leaf Stamp",
  },
  {
    title:"The Highest Watch Bough",intro:"A signal lantern must reach the highest occupied level of the tree. Measure the height without confusing depth with node ID.",
    statement:"Find the maximum number of vertices on a path from the root to a leaf. A tree containing only its root has height one.",
    input,output:"One integer, the height measured in vertices.",constraints:limits,
    samples:[[plain,"3","A longest path is 1→2→4, which contains three vertices."],["2 2\n0 0\n0 1\n","2","The root is 2 and its only child is 1."]],
    hints:["The next level consists exactly of children of the current level.","Process nodes breadth-first.","Initialize root depth to one and set child depth to parent depth plus one."],
    editorial:"Traverse breadth-first starting at the root. Assign root depth one and every child depth one more than its parent. A tree has a unique root path for each node, so this assignment counts its path vertices correctly. The deepest node must be a leaf, since a child would be deeper still. Thus the maximum depth is the required height. An explicit queue avoids recursion limits on skewed trees, and null children are never enqueued.",
    time:"O(n)",space:"O(n)",starter:tree,
    reference:refs(tree,
      '    queue<pair<int,int>> q;q.push({root,1});int best=0;\n    while(!q.empty()){auto [v,d]=q.front();q.pop();best=max(best,d);for(int c:child[v])if(c)q.push({c,d+1});}cout<<best;',
      '        ArrayDeque<Integer> q=new ArrayDeque<>();int[] depth=new int[n+1];q.add(root);depth[root]=1;int best=0;\n        while(!q.isEmpty()){int v=q.remove();best=Math.max(best,depth[v]);for(int c:child[v])if(c!=0){depth[c]=depth[v]+1;q.add(c);}}System.out.print(best);',
      'from collections import deque\nq=deque([(root,1)])\nbest=0\nwhile q:\n    v,d=q.popleft()\n    best=max(best,d)\n    q.extend((c,d+1) for c in child[v] if c)\nprint(best)'),
    oracle:s=>{const {root,child}=parse(s);const height=i=>i?1+Math.max(...child[i].map(height)):0;return String(height(root));},
    hidden:["1 1\n0 0\n","3 3\n0 0\n0 0\n2 1\n",[chain,String(N)]],
    clue:"The highest lantern is capped with a gold depth finial.",treasure:"Gold Depth Finial",
  },
  {
    title:"The Key in the Ordered Boughs",intro:"Each bough holds one signed key. The curator guarantees the search-tree order, so the investigator can follow only one branch per comparison.",
    statement:"Find the depth of target K in a valid binary search tree with distinct keys. Depth is the number of edges from root. Print -1 if absent. Every key in a left subtree is less than its parent key, and every key in a right subtree is greater.",
    input:"First line: n root K. Then n lines in ID order containing leftChild rightChild key.",
    output:"The depth of K, or -1.",constraints:limits+" Keys and K are between -10^9 and 10^9 and keys are distinct.",
    samples:[["5 1 9\n2 3 6\n4 0 -3\n0 5 9\n0 0 -7\n0 0 13\n","1","From key 6 go right to key 9, one edge from the root."],["1 1 -5\n0 0 2\n","-1","The only key is 2. Its left link is null."]],
    hints:["Compare the requested key with the current key.","The ordering rule eliminates one entire subtree at each comparison.","Advance the depth whenever following an edge. Stop on equality or null."],
    editorial:"Start at root with depth zero. If its key matches, report the depth. If K is smaller, the current node and its right subtree cannot contain K, so follow only the left link. For larger K use the symmetric right link. At every iteration, a possible match must be in the remaining subtree. Null means no such subtree remains. The search takes O(height), including for a skewed tree, and reading the complete node table takes O(n).",
    time:"O(height) search plus O(n) input",space:"O(n) for records, O(1) auxiliary",starter:bst,
    reference:refs(bst,
      '    int v=root,depth=0;while(v&&key[v]!=target){v=child[v][target>key[v]];depth++;}cout<<(v?depth:-1);',
      '        int v=root,depth=0;while(v!=0&&key[v]!=target){v=child[v][target>key[v]?1:0];depth++;}System.out.print(v==0?-1:depth);',
      'v,depth=root,0\nwhile v and key[v]!=target:\n    v=child[v][int(target>key[v])]\n    depth+=1\nprint(depth if v else -1)'),
    oracle:s=>{const {root,parameter,child}=parse(s,3,3);const q=[[root,0]];for(const [i,d] of q){const [l,r,k]=child[i];if(k===parameter)return String(d);if(l)q.push([l,d+1]);if(r)q.push([r,d+1]);}return "-1";},
    hidden:["1 1 0\n0 0 0\n","3 2 -9\n0 0 -8\n1 3 0\n0 0 8\n",[N+" 1 "+N+"\n"+Array.from({length:N},(_,i)=>"0 "+(i===N-1?0:i+2)+" "+(i+1)).join("\n")+"\n",String(N-1)]],
    clue:"Behind the ordered bough's keyhole lies an obsidian key tag.",treasure:"Obsidian Key Tag",
  },
  {
    title:"The Longest Root Passage",intro:"Two sealed doors lie far apart in the archive. Find the longest possible passage between any pair of nodes.",
    statement:"Compute the maximum number of edges on the unique path between any two nodes. A path may pass through the root but is not required to. A single-node tree has diameter zero.",
    input,output:"One integer, the tree diameter in edges.",constraints:limits,
    samples:[[plain,"3","Path 4→2→1→3 has three edges, and no path is longer."],["1 1\n0 0\n","0","There are no edges."]],
    hints:["Every path has one highest node relative to the root.","At that node, the longest path combines the deepest left and right branches.","Compute child heights before parent heights, treating a null child as height zero."],
    editorial:"Collect a root-first order and process it backward so children precede parents. Let h[v] count vertices in the longest downward chain beginning at v, with h[0]=0. A longest path whose highest node is v can extend h[left] edges into the left child and h[right] into the right. Their sum is achievable and bounds every path with this highest node. Check every node, then set h[v]=1+max(h[left],h[right]). This handles paths inside a subtree and missing children. Use an explicit order to avoid deep call stacks.",
    time:"O(n)",space:"O(n)",starter:tree,
    reference:refs(tree,
      '    vector<int> order{root},h(n+1);for(size_t i=0;i<order.size();i++)for(int c:child[order[i]])if(c)order.push_back(c);\n    int best=0;for(auto it=order.rbegin();it!=order.rend();it++){auto [l,r]=child[*it];best=max(best,h[l]+h[r]);h[*it]=1+max(h[l],h[r]);}cout<<best;',
      '        int[] order=new int[n],h=new int[n+1];order[0]=root;int used=1,best=0;\n        for(int i=0;i<used;i++)for(int c:child[order[i]])if(c!=0)order[used++]=c;\n        for(int i=n-1;i>=0;i--){int v=order[i],l=child[v][0],r=child[v][1];best=Math.max(best,h[l]+h[r]);h[v]=1+Math.max(h[l],h[r]);}System.out.print(best);',
      'order=[root]\nfor v in order:\n    order.extend(c for c in child[v] if c)\nh=[0]*(n+1)\nbest=0\nfor v in reversed(order):\n    l,r=child[v]\n    best=max(best,h[l]+h[r])\n    h[v]=1+max(h[l],h[r])\nprint(best)'),
    oracle:s=>{const {n,child}=parse(s),g=Array.from({length:n+1},()=>[]);for(let v=1;v<=n;v++)for(const c of child[v])if(c){g[c].push(v);g[v].push(c);}let best=0;for(let v=1;v<=n;v++){const q=[[v,0,0]];for(const [u,p,d] of q){best=Math.max(best,d);for(const w of g[u])if(w!==p)q.push([w,u,d+1]);}}return String(best);},
    hidden:["2 2\n0 0\n1 0\n","7 1\n2 0\n3 4\n5 0\n0 6\n7 0\n0 0\n0 0\n",[chain,String(N-1)]],
    clue:"The longest route passes a junction inlaid with a silver span marker.",treasure:"Silver Span Marker",
  },
  {
    title:"The Common Ancestor Ledger",intro:"Pairs of boughs share a guardian in the archive. Find the nearest common guardian for each request without retracing long chains.",
    statement:"For each pair u,v, print their lowest common ancestor: the deepest node that is an ancestor of both. Every node is an ancestor of itself.",
    input:"First line: n root q. Then n lines of leftChild rightChild in ID order. Then q lines of node pairs u v.",
    output:"One lowest common ancestor ID per line, in query order.",constraints:limits+" 1 ≤ q ≤ 20000 and 1 ≤ u,v ≤ n.",
    samples:[["5 1 3\n2 3\n4 5\n0 0\n0 0\n0 0\n4 5\n2 4\n3 5\n","2\n2\n1","Siblings 4 and 5 share parent 2. Node 2 is its own ancestor. The last pair meets at the root."],["1 1 1\n0 0\n1 1\n","1","Both paths consist only of the root."]],
    hints:["Align the two nodes' depths before comparing ancestors.","Precompute the ancestor at every power-of-two distance for each node.","From the largest jump down, lift both nodes only when their jumped ancestors differ. Then their parents agree."],
    editorial:"Traverse the tree to get depths and immediate parents, treating the root as its own parent. Set jump[k][v]=jump[k-1][jump[k-1][v]] so it moves 2^k edges upward. For a query, lift the deeper node by the depth difference using its binary digits. If the nodes coincide, that node is the lowest common ancestor. Otherwise try jumps from largest to smallest, applying both only when the resulting nodes differ. Such a jump stays below the meeting point. After these jumps the nodes are distinct but share their immediate parent, which is their first common ancestor. The table covers every depth difference, and root self-links make oversized jumps safe.",
    time:"O((n+q) log n)",space:"O(n log n)",starter:lca,
    reference:refs(lca,
      '    int log=1;while((1<<log)<=n)log++;vector<vector<int>> jump(log,vector<int>(n+1));vector<int> depth(n+1),order{root};jump[0][root]=root;\n    for(size_t i=0;i<order.size();i++)for(int c:child[order[i]])if(c){jump[0][c]=order[i];depth[c]=depth[order[i]]+1;order.push_back(c);}\n    for(int k=1;k<log;k++)for(int v=1;v<=n;v++)jump[k][v]=jump[k-1][jump[k-1][v]];\n    while(queries--){int u,v;cin>>u>>v;if(depth[u]<depth[v])swap(u,v);int diff=depth[u]-depth[v];for(int k=0;k<log;k++)if(diff&(1<<k))u=jump[k][u];if(u!=v){for(int k=log-1;k>=0;k--)if(jump[k][u]!=jump[k][v]){u=jump[k][u];v=jump[k][v];}u=jump[0][u];}cout<<u<<"\\n";}',
      '        int log=1;while((1<<log)<=n)log++;int[][] jump=new int[log][n+1];int[] depth=new int[n+1],order=new int[n];order[0]=root;jump[0][root]=root;int used=1;\n        for(int i=0;i<used;i++)for(int c:child[order[i]])if(c!=0){jump[0][c]=order[i];depth[c]=depth[order[i]]+1;order[used++]=c;}\n        for(int k=1;k<log;k++)for(int v=1;v<=n;v++)jump[k][v]=jump[k-1][jump[k-1][v]];\n        StringBuilder out=new StringBuilder();while(queries-->0){int u=in.nextInt(),v=in.nextInt();if(depth[u]<depth[v]){int t=u;u=v;v=t;}int diff=depth[u]-depth[v];for(int k=0;k<log;k++)if((diff&(1<<k))!=0)u=jump[k][u];if(u!=v){for(int k=log-1;k>=0;k--)if(jump[k][u]!=jump[k][v]){u=jump[k][u];v=jump[k][v];}u=jump[0][u];}out.append(u).append("\\n");}System.out.print(out);',
      'parent=[0]*(n+1)\nparent[root]=root\ndepth=[0]*(n+1)\norder=[root]\nfor v in order:\n    for c in child[v]:\n        if c:\n            parent[c]=v\n            depth[c]=depth[v]+1\n            order.append(c)\njump=[parent]\nfor _ in range(1,n.bit_length()):\n    prev=jump[-1]\n    jump.append([prev[p] for p in prev])\nout=[]\nfor _ in range(queries):\n    u,v=next(tokens),next(tokens)\n    if depth[u]<depth[v]:\n        u,v=v,u\n    diff=depth[u]-depth[v]\n    for k,row in enumerate(jump):\n        if diff&(1<<k):\n            u=row[u]\n    if u!=v:\n        for row in reversed(jump):\n            if row[u]!=row[v]:\n                u,v=row[u],row[v]\n        u=parent[u]\n    out.append(str(u))\nprint("\\n".join(out))'),
    oracle:s=>{const {n,child,extra}=parse(s,3),parent=Array(n+1).fill(0),out=[];for(let v=1;v<=n;v++)for(const c of child[v])if(c)parent[c]=v;for(let i=0;i<extra.length;i+=2){let u=extra[i],v=extra[i+1];const seen=new Set();while(u){seen.add(u);u=parent[u];}while(!seen.has(v))v=parent[v];out.push(v);}return out.join("\n");},
    hidden:["2 2 2\n0 0\n1 0\n1 2\n1 1\n","4 3 3\n2 0\n0 0\n1 4\n0 0\n2 4\n1 2\n4 4\n",[N+" 1 "+N+"\n"+line+"10000 20000\n".repeat(N),Array(N).fill(10000).join("\n")]],
    clue:"Where the two boughs first meet, the guardian has hidden the root-crown clasp.",treasure:"Root-Crown Clasp",
  },
]);
