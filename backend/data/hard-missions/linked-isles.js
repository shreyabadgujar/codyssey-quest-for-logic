const {build,line,repeat,range}=require("./build");
const size=40000;
module.exports=build("linked-isles",[
{
title:"The Broken Convoy Refit", treasure:"Split Mooring Ring",
intro:"A smuggler relinked the buoy registry. The dockmaster's signed work orders say which stretches of the convoy should face upstream.",
statement:"The registry describes one singly linked list of all n IDs. Starting at head, partition the list into k consecutive blocks of lengths |b_i|. Reverse the links within blocks with negative b_i. Join the resulting blocks in reverse block order, keeping each block's chosen orientation. Print IDs from the new head.",
input:"n k head, then n successors for IDs 1 through n (0 ends the list), then k signed block lengths.",
output:"The resulting n IDs separated by spaces.",
constraints:"1 ≤ k ≤ n ≤ 40000. The list contains every ID exactly once. All block lengths are nonzero and their absolute values sum to n.",
samples:[["6 3 3\n5 0 1 6 4 2\n2 -3 1\n","2 6 4 5 3 1","The original blocks are [3,1], [5,4,6], [2]. The middle block reverses before the blocks are joined back to front."],["4 2 1\n2 3 4 0\n-2 -2\n","4 3 2 1","Both internal orders and the block order reverse, producing the reverse of the whole list."]],
hidden:[["1 1 1\n0\n-1\n","1"],["5 2 5\n0 1 2 3 4\n-4 1\n","1 2 3 4 5"],["40000 2 1\n"+line([...range(size-1,2),0])+"-20000 20000\n",line([...range(20000,20001),...range(20000).reverse()]).trim()]],
hints:["Registry order is unrelated to list order.","Process a block before touching the rest of the original chain.","Prepend the processed block to the already rebuilt chain, taking care to save each original successor."],
editorial:"Consume the original chain once. When a block should reverse, save each node's original successor before redirecting it to the partial reversed block. The first consumed node is then the block tail. For a positive block keep its links and remember its last node. In either case connect that tail to the previously rebuilt head and adopt the new block head. After processing i blocks this invariant gives blocks i through 1 with precisely the required orientations. Traversing the rebuilt chain prints the answer.",
time:"O(n)",space:"O(n) for the link table, O(1) auxiliary excluding output",
cpp: String.raw`int n,k,h;cin>>n>>k>>h;vector<int>a(n+1);for(int i=1;i<=n;i++)cin>>a[i];int out=0;
while(k--){int b;cin>>b;int first=h,last=h,r=0;for(int j=0;j<abs(b);j++){int nx=a[h];last=h;if(b<0){a[h]=r;r=h;}h=nx;}if(b<0){a[first]=out;out=r;}else{a[last]=out;out=first;}}
while(out){cout<<out;out=a[out];if(out)cout<<' ';}`,
java: String.raw`int n=integer(),k=integer(),h=integer(),out=0;int[] a=new int[n+1];for(int i=1;i<=n;i++)a[i]=integer();
while(k-->0){int b=integer(),first=h,last=h,r=0;for(int j=0;j<Math.abs(b);j++){int nx=a[h];last=h;if(b<0){a[h]=r;r=h;}h=nx;}if(b<0){a[first]=out;out=r;}else{a[last]=out;out=first;}}
StringBuilder s=new StringBuilder();while(out!=0){s.append(out);out=a[out];if(out!=0)s.append(' ');}System.out.print(s);`,
py:`n,k,h=I(),I(),I()
a=[0]+[I() for _ in range(n)]
out=0
for _ in range(k):
    b=I()
    first=last=h
    rev=0
    for j in range(abs(b)):
        nxt=a[h]
        last=h
        if b<0:
            a[h]=rev
            rev=h
        h=nxt
    if b<0:
        a[first]=out
        out=rev
    else:
        a[last]=out
        out=first
result=[]
while out:
    result.append(str(out))
    out=a[out]
print(' '.join(result))`,
},
{
title:"The Two Lantern Trails",treasure:"Twin Wick Compass",
intro:"Two watchmen vanished along directed plank routes. Their reports may have ended at a dead end or looped forever.",
statement:"From each of two heads, repeatedly follow the successor until it is zero or a node has already been visited on that walk. Among IDs reached by both walks, find the minimum sum of their first-visit distances. Break ties by smaller ID.",
input:"n a b, then n successors for IDs 1 through n. Heads a and b are in 1..n. Successor 0 means stop.",
output:"The winning ID and the two first-visit distances, or -1 if no ID is shared.",
constraints:"1 ≤ n ≤ 40000. Successors lie in 0..n. Any number of cycles or disconnected components is allowed.",
samples:[["5 1 4\n2 3 4 5 2\n","2 1 2","IDs 2 and 4 both give total distance 3, so the smaller ID wins."],["4 1 3\n2 1 4 0\n","-1","The first walk stays in the 1–2 cycle and the second ends after 4."]],
hidden:[["1 1 1\n1\n","1 0 0"],["5 1 4\n2 3 0 5 3\n","3 2 2"],["40000 1 20000\n"+line([...range(size-1,2),1]),"20000 19999 0"]],
hints:["Stopping at a repeated node does not lose any first-visit distances.","The two walks need not enter a shared cycle at the same place.","Store one distance table per head and compare every shared ID."],
editorial:"Record the first distance from each head while advancing along successors. Each successor is deterministic, so after a repeat the entire future stays within already recorded nodes. Every candidate is exactly an ID with both distances defined. Scanning IDs in ascending order and replacing the winner only on a smaller sum implements the tie rule.",
time:"O(n)",space:"O(n)",
cpp: String.raw`int n,a,b;cin>>n>>a>>b;vector<int> nx(n+1),x(n+1,-1),y=x;for(int i=1;i<=n;i++)cin>>nx[i];for(int d=0;a&&x[a]<0;a=nx[a])x[a]=d++;for(int d=0;b&&y[b]<0;b=nx[b])y[b]=d++;int p=0,best=2*n;for(int i=1;i<=n;i++)if(x[i]>=0&&y[i]>=0&&x[i]+y[i]<best){best=x[i]+y[i];p=i;}if(p)cout<<p<<" "<<x[p]<<" "<<y[p];else cout<<-1;`,
java: String.raw`int n=integer(),a=integer(),b=integer(),best=2*n,p=0;int[] nx=new int[n+1],x=new int[n+1],y=new int[n+1];Arrays.fill(x,-1);Arrays.fill(y,-1);for(int i=1;i<=n;i++)nx[i]=integer();for(int d=0;a!=0&&x[a]<0;a=nx[a])x[a]=d++;for(int d=0;b!=0&&y[b]<0;b=nx[b])y[b]=d++;for(int i=1;i<=n;i++)if(x[i]>=0&&y[i]>=0&&x[i]+y[i]<best){best=x[i]+y[i];p=i;}System.out.print(p==0?"-1":p+" "+x[p]+" "+y[p]);`,
py:`n,a,b=I(),I(),I()
nx=[0]+[I() for _ in range(n)]
def distances(h):
    d=[-1]*(n+1)
    k=0
    while h and d[h]<0:
        d[h]=k
        k+=1
        h=nx[h]
    return d
x,y=distances(a),distances(b)
winner=min((x[i]+y[i],i) for i in range(1,n+1) if min(x[i],y[i])>=0) if any(x[i]>=0 and y[i]>=0 for i in range(1,n+1)) else None
if winner:
    p=winner[1]
    print(p,x[p],y[p])
else:
    print(-1)`,
},
{
title:"The Uncut Causeway",treasure:"Return Chain Token",
intro:"The saboteur's strikes are recorded in order, but the witness statements are dated out of sequence. Reconstruct the neighbours each witness could have seen.",
statement:"A doubly linked list starts in the given order. A fixed sequence of distinct planks is removed. Each query (t,x) asks for the predecessor and successor of plank x immediately after the first t removals. Queries are in arbitrary order and do not themselves remove anything.",
input:"n r q, a permutation of IDs 1..n, r distinct removal IDs, then q lines t x.",
output:"q lines, predecessor and successor in query order. Use 0 for a missing neighbour.",
constraints:"1 ≤ n,q ≤ 30000. 0 ≤ r < n. 0 ≤ t ≤ r. Query plank x is guaranteed to survive the first t removals.",
samples:[["5 3 4\n4 2 5 1 3\n5 4 2\n3 1\n0 2\n2 2\n1 2\n","0 3\n4 5\n0 1\n4 1","After three strikes only [1,3] remains. The other queries inspect earlier versions of plank 2."],["3 1 2\n3 2 1\n2\n1 3\n0 3\n","0 1\n0 2","Removing the middle plank changes the head's successor from 2 to 1."]],
hidden:[["1 0 1\n1\n0 1\n","0 0"],["4 2 3\n2 4 3 1\n1 2\n2 4\n0 1\n1 2\n","0 3\n3 0\n0 4"],["30000 29999 30000\n"+line(range(30000))+line(range(29999,2).reverse())+range(30000,0).reverse().map(t=>t+" 1\n").join(""),range(30000,0).reverse().map(t=>"0 "+(t===29999?0:2)).join("\n")]],
hints:["You may answer queries in a different order from their input order.","Removal count is a bounded integer, so bucket queries by timestamp.","Sweep the timeline once and splice adjacent plank IDs directly, saving every answer by its original query index."],
editorial:"Bucket queries by removal count and store their original indices. Build predecessor and successor tables keyed by plank ID from the initial permutation. Before answering bucket t, apply the t-th removal if t is positive. A splice updates only the removed node's two neighbours, so all surviving links then represent exactly that historical version. Answer each bucket from the current tables and finally print answers in input order. Buckets avoid sorting timestamps and prevent rebuilding the list for each witness.",
time:"O(n+r+q)",space:"O(n+r+q)",
cpp:String.raw`int n,r,q;cin>>n>>r>>q;vector<int> l(n+1),right(n+1),del(r+1),x(q);vector<vector<int>> at(r+1);int p=0;
for(int i=0,v;i<n;i++){cin>>v;l[v]=p;right[p]=v;p=v;}for(int i=1;i<=r;i++)cin>>del[i];for(int i=0,t;i<q;i++){cin>>t>>x[i];at[t].push_back(i);}
vector<pair<int,int>> ans(q);for(int t=0;t<=r;t++){if(t){int v=del[t];right[l[v]]=right[v];l[right[v]]=l[v];}for(int i:at[t])ans[i]={l[x[i]],right[x[i]]};}for(auto [a,b]:ans)cout<<a<<' '<<b<<'\n';`,
java:String.raw`int n=integer(),r=integer(),q=integer(),p=0;int[] l=new int[n+1],right=new int[n+1],del=new int[r+1],x=new int[q],head=new int[r+1],next=new int[q],a=new int[q],b=new int[q];Arrays.fill(head,-1);
for(int i=0;i<n;i++){int v=integer();l[v]=p;right[p]=v;p=v;}for(int i=1;i<=r;i++)del[i]=integer();for(int i=0;i<q;i++){int t=integer();x[i]=integer();next[i]=head[t];head[t]=i;}
for(int t=0;t<=r;t++){if(t>0){int v=del[t];right[l[v]]=right[v];l[right[v]]=l[v];}for(int i=head[t];i>=0;i=next[i]){a[i]=l[x[i]];b[i]=right[x[i]];}}StringBuilder s=new StringBuilder();for(int i=0;i<q;i++)s.append(a[i]).append(' ').append(b[i]).append('\n');System.out.print(s);`,
py:`n,r,q=I(),I(),I()
l=[0]*(n+1)
right=l.copy()
p=0
for _ in range(n):
    v=I()
    l[v]=p
    right[p]=v
    p=v
deleted=[0]+[I() for _ in range(r)]
at=[[] for _ in deleted]
for i in range(q):
    t,x=I(),I()
    at[t].append((i,x))
out=['']*q
for t,v in enumerate(deleted):
    if t:
        right[l[v]]=right[v]
        l[right[v]]=l[v]
    for i,x in at[t]:
        out[i]=f'{l[x]} {right[x]}'
print(chr(10).join(out))`,
}
]);
