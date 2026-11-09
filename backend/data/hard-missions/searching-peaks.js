const {build,line,repeat,range}=require("./build");
module.exports=build("searching-peaks",[
{
title:"The Paired Summit Tribute",treasure:"Summit Pair Counter",
intro:"Two shrines offer tribute independently. The governor's sealed tariff is the k-th price among every possible pair of offerings.",
statement:"Take one indexed entry from each of two arrays and add their values. Find the k-th smallest sum over all n times m pairs, counting repeated sums with multiplicity.",
input:"n m k, followed by n values and then m values.",output:"The k-th smallest sum.",
constraints:"1 ≤ n,m ≤ 35000. 1 ≤ k ≤ n×m. Values lie in [-10^9,10^9].",
samples:[["3 2 4\n-2 0 4\n1 1\n","1","The sorted multiset starts -1,-1,1,1,5,5."],["2 3 5\n3 -3\n-2 2 0\n","3","The six sums are -5,-3,-1,1,3,5."]],
hidden:[["1 1 1\n-1000000000\n-1000000000\n","-2000000000"],["2 2 4\n-3 1\n-2 2\n","3"],["35000 35000 1225000000\n"+line(repeat(35000,1000000000))+line(repeat(35000,1000000000)),"2000000000"]],
hints:["The sums themselves are too numerous to store.","Ask how many pairs have sum at most a proposed threshold.","Sort both lists, then walk one index backward as the other index advances."],
editorial:"Sort both arrays. For a threshold T, the legal partners of an entry form a prefix of the second array. Its length can only decrease as the first entry increases, so one backward pointer counts all pairs in linear time. Count indexed pairs even on ties. The count is nondecreasing in T, and the first threshold with at least k pairs is exactly the k-th sum. Use 64-bit bounds and counters.",
time:"O(n log n + m log m + (n+m) log W), where W is the sum range plus one",space:"O(n+m)",
cpp:String.raw`int n,m;long long k;cin>>n>>m>>k;vector<long long>a(n),b(m);for(auto&x:a)cin>>x;for(auto&x:b)cin>>x;sort(a.begin(),a.end());sort(b.begin(),b.end());long long l=a[0]+b[0],r=a.back()+b.back();while(l<r){long long t=l+(r-l)/2,c=0;int j=m-1;for(auto x:a){while(j>=0&&x+b[j]>t)j--;c+=j+1;}if(c>=k)r=t;else l=t+1;}cout<<l;`,
java:String.raw`int n=integer(),m=integer();long k=num();long[] a=new long[n],b=new long[m];for(int i=0;i<n;i++)a[i]=num();for(int j=0;j<m;j++)b[j]=num();Arrays.sort(a);Arrays.sort(b);long l=a[0]+b[0],r=a[n-1]+b[m-1];while(l<r){long t=l+(r-l)/2,c=0;int j=m-1;for(long x:a){while(j>=0&&x+b[j]>t)j--;c+=j+1;}if(c>=k)r=t;else l=t+1;}System.out.print(l);`,
py:`n,m,k=I(),I(),I()
a=sorted(I() for _ in range(n))
b=sorted(I() for _ in range(m))
l,r=a[0]+b[0],a[-1]+b[-1]
while l<r:
    t=(l+r)//2
    c,j=0,m-1
    for x in a:
        while j>=0 and x+b[j]>t:
            j-=1
        c+=j+1
    if c>=k:
        r=t
    else:
        l=t+1
print(l)`,
},
{
title:"The Widest Survey Line",treasure:"Ridge Spacing Divider",
intro:"Crevasses divide the ridge into disjoint safe ledges. Place survey beacons with the widest possible guaranteed separation.",
statement:"Choose k distinct integer coordinates in the union of the given disjoint closed intervals. Maximize the smallest gap between consecutive chosen coordinates in sorted order.",
input:"n k, then n lines l r. Intervals are disjoint, may be adjacent, and are in arbitrary order.",output:"The largest possible minimum gap.",
constraints:"1 ≤ n ≤ 40000. 2 ≤ k ≤ 10^9. -10^9 ≤ l ≤ r ≤ 10^9. There are at least k allowed coordinates.",
samples:[["2 3\n10 13\n0 2\n","3","Positions 0,10,13 give gap 3. Four is impossible because two chosen positions must lie on one ledge."],["1 3\n-2 4\n","3","The endpoints and their midpoint are equally spaced."]],
hidden:[["2 2\n1000000000 1000000000\n-1000000000 -1000000000\n","2000000000"],["3 4\n3 3\n0 1\n2 2\n","1"],["40000 40000\n"+range(40000,0).reverse().map(x=>2*x+" "+2*x+"\n").join(""),"2"]],
hints:["Test whether a fixed gap is possible.","The earliest feasible position leaves as much space as any later placement.","On one ledge count an entire arithmetic progression of placements using division."],
editorial:"Sort the ledges. For a proposed positive gap d, greedily place each beacon at the earliest allowed coordinate at least d beyond its predecessor. Induction shows every greedy placement is no later than the corresponding placement in any feasible answer. Within one interval compute the number of placements as floor((right-start)/d)+1 rather than visiting each coordinate. Feasibility decreases with d, so binary search for the largest feasible d.",
time:"O(n log n + n log W), where W is the coordinate span",space:"O(n)",
cpp:String.raw`int n;long long k;cin>>n>>k;vector<pair<long long,long long>> a(n);for(auto&[l,r]:a)cin>>l>>r;sort(a.begin(),a.end());auto ok=[&](long long d){long long next=-4000000000LL,c=0;for(auto [l,r]:a){long long x=max(next,l);if(x<=r){long long z=(r-x)/d+1;c+=z;next=x+z*d;if(c>=k)return true;}}return false;};long long l=1,r=a.back().second-a[0].first;while(l<r){long long m=(l+r+1)/2;if(ok(m))l=m;else r=m-1;}cout<<l;`,
java:String.raw`int n=integer();long k=num();long[][] a=new long[n][2];for(long[] p:a){p[0]=num();p[1]=num();}Arrays.sort(a,Comparator.comparingLong(p->p[0]));long l=1,r=a[n-1][1]-a[0][0];while(l<r){long d=(l+r+1)/2,next=-4000000000L,c=0;for(long[] p:a){long x=Math.max(next,p[0]);if(x<=p[1]){long z=(p[1]-x)/d+1;c+=z;next=x+z*d;if(c>=k)break;}}if(c>=k)l=d;else r=d-1;}System.out.print(l);`,
py:`n,k=I(),I()
a=sorted((I(),I()) for _ in range(n))
def ok(d):
    nxt=-4*10**9
    count=0
    for l,r in a:
        x=max(nxt,l)
        if x<=r:
            z=(r-x)//d+1
            count+=z
            if count>=k:
                return True
            nxt=x+z*d
    return False
l,r=1,a[-1][1]-a[0][0]
while l<r:
    m=(l+r+1)//2
    if ok(m):
        l=m
    else:
        r=m-1
print(l)`,
},
{
title:"The Shelter Radius",treasure:"Shelter Range Dial",
intro:"Avalanche shelters can be built only on inspected foundations. Find the smallest beacon radius that lets the allotted shelters cover all travellers.",
statement:"Choose at most k sites from the list of inspected foundations. Every traveller coordinate must be within distance r of a chosen site. Find the minimum nonnegative integer radius r.",
input:"n m k, then n traveller coordinates and m candidate site coordinates, each in arbitrary order.",output:"The minimum radius.",
constraints:"1 ≤ n,m ≤ 35000. 1 ≤ k ≤ m. Coordinates lie in [-10^9,10^9]. Duplicates are allowed.",
samples:[["4 3 2\n0 1 7 9\n0 4 8\n","1","Sites 0 and 8 each cover their nearest two travellers."],["3 2 1\n-4 2 4\n-3 3\n","7","Both foundations are at distance 7 from the opposite outer traveller."]],
hidden:[["1 1 1\n1000000000\n-1000000000\n","2000000000"],["3 2 2\n7 7 7\n7 8\n","0"],["35000 35000 35000\n"+line(range(35000,0).map(x=>2*x))+line(range(35000,0).map(x=>2*x+1)),"1"]],
hints:["Check a proposed radius on sorted traveller and site lists.","For the leftmost uncovered traveller, several sites may be able to reach it.","Choose the rightmost of those sites, then skip everyone it covers."],
editorial:"For a radius r, take the leftmost uncovered traveller x. If no site lies in [x-r,x+r], fail. Of sites that can cover x, the rightmost reaches farthest to the right. Replacing the site that covers x in any solution by this site preserves x and all still-uncovered travellers it reached. Continue greedily. Both traveller and site pointers advance monotonically. If at most k sites suffice, larger radii also work; binary search the minimum.",
time:"O(n log n + m log m + (n+m) log W), where W bounds the radius range",space:"O(n+m)",
cpp:String.raw`int n,m,k;cin>>n>>m>>k;vector<long long>a(n),b(m);for(auto&x:a)cin>>x;for(auto&x:b)cin>>x;sort(a.begin(),a.end());sort(b.begin(),b.end());auto ok=[&](long long r){int i=0,j=0,c=0;while(i<n){long long x=a[i];while(j<m&&b[j]<=x+r)j++;if(j==0||b[j-1]<x-r||++c>k)return false;while(i<n&&a[i]<=b[j-1]+r)i++;}return true;};long long l=0,r=2000000000;while(l<r){long long d=(l+r)/2;if(ok(d))r=d;else l=d+1;}cout<<l;`,
java:String.raw`int n=integer(),m=integer(),k=integer();long[] a=new long[n],b=new long[m];for(int i=0;i<n;i++)a[i]=num();for(int i=0;i<m;i++)b[i]=num();Arrays.sort(a);Arrays.sort(b);long l=0,r=2000000000;while(l<r){long d=(l+r)/2;int i=0,j=0,c=0;while(i<n){long x=a[i];while(j<m&&b[j]<=x+d)j++;if(j==0||b[j-1]<x-d||++c>k)break;while(i<n&&a[i]<=b[j-1]+d)i++;}if(i==n)r=d;else l=d+1;}System.out.print(l);`,
py:`n,m,k=I(),I(),I()
a=sorted(I() for _ in range(n))
b=sorted(I() for _ in range(m))
def ok(r):
    i=j=count=0
    while i<n:
        x=a[i]
        while j<m and b[j]<=x+r:
            j+=1
        count+=1
        if j==0 or b[j-1]<x-r or count>k:
            return False
        end=b[j-1]+r
        while i<n and a[i]<=end:
            i+=1
    return True
l,r=0,2*10**9
while l<r:
    d=(l+r)//2
    if ok(d):
        r=d
    else:
        l=d+1
print(l)`,
}
]);
