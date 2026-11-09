const {build,repeat,range}=require("./build");
const n=50000;
module.exports=build("sorting-sands",[
{
title:"The Twin Dune Rankings",treasure:"Twin Rank Abacus",
intro:"Two guilds ranked the same crates on separate scales. A crate dominates another only when both recorded measures are strictly higher.",
statement:"Count ordered pairs of distinct crates (i,j) such that x_i < x_j and y_i < y_j. Duplicate measurements still represent separate crates.",
input:"n, followed by n lines x y.",output:"The number of qualifying pairs.",
constraints:"1 ≤ n ≤ 50000. Each coordinate is in [-1000000,1000000].",
samples:[["5\n0 0\n0 1\n1 1\n2 2\n2 2\n","7","The (1,1) crate dominates only (0,0). Each (2,2) crate dominates three earlier-scale crates."],["3\n-3 9\n-2 8\n-1 7\n","0","The second scale decreases whenever the first increases."]],
hidden:[["1\n0 0\n","0"],["4\n1 1\n1 1\n2 2\n2 2\n","4"],[n+"\n"+range(n).map(i=>i+" "+i+"\n").join(""),String(n*(n-1)/2)]],
hints:["Process crates in ascending first-coordinate order.","Tie groups must never count pairs internally.","Sort ties by descending second coordinate, then use a Fenwick prefix count on compressed second coordinates."],
editorial:"Sort by x ascending and by y descending when x ties. A previously processed crate with y strictly below the current y cannot have the same x because of the tie ordering. Conversely every dominated crate appears earlier and has strictly lower y. A Fenwick tree stores previously seen y frequencies, so querying the prefix before y's rank counts exactly the new pairs. Insert each crate separately to preserve multiplicity.",
time:"O(n log n)",space:"O(n)",
cpp:String.raw`int n;cin>>n;vector<pair<int,int>> a(n);vector<int> ys;for(auto& [x,v]:a){int y;cin>>x>>y;v=-y;ys.push_back(y);}sort(a.begin(),a.end());sort(ys.begin(),ys.end());vector<int> f(n+1);long long ans=0;for(auto [x,v]:a){int k=lower_bound(ys.begin(),ys.end(),-v)-ys.begin()+1;for(int i=k-1;i;i-=i&-i)ans+=f[i];for(int i=k;i<=n;i+=i&-i)f[i]++;}cout<<ans;`,
java:String.raw`int n=integer();long[] a=new long[n];int[] ys=new int[n],f=new int[n+1];for(int i=0;i<n;i++){int x=integer(),y=integer();ys[i]=y;a[i]=((long)(x+1000000)<<21)|(1000000-y);}Arrays.sort(a);Arrays.sort(ys);long ans=0;for(long v:a){int y=1000000-(int)(v&2097151),lo=0,hi=n;while(lo<hi){int m=(lo+hi)/2;if(ys[m]<y)lo=m+1;else hi=m;}for(int i=lo;i>0;i-=i&-i)ans+=f[i];for(int i=lo+1;i<=n;i+=i&-i)f[i]++;}System.out.print(ans);`,
py:`n=I()
a=[(I(),-I()) for _ in range(n)]
ys={y:i+1 for i,y in enumerate(sorted({-v for _,v in a}))}
f=[0]*(len(ys)+1)
ans=0
for _,v in sorted(a):
    k=ys[-v]
    i=k-1
    while i:
        ans+=f[i]
        i-=i&-i
    while k<len(f):
        f[k]+=1
        k+=k&-k
print(ans)`,
},
{
title:"The Longest Bazaar Bell",treasure:"Bazaar Bell Counterweight",
intro:"Stalls share one bell tower. Its strain is the sum of every open stall's load; the inspector needs both the peak strain and how long it lasted.",
statement:"Each weighted opening interval is half-open [l,r). Find the maximum total load at any time and the total duration at that maximum, adding disjoint stretches.",
input:"n, then n lines l r weight.",output:"Two integers, maximum load and total duration.",
constraints:"1 ≤ n ≤ 40000. -10^9 ≤ l < r ≤ 10^9. 1 ≤ weight ≤ 10^9.",
samples:[["3\n0 4 2\n2 5 3\n5 7 5\n","5 4","Load 5 occurs on [2,4) and [5,7). The endpoint at 5 does not overlap the two stalls."],["2\n-3 -1 9\n2 7 9\n","9 7","The disjoint peak stretches contribute lengths 2 and 5."]],
hidden:[["1\n-1000000000 1000000000 1\n","1 2000000000"],["3\n0 2 8\n2 4 5\n2 4 3\n","8 4"],["40000\n"+repeat(40000,"0 1 1000000000\n").join(""),"40000000000000 1"]],
hints:["A load changes only when a stall opens or closes.","Process all deltas at one coordinate as a single event.","Compare the load on each gap, resetting the accumulated duration when a new peak is found."],
editorial:"Convert each interval to +weight at its left endpoint and -weight at its right endpoint. Sort the event coordinates and combine ties. After applying one coordinate's net change, the load is constant up to the next coordinate and includes exactly the intervals active in that half-open gap. Update the peak and its total duration from these gaps. Combining equal coordinates avoids inventing an instant of overlap.",
time:"O(n log n)",space:"O(n)",
cpp:String.raw`int n;cin>>n;map<long long,long long> e;while(n--){long long l,r,w;cin>>l>>r>>w;e[l]+=w;e[r]-=w;}long long load=0,best=-1,total=0,p=e.begin()->first;for(auto [x,d]:e){if(x>p){if(load>best){best=load;total=0;}if(load==best)total+=x-p;}load+=d;p=x;}cout<<best<<' '<<total;`,
java:String.raw`int n=integer();TreeMap<Long,Long> e=new TreeMap<>();while(n-->0){long l=num(),r=num(),w=num();e.merge(l,w,Long::sum);e.merge(r,-w,Long::sum);}long load=0,best=-1,total=0,p=e.firstKey();for(var a:e.entrySet()){long x=a.getKey();if(x>p){if(load>best){best=load;total=0;}if(load==best)total+=x-p;}load+=a.getValue();p=x;}System.out.print(best+" "+total);`,
py:`from collections import defaultdict
e=defaultdict(int)
for _ in range(I()):
    l,r,w=I(),I(),I()
    e[l]+=w
    e[r]-=w
p=min(e)
load=total=0
best=-1
for x in sorted(e):
    if x>p:
        if load>best:
            best,total=load,0
        if load==best:
            total+=x-p
    load+=e[x]
    p=x
print(best,total)`,
},
{
title:"The Costly Caravan Queue",treasure:"Priority Toll Parchment",
intro:"A narrow pass admits one caravan each day. Every day of waiting incurs a different protection fee for each caravan.",
statement:"Caravan i may enter on any integer day d_i ≥ r_i. No two caravans share an entry day. Minimize the sum of w_i times (d_i-r_i).",
input:"n, then n lines release day r and daily fee w.",output:"The minimum total fee.",
constraints:"1 ≤ n ≤ 50000. 0 ≤ r ≤ 10^9. 1 ≤ w ≤ 10^6.",
samples:[["4\n0 4\n0 2\n1 5\n1 1\n","6","Enter fees 4, 5, 2, 1 on days 0..3. The last two each wait two days."],["3\n4 1\n4 8\n100 3\n","1","Enter fee 8 first; the last caravan need not wait."]],
hidden:[["1\n1000000000 1000000\n","0"],["3\n0 1\n0 10\n1 100\n","2"],[n+"\n"+repeat(n,"1000000000 1000000\n").join(""),String(n*(n-1)/2*1000000)]],
hints:["If any caravan is waiting, an idle day is unnecessary.","At a fixed day compare the fees of two caravans already released.","Sort release days and use a max heap; jump directly to the next release when the heap is empty."],
editorial:"Use each occupied day for the waiting caravan with the largest daily fee. If an optimal schedule instead used a lower fee caravan, swap it with the higher fee one later in the schedule. Both were released by the earlier day and the swap never increases the fee. Idling while a caravan is ready can likewise be removed. Sort by release day, add newly released caravans to a max heap, and jump over empty stretches. Each caravan is pushed and popped once.",
time:"O(n log n)",space:"O(n)",
cpp:String.raw`int n;cin>>n;vector<pair<long long,long long>> a(n);for(auto&[r,w]:a)cin>>r>>w;sort(a.begin(),a.end());priority_queue<pair<long long,long long>> q;long long d=0,ans=0;int i=0;while(i<n||!q.empty()){if(q.empty())d=max(d,a[i].first);while(i<n&&a[i].first<=d){q.push({a[i].second,a[i].first});i++;}auto [w,r]=q.top();q.pop();ans+=w*(d-r);d++;}cout<<ans;`,
java:String.raw`int n=integer();long[][] a=new long[n][2];for(long[] t:a){t[0]=num();t[1]=num();}Arrays.sort(a,Comparator.comparingLong(t->t[0]));PriorityQueue<long[]> q=new PriorityQueue<>((x,y)->Long.compare(y[1],x[1]));int i=0;long d=0,ans=0;while(i<n||!q.isEmpty()){if(q.isEmpty())d=Math.max(d,a[i][0]);while(i<n&&a[i][0]<=d)q.add(a[i++]);long[] t=q.remove();ans+=t[1]*(d-t[0]);d++;}System.out.print(ans);`,
py:`from heapq import heappush,heappop
n=I()
a=sorted((I(),I()) for _ in range(n))
q=[]
i=d=ans=0
while i<n or q:
    if not q:
        d=max(d,a[i][0])
    while i<n and a[i][0]<=d:
        r,w=a[i]
        heappush(q,(-w,r))
        i+=1
    w,r=heappop(q)
    ans-=w*(d-r)
    d+=1
print(ans)`,
}
]);
