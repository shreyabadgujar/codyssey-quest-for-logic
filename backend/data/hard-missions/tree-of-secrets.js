const {build,line,repeat,range}=require("./build");
const chain=n=>line(range(n-1));
module.exports=build("tree-of-secrets",[
{
title:"The Wandering Root",treasure:"Wandering Root Dial",
intro:"The living archive can move its entrance to any bough. Find the entrance that minimizes total travel through its weighted branches.",
statement:"Given an undirected weighted tree, choose a node minimizing the sum of distances to all nodes. Break ties by choosing the smallest ID.",
input:"n, then n-1 lines u v w for edges of weight w.",output:"The selected node and its minimum distance sum.",
constraints:"1 ≤ n ≤ 35000. IDs are 1..n. 0 ≤ w ≤ 10^9.",
samples:[["4\n1 2 5\n2 3 1\n3 4 9\n","2 16","Nodes 2 and 3 each have sum 16; node 2 has the smaller ID."],["3\n1 2 0\n2 3 9\n","1 9","The zero-weight branch makes nodes 1 and 2 equivalent."]],
hidden:[["1\n","1 0"],["3\n2 1 1000000000\n3 2 1000000000\n","2 2000000000"],["35000\n"+range(34999).map(i=>i+" "+(i+1)+" 1\n").join(""),"17500 306250000"]],
hints:["Compute the sum at one root first.","Crossing an edge makes one component nearer and the other farther.","Use subtree sizes to express the change as w times (n minus twice the child size)."],
editorial:"Root the tree at 1 and obtain a parent-before-child traversal. Sum distances from 1 and aggregate subtree sizes in reverse order. Moving the entrance over an edge of weight w toward a child makes its s subtree nodes w closer and the other n-s nodes w farther. Add (n-2s)w to obtain the child's sum. Repeat in traversal order, then scan IDs in order for the minimum. The traversal uses explicit storage so a long chain is safe.",
time:"O(n)",space:"O(n)",
cpp:String.raw`int n;cin>>n;vector<vector<pair<int,int>>>g(n+1);for(int i=1,u,v,w;i<n;i++){cin>>u>>v>>w;g[u].push_back({v,w});g[v].push_back({u,w});}vector<int>p(n+1),w(n+1),sz(n+1,1),a{1};vector<long long>d(n+1);long long total=0;for(int i=0;i<(int)a.size();i++){int u=a[i];for(auto [v,c]:g[u])if(v!=p[u]){p[v]=u;w[v]=c;d[v]=d[u]+c;total+=d[v];a.push_back(v);}}for(int i=n-1;i>0;i--)sz[p[a[i]]]+=sz[a[i]];d[1]=total;for(int i=1;i<n;i++){int u=a[i];d[u]=d[p[u]]+1LL*(n-2*sz[u])*w[u];}int best=1;for(int u=2;u<=n;u++)if(d[u]<d[best])best=u;cout<<best<<' '<<d[best];`,
java:String.raw`int n=integer();ArrayList<int[]>[] g=new ArrayList[n+1];for(int i=1;i<=n;i++)g[i]=new ArrayList<>();for(int i=1;i<n;i++){int u=integer(),v=integer(),w=integer();g[u].add(new int[]{v,w});g[v].add(new int[]{u,w});}int[] p=new int[n+1],w=new int[n+1],sz=new int[n+1],a=new int[n];long[] d=new long[n+1];Arrays.fill(sz,1);long total=0;a[0]=1;int k=1;for(int i=0;i<k;i++){int u=a[i];for(int[] e:g[u])if(e[0]!=p[u]){int v=e[0];p[v]=u;w[v]=e[1];d[v]=d[u]+w[v];total+=d[v];a[k++]=v;}}for(int i=n-1;i>0;i--)sz[p[a[i]]]+=sz[a[i]];d[1]=total;for(int i=1;i<n;i++){int u=a[i];d[u]=d[p[u]]+(long)(n-2*sz[u])*w[u];}int best=1;for(int u=2;u<=n;u++)if(d[u]<d[best])best=u;System.out.print(best+" "+d[best]);`,
py:`n=I()
g=[[] for _ in range(n+1)]
for _ in range(n-1):
    u,v,w=I(),I(),I()
    g[u].append((v,w))
    g[v].append((u,w))
p=[0]*(n+1)
weight=p.copy()
d=p.copy()
order=[1]
for u in order:
    for v,w in g[u]:
        if v!=p[u]:
            p[v]=u
            weight[v]=w
            d[v]=d[u]+w
            order.append(v)
size=[1]*(n+1)
for u in reversed(order[1:]):
    size[p[u]]+=size[u]
d[1]=sum(d)
for u in order[1:]:
    d[u]=d[p[u]]+(n-2*size[u])*weight[u]
best=min(range(1,n+1),key=d.__getitem__)
print(best,d[best])`,
},
{
title:"The Ancestor Debt",treasure:"Signed Sap Ledger",
intro:"Every bough records a debt or a credit. The forester needs to count all straight downward trails that reconcile to a sealed balance.",
statement:"Count nonempty paths that start at a node and end at that node or one of its descendants, with node-value sum equal to K. Paths cannot go upward or jump branches.",
input:"n K, then n signed node values, then parents of nodes 2 through n. Node 1 is the root.",
output:"The number of qualifying downward paths.",
constraints:"1 ≤ n ≤ 50000. A parent ID is smaller than its child ID. Absolute node values are at most 10^9. |K| ≤ 10^14.",
samples:[["5 0\n1 -1 1 0 -1\n1 1 2 3\n","4","Valid paths are 1→2, 1→2→4, 4 alone, and 3→5."],["4 2\n2 2 2 -2\n1 2 1\n","3","Only the three singleton nodes with value 2 qualify."]],
hidden:[["1 0\n0\n","1"],["3 3000000000\n1000000000 1000000000 1000000000\n1 2\n","1"],["50000 0\n"+line(repeat(50000,0))+chain(50000),"1250025000"]],
hints:["Write the sum ending at u using the root prefix.","Only prefixes on the active ancestor chain are eligible.","Increment on entry and decrement on exit; query before inserting the current prefix."],
editorial:"Let P(u) be the root-to-u sum. A downward path ending at u has sum K precisely when the prefix immediately before its start is P(u)-K. During DFS keep counts of only active ancestor prefixes, with a virtual prefix zero above the root. Query before adding P(u) so empty paths are excluded. Remove it on exit so unrelated branches never contribute. An explicit event stack handles deep trees.",
time:"O(n) expected with hashing",space:"O(n)",
cpp:String.raw`int n;long long k;cin>>n>>k;vector<long long>a(n+1),s(n+1);for(int i=1;i<=n;i++)cin>>a[i];vector<vector<int>>g(n+1);for(int i=2,p;i<=n;i++){cin>>p;g[p].push_back(i);s[i]=0;}unordered_map<long long,int> f;f.reserve(2*n);f[0]=1;vector<int> st{1};s[1]=a[1];long long ans=0;while(!st.empty()){int u=st.back();st.pop_back();if(u<0){if(--f[s[-u]]==0)f.erase(s[-u]);continue;}auto it=f.find(s[u]-k);if(it!=f.end())ans+=it->second;f[s[u]]++;st.push_back(-u);for(int v:g[u]){s[v]=s[u]+a[v];st.push_back(v);}}cout<<ans;`,
java:String.raw`int n=integer();long k=num();long[] a=new long[n+1],s=new long[n+1];for(int i=1;i<=n;i++)a[i]=num();int[] head=new int[n+1],next=new int[n+1];for(int i=2;i<=n;i++){int p=integer();next[i]=head[p];head[p]=i;}HashMap<Long,Integer> f=new HashMap<>();f.put(0L,1);int[] st=new int[2*n];int top=0;st[top++]=1;s[1]=a[1];long ans=0;while(top>0){int u=st[--top];if(u<0){long v=s[-u];int c=f.get(v);if(c==1)f.remove(v);else f.put(v,c-1);continue;}ans+=f.getOrDefault(s[u]-k,0);f.merge(s[u],1,Integer::sum);st[top++]=-u;for(int v=head[u];v!=0;v=next[v]){s[v]=s[u]+a[v];st[top++]=v;}}System.out.print(ans);`,
py:`n,k=I(),I()
a=[0]+[I() for _ in range(n)]
g=[[] for _ in a]
for u in range(2,n+1):
    g[I()].append(u)
s=[0]*(n+1)
s[1]=a[1]
f={0:1}
st=[1]
ans=0
while st:
    u=st.pop()
    if u<0:
        v=s[-u]
        f[v]-=1
        if not f[v]:
            del f[v]
    else:
        v=s[u]
        ans+=f.get(v-k,0)
        f[v]=f.get(v,0)+1
        st.append(-u)
        for child in g[u]:
            s[child]=v+a[child]
            st.append(child)
print(ans)`,
},
{
title:"The Many-Coloured Canopy",treasure:"Canopy Colour Census",
intro:"Forgers reused the same pigment on different boughs. Each subtree owes one tribute per distinct colour, regardless of repetition.",
statement:"For every node, count the distinct colours in its rooted subtree, including the node itself. Output the sum of these counts over all nodes.",
input:"n, then n colour IDs, then parents of nodes 2 through n. Node 1 is the root.",output:"The sum of all distinct-colour counts.",
constraints:"1 ≤ n ≤ 50000. A parent ID is smaller than its child ID. Colour IDs are in [-10^9,10^9].",
samples:[["5\n3 3 4 4 5\n1 1 2 2\n","9","The root and node 2 each see three colours. The remaining nodes are leaves."],["4\n1 1 1 1\n1 2 3\n","4","Each of the four subtrees contains exactly one colour."]],
hidden:[["1\n-1000000000\n","1"],["4\n1 2 1 2\n1 2 3\n","7"],["50000\n"+line(range(50000))+chain(50000),"1250025000"]],
hints:["A DFS preorder places each subtree on one contiguous interval.","Process those intervals from right to left by their starting index.","Keep only the first occurrence of each colour in the current suffix and sum marks with a Fenwick tree."],
editorial:"Find a preorder of the tree and compute each subtree size by adding children in reverse ID order. The subtree starting at preorder index i is the next size nodes. Sweep indices backward, retaining one Fenwick mark for the first occurrence of each colour in the current suffix. Moving a colour's mark left removes its older representative. A colour occurs inside a subtree interval exactly when its current representative lies before the interval ends. Sum its Fenwick range count into the answer.",
time:"O(n log n)",space:"O(n)",
cpp:String.raw`int n;cin>>n;vector<int> c(n+1),p(n+1),sz(n+1,1),f(n+1);vector<vector<int>>g(n+1);for(int i=1;i<=n;i++)cin>>c[i];for(int i=2;i<=n;i++){cin>>p[i];g[p[i]].push_back(i);}for(int i=n;i>1;i--)sz[p[i]]+=sz[i];vector<int> a,st{1};while(!st.empty()){int u=st.back();st.pop_back();a.push_back(u);for(int v:g[u])st.push_back(v);}auto upd=[&](int i,int v){for(;i<=n;i+=i&-i)f[i]+=v;};auto sum=[&](int i){int s=0;for(;i;i-=i&-i)s+=f[i];return s;};unordered_map<int,int> last;long long ans=0;for(int i=n;i;i--){int u=a[i-1],v=c[u];if(last[v])upd(last[v],-1);last[v]=i;upd(i,1);ans+=sum(i+sz[u]-1);}cout<<ans;`,
java:String.raw`int n=integer();int[] c=new int[n+1],p=new int[n+1],sz=new int[n+1],head=new int[n+1],next=new int[n+1],f=new int[n+1],a=new int[n],st=new int[n];Arrays.fill(sz,1);for(int i=1;i<=n;i++)c[i]=integer();for(int i=2;i<=n;i++){p[i]=integer();next[i]=head[p[i]];head[p[i]]=i;}for(int i=n;i>1;i--)sz[p[i]]+=sz[i];int top=0,k=0;st[top++]=1;while(top>0){int u=st[--top];a[k++]=u;for(int v=head[u];v!=0;v=next[v])st[top++]=v;}HashMap<Integer,Integer> last=new HashMap<>();long ans=0;for(int i=n;i>0;i--){int u=a[i-1];Integer old=last.put(c[u],i);if(old!=null)for(int j=old;j<=n;j+=j&-j)f[j]--;for(int j=i;j<=n;j+=j&-j)f[j]++;for(int j=i+sz[u]-1;j>0;j-=j&-j)ans+=f[j];}System.out.print(ans);`,
py:`n=I()
c=[0]+[I() for _ in range(n)]
p=[0,0]+[I() for _ in range(n-1)]
g=[[] for _ in c]
sz=[1]*(n+1)
for u in range(n,1,-1):
    sz[p[u]]+=sz[u]
    g[p[u]].append(u)
a=[]
st=[1]
while st:
    u=st.pop()
    a.append(u)
    st.extend(g[u])
f=[0]*(n+1)
def add(i,v):
    while i<=n:
        f[i]+=v
        i+=i&-i
last={}
ans=0
for i in range(n,0,-1):
    u=a[i-1]
    colour=c[u]
    if colour in last:
        add(last[colour],-1)
    add(i,1)
    last[colour]=i
    j=i+sz[u]-1
    while j:
        ans+=f[j]
        j-=j&-j
print(ans)`,
}
]);
