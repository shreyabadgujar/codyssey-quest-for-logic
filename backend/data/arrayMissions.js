const { references, starters } = require("./arrayReferences");
const { oracle } = require("./arrayOracle");
// All test material and full-program references stay in the backend.
const specs = [
  {
    title: "The Harbour Ledger", intro: "Someone scraped the final balance from the harbour ledger. Credits and debts survived on separate strips; their signed total identifies the missing entry.",
    statement: "Given n signed ledger entries, compute their sum. Positive entries add coins and negative entries remove coins. The starting balance is zero. Do not discard negative entries or take absolute values.",
    extra: "No additional input.", output: "One integer: the final signed balance.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9. The answer may exceed 32-bit integer range.",
    samples: [[[8,-3,5,-2],[],"8","8 - 3 + 5 - 2 = 8."], [[-7],[],"-7","The only entry is a debt, so the balance remains negative."]],
    hints: ["Each strip contributes independently.","Keep a running signed total while scanning the array.","Use long long in C++, long in Java, or Python integers."],
    editorial: "Start a total at zero and add every entry exactly once. After processing i entries, the total equals their sum; adding entry i+1 preserves this invariant. At the end the total is precisely the requested balance. Negative totals and zero are valid; never reset the total when it becomes negative. Use a 64-bit accumulator because 20000 entries can sum to 2×10^13.", time: "O(n)", space: "O(1) auxiliary", clue: "Lift the brass counterweight beneath the harbour ledger; a salt-stained compass waits there.",
  },
  {
    title: "The Forged Cargo Marks", intro: "A smuggler marked every counterfeit crate with the same number. The investigator must preserve the order of all genuine cargo while removing those marks.",
    statement: "Remove every occurrence of the forbidden value x from the array. Preserve the relative order of all remaining values. Print the number of survivors, then the surviving sequence. The operation concerns values, not array indices.",
    extra: "A final line contains the forbidden value x.", output: "First line: survivor count. Second line: survivors separated by spaces. If none survive, the second line is empty.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i], x ≤ 10^9.",
    samples: [[[4,7,4,2,7],[4],"3\n7 2 7","Both 4s are removed; the two 7s keep their positions relative to 2."], [[9,9],[9],"0\n","All crates are counterfeit, leaving no values."]],
    hints: ["Filtering must not reorder the cargo.","Scan left to right and keep only values different from x.","An in-place solution writes each retained value at the next free position."],
    editorial: "Maintain a write index initially zero. Scan the original array from left to right. Whenever a value differs from x, copy it to the write index and advance that index. The written prefix always contains exactly the valid values from the scanned prefix in their original order. Consequently the final write index is the survivor count. A separate result list is also correct but uses O(n) space. Handle all-removed and none-removed cases explicitly in output.", time: "O(n)", space: "O(1) auxiliary with in-place compaction", clue: "Inside the last unmarked crate lies the ivory manifest seal.",
  },
  {
    title: "The Shifted Beacon Ring", intro: "The lighthouse keeper rotated a row of beacon readings to hide its starting point. Restore the requested rightward shift without simulating every tide.",
    statement: "Rotate the array to the right by k positions. One right rotation moves the final element to the front and shifts the other elements one place right. Output the final array. k can be larger than n.",
    extra: "A final line contains k.", output: "The n rotated values, separated by spaces.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9; 0 ≤ k ≤ 10^12.",
    samples: [[[10,20,30,40,50],[2],"40 50 10 20 30","The last two readings become the first two."], [[3,1,4],[6],"3 1 4","Six shifts are two full rotations, so the order is unchanged."]],
    hints: ["A full cycle of n rotations changes nothing.","Reduce k modulo n.","Output position i comes from original position (i+n-k) mod n."],
    editorial: "Let r=k mod n. The last r values move in front of the first n-r values, preserving order within both parts. Equivalently, the value at output index i is a[(i+n-r) mod n]. This formula follows by reversing the movement j→(j+r) mod n and visits every input index once. When r=0 the array is unchanged. Repeated single rotations can take O(nk), so compute the destination directly or use three reversals.", time: "O(n)", space: "O(1) auxiliary with indexed output or reversals", clue: "The restored north beacon points to a copper lens buried in the eastern sand.",
  },
  {
    title: "The Most Repeated Seal", intro: "Wax seals recovered from the wreck reveal a repeating supplier code. The most common code identifies the supplier; ties follow the archive's smallest-code rule.",
    statement: "Find the value with greatest frequency in the array. If multiple values have that frequency, choose the smallest numerical value. Output both the chosen value and its frequency.",
    extra: "No additional input.", output: "Two integers: chosen value and frequency.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9.",
    samples: [[[5,2,5,2,9],[],"2 2","2 and 5 occur twice; the smaller value 2 wins."], [[-4,-4,-1],[],"-4 2","Negative codes are valid; -4 occurs twice."]],
    hints: ["Count occurrences, not runs of adjacent equal values.","Use a frequency map or sort the array.","Update the winner for a larger frequency or an equal frequency with a smaller value."],
    editorial: "Count each value in a frequency map. Examine every distinct value and retain the best according to the ordered pair (-frequency,value). The count is exact because every occurrence increments exactly one entry. Comparing all distinct entries with the same tie rule yields the required winner. A hash map gives expected linear time; sorting or an ordered map is also valid in O(n log n). Do not assume codes are positive or that the first observed tie winner is smallest.", time: "O(n) expected with a hash map; O(n log n) with sorting", space: "O(n)", clue: "The supplier's smallest seal fits a silver keyhole behind the customs desk.",
  },
  {
    title: "The Surveyor's Missing Totals", intro: "The surveyor recorded signed changes along a coastal route but lost the totals for several stretches. Repeatedly recounting the same landmarks will miss the departing ship.",
    statement: "For each query (l,r), report the sum a[l]+...+a[r] using 1-based inclusive indices. The array never changes. Answer the queries in input order.",
    extra: "After the array, read q, then q lines containing l and r.", output: "One sum per query, each on its own line.", constraints: "1 ≤ n,q ≤ 20000; -10^9 ≤ a[i] ≤ 10^9; 1 ≤ l ≤ r ≤ n.",
    samples: [[[3,-2,7,1],[3,1,4,2,3,3,3],"9\n5\n7","The whole route totals 9, positions 2–3 total 5, and position 3 alone is 7."], [[-5],[2,1,1,1,1],"-5\n-5","Repeated queries return the same negative total."]],
    hints: ["Neighbouring queries may reuse most of their entries.","Precompute totals for prefixes, including an empty prefix.","For inclusive [l,r], subtract prefix[l-1] from prefix[r]."],
    editorial: "Build prefix[0]=0 and prefix[i]=prefix[i-1]+a[i] for 1-based i. In prefix[r], the unwanted entries are precisely those in prefix[l-1]; subtracting cancels them and leaves the requested interval. Preprocessing costs O(n), then each query costs O(1). Store prefix totals in 64-bit integers. The formula handles l=1, single-element ranges, repeated queries and negative values without special arithmetic cases.", time: "O(n+q)", space: "O(n)", clue: "The third survey notch conceals a folded tide chart in a bone tube.",
  },
  {
    title: "The Quiet Patrol Stretch", intro: "Each harbour sector has a nonnegative patrol cost. The detective needs the longest uninterrupted stretch that can be inspected before the budget runs out.",
    statement: "Find the maximum length of a contiguous subarray whose sum is at most budget B. All array values are nonnegative. If no nonempty subarray is affordable, output 0. You may not skip sectors inside a chosen stretch.",
    extra: "A final line contains B.", output: "One integer: the maximum affordable length.", constraints: "1 ≤ n ≤ 20000; 0 ≤ a[i] ≤ 10^9; 0 ≤ B ≤ 10^13.",
    samples: [[[2,1,3,1,1],[5],"3","The final three sectors cost 5; no four consecutive sectors fit."], [[4,5],[0],"0","Neither nonempty stretch fits a zero budget."]],
    hints: ["Nonnegative costs make a window's sum monotone when either end advances.","Extend the right end, then remove values from the left until affordable.","Record r-l+1 after shrinking; zero-cost sectors should remain in the window."],
    editorial: "Maintain a window [l,r] and its sum. Add a[r], then advance l while the sum exceeds B. Since all values are nonnegative, every discarded left boundary is infeasible for this r and for any later extension until it is discarded; the remaining earliest feasible boundary maximizes length ending at r. Track the largest such length. Each index enters and leaves once. This argument fails for signed costs, which is why this mission explicitly prohibits them. All-zero arrays and B=0 are important boundaries.", time: "O(n)", space: "O(1)", clue: "The quietest patrol stretch ends at a hollow bollard containing an emerald token.",
  },
  {
    title: "The Profitable Smuggler Trail", intro: "A trail alternates recovered treasure and costly decoys. The detective must identify the most valuable continuous segment rather than select scattered profitable stops.",
    statement: "Find the largest sum of any nonempty contiguous subarray. At least one array element must be selected, even if every element is negative.",
    extra: "No additional input.", output: "One integer: the maximum nonempty subarray sum.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9.",
    samples: [[[-2,4,-1,3,-5],[],"6","The segment [4,-1,3] has sum 6."], [[-8,-3,-6],[],"-3","An empty segment is forbidden; select the single -3."]],
    hints: ["Think about the best segment ending exactly at an index.","Either extend the previous segment or start at the current element.","Initialize both running and global best to a[0], not zero."],
    editorial: "Let end[i] be the largest sum of a nonempty segment ending at i. Such a segment either consists only of a[i], or extends a segment ending at i-1, so end[i]=max(a[i],end[i-1]+a[i]). Keep only the previous value and update a global maximum. Induction proves the recurrence considers every valid segment ending at each position, and the maximum over endings is the answer. Initializing from the first value correctly handles all-negative inputs. Use 64-bit sums.", time: "O(n)", space: "O(1)", clue: "Beneath the trail's richest marker is a ruby-studded sextant handle.",
  },
  {
    title: "The Exact Tribute", intro: "A coded tribute records a target signed amount. Count every uninterrupted run of ledger entries that could have paid exactly that amount, including overlapping runs.",
    statement: "Count nonempty contiguous subarrays with sum exactly K. Equal sums at different positions represent different subarrays. Values may be negative or zero.",
    extra: "A final line contains K.", output: "One integer: the number of matching subarrays.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9; -10^13 ≤ K ≤ 10^13.",
    samples: [[[1,-1,1],[1],"3","The two singleton 1s and the entire array all total 1."], [[0,0,0],[0],"6","All six nonempty subarrays total zero."]],
    hints: ["Represent a subarray sum as the difference of two prefix sums.","For current prefix s, earlier prefixes equal to s-K are valid starts.","Count before inserting the current prefix; begin with frequency[0]=1."],
    editorial: "Keep a frequency map of earlier prefix sums, initially containing the empty prefix 0 once. After reading x, update s and add frequency[s-K] to the answer, then increment frequency[s]. Every earlier matching prefix determines exactly one nonempty interval ending here; querying before inserting prevents counting an empty interval when K=0. Each interval has one ending, so none are double-counted. Negative values invalidate a simple sum-based sliding window. Both prefix sums and counts need 64-bit arithmetic.", time: "O(n) expected", space: "O(n)", clue: "The tribute count opens the cedar strongbox holding a pearl abacus bead.",
  },
  {
    title: "The Paired Crate Cipher", intro: "Two crate weights together spell the smuggler's code. Identical weights belong to distinct crates, so duplicate values can hide many valid pairings.",
    statement: "Count pairs of original indices (i,j) with i<j and a[i]+a[j]=K. Count each index pair once. The array need not be sorted and duplicate values must contribute their full multiplicity.",
    extra: "A final line contains K.", output: "One integer: the number of matching index pairs.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9; -2×10^9 ≤ K ≤ 2×10^9.",
    samples: [[[1,3,1,3],[4],"4","Each of the two 1-crates pairs with either of the two 3-crates."], [[2,2,2],[4],"3","Choose any two distinct indices: 3 choose 2 = 3."]],
    hints: ["Sorting changes positions but preserves the number of value pairings.","Use two pointers and compare their sum with K.","For unequal matching values multiply run lengths; for equal values use c(c-1)/2."],
    editorial: "Sort the weights and place pointers at both ends. If their sum is too small, the left value cannot match any remaining value, so advance left; if too large, decrease right. When the sum matches and the endpoint values differ, count their runs c and d and add c*d before skipping both runs. When endpoints are equal, every remaining value is identical, giving c(c-1)/2 pairs; stop. These operations partition all possible matches without losing multiplicity. A frequency-map one-pass alternative is also valid.", time: "O(n log n) with sorting", space: "O(n) or O(log n), depending on sort implementation", clue: "The paired crates conceal a two-part bronze medallion.",
  },
  {
    title: "The Contiguous Safe Cargo", intro: "Safe crates must be grouped into one inspection bay. The crane can swap any two positions, but every swap costs precious time.",
    statement: "A value is safe if it is at most threshold T. Find the minimum number of swaps of arbitrary pairs of positions needed to make all safe values occupy one contiguous block in this linear array. Unsafe values may appear anywhere else. The array is not circular. If there are no safe values, output 0.",
    extra: "A final line contains T.", output: "One integer: the minimum swaps.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i], T ≤ 10^9.",
    samples: [[[2,9,1,8,3],[3],"1","There are three safe values. In positions 1–3, swap 9 with the final 3."], [[7,8],[1],"0","There are no safe values to group."]],
    hints: ["The final block length is fixed by the total number of safe values.","For each block of that length, count unsafe occupants.","Each unsafe occupant can be swapped with a safe value outside; minimize this count using a sliding window."],
    editorial: "Let g be the total number of safe elements. Any final safe block must have length g. In a candidate block with b unsafe values, exactly b safe values are outside. At least b swaps are necessary because each unsafe slot must change, and b swaps suffice by pairing those slots with outside safe values. Thus minimize b over all length-g windows. Maintain the count as the window slides by subtracting the departing indicator and adding the entering indicator. g=0 or g=n gives zero.", time: "O(n)", space: "O(1)", clue: "The cleared cargo bay reveals an amber whistle beneath its central plank.",
  },
  {
    title: "The Shortest Storm Crossing", intro: "Storm readings contain gains and losses. Find the shortest continuous crossing that accumulates enough signal; a negative reading can make the usual patrol window unreliable.",
    statement: "Find the length of the shortest nonempty contiguous subarray with sum at least K. Values may be negative. Output -1 if no such subarray exists.",
    extra: "A final line contains K.", output: "One integer: shortest qualifying length, or -1.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9; 1 ≤ K ≤ 10^13.",
    samples: [[[2,-1,2],[3],"3","Only the entire array reaches 3."], [[[84,-37,32,40,95]][0],[167],"3","The final three entries total 167. No length-1 or length-2 segment reaches the target."]],
    hints: ["Use prefix sums; a negative value breaks ordinary window monotonicity.","A later prefix with a smaller or equal sum dominates an earlier larger prefix as a future starting point.","Maintain increasing prefix sums in a deque; pop qualifying starts from the front and dominated starts from the back."],
    editorial: "Build prefix sums p. For each endpoint i, first remove deque-front indices j while p[i]-p[j]≥K, updating the shortest length. Once j qualifies, future endpoints cannot yield a shorter interval from j, so removal is safe. Next remove back indices j with p[j]≥p[i]: i is later and no larger in prefix value, so it gives an at-least-as-large sum and a shorter interval for every future endpoint. Append i. The deque therefore keeps exactly the undominated candidates. Each index is inserted and removed at most once. Start with p[0]=0, use nonempty intervals, and return -1 if none qualify.", time: "O(n)", space: "O(n)", clue: "At the shortest crossing's far post hangs the obsidian storm charm.",
  },
  {
    title: "The K-Sigil Evidence Chain", intro: "An admissible chain of evidence must contain exactly K different sigils. Repeated sigils still occupy space, and every pair of endpoints describes a separate chain.",
    statement: "Count nonempty contiguous subarrays containing exactly K distinct numerical values. Multiple occurrences of the same value count as one distinct value, but different index intervals are counted separately.",
    extra: "A final line contains K.", output: "One integer: the number of qualifying subarrays.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9; 1 ≤ K ≤ n.",
    samples: [[[1,2,1,2,3],[2],"7","The intervals are [1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], and [1,2,1,2]."], [[5,5,5],[1],"6","Every nonempty interval contains the single sigil 5."]],
    hints: ["Exactly K is awkward to maintain directly as endpoints move.","Subtract the number with at most K-1 distinct values from the number with at most K.","For an at-most window ending at r with earliest valid l, there are r-l+1 valid starts."],
    editorial: "Define F(c) as the number of subarrays with at most c distinct values. A frequency-map window computes F: extend right, shrink left while the map has too many keys, then add r-l+1. Every start between l and r is valid because removing a prefix cannot introduce a new distinct value; earlier starts are invalid by the shrink invariant. Exactly-K intervals are precisely those counted by F(K) but not F(K-1). Erase frequency entries when their count becomes zero. F(0)=0. The two scans are linear expected time, with a 64-bit answer.", time: "O(n) expected", space: "O(n)", clue: "The K-sigil archive drawer holds a lapis seal of admissible evidence.",
  },
  {
    title: "The Reversed Convoy Orders", intro: "The convoy manifest was scrambled. Each heavier-priority entry appearing before a lighter one is evidence of one reversed order.",
    statement: "Count inversions: pairs of indices i<j such that a[i]>a[j]. Equal values are not inversions. Output the count without changing the definition to adjacent pairs only.",
    extra: "No additional input.", output: "One integer: inversion count.", constraints: "1 ≤ n ≤ 20000; -10^9 ≤ a[i] ≤ 10^9.",
    samples: [[[3,1,2],[],"2","3 precedes both 1 and 2; those are the only inversions."], [[2,2,1],[],"2","Each 2 precedes 1; the two equal 2s are not an inversion."]],
    hints: ["Each element needs to know how many smaller values lie to its right.","Compress values to ranks and count suffix frequencies efficiently, or use merge sort.","Scan right to left; query Fenwick ranks strictly below the current rank, then insert the current rank."],
    editorial: "Sort distinct values to assign ranks preserving their ordering. Scan the original array from right to left while a Fenwick tree stores counts of the already processed suffix. Its prefix query at rank-1 counts exactly the smaller suffix values, hence exactly the inversions with the current left endpoint. Add that count and insert the current value. Each inversion has a unique left endpoint and is counted once. Strict rank-1 excludes equal values. Coordinate compression handles large and negative integers. The answer can be n(n-1)/2; store it in 64 bits. Merge-sort inversion counting is equally valid.", time: "O(n log n)", space: "O(n)", clue: "The restored convoy order exposes a garnet rank badge in the captain's box.",
  },
  {
    title: "The Weakest Link Tribute", intro: "Every continuous stretch of an ancient chain pays tribute equal to its weakest link. The archive asks for the total tribute over every possible stretch.",
    statement: "For every nonempty contiguous subarray, take its minimum value. Sum all these minima and output the result modulo 1000000007. Equal values at different indices are distinct elements; each subarray contributes exactly once.",
    extra: "No additional input.", output: "One integer in [0,1000000006]: the sum of minima modulo 1000000007.", constraints: "1 ≤ n ≤ 20000; 1 ≤ a[i] ≤ 10^9.",
    samples: [[[3,1,2,4],[],"17","Singleton minima sum to 10, length-2 minima to 4, length-3 minima to 2, and the whole-array minimum is 1."], [[2,2],[],"6","The three subarrays each have minimum 2; duplicates must not double-count the length-2 interval."]],
    hints: ["Count the contribution of each element as a minimum instead of enumerating intervals.","Find a smaller boundary to the left and a smaller-or-equal boundary to the right.","A monotone stack that pops on >= assigns tied minima consistently; contribute a[i]×(i-left)×(right-i)."],
    editorial: "Maintain indices in a strictly increasing-value stack. On encountering a value no larger than the top, pop index i; the current index r is its first smaller-or-equal right boundary, and the new stack top l is its previous strictly smaller left boundary. There are (i-l) choices for a left endpoint and (r-i) choices for a right endpoint for which i is the assigned minimum. Add their product times a[i]. The asymmetric tie convention assigns any interval to its rightmost minimum, so equal values neither lose nor duplicate intervals. Flush the stack at r=n. Apply modulo between multiplications to avoid overflow; each index is pushed and popped once.", time: "O(n)", space: "O(n)", clue: "The chain's final tally releases a moonstone link from the tribute altar.",
  },
  {
    title: "The Final Expedition Windows", intro: "The expedition has exactly M crews. Each crew must inspect K consecutive sectors; crews may leave gaps but must never inspect the same sector twice.",
    statement: "Choose exactly M pairwise non-overlapping contiguous subarrays, each of length K, maximizing the sum of all selected values. Adjacent selected windows are allowed. Gaps are allowed. Values can be negative, and you must still choose exactly M windows. Print the optimal total, not the window positions.",
    extra: "A final line contains K and M.", output: "One integer: the maximum total of exactly M non-overlapping length-K windows.", constraints: "1 ≤ n ≤ 10000; 1 ≤ M ≤ 50; 1 ≤ K ≤ n; K×M ≤ n; -10^9 ≤ a[i] ≤ 10^9.",
    samples: [[[1,2,1,2,6,7,5,1],[2,3],"23","Windows at 1-based ranges [1,2], [4,5], [6,7] total 3+8+12=23."], [[-5,-1,-3,-2],[1,2],"-3","Choose -1 and -2. Taking no windows would be invalid."]],
    hints: ["Choosing the largest remaining window greedily can block a better combination.","Use a state for exactly j windows within the first i elements.","Either skip element i, or take the length-K window ending at i and add the best j-1 windows within the first i-K elements."],
    editorial: "Precompute prefix sums so a length-K window ending at i has sum p[i]-p[i-K]. Let dp[j][i] be the best total from exactly j windows within the first i elements. Either an optimum does not use i, giving dp[j][i-1], or it uses the window ending at i, giving dp[j-1][i-K]+p[i]-p[i-K]. These cases exhaust all optima and the second enforces non-overlap. Initialize dp[0][i]=0 and every impossible positive-j state to negative infinity, not zero; otherwise negative inputs incorrectly permit fewer windows. Compute j rows, retaining only the preceding row. Because K×M≤n the final state is feasible. Use 64-bit arithmetic and never add a window to an impossible state.", time: "O(nM)", space: "O(n)", clue: "The final crews recover the Chronometer's etched dial beneath the expedition's last cairn.",
  },
];
function input(a, extra=[]) { return `${a.length}\n${a.join(" ")}\n${extra.join(" ")}\n`; }
function makeCase(level,a,extra=[],explanation="") { return { input: input(a,extra), expectedOutput: oracle(level,a,extra), explanation }; }
function hidden(level) {
  const signed = [1,2,3,4,5,7,8,9,10,11,12,13,15].includes(level);
  let seed=level*7919;
  const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed;};
  const extra=(a)=>level===5?[3,1,a.length,1,1,a.length,a.length]:level===15?[1,Math.min(2,a.length)]:
    [2,3,6,8,9,10,11,12].includes(level)?[level===3?1000000000000:level===12?Math.min(3,a.length):level===11?7:3]:[];
  const arrays = [[signed?-1:1], Array(7).fill(level===14?2:0), [5,4,3,2,1], Array.from({length:20},()=>signed?(random()%13)-6:level===14?random()%12+1:random()%12)];
  const cases=arrays.map(a=>makeCase(level,a,extra(a)));
  const n=level===15?10000:20000;
  let a=Array(n).fill(1), e=extra(a), expected;
  switch(level){
    case 1:a=Array(n).fill(1000000000);expected=String(n*1000000000);break;
    case 2:e=[1];expected="0\n";break;
    case 3:e=[999999999999];expected=a.join(" ");break;
    case 4:expected=`1 ${n}`;break;
    case 5:e=[3,1,n,1,1,n,n];expected=`${n}\n1\n1`;break;
    case 6:e=[n];expected=String(n);break;
    case 7:expected=String(n);break;
    case 8:a=Array(n).fill(0);e=[0];expected=String(n*(n+1)/2);break;
    case 9:e=[2];expected=String(n*(n-1)/2);break;
    case 10:e=[1];expected="0";break;
    case 11:e=[n];expected=String(n);break;
    case 12:e=[1];expected=String(n*(n+1)/2);break;
    case 13:a=Array.from({length:n},(_,i)=>n-i);expected=String(n*(n-1)/2);break;
    case 14:expected=String((n*(n+1)/2)%1000000007);break;
    case 15:e=[100,50];expected="5000";break;
  }
  cases.push({input:input(a,e),expectedOutput:expected});
  return cases;
}
const missions=specs.map((s,i)=>{
  const level=i+1;
  const samples=s.samples.map(([a,e,expected,explanation])=>{
    const test=makeCase(level,a,e,explanation);
    if(test.expectedOutput.trimEnd()!==expected.trimEnd())throw new Error(`Sample mismatch Q${level}`);
    return {...test,expectedOutput:expected};
  });
  return { level, slug:`array-${String(level).padStart(2,"0")}`, title:s.title,
    difficulty:level<=5?"apprentice":level<=10?"journeyman":"master", stage:level<=5?"Explorer":level<=10?"Detective":"Mastermind",
    introduction:s.intro, description:s.statement, inputFormat:`First line: n. Second line: n space-separated integers a[1] ... a[n]. ${s.extra}`,
    outputFormat:s.output, constraints:s.constraints, hints:s.hints,
    editorial:{ explanation:s.editorial,timeComplexity:s.time,spaceComplexity:s.space },
    sampleTestCases:samples, hiddenTestCases:hidden(level), starterCode:starters(level), referenceSolutions:references(level),
    xpReward:40+level*10,coinReward:15+level*5,storyClue:s.clue,
    hiddenObject:{name:`Array relic ${level}`,position:{x:10+level*5,y:35+level%3*10},asset:"/assets/decorations/wax-seal.webp"},
    validator:"exact", executionLimits:{cpu:4,wall:15,memory:262144},
  };
});
module.exports={ missions, input };
