const {build,line,repeat,range}=require("./build");
const chain=(n,w="")=>range(n-1).map(u=>u+" "+(u+1)+w+"\n").join("");
module.exports=build("graphbound-kingdom",[
{
title:"The Forged Toll Pass",treasure:"Half-Toll Signet",
intro:"A seized toll pass grants one half-price crossing. Spending it at the most expensive bridge on an ordinary shortest route can send the courier the wrong way.",
statement:"Find the minimum cost of a directed route from 1 to n. You may pay floor(w/2) instead of w on at most one traversed edge.",
input:"n m, followed by m lines u v w for directed roads.",output:"The minimum cost, or -1 if unreachable.",
constraints:"1 ≤ n ≤ 35000. 0 ≤ m ≤ 50000. 0 ≤ w ≤ 10^9. Parallel roads are allowed.",
samples:[["4 4\n1 2 5\n2 4 5\n1 3 1\n3 4 10\n","6","The undiscounted best costs 10 via node 2, but spending the pass on 3→4 gives 6."],["3 1\n1 2 0\n","-1","Node 3 cannot be reached."]],
hidden:[["1 0\n","0"],["2 2\n1 2 7\n1 2 5\n","2"],["35000 34999\n"+chain(35000," 1000000000"),"34998500000000"]],
hints:["The same citadel reached with and without the pass is a different state.","Each original edge has normal transitions and may also consume the pass.","All expanded edge costs are nonnegative, so Dijkstra applies."],
editorial:"Duplicate each vertex into states for an unused and a spent pass. An edge normally preserves the flag. From an unused state there is also a floor(w/2) edge to the spent state. Paths in this graph encode exactly the allowed routes and costs. Dijkstra from (1, unused) gives the two distances to n; take the smaller or report unreachable.",
time:"O((n+m) log(n+m))",space:"O(n+m)",
cpp:String.raw`int n,m;cin>>n>>m;vector<vector<pair<int,int>>>g(n+1);while(m--){int u,v,w;cin>>u>>v>>w;g[u].push_back({v,w});}const long long inf=LLONG_MAX/4;vector<long long>d(2*n+2,inf);using P=pair<long long,int>;priority_queue<P,vector<P>,greater<P>>q;d[2]=0;q.push({0,2});while(!q.empty()){auto [cost,s]=q.top();q.pop();if(d[s]!=cost)continue;int u=s/2,b=s%2;for(auto [v,w]:g[u]){auto put=[&](int k,long long c){if(c<d[k]){d[k]=c;q.push({c,k});}};put(2*v+b,cost+w);if(!b)put(2*v+1,cost+w/2);}}long long ans=min(d[2*n],d[2*n+1]);cout<<(ans==inf?-1:ans);`,
java:String.raw`int n=integer(),m=integer();ArrayList<int[]>[] g=new ArrayList[n+1];for(int i=1;i<=n;i++)g[i]=new ArrayList<>();while(m-->0){int u=integer(),v=integer(),w=integer();g[u].add(new int[]{v,w});}long[] d=new long[2*n+2];Arrays.fill(d,Long.MAX_VALUE);d[2]=0;PriorityQueue<long[]> q=new PriorityQueue<>(Comparator.comparingLong(a->a[0]));q.add(new long[]{0,2});while(!q.isEmpty()){long[] e=q.remove();long c=e[0];int s=(int)e[1];if(d[s]!=c)continue;int b=s%2;for(int[] t:g[s/2]){int v=2*t[0]+b;long z=c+t[1];if(z<d[v]){d[v]=z;q.add(new long[]{z,v});}if(b==0){z=c+t[1]/2;if(z<d[v+1]){d[v+1]=z;q.add(new long[]{z,v+1});}}}}long a=Math.min(d[2*n],d[2*n+1]);System.out.print(a==Long.MAX_VALUE?-1:a);`,
py:`from heapq import heappop,heappush
n,m=I(),I()
g=[[] for _ in range(n+1)]
for _ in range(m):
    u,v,w=I(),I(),I()
    g[u].append((v,w))
inf=10**30
d=[inf]*(2*n+2)
d[2]=0
q=[(0,2)]
while q:
    c,s=heappop(q)
    if d[s]!=c:
        continue
    b=s%2
    for v,w in g[s//2]:
        k=2*v+b
        z=c+w
        if z<d[k]:
            d[k]=z
            heappush(q,(z,k))
        if not b:
            z=c+w//2
            if z<d[k+1]:
                d[k+1]=z
                heappush(q,(z,k+1))
ans=min(d[2*n:2*n+2])
print(ans if ans<inf else -1)`,
},
{
title:"The Falling Bridges",treasure:"Bridge Ledger Rivet",
intro:"The enemy destroys bridges one at a time. Recover how many isolated regions existed after every strike.",
statement:"Remove the specified undirected edges in order and count the connected components after each removal. Edges are identified by their 1-based input index. Parallel edges can be removed independently.",
input:"n m q, then m lines u v, then q distinct edge indices.",output:"q component counts in removal order, separated by spaces.",
constraints:"1 ≤ n ≤ 35000. 1 ≤ q ≤ m ≤ 35000. Self-loops and parallel edges are allowed.",
samples:[["4 4 3\n1 2\n2 3\n3 1\n3 4\n2 4 1\n","1 2 3","The triangle survives the first strike. The second isolates 4, and the third isolates 2."],["3 2 2\n1 2\n1 2\n1 2\n","2 3","The first removal leaves a parallel bridge and isolated node 3."]],
hidden:[["1 1 1\n1 1\n1\n","1"],["4 2 1\n1 2\n3 4\n2\n","3"],["30000 29999 29999\n"+chain(30000)+line(range(29999)),line(range(29999,2)).trim()]],
hints:["Deleting edges is hard for a standard DSU.","Look at the graph after all removals first.","Record the component count just before undoing each deletion in reverse order."],
editorial:"Mark removed edge IDs and build a union-find on the edges that survive all removals. Undo removals in reverse order, recording the component count before restoring each edge. At this instant the graph is exactly the graph after that forward removal. A union decreases the count only when distinct components merge. Path compression and union by size bound the work.",
time:"O(n + (m+q) α(n))",space:"O(n+m+q)",
cpp:String.raw`int n,m,q;cin>>n>>m>>q;vector<pair<int,int>>e(m+1);for(int i=1;i<=m;i++)cin>>e[i].first>>e[i].second;vector<int>a(q),p(n+1,-1),ans(q);vector<char> gone(m+1);for(int&x:a){cin>>x;gone[x]=1;}auto find=[&](int x){while(p[x]>=0){if(p[p[x]]>=0)p[x]=p[p[x]];x=p[x];}return x;};auto join=[&](int i){auto [u,v]=e[i];u=find(u);v=find(v);if(u==v)return;if(p[u]>p[v])swap(u,v);p[u]+=p[v];p[v]=u;n--;};for(int i=1;i<=m;i++)if(!gone[i])join(i);for(int i=q-1;i>=0;i--){ans[i]=n;join(a[i]);}for(int i=0;i<q;i++)cout<<(i?" ":"")<<ans[i];`,
java:String.raw`int n=integer(),m=integer(),q=integer();int[] u=new int[m+1],v=new int[m+1],a=new int[q],ans=new int[q],p=new int[n+1];Arrays.fill(p,-1);for(int i=1;i<=m;i++){u[i]=integer();v[i]=integer();}boolean[] gone=new boolean[m+1];for(int i=0;i<q;i++){a[i]=integer();gone[a[i]]=true;}class Dsu{int count;Dsu(int n){count=n;}int find(int x){while(p[x]>=0){if(p[p[x]]>=0)p[x]=p[p[x]];x=p[x];}return x;}void join(int i){int x=find(u[i]),y=find(v[i]);if(x==y)return;if(p[x]>p[y]){int z=x;x=y;y=z;}p[x]+=p[y];p[y]=x;count--;}}Dsu ds=new Dsu(n);for(int i=1;i<=m;i++)if(!gone[i])ds.join(i);for(int i=q-1;i>=0;i--){ans[i]=ds.count;ds.join(a[i]);}StringJoiner out=new StringJoiner(" ");for(int x:ans)out.add(""+x);System.out.print(out);`,
py:`n,m,q=I(),I(),I()
e=[None]+[(I(),I()) for _ in range(m)]
a=[I() for _ in range(q)]
gone=set(a)
p=[-1]*(n+1)
def find(x):
    while p[x]>=0:
        if p[p[x]]>=0:
            p[x]=p[p[x]]
        x=p[x]
    return x
def join(edge):
    x,y=map(find,e[edge])
    if x==y:
        return 0
    if p[x]>p[y]:
        x,y=y,x
    p[x]+=p[y]
    p[y]=x
    return 1
for i in range(1,m+1):
    if i not in gone:
        n-=join(i)
out=[]
for i in reversed(a):
    out.append(str(n))
    n-=join(i)
print(' '.join(reversed(out)))`,
},
{
title:"The Crown of Circuits",treasure:"Circuit Crown Fragment",
intro:"A courier may revisit citadels but can claim each cache only once. Plan the richest possible route from the entry gate to the crown.",
statement:"In a directed graph with nonnegative vertex values, maximize the sum of values of distinct vertices on a walk from 1 to n. You may revisit vertices and edges and may pass through n before stopping there.",
input:"n m, then n values, then m lines u v.",output:"The maximum collectible value, or -1 if no such walk exists.",
constraints:"1 ≤ n ≤ 35000. 0 ≤ m ≤ 50000. 0 ≤ value ≤ 10^9.",
samples:[["5 6\n2 5 7 9 1\n1 2\n2 3\n3 2\n3 5\n1 4\n4 5\n","15","Collect both values in the 2–3 circuit, then continue to 5."],["3 2\n8 6 2\n1 2\n2 1\n","-1","The profitable circuit cannot reach the crown."]],
hidden:[["1 0\n0\n","0"],["3 3\n4 7 9\n1 3\n3 2\n2 3\n","20"],["35000 35000\n"+line(repeat(35000,1000000000))+chain(35000)+"35000 1\n","35000000000000"]],
hints:["Inside a strongly connected component you can claim every cache before exiting.","Contract each strongly connected component to a single vertex.","Run maximum-sum path DP on the resulting DAG, starting at the component of 1."],
editorial:"Find SCCs by iterative Kosaraju. Inside a component, reach every vertex and then any required exit, so each component contributes its full nonnegative sum. The condensation is acyclic; leaving a component cannot allow a return. Kosaraju's transpose pass assigns components in topological order. Propagate maximum reachable sums along inter-component edges in that order, then read the target. Repeated edges just repeat a maximum update.",
time:"O(n+m)",space:"O(n+m)",
cpp:String.raw`int n,m;cin>>n>>m;vector<long long>w(n);for(auto&x:w)cin>>x;vector<vector<int>>g(n),r(n);while(m--){int u,v;cin>>u>>v;u--;v--;g[u].push_back(v);r[v].push_back(u);}vector<int> seen(n),order,st;for(int s=0;s<n;s++)if(!seen[s]){vector<pair<int,int>> stack{{s,0}};seen[s]=1;while(!stack.empty()){auto&[u,i]=stack.back();if(i==(int)g[u].size()){order.push_back(u);stack.pop_back();}else{int v=g[u][i++];if(!seen[v]){seen[v]=1;stack.push_back({v,0});}}}}vector<int> c(n,-1);vector<vector<int>> group;vector<long long> sum;reverse(order.begin(),order.end());for(int s:order)if(c[s]<0){int k=group.size();group.emplace_back();sum.push_back(0);st={s};c[s]=k;while(!st.empty()){int u=st.back();st.pop_back();group[k].push_back(u);sum[k]+=w[u];for(int v:r[u])if(c[v]<0){c[v]=k;st.push_back(v);}}}vector<long long> d(sum.size(),-1);d[c[0]]=sum[c[0]];for(int k=0;k<(int)sum.size();k++)if(d[k]>=0)for(int u:group[k])for(int v:g[u])if(c[v]!=k)d[c[v]]=max(d[c[v]],d[k]+sum[c[v]]);cout<<d[c[n-1]];`,
java:String.raw`int n=integer(),m=integer();long[] w=new long[n],sum=new long[n],d=new long[n];for(int i=0;i<n;i++)w[i]=num();ArrayList<Integer>[] g=new ArrayList[n],r=new ArrayList[n];for(int i=0;i<n;i++){g[i]=new ArrayList<>();r[i]=new ArrayList<>();}while(m-->0){int u=integer()-1,v=integer()-1;g[u].add(v);r[v].add(u);}int[] it=new int[n],order=new int[n],st=new int[n],c=new int[n],head=new int[n],next=new int[n];Arrays.fill(c,-1);Arrays.fill(head,-1);boolean[] seen=new boolean[n];int done=0;for(int s=0;s<n;s++)if(!seen[s]){int top=0;st[top++]=s;seen[s]=true;while(top>0){int u=st[top-1];if(it[u]==g[u].size()){order[done++]=u;top--;}else{int v=g[u].get(it[u]++);if(!seen[v]){seen[v]=true;st[top++]=v;}}}}int k=0;for(int j=n-1;j>=0;j--){int s=order[j];if(c[s]>=0)continue;int top=0;st[top++]=s;c[s]=k;while(top>0){int u=st[--top];next[u]=head[k];head[k]=u;sum[k]+=w[u];for(int v:r[u])if(c[v]<0){c[v]=k;st[top++]=v;}}k++;}Arrays.fill(d,-1);d[c[0]]=sum[c[0]];for(int i=0;i<k;i++)if(d[i]>=0)for(int u=head[i];u>=0;u=next[u])for(int v:g[u])if(c[v]!=i)d[c[v]]=Math.max(d[c[v]],d[i]+sum[c[v]]);System.out.print(d[c[n-1]]);`,
py:`n,m=I(),I()
w=[I() for _ in range(n)]
g=[[] for _ in w]
r=[[] for _ in w]
for _ in range(m):
    u,v=I()-1,I()-1
    g[u].append(v)
    r[v].append(u)
seen=bytearray(n)
idx=[0]*n
order=[]
for s in range(n):
    if seen[s]:
        continue
    seen[s]=1
    st=[s]
    while st:
        u=st[-1]
        i=idx[u]
        if i==len(g[u]):
            order.append(st.pop())
        else:
            idx[u]+=1
            v=g[u][i]
            if not seen[v]:
                seen[v]=1
                st.append(v)
c=[-1]*n
groups=[]
sums=[]
for s in reversed(order):
    if c[s]>=0:
        continue
    k=len(groups)
    c[s]=k
    st=[s]
    group=[]
    total=0
    while st:
        u=st.pop()
        group.append(u)
        total+=w[u]
        for v in r[u]:
            if c[v]<0:
                c[v]=k
                st.append(v)
    groups.append(group)
    sums.append(total)
d=[-1]*len(groups)
d[c[0]]=sums[c[0]]
for k,group in enumerate(groups):
    if d[k]>=0:
        for u in group:
            for v in g[u]:
                j=c[v]
                if j!=k:
                    d[j]=max(d[j],d[k]+sums[j])
print(d[c[-1]])`,
}
]);
