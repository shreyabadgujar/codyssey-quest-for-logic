const { makeBank } = require("./missionBank");
const numbers=s=>s.trim().split(/\s+/).map(Number);
const input=(a,p,queries=[])=>a.length+" "+p+"\n"+a.join(" ")+"\n"+queries.join(" ")+"\n";
const starter=[
  "    int n; long long parameter; cin>>n>>parameter;\n    vector<long long>a(n); for(auto &x:a)cin>>x;\n    // Read any queries and compute your answer.",
  "        int n=in.nextInt(); long parameter=in.nextLong();\n        long[] a=new long[n]; for(int i=0;i<n;i++)a[i]=in.nextLong();\n        // Read any queries and compute your answer.",
  "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn,parameter=next(tokens),next(tokens)\na=[next(tokens) for _ in range(n)]\n# Read any queries and compute your answer.",
];
const solve=(...bodies)=>starter.map((code,i)=>code.split(/\n[ ]*(?:\/\/|#) /)[0]+"\n"+bodies[i]);
const N=20000;
const seq=Array.from({length:N},(_,i)=>i-N/2);
const queryInput="First line: n q. Second line: n readings. Third line: q query values.";
const queryBounds="1 ≤ n,q ≤ 20000. Every reading and query is between -10^9 and 10^9.";
module.exports=makeBank({
  slug:"searching-peaks",name:"Searching Peaks",topic:"Searching",order:6,
  description:"Find the buried landmarks on a succession of increasingly difficult mountain surveys.",
  image:"/assets/islands/searching-peaks.webp",mapPosition:{x:79,y:17},
  completionReward:{coins:400,xp:800,artifact:"The Sextant of Halving"},
},[
  {
    title:"The First Distress Flare",intro:"Weather stations sent distress codes out of order. Find the first station carrying the specific code mentioned in the rescue note.",
    statement:"Given an unsorted array and target K, return the 1-based index of the first occurrence of K, or 0 when absent. Duplicate readings are allowed.",
    input:"First line: n K. Second line: n readings in station order.",output:"One integer, the first matching index or 0.",
    constraints:"1 ≤ n ≤ 20000. -10^9 ≤ K,a[i] ≤ 10^9.",
    samples:[["5 -4\n2 -4 3 -4 0\n","2","Stations 2 and 4 both match, so return 2."],["3 9\n9 3 2\n","1","The very first station matches."]],
    hints:["The stations are unsorted.","Check stations in their given order.","Stop at the first equality and convert the zero-based position to 1-based indexing."],
    editorial:"Scan left to right and return immediately when a value equals K. Before checking position i, all earlier readings have failed, so the first success is the earliest match. If the loop ends, none matched. Keeping original order matters because sorting would lose the required positions. A single missing reading still yields 0.",
    time:"O(n)",space:"O(1) auxiliary",starter,
    reference:solve(
      '    for(int i=0;i<n;i++)if(a[i]==parameter){cout<<i+1;return 0;}\n    cout<<0;',
      '        for(int i=0;i<n;i++)if(a[i]==parameter){System.out.print(i+1);return;}\n        System.out.print(0);',
      'print(next((i for i,x in enumerate(a,1) if x==parameter),0))'),
    oracle:s=>{const [n,k,...a]=numbers(s);return String(a.indexOf(k)+1);},
    hidden:["1 8\n-8\n","1 0\n0\n",[input(Array(N-1).fill(2).concat(5),5),String(N)]],
    clue:"Search under the first matching station's flare box for an iron signal ring.",treasure:"Iron Signal Ring",
  },
  {
    title:"The Minimum Safe Altitude",intro:"The ridge survey is sorted by altitude. A pilot requests the first landing platform at or above each altitude threshold.",
    statement:"For every query x, find the first 1-based index i with a[i] ≥ x in a nondecreasing array. Return 0 if no platform qualifies.",
    input:queryInput,output:"One answer per query, one per line, in input order.",
    constraints:queryBounds+" The readings are sorted in nondecreasing order.",
    samples:[["5 3\n-2 0 4 4 9\n4 1 10\n","3\n3\n0","Both 4 and 1 first qualify at position 3. Nothing reaches 10."],["1 2\n5\n-2 5\n","1\n1","The lone platform satisfies both thresholds."]],
    hints:["For a fixed threshold, all qualifying positions form a suffix.","Binary search for the boundary between false and true.","Use [left,right) initially [0,n). When a[mid] is too small advance left to mid+1, otherwise set right to mid."],
    editorial:"Binary search for the first index where a[i]≥x. The candidate boundary begins in [0,n], where n represents no qualifying element. If a[mid]<x, the boundary lies strictly later by sorted order. Otherwise it lies at or before mid. Each update keeps the boundary in the narrowed range until both endpoints coincide. Return that index plus one unless it equals n. Equality takes the left half so ties return the earliest platform.",
    time:"O(n + q log n) including input",space:"O(n) for the readings",starter,
    reference:solve(
      '    for(int q=0;q<parameter;q++){long long x;cin>>x;auto i=lower_bound(a.begin(),a.end(),x);cout<<(i==a.end()?0:i-a.begin()+1)<<"\\n";}',
      '        StringBuilder out=new StringBuilder();\n        for(int q=0;q<parameter;q++){long x=in.nextLong();int l=0,r=n;while(l<r){int m=(l+r)/2;if(a[m]<x)l=m+1;else r=m;}out.append(l==n?0:l+1).append("\\n");}System.out.print(out);',
      'from bisect import bisect_left\nfor x in tokens:\n    i=bisect_left(a,x)\n    print(i+1 if i<n else 0)'),
    oracle:s=>{const [n,q,...a]=numbers(s);return a.slice(n).map(x=>a.slice(0,n).findIndex(v=>v>=x)+1).join("\n");},
    hidden:["1 1\n-9\n-8\n","4 2\n2 2 2 2\n1 2\n",[input(seq,N,Array(N).fill(0)),Array(N).fill(10001).join("\n")]],
    clue:"The first safe platform shelters a silver altitude vane.",treasure:"Silver Altitude Vane",
  },
  {
    title:"The Span of Buried Markers",intro:"Several neighboring posts carry the same code. Locate the full run so the excavation team knows where to begin and end.",
    statement:"For each x, report the first and last 1-based index of x in the nondecreasing array. If x is absent, report 0 0.",
    input:queryInput,output:"One line per query with the first and last positions, separated by a space.",
    constraints:queryBounds+" The readings are sorted in nondecreasing order.",
    samples:[["6 3\n1 2 2 2 7 7\n2 7 3\n","2 4\n5 6\n0 0","The 2 run occupies positions 2 through 4. The value 3 is absent."],["3 2\n-5 -5 -5\n-5 0\n","1 3\n0 0","Every station matches -5 and none matches 0."]],
    hints:["All equal values form a contiguous run.","Search for two boundaries: first value at least x and first value greater than x.","Check whether the lower boundary points to x, then convert [lower,upper) to 1-based inclusive endpoints."],
    editorial:"Let L be the first index with a[L]≥x, and R the first with a[R]>x, using n for missing boundaries. Sorted order makes each predicate monotone, so binary search finds it. Every index in [L,R) has value x and no outside index does. If L=R, x is absent. Otherwise the inclusive 1-based range is L+1 through R. Avoid computing x+1 in the type used for an upper-bound search, since a value at the type limit would overflow. The same method handles runs at either array edge.",
    time:"O(n + q log n)",space:"O(n)",starter,
    reference:solve(
      '    for(int q=0;q<parameter;q++){long long x;cin>>x;auto range=equal_range(a.begin(),a.end(),x);if(range.first==range.second)cout<<"0 0\\n";else cout<<range.first-a.begin()+1<<" "<<range.second-a.begin()<<"\\n";}',
      '        StringBuilder out=new StringBuilder();\n        for(int q=0;q<parameter;q++){long x=in.nextLong();int[] edge=new int[2];for(int t=0;t<2;t++){int l=0,r=n;while(l<r){int m=(l+r)/2;if(a[m]<x||(t==1&&a[m]==x))l=m+1;else r=m;}edge[t]=l;}if(edge[0]==edge[1])out.append("0 0");else out.append(edge[0]+1).append(" ").append(edge[1]);out.append("\\n");}\n        System.out.print(out);',
      'from bisect import bisect_left,bisect_right\nfor x in tokens:\n    l,r=bisect_left(a,x),bisect_right(a,x)\n    print(l+1,r) if l<r else print(0,0)'),
    oracle:s=>{const [n,q,...a]=numbers(s), readings=a.slice(0,n);return a.slice(n).map(x=>[readings.indexOf(x)+1,readings.lastIndexOf(x)+1].join(" ")).join("\n");},
    hidden:["1 1\n-9\n-8\n","7 3\n-3 -3 0 0 0 2 2\n-3 0 2\n",[input(Array(N).fill(7),N,Array(N).fill(7)),Array(N).fill("1 20000").join("\n")]],
    clue:"The rightmost buried marker conceals an ivory excavation caliper.",treasure:"Ivory Excavation Caliper",
  },
  {
    title:"The Rotated Ridge Chart",intro:"The surveyor's numbered chart was wrapped around the wrong notch. Recover each landmark's position on the chart as it actually lies.",
    statement:"The array was formed by cyclically rotating a strictly increasing array by an unknown amount, possibly zero. For every target, report its 1-based position in the given rotated array, or 0 if absent.",
    input:queryInput,output:"One original position per query, one per line.",
    constraints:queryBounds+" All readings are distinct and the given array is a valid rotation.",
    samples:[["6 3\n8 11 15 -3 0 2\n-3 11 4\n","4\n2\n0","The minimum lies at position 4. Target 11 is at position 2 in the given rotation."],["3 2\n-2 1 4\n4 -2\n","3\n1","A zero rotation preserves the increasing order."]],
    hints:["Find where the increasing order wraps.","Comparing the middle reading with the right boundary identifies which side contains the minimum.","Use the minimum's position as logical index zero. Map a logical index i back with (pivot+i) mod n."],
    editorial:"Binary search for the minimum by comparing a[mid] with a[right]. If a[mid] is greater, the wrap is strictly to its right. Otherwise the minimum is at mid or to its left, since that suffix is increasing. Distinct values remove ambiguity. Once the pivot is known, the virtual array a[(pivot+i)%n] is strictly increasing. Lower-bound search this virtual order for each target, map the result back, and check equality. This avoids copying or rotating the input and handles an unrotated or singleton array.",
    time:"O(n + (q+1) log n)",space:"O(n)",starter,
    reference:solve(
      '    int l=0,r=n-1;while(l<r){int m=(l+r)/2;if(a[m]>a[r])l=m+1;else r=m;}int pivot=l;\n    for(int q=0;q<parameter;q++){long long x;cin>>x;l=0;r=n;while(l<r){int m=(l+r)/2;if(a[(pivot+m)%n]<x)l=m+1;else r=m;}int i=(pivot+l)%n;cout<<(l<n&&a[i]==x?i+1:0)<<"\\n";}',
      '        int l=0,r=n-1;while(l<r){int m=(l+r)/2;if(a[m]>a[r])l=m+1;else r=m;}int pivot=l;\n        StringBuilder out=new StringBuilder();for(int q=0;q<parameter;q++){long x=in.nextLong();l=0;r=n;while(l<r){int m=(l+r)/2;if(a[(pivot+m)%n]<x)l=m+1;else r=m;}int i=(pivot+l)%n;out.append(l<n&&a[i]==x?i+1:0).append("\\n");}System.out.print(out);',
      'l,r=0,n-1\nwhile l<r:\n    m=(l+r)//2\n    if a[m]>a[r]: l=m+1\n    else: r=m\npivot=l\nfor x in tokens:\n    l,r=0,n\n    while l<r:\n        m=(l+r)//2\n        if a[(pivot+m)%n]<x: l=m+1\n        else: r=m\n    i=(pivot+l)%n\n    print(i+1 if l<n and a[i]==x else 0)'),
    oracle:s=>{const [n,q,...a]=numbers(s), readings=a.slice(0,n);return a.slice(n).map(x=>readings.indexOf(x)+1).join("\n");},
    hidden:["1 1\n4\n4\n","4 4\n1 2 3 -1\n-1 3 0 2\n",[input(seq.slice(10000).concat(seq.slice(0,10000)),N,Array(N).fill(-10000)),Array(N).fill(10001).join("\n")]],
    clue:"The hidden wrap notch points to a bronze ridge-chart wheel.",treasure:"Bronze Ridge-Chart Wheel",
  },
  {
    title:"The Pass Before the Avalanche",intro:"A sled carries consecutive crates along the pass each day. Its load rating must be as low as possible while finishing before the forecast avalanche.",
    statement:"Ship all positive crate weights in order over at most D days. A day ships a nonempty consecutive block and cannot exceed capacity C. Find the minimum integer C that works. No crate may be split.",
    input:"First line: n D. Second line: n positive crate weights.",output:"One integer, the smallest feasible capacity.",
    constraints:"1 ≤ n ≤ 20000. 1 ≤ D ≤ n. 1 ≤ weight[i] ≤ 10^9.",
    samples:[["5 3\n3 2 2 4 1\n","5","Capacity 5 fits [3,2], [2], [4,1]. Capacity 4 needs more than three days."],["4 1\n2 1 4 3\n","10","One day must fit the entire shipment."]],
    hints:["Feasibility is monotone in capacity.","For a fixed capacity, greedily ship the longest prefix that fits each day.","Binary search from the largest single weight to the total weight, using 64-bit capacities."],
    editorial:"For a candidate capacity C, start a new day only when the next crate does not fit. Since weights are positive, the greedy first day reaches the farthest possible position. Moving any feasible first cut to this farther position only removes crates from later days and cannot increase their needed capacity. Apply the same argument after each cut, so the greedy count is the minimum number of days for C. Increasing C cannot destroy feasibility. Binary search for the first feasible value between max(weight) and sum(weight). D=1 reaches the upper bound, and D=n reaches the lower bound.",
    time:"O(n log(sum of weights))",space:"O(n) for input, O(1) auxiliary",starter,
    reference:solve(
      '    long long l=*max_element(a.begin(),a.end()),r=accumulate(a.begin(),a.end(),0LL);\n    while(l<r){long long cap=l+(r-l)/2,load=0;int days=1;for(long long w:a){if(load+w>cap){days++;load=0;}load+=w;}if(days<=parameter)r=cap;else l=cap+1;}cout<<l;',
      '        long l=0,r=0;for(long w:a){l=Math.max(l,w);r+=w;}\n        while(l<r){long cap=l+(r-l)/2,load=0;int days=1;for(long w:a){if(load+w>cap){days++;load=0;}load+=w;}if(days<=parameter)r=cap;else l=cap+1;}System.out.print(l);',
      'l,r=max(a),sum(a)\nwhile l<r:\n    cap=(l+r)//2\n    days,load=1,0\n    for w in a:\n        if load+w>cap:\n            days+=1\n            load=0\n        load+=w\n    if days<=parameter: r=cap\n    else: l=cap+1\nprint(l)'),
    oracle:s=>{const [n,d,...a]=numbers(s);const search=(i,days)=>{if(i===n)return 0;if(!days)return Infinity;let best=Infinity,load=0;for(let j=i;j<n;j++){load+=a[j];best=Math.min(best,Math.max(load,search(j+1,days-1)));}return best;};return String(search(0,d));},
    hidden:["1 1\n1000000000\n","5 5\n9 1 8 2 7\n","6 2\n1 7 1 1 3 9\n",[input(Array(N).fill(1000000000),113),"177000000000"]],
    clue:"Under the sled's load dial sits the sextant that charts the avalanche pass.",treasure:"Avalanche Sextant",
  },
]);
