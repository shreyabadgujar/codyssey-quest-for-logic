const {build,line,repeat}=require("./build");
module.exports=build("recursion-realm",[
{
title:"The Balanced Reliquaries",treasure:"Balanced Reliquary Key",
intro:"The vault has k indistinguishable reliquaries. Each must receive exactly the same total relic weight, and no relic can be left behind.",
statement:"Decide whether all n indexed positive weights can be partitioned into k nonempty groups with equal total weight. Each index is used once.",
input:"n k, then n positive weights.",output:"YES or NO.",
constraints:"1 ≤ k ≤ n ≤ 17. 1 ≤ weight ≤ 10^9.",
samples:[["7 4\n4 3 2 3 5 2 1\n","YES","Use groups [5], [4,1], [3,2], [3,2]."],["5 3\n2 2 2 2 2\n","NO","The total of 10 is not divisible by 3."]],
hidden:[["1 1\n1000000000\n","YES"],["7 4\n2 2 2 2 3 4 5\n","NO"],["17 17\n"+line(repeat(17,1000000000)),"YES"]],
hints:["Determine the required weight of one reliquary.","Fill one reliquary at a time, remembering which indices are used.","The current partial weight is uniquely determined by the used-mask sum modulo the target."],
editorial:"Reject indivisible totals or a relic exceeding the target. Build groups one by one in any order, extending a bitmask of used indices without exceeding the current group's target. Reset the partial weight to zero whenever the group fills. For a given mask the partial weight is its fixed sum modulo the target, so reaching the same mask twice cannot enable different future moves. Memoize failed masks; a full mask proves a partition. Every valid partition can be ordered in precisely this way.",
time:"O(n·2^n)",space:"O(2^n)",
cpp:String.raw`int n,k;cin>>n>>k;vector<long long>a(n);long long total=0;for(auto&x:a){cin>>x;total+=x;}if(total%k){cout<<"NO";return 0;}long long goal=total/k;sort(a.rbegin(),a.rend());int full=(1<<n)-1;vector<char> dead(full+1);function<bool(int,long long)> go=[&](int m,long long s){if(m==full)return true;if(dead[m])return false;long long prev=-1;for(int i=0;i<n;i++)if(!(m>>i&1)&&a[i]!=prev&&s+a[i]<=goal){prev=a[i];if(go(m|(1<<i),(s+a[i])%goal))return true;}dead[m]=1;return false;};cout<<(go(0,0)?"YES":"NO");`,
java:String.raw`int n=integer(),k=integer();long[] a=new long[n];long total=0;for(int i=0;i<n;i++){a[i]=num();total+=a[i];}if(total%k!=0){System.out.print("NO");return;}long goal=total/k;Arrays.sort(a);int full=(1<<n)-1;boolean[] dead=new boolean[full+1];class Search{boolean go(int m,long s){if(m==full)return true;if(dead[m])return false;long prev=-1;for(int i=n-1;i>=0;i--)if((m&(1<<i))==0&&a[i]!=prev&&s+a[i]<=goal){prev=a[i];if(go(m|(1<<i),(s+a[i])%goal))return true;}dead[m]=true;return false;}}System.out.print(new Search().go(0,0)?"YES":"NO");`,
py:`n,k=I(),I()
a=sorted((I() for _ in range(n)),reverse=True)
total=sum(a)
if total%k:
    print("NO")
else:
    goal=total//k
    full=(1<<n)-1
    dead=bytearray(full+1)
    def go(mask,s):
        if mask==full:
            return True
        if dead[mask]:
            return False
        prev=-1
        for i,x in enumerate(a):
            if mask>>i&1 or x==prev or s+x>goal:
                continue
            prev=x
            if go(mask|(1<<i),(s+x)%goal):
                return True
        dead[mask]=1
        return False
    print("YES" if go(0,0) else "NO")`,
},
{
title:"The Last Tile Pilgrimage",treasure:"Pilgrim's Last Tile",
intro:"A ritual walkway collapses behind every step. The guide must cross every sound tile exactly once and arrive at the exit last.",
statement:"Count paths from S to E that visit every non-wall tile exactly once. Steps are orthogonal; # is a wall, and . is an ordinary open tile. The start and exit are distinct.",
input:"h w, then h rows of w characters containing exactly one S and one E.",output:"The number of such paths as an integer.",
constraints:"1 ≤ h,w ≤ 18. The grid has between 2 and 18 non-wall tiles, including S and E.",
samples:[["2 3\nS..\n..E\n","1","The valid route goes down, right, up, right, then down."],["3 3\nS.#\n###\n..E\n","0","The wall splits the floor, leaving the exit unreachable."]],
hidden:[["1 2\nSE\n","1"],["2 2\nS.\n.E\n","0"],["2 9\nS........\n........E\n","1"]],
hints:["Assign each open tile one bit.","Reaching the exit early cannot produce a valid continuation.","Future moves depend only on the current tile and visited mask, so memoize that pair."],
editorial:"Map open tiles to IDs and precompute orthogonal neighbour masks. A state (u, mask) counts completions from u using exactly the visited set. Branch over unvisited neighbours. At E, count one only when every tile has been visited. Each branch produces a disjoint set of paths; memoizing states avoids recalculating identical suffix choices. A parity check on the checkerboard can reject impossible start and exit colours before searching.",
time:"O(k·2^k) for k open tiles because every tile has at most four neighbours",space:"O(k·2^k) worst case",
cpp:String.raw`int h,w;cin>>h>>w;vector<string>b(h);for(auto&x:b)cin>>x;vector<vector<int>>id(h,vector<int>(w,-1));int n=0,s=0,e=0,par=0;for(int i=0;i<h;i++)for(int j=0;j<w;j++)if(b[i][j]!='#'){id[i][j]=n;if(b[i][j]=='S'){s=n;par^=(i+j)&1;}if(b[i][j]=='E'){e=n;par^=(i+j)&1;}n++;}if(par!=((n-1)&1)){cout<<0;return 0;}vector<int>g(n);int dr[]={1,-1,0,0},dc[]={0,0,1,-1};for(int i=0;i<h;i++)for(int j=0;j<w;j++)if(id[i][j]>=0)for(int z=0;z<4;z++){int r=i+dr[z],c=j+dc[z];if(r>=0&&r<h&&c>=0&&c<w&&id[r][c]>=0)g[id[i][j]]|=1<<id[r][c];}int full=(1<<n)-1;unordered_map<int,long long> mem;function<long long(int,int)> go=[&](int u,int m)->long long{if(u==e)return m==full;int key=m*n+u;auto it=mem.find(key);if(it!=mem.end())return it->second;long long z=0;for(int x=g[u]&~m;x;x&=x-1){int bit=x&-x;z+=go(__builtin_ctz((unsigned)bit),m|bit);}return mem[key]=z;};cout<<go(s,1<<s);`,
java:String.raw`int h=integer(),w=integer(),n=0,s=0,e=0,par=0;int[][] id=new int[h][w];for(int i=0;i<h;i++){Arrays.fill(id[i],-1);String row=token();for(int j=0;j<w;j++)if(row.charAt(j)!='#'){id[i][j]=n;if(row.charAt(j)=='S'){s=n;par^=(i+j)&1;}if(row.charAt(j)=='E'){e=n;par^=(i+j)&1;}n++;}}if(par!=((n-1)&1)){System.out.print(0);return;}int[] g=new int[n],dr={1,-1,0,0},dc={0,0,1,-1};for(int i=0;i<h;i++)for(int j=0;j<w;j++)if(id[i][j]>=0)for(int z=0;z<4;z++){int r=i+dr[z],c=j+dc[z];if(r>=0&&r<h&&c>=0&&c<w&&id[r][c]>=0)g[id[i][j]]|=1<<id[r][c];}int full=(1<<n)-1,exit=e,width=n;HashMap<Integer,Long> mem=new HashMap<>();class Search{long go(int u,int m){if(u==exit)return m==full?1:0;int key=m*width+u;Long hit=mem.get(key);if(hit!=null)return hit;long z=0;for(int x=g[u]&~m;x!=0;x&=x-1){int bit=x&-x;z+=go(Integer.numberOfTrailingZeros(bit),m|bit);}mem.put(key,z);return z;}}System.out.print(new Search().go(s,1<<s));`,
py:`from functools import lru_cache
h,w=I(),I()
board=[next(tokens).decode() for _ in range(h)]
tiles=[(i,j) for i in range(h) for j in range(w) if board[i][j]!='#']
ids={p:i for i,p in enumerate(tiles)}
s,e=[next(i for i,(r,c) in enumerate(tiles) if board[r][c]==key) for key in 'SE']
n=len(tiles)
g=[sum(1<<ids[p] for p in [(i-1,j),(i+1,j),(i,j-1),(i,j+1)] if p in ids) for i,j in tiles]
full=(1<<n)-1
@lru_cache(None)
def go(u,m):
    if u==e:
        return int(m==full)
    rest=g[u]&~m
    total=0
    while rest:
        bit=rest&-rest
        total+=go(bit.bit_length()-1,m|bit)
        rest-=bit
    return total
print(go(s,1<<s) if (sum(tiles[s])+sum(tiles[e])+n-1)%2==0 else 0)`,
},
{
title:"The Echoes Between Bounds",treasure:"Echo Bounds Crucible",
intro:"Every consecutive run of chambers produces a signed echo. The archivist wants the number of runs within a tolerated band.",
statement:"Count nonempty contiguous segments whose sum lies in the inclusive interval [L,R]. Values may be negative.",
input:"n L R, then n signed chamber values.",output:"The number of valid segments.",
constraints:"1 ≤ n ≤ 50000. |value| ≤ 10^9. -10^14 ≤ L ≤ R ≤ 10^14.",
samples:[["3 -2 2\n-2 5 -1\n","3","The valid segments are [-2], [-1], and the complete run with sum 2."],["4 0 0\n0 0 0 0\n","10","Every nonempty segment sums to zero."]],
hidden:[["1 -1000000000 -1000000000\n-1000000000\n","1"],["4 2 2\n2 -2 2 -2\n","3"],["50000 0 1\n"+line(repeat(50000,0)),"1250025000"]],
hints:["Every segment is a pair of prefix indices in chronological order.","Split prefix indices into halves and count pairs that cross the split.","With each half sorted by value, two pointers delimit the right values in [left+L,left+R]."],
editorial:"Divide the prefix index range in half. Recursively count pairs within either half and return each half sorted by value. Every cross pair uses an earlier index on the left and a later one on the right, so sorting values within their halves does not violate chronological order. As left values increase, two right pointers advance monotonically to delimit the inclusive difference band. Add their distance, then merge the sorted halves. Each level costs linear time.",
time:"O(n log n)",space:"O(n)",
cpp:String.raw`int n;long long l,r;cin>>n>>l>>r;vector<long long>a(n+1),b(n+1);for(int i=1;i<=n;i++){cin>>a[i];a[i]+=a[i-1];}function<long long(int,int)> go=[&](int s,int t)->long long{if(t-s<2)return 0;int m=(s+t)/2;long long ans=go(s,m)+go(m,t);int x=m,y=m;for(int i=s;i<m;i++){while(x<t&&a[x]-a[i]<l)x++;while(y<t&&a[y]-a[i]<=r)y++;ans+=y-x;}merge(a.begin()+s,a.begin()+m,a.begin()+m,a.begin()+t,b.begin()+s);copy(b.begin()+s,b.begin()+t,a.begin()+s);return ans;};cout<<go(0,n+1);`,
java:String.raw`int n=integer();long l=num(),r=num();long[] a=new long[n+1],b=new long[n+1];for(int i=1;i<=n;i++)a[i]=a[i-1]+num();class Counter{long go(int s,int t){if(t-s<2)return 0;int m=(s+t)/2;long ans=go(s,m)+go(m,t);int x=m,y=m;for(int i=s;i<m;i++){while(x<t&&a[x]-a[i]<l)x++;while(y<t&&a[y]-a[i]<=r)y++;ans+=y-x;}int p=s,q=m;for(int i=s;i<t;i++)b[i]=(p<m&&(q==t||a[p]<=a[q]))?a[p++]:a[q++];System.arraycopy(b,s,a,s,t-s);return ans;}}System.out.print(new Counter().go(0,n+1));`,
py:`n,l,r=I(),I(),I()
a=[0]
for _ in range(n):
    a.append(a[-1]+I())
def go(s,t):
    if t-s<2:
        return 0
    m=(s+t)//2
    ans=go(s,m)+go(m,t)
    x=y=m
    for v in a[s:m]:
        while x<t and a[x]-v<l:
            x+=1
        while y<t and a[y]-v<=r:
            y+=1
        ans+=y-x
    a[s:t]=sorted(a[s:t])
    return ans
print(go(0,n+1))`,
}
]);
