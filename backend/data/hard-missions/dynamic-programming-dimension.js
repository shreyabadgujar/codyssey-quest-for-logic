const {build,line,range,repeat}=require("./build");
module.exports=build("dynamic-programming-dimension",[
{
title:"The Rising Tribute",treasure:"Rising Tribute Seal",
intro:"The vault opens only after exactly k tributes in increasing inscription order. Choose the most valuable route without overlooking costly negative seals.",
statement:"Choose exactly k indices in their original order with strictly increasing values. Maximize the sum of the chosen values.",
input:"n k, then n signed values.",output:"The maximum sum, or IMPOSSIBLE if no such subsequence exists.",
constraints:"1 ≤ k ≤ min(n,8). n ≤ 20000. Absolute values are at most 10^9.",
samples:[["6 3\n5 1 4 2 6 8\n","19","The subsequence 5,6,8 beats the alternatives starting lower."],["4 2\n-8 -6 -6 -3\n","-9","Use -6 then -3. Two equal -6 values do not form a valid rise."]],
hidden:[["4 2\n7 7 7 7\n","IMPOSSIBLE"],["3 3\n-1000000000 0 1000000000\n","0"],["20000 8\n"+line(range(20000)),"159972"]],
hints:["Keep separate best sums for each subsequence length.","A transition must use an earlier index with a strictly smaller value.","Process one length layer at a time and query a Fenwick prefix maximum on compressed values."],
editorial:"For length one the best sum ending at each index is its own value. For a longer length, scan indices left to right. Query a Fenwick maximum over ranks strictly below the current value before inserting the previous layer's sum for this index. The tree thus includes exactly legal earlier endpoints. Adding the current value considers every legal predecessor; a missing prefix maximum means no transition. After k layers take the best ending sum. Negative sums remain valid and are distinct from unreachable states.",
time:"O(kn log n)",space:"O(n)",
cpp:String.raw`int n,k;cin>>n>>k;vector<int>a(n);for(auto&x:a)cin>>x;auto b=a;sort(b.begin(),b.end());vector<int> rank(n);for(int i=0;i<n;i++)rank[i]=lower_bound(b.begin(),b.end(),a[i])-b.begin()+1;const long long bad=LLONG_MIN/4;vector<long long>d(a.begin(),a.end()),e(n),f(n+1);while(--k){fill(f.begin(),f.end(),bad);for(int i=0;i<n;i++){long long best=bad;for(int j=rank[i]-1;j;j-=j&-j)best=max(best,f[j]);e[i]=best==bad?bad:best+a[i];for(int j=rank[i];j<=n;j+=j&-j)f[j]=max(f[j],d[i]);}d.swap(e);}long long ans=*max_element(d.begin(),d.end());if(ans==bad)cout<<"IMPOSSIBLE";else cout<<ans;`,
java:String.raw`int n=integer(),k=integer();int[] a=new int[n],b=new int[n],rank=new int[n];long bad=Long.MIN_VALUE/4;long[] d=new long[n],e=new long[n],f=new long[n+1];for(int i=0;i<n;i++){a[i]=b[i]=integer();d[i]=a[i];}Arrays.sort(b);for(int i=0;i<n;i++)rank[i]=Arrays.binarySearch(b,a[i])+1;while(--k>0){Arrays.fill(f,bad);for(int i=0;i<n;i++){long best=bad;for(int j=rank[i]-1;j>0;j-=j&-j)best=Math.max(best,f[j]);e[i]=best==bad?bad:best+a[i];for(int j=rank[i];j<=n;j+=j&-j)f[j]=Math.max(f[j],d[i]);}long[] tmp=d;d=e;e=tmp;}long ans=bad;for(long x:d)ans=Math.max(ans,x);System.out.print(ans==bad?"IMPOSSIBLE":Long.toString(ans));`,
py:`n,k=I(),I()
a=[I() for _ in range(n)]
ranks={x:i+1 for i,x in enumerate(sorted(set(a)))}
r=[ranks[x] for x in a]
m=len(ranks)
bad=-10**30
d=a[:]
for _ in range(1,k):
    f=[bad]*(m+1)
    e=[bad]*n
    for i,x in enumerate(r):
        j=x-1
        v=bad
        while j:
            if f[j]>v:
                v=f[j]
            j-=j&-j
        if v!=bad:
            e[i]=v+a[i]
        v=d[i]
        while x<=m:
            if v>f[x]:
                f[x]=v
            x+=x&-x
    d=e
ans=max(d)
print(ans if ans!=bad else 'IMPOSSIBLE')`,
},
{
title:"The Finite Armoury",treasure:"Armoury Capacity Dial",
intro:"The armoury records limited quantities of each tool. Work out the richest load the expedition can carry before the shutters fall.",
statement:"Choose at most c_i copies of each type i with weight w_i and value v_i. Maximize total value subject to total weight at most C. Choosing no tools is allowed.",
input:"n C, then n lines w v c.",output:"The greatest attainable total value.",
constraints:"1 ≤ n ≤ 75. 0 ≤ C ≤ 12000. 1 ≤ w ≤ 20000. -10^9 ≤ v ≤ 10^9. 0 ≤ c ≤ 10^9.",
samples:[["3 7\n2 5 2\n3 8 1\n4 11 1\n","19","One weight-3 tool and one weight-4 tool fill the load and give 19."],["2 5\n1 -4 7\n3 9 0\n","0","The positive tool is unavailable. The best load is empty."]],
hidden:[["1 0\n1 1000000000 1000000000\n","0"],["2 4\n2 1000000000 2\n1 -1 1000000000\n","2000000000"],["75 12000\n"+repeat(75,"1 1000000000 1000000000\n").join(""),"12000000000000"]],
hints:["For one tool type, capacity moves by multiples of that tool's weight.","Group capacities by remainder modulo the weight.","After subtracting a linear value term, each transition becomes a bounded sliding maximum."],
editorial:"Let old[j] be the best value with capacity at most j before a type. Fix a residue r and write j=r+tw. Choosing t-s copies contributes (t-s)v, with max(0,t-c)≤s≤t. Therefore new[j] is tv plus the maximum of old[r+sw]-sv over that sliding interval. A monotone deque maintains it by expiring indices too old and dropping dominated values at the back. The candidate s=t always represents zero copies. Across all residues each capacity enters and leaves a deque at most once per type.",
time:"O(nC) for positive C, O(n) when C=0",space:"O(C+1)",
cpp:String.raw`int n,C;cin>>n>>C;vector<long long>d(C+1),e(C+1);while(n--){int w,c;long long v;cin>>w>>v>>c;for(int r=0;r<w&&r<=C;r++){deque<pair<int,long long>>q;for(int t=0,j=r;j<=C;j+=w,t++){while(!q.empty()&&q.front().first<t-c)q.pop_front();long long key=d[j]-t*v;while(!q.empty()&&q.back().second<=key)q.pop_back();q.push_back({t,key});e[j]=t*v+q.front().second;}}d.swap(e);}cout<<d[C];`,
java:String.raw`int n=integer(),C=integer();long[] d=new long[C+1],e=new long[C+1],val=new long[C+1];int[] idx=new int[C+1];while(n-->0){int w=integer();long v=num();int c=integer();for(int r=0;r<w&&r<=C;r++){int h=0,b=0;for(int t=0,j=r;j<=C;j+=w,t++){while(h<b&&idx[h]<t-c)h++;long key=d[j]-t*v;while(h<b&&val[b-1]<=key)b--;idx[b]=t;val[b++]=key;e[j]=t*v+val[h];}}long[] tmp=d;d=e;e=tmp;}System.out.print(d[C]);`,
py:`from collections import deque
n,C=I(),I()
d=[0]*(C+1)
for _ in range(n):
    w,v,c=I(),I(),I()
    if w>C or v<=0 or not c:
        continue
    e=[0]*(C+1)
    for r in range(min(w,C+1)):
        q=deque()
        for t,j in enumerate(range(r,C+1,w)):
            while q and q[0][0]<t-c:
                q.popleft()
            key=d[j]-t*v
            while q and q[-1][1]<=key:
                q.pop()
            q.append((t,key))
            e[j]=t*v+q[0][1]
    d=e
print(d[C])`,
},
{
title:"The Unrepeated Vault Digits",treasure:"Unrepeated Cipher Plate",
intro:"A counting lock accepts only serials with no adjacent repeated digits and a balanced digit sum. Determine how many serials in the ledger could open it.",
statement:"Count integers in [L,R] whose decimal digits have no two equal adjacent digits and whose digit sum is divisible by M. Use ordinary decimal representation with no leading zeros. Zero is written as 0.",
input:"L R M.",output:"The number of accepted integers.",
constraints:"0 ≤ L ≤ R ≤ 10^18. 1 ≤ M ≤ 40.",
samples:[["0 30 3\n","11","Zero qualifies. Every multiple of 3 through 30 has a qualifying digit sum and no repeated neighbours."],["10 22 2\n","5","The valid numbers are 13, 15, 17, 19 and 20."]],
hidden:[["0 0 40\n","1"],["11 11 2\n","0"],["0 1000000000000000000 1\n",String((9n**19n-1n)/8n)]],
hints:["Count valid integers up to each bound separately.","A digit decision depends on the previous digit and the running sum modulo M.","Use a sentinel for the not-started state and memoize states whose prefix is already below the bound."],
editorial:"Count up to bound B using digit DP. A state records position, previous significant digit or not-started sentinel, residue, and whether the prefix still equals B's prefix. While not started, a zero is padding and does not restrict the next digit. Otherwise forbid repeating the previous digit and update the residue. At the end count residue zero, including the all-padding representation of 0. Each integer has exactly one padded digit sequence. Subtract count(L−1) from count(R), treating a negative bound as empty.",
time:"O(d·M·11·10), where d is the number of digits",space:"O(d·M·11)",
cpp:String.raw`long long l,r;int mod;cin>>l>>r>>mod;auto upto=[&](long long b)->long long{if(b<0)return 0;string s=to_string(b);vector<vector<vector<long long>>> memo(s.size(),vector<vector<long long>>(11,vector<long long>(mod,-1)));function<long long(int,int,int,bool)> go=[&](int i,int prev,int rem,bool tight)->long long{if(i==(int)s.size())return rem==0;auto &cache=memo[i][prev][rem];if(!tight&&cache>=0)return cache;int maxd=tight?s[i]-'0':9;long long ans=0;for(int d=0;d<=maxd;d++)if(d!=prev)ans+=go(i+1,prev==10&&d==0?10:d,(rem+d)%mod,tight&&d==maxd);if(!tight)cache=ans;return ans;};return go(0,10,0,true);};cout<<upto(r)-upto(l-1);`,
java:String.raw`long l=num(),r=num();int mod=integer();class Count{String s;long[][][] mem;long up(long b){if(b<0)return 0;s=Long.toString(b);mem=new long[s.length()][11][mod];for(long[][] a:mem)for(long[] t:a)Arrays.fill(t,-1);return go(0,10,0,true);}long go(int i,int p,int rem,boolean tight){if(i==s.length())return rem==0?1:0;if(!tight&&mem[i][p][rem]>=0)return mem[i][p][rem];int max=tight?s.charAt(i)-'0':9;long ans=0;for(int d=0;d<=max;d++)if(d!=p)ans+=go(i+1,p==10&&d==0?10:d,(rem+d)%mod,tight&&d==max);if(!tight)mem[i][p][rem]=ans;return ans;}}Count c=new Count();System.out.print(c.up(r)-c.up(l-1));`,
py:`from functools import lru_cache
l,r,m=I(),I(),I()
def up(b):
    if b<0:
        return 0
    s=list(map(int,str(b)))
    @lru_cache(None)
    def go(i,prev,rem,tight):
        if i==len(s):
            return int(rem==0)
        bound=s[i] if tight else 9
        return sum(go(i+1,10 if prev==10 and d==0 else d,(rem+d)%m,tight and d==bound)
                   for d in range(bound+1) if d!=prev)
    return go(0,10,0,True)
print(up(r)-up(l-1))`,
}
]);
