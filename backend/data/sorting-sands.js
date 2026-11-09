const { makeBank } = require("./missionBank");
const nums = s => s.trim().split(/\s+/).map(Number);
const n = 20000;
const single = [
  "    int n; cin>>n; vector<int> a(n);\n    for (int &x:a) cin>>x;\n    // Process a and print the answer.",
  "        int n=in.nextInt(); int[] a=new int[n];\n        for(int i=0;i<n;i++) a[i]=in.nextInt();\n        // Process a and print the answer.",
  "n,*a=map(int,sys.stdin.buffer.read().split())\n# Process a and print the answer.",
];
const pairs = [
  "    int n; cin>>n; vector<pair<int,int>> records(n);\n    for(auto &[x,y]:records) cin>>x>>y;\n    // Process the records and print the answer.",
  "        int n=in.nextInt(); int[][] records=new int[n][2];\n        for(int[] row:records){row[0]=in.nextInt();row[1]=in.nextInt();}\n        // Process the records and print the answer.",
  "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn=next(tokens)\nrecords=[(next(tokens),next(tokens)) for _ in range(n)]\n# Process the records and print the answer.",
];
const prefix=(starter)=>starter.map(code=>code.split(/\n[ ]*(?:\/\/|#) /)[0]+"\n");
const using=(starter,bodies)=>prefix(starter).map((head,i)=>head+bodies[i]);
const twoArrays = [
  "    int n;cin>>n;vector<int>a(n),b(n);\n    for(int &x:a)cin>>x;\n    for(int &x:b)cin>>x;\n    // Match the two arrays.",
  "        int n=in.nextInt();int[] a=new int[n],b=new int[n];\n        for(int i=0;i<n;i++)a[i]=in.nextInt();\n        for(int i=0;i<n;i++)b[i]=in.nextInt();\n        // Match the two arrays.",
  "tokens=iter(map(int,sys.stdin.buffer.read().split()))\nn=next(tokens)\na=[next(tokens) for _ in range(n)]\nb=[next(tokens) for _ in range(n)]\n# Match the two arrays.",
];
const rows = s => { const [n,...a]=nums(s);return Array.from({length:n},(_,i)=>[a[2*i],a[2*i+1]]); };
module.exports = makeBank({
  slug:"sorting-sands",name:"Sorting Sands",topic:"Sorting",order:5,
  description:"Rebuild the caravan registry and resolve overlapping claims in the shifting dunes.",
  image:"/assets/islands/sorting-sands.webp",mapPosition:{x:18,y:60},
  completionReward:{xp:700,coins:350,artifact:"The Golden Sieve of Quick-Sort"},
}, [
  {
    title:"The Scattered Survey Stakes",intro:"A sandstorm buried the survey stakes out of order. Restore the sequence of measured heights for the cartographer.",
    statement:"Sort all n signed readings in nondecreasing numerical order. Preserve every occurrence of each value.",
    input:"First line: n. Second line: n signed readings.",output:"One line with n space-separated readings in nondecreasing order.",
    constraints:"1 ≤ n ≤ 20000. -10^9 ≤ reading ≤ 10^9.",
    samples:[["6\n5 -3 5 2 0 -1\n","-3 -1 0 2 5 5","Both readings of 5 are preserved after sorting."],["1\n-8\n","-8","A single reading is already sorted."]],
    hints:["Equal readings are separate entries.","Use a comparison sort rather than indexing by the reading value.","Compare numerically and print the sorted values in a single pass."],
    editorial:"Read all values and sort them using a comparison sort such as merge sort. Merge sort splits the array into halves, sorts each half, then repeatedly writes the smaller of the two remaining front values. That choice is the smallest value not yet emitted, so the merged output is sorted and contains every value exactly once per input occurrence. A single-element subarray needs no work. Built-in numeric sorting is allowed. Use comparisons that handle negative values and retain duplicates.",
    time:"O(n log n)",space:"O(n) with merge sort",starter:single,
    reference:using(single,[
      '    sort(a.begin(),a.end());for(int value:a)cout<<value<<" ";',
      '        Arrays.sort(a);StringBuilder out=new StringBuilder();\n        for(int value:a)out.append(value).append(" ");System.out.print(out);',
      'a.sort()\nprint(*a)',
    ]),
    oracle:s=>{const a=nums(s).slice(1),out=[];while(a.length){const value=Math.min(...a);out.push(value);a.splice(a.indexOf(value),1);}return out.join(" ");},
    hidden:["1\n1000000000\n","5\n-7 -7 -7 -7 -7\n",[n+"\n"+Array.from({length:n},(_,i)=>n-i).join(" ")+"\n",Array.from({length:n},(_,i)=>i+1).join(" ")]],
    clue:"The lowest survey stake bears a copper crest beneath the sand.",treasure:"Copper Survey Crest",
  },
  {
    title:"The Customs Priority Roll",intro:"Five caravans claim they were first in line. Reconstruct the official order from priority, arrival time, and registry ID.",
    statement:"Order records by descending priority. For equal priority, order by ascending arrival time. If both fields match, order by ascending record ID. IDs are 1-based input positions.",
    input:"First line: n. Each of the next n lines contains priority and arrival time.",output:"The n record IDs in dispatch order, separated by spaces.",
    constraints:"1 ≤ n ≤ 20000. -10^9 ≤ priority ≤ 10^9. 0 ≤ arrival ≤ 10^9.",
    samples:[["4\n5 8\n7 3\n5 2\n7 3\n","2 4 3 1","Records 2 and 4 tie on both fields. Between 3 and 1, record 3 arrived first."],["3\n-2 3\n-1 9\n-2 1\n","2 3 1","The larger signed priority comes first. Arrival breaks the remaining tie."]],
    hints:["Think of the three fields as a lexicographic key.","Descending priority can be represented by its negative in an ascending key.","Carry the original ID along when sorting so a final tie has a defined result."],
    editorial:"Associate each record with key (-priority, arrival, ID). Compare the first component and use the second or third only when earlier components tie. This key defines exactly the requested total order, so sorting it yields the dispatch sequence. Print IDs, not the fields that determined their order. A stable sort by the first two fields could also preserve input order, but making ID part of the key works with any correct comparator. Beware of reversing arrival order when implementing the descending priority comparison.",
    time:"O(n log n)",space:"O(n) for the records",starter:pairs,
    reference:using(pairs,[
      '    vector<int> ids(n);iota(ids.begin(),ids.end(),0);\n    sort(ids.begin(),ids.end(),[&](int i,int j){auto [p,t]=records[i];auto [q,u]=records[j];return make_tuple(-p,t,i)<make_tuple(-q,u,j);});\n    for(int i:ids)cout<<i+1<<" ";',
      '        Integer[] ids=new Integer[n];for(int i=0;i<n;i++)ids[i]=i;\n        Arrays.sort(ids,Comparator.<Integer>comparingInt(i->-records[i][0]).thenComparingInt(i->records[i][1]).thenComparingInt(i->i));\n        StringBuilder out=new StringBuilder();for(int i:ids)out.append(i+1).append(" ");System.out.print(out);',
      'ids=sorted(range(n),key=lambda i:(-records[i][0],records[i][1],i))\nprint(*(i+1 for i in ids))',
    ]),
    oracle:s=>{const a=rows(s);const rank=a.map(([p,t],i)=>a.filter(([q,u],j)=>q>p||(p===q&&(u<t||(t===u&&j<i)))).length);const order=[];rank.forEach((r,i)=>order[r]=i+1);return order.join(" ");},
    hidden:["1\n0 0\n","4\n0 8\n0 8\n0 8\n0 8\n",[n+"\n"+"100 50\n".repeat(n),Array.from({length:n},(_,i)=>i+1).join(" ")]],
    clue:"The top dispatch tag folds over a pearl-stamped customs token.",treasure:"Pearl Customs Token",
  },
  {
    title:"The Unified Dune Claims",intro:"Surveyors registered overlapping stretches of a caravan road. The magistrate needs a single map of the land claimed by at least one surveyor.",
    statement:"Given half-open intervals [l,r), output their union as the smallest number of half-open intervals. Intervals that touch at an endpoint must merge. Output in ascending order of left endpoint.",
    input:"First line: n. Then n lines each containing l r.",output:"First line: number of resulting intervals. Then one line l r per interval.",
    constraints:"1 ≤ n ≤ 20000. -10^9 ≤ l < r ≤ 10^9. Endpoints are integers.",
    samples:[["4\n4 7\n-2 1\n1 3\n6 8\n","2\n-2 3\n4 8","The first group touches at 1, and the second group overlaps from 6 to 7."],["2\n0 6\n2 4\n","1\n0 6","The smaller claim is already contained in the larger one."]],
    hints:["Process claims in order of left endpoint.","Maintain the right boundary of the current merged claim.","When the next left endpoint exceeds that boundary, finish the current claim. Otherwise extend it with max of the right endpoints."],
    editorial:"Sort the intervals by left endpoint. Keep one current merged interval. If the next start is at most its end, their union is contiguous, so extend the end if needed. If the next start lies strictly beyond the end, a gap exists. No later interval starts earlier than this next one, so the current component is final. Start a new component and continue. Flush the last component at the end. Every emitted interval is maximal, which makes the output unique and minimizes the count. Use <= to merge touching endpoints and max to handle containment.",
    time:"O(n log n)",space:"O(n)",starter:pairs,
    reference:using(pairs,[
      '    sort(records.begin(),records.end());vector<pair<int,int>> merged;\n    for(auto [l,r]:records){if(merged.empty()||l>merged.back().second)merged.emplace_back(l,r);else merged.back().second=max(merged.back().second,r);}\n    cout<<merged.size()<<"\\n";for(auto [l,r]:merged)cout<<l<<" "<<r<<"\\n";',
      '        Arrays.sort(records,Comparator.comparingInt(a->a[0]));List<int[]> merged=new ArrayList<>();\n        for(int[] row:records){if(merged.isEmpty()||row[0]>merged.get(merged.size()-1)[1])merged.add(row);else{int[] last=merged.get(merged.size()-1);last[1]=Math.max(last[1],row[1]);}}\n        StringBuilder out=new StringBuilder().append(merged.size()).append("\\n");for(int[] row:merged)out.append(row[0]).append(" ").append(row[1]).append("\\n");System.out.print(out);',
      'merged=[]\nfor l,r in sorted(records):\n    if not merged or l>merged[-1][1]:\n        merged.append([l,r])\n    else:\n        merged[-1][1]=max(merged[-1][1],r)\nprint(len(merged))\nfor l,r in merged:\n    print(l,r)',
    ]),
    oracle:s=>{const units=new Set();for(const [l,r] of rows(s))for(let i=l;i<r;i++)units.add(i);const out=[];for(const i of [...units].sort((a,b)=>a-b)){const last=out.at(-1);if(last&&last[1]===i)last[1]++;else out.push([i,i+1]);}return out.length+"\n"+out.map(a=>a.join(" ")).join("\n");},
    hidden:["1\n-5 -2\n","4\n-4 0\n0 1\n1 2\n-1 4\n",[n+"\n"+Array.from({length:n},(_,i)=>[n-i-1,n-i].join(" ")).join("\n")+"\n","1\n0 "+n]],
    clue:"The final map's one remaining seam hides an ivory boundary pin.",treasure:"Ivory Boundary Pin",
  },
  {
    title:"The Balanced Camel Loads",intro:"Each camel needs one counterweight. The caravan pays for the total mismatch in weight between the camel loads and their counterweights.",
    statement:"Pair each entry of array A with a distinct entry of array B so all entries in both arrays are used once. Minimize the total sum of absolute differences of the pairs.",
    input:"First line: n. Second line: n signed values of A. Third line: n signed values of B.",output:"One integer, the minimum total mismatch.",
    constraints:"1 ≤ n ≤ 20000. Values are between -10^9 and 10^9. The answer may require 64-bit arithmetic.",
    samples:[["3\n9 1 6\n2 10 5\n","3","Pair 1 with 2, 6 with 5, and 9 with 10."],["2\n-2 -2\n-4 5\n","9","The two mismatches are 2 and 7."]],
    hints:["Try putting both sets of readings in the same order.","For a≤b and c≤d, pairing a with c and b with d costs no more than crossing the pairs.","Sort both arrays and sum their elementwise differences using 64-bit arithmetic."],
    editorial:"Sort both arrays ascending and pair equal ranks. To justify it, consider two crossed pairs, matching a≤b with d≥c respectively. The function |x-c|-|x-d| is nondecreasing in x when c≤d, so exchanging those pairs to (a,c),(b,d) cannot increase the total cost. Repeatedly uncross any inversion in the matched ranks. The resulting monotone matching is exactly the equal-rank pairing, so it is optimal. Duplicates can use any consistent rank order. Convert to a 64-bit value before subtracting or accumulating.",
    time:"O(n log n)",space:"O(n) for the arrays",starter:twoArrays,
    reference:using(twoArrays,[
      '    sort(a.begin(),a.end());sort(b.begin(),b.end());long long cost=0;\n    for(int i=0;i<n;i++)cost+=llabs((long long)a[i]-b[i]);cout<<cost;',
      '        Arrays.sort(a);Arrays.sort(b);long cost=0;\n        for(int i=0;i<n;i++)cost+=Math.abs((long)a[i]-b[i]);System.out.print(cost);',
      'print(sum(abs(x-y) for x,y in zip(sorted(a),sorted(b))))',
    ]),
    oracle:s=>{const [n,...a]=nums(s);const search=(i,left)=>!left.length?0:Math.min(...left.map((x,j)=>Math.abs(a[i]-x)+search(i+1,left.filter((_,k)=>k!==j))));return String(search(0,a.slice(n)));},
    hidden:["1\n-1000000000\n1000000000\n","5\n9 0 1 -6 -1\n0 9 1 1 -6\n",[n+"\n"+Array(n).fill(-1000000000).join(" ")+"\n"+Array(n).fill(1000000000).join(" ")+"\n","40000000000000"]],
    clue:"A matched pair of counterweights holds the caravan's amber balance stone.",treasure:"Amber Balance Stone",
  },
  {
    title:"The Closing Bazaar",intro:"Buyers leave the bazaar at different bells. One delivery fits in each time slot. Select the jobs that earn the most before their buyers disappear.",
    statement:"Each job takes exactly one slot. A job with deadline d must occupy a slot numbered 1 through d inclusive. At most one job can occupy a slot and each job can be chosen at most once. Maximize the sum of rewards of scheduled jobs.",
    input:"First line: n. Then n lines each containing deadline d and reward w.",output:"One integer, the largest total reward.",
    constraints:"1 ≤ n ≤ 20000. 1 ≤ d ≤ n. 1 ≤ w ≤ 10^9.",
    samples:[["4\n1 9\n1 4\n2 8\n3 5\n","22","Place rewards 9, 8, and 5 into slots 1, 2, and 3."],["3\n2 10\n2 1\n1 9\n","19","Use reward 9 in slot 1 and reward 10 in slot 2."]],
    hints:["Consider jobs in nondecreasing deadline order.","The selected set can become infeasible only when adding a job exceeds its deadline capacity.","Use a min-heap of rewards. Whenever its size exceeds the current deadline, discard the smallest reward."],
    editorial:"Sort by deadline and maintain a min-heap of selected rewards. Add each job. If the heap has more jobs than the current deadline d, remove the smallest reward. The earlier selected set was feasible. Before any overflow, a new job with this latest deadline can be appended at the next slot. When there are d+1 jobs, keeping them all is impossible. Removing any one restores feasibility: if the new job is kept, the remaining earlier jobs can shift left and the new job occupies slot d. Removing the minimum keeps the best reward among these choices. A discarded minimum can never improve a later optimum: it used a slot within the current deadline, and the retained jobs already fill that capacity with rewards at least as large. This gives the standard greedy exchange argument for nested deadline capacities. Equal deadlines can be processed in any order. Store the reward sum in 64 bits.",
    time:"O(n log n)",space:"O(n)",starter:pairs,
    reference:using(pairs,[
      '    sort(records.begin(),records.end());priority_queue<int,vector<int>,greater<int>> keep;long long total=0;\n    for(auto [d,w]:records){keep.push(w);total+=w;if((int)keep.size()>d){total-=keep.top();keep.pop();}}\n    cout<<total;',
      '        Arrays.sort(records,Comparator.comparingInt(a->a[0]));PriorityQueue<Integer> keep=new PriorityQueue<>();long total=0;\n        for(int[] job:records){keep.add(job[1]);total+=job[1];if(keep.size()>job[0])total-=keep.remove();}\n        System.out.print(total);',
      'from heapq import heappush,heappop\nkeep=[]\ntotal=0\nfor d,w in sorted(records):\n    heappush(keep,w)\n    total+=w\n    if len(keep)>d:\n        total-=heappop(keep)\nprint(total)',
    ]),
    oracle:s=>{const a=rows(s);let best=0;for(let mask=0;mask<(1<<a.length);mask++){const set=a.filter((_,i)=>mask&(1<<i)).sort((x,y)=>x[0]-y[0]);if(set.every(([d],i)=>d>i))best=Math.max(best,set.reduce((total,row)=>total+row[1],0));}return String(best);},
    hidden:["1\n1 1000000000\n","4\n1 4\n1 1\n2 2\n2 8\n", "5\n3 5\n1 9\n2 2\n2 7\n4 3\n",[n+"\n"+Array.from({length:n},(_,i)=>(i+1)+" 1000000000").join("\n")+"\n","20000000000000"]],
    clue:"At the final bell the best-paid buyer leaves a gilded deadline dial by the gate.",treasure:"Gilded Deadline Dial",
  },
]);
