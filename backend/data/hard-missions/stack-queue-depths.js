const {build,line,repeat}=require("./build");
module.exports=build("stack-queue-depths",[
{
title:"The Sunken Drydock",treasure:"Drydock Plumb Weight",
intro:"A rescue barge can straddle submerged columns of different widths. Only the smallest clearance beneath its footprint determines how much cargo it can recover.",
statement:"Find the largest rectangle supported by consecutive whole columns. Its width is their sum of widths and its height is their minimum height.",
input:"n, followed by n lines of width and height.",output:"The maximum area as an integer.",
constraints:"1 ≤ n ≤ 50000. 1 ≤ width ≤ 1000. 0 ≤ height ≤ 10^9.",
samples:[["4\n2 4\n5 2\n1 6\n3 3\n","22","All four columns have width 11 and support height 2. No narrower choice beats 22."],["3\n3 7\n1 0\n4 7\n","28","The zero splits the drydock. The wider of the two tall sections wins."]],
hidden:[["1\n1 0\n","0"],["3\n2 9\n3 9\n1 9\n","54"],["50000\n"+repeat(50000,"1000 1000000000\n").join(""),"50000000000000000"]],
hints:["A rectangle can extend until a strictly shorter column blocks it.","Record actual horizontal coordinates instead of counting columns.","When popping a taller column, carry its left boundary into the new stack entry."],
editorial:"Maintain increasing heights with the earliest coordinate from which each can extend. A shorter height closes taller rectangles at the current coordinate. Popping an entry evaluates its maximal width and transfers its start to the new shorter height. Collapse equal heights by retaining their earliest start. A final zero flushes all positive heights. An optimal rectangle of positive height can expand to these boundaries without losing area, so one of the tested rectangles is optimal.",
time:"O(n)",space:"O(n)",
cpp:String.raw`int n;cin>>n;long long x=0,ans=0;vector<pair<long long,long long>> st;
for(int i=0;i<=n;i++){long long w=0,h=0;if(i<n)cin>>w>>h;long long l=x;while(!st.empty()&&st.back().first>h){auto [v,p]=st.back();st.pop_back();ans=max(ans,v*(x-p));l=p;}if(st.empty()||st.back().first<h)st.push_back({h,l});x+=w;}cout<<ans;`,
java:String.raw`int n=integer(),k=0;long[] h=new long[n+1],l=new long[n+1];long x=0,ans=0;for(int i=0;i<=n;i++){long w=i<n?num():0,v=i<n?num():0,p=x;while(k>0&&h[k-1]>v){k--;ans=Math.max(ans,h[k]*(x-l[k]));p=l[k];}if(k==0||h[k-1]<v){h[k]=v;l[k++]=p;}x+=w;}System.out.print(ans);`,
py:`n=I()
x=ans=0
st=[]
for i in range(n+1):
    w,h=(I(),I()) if i<n else (0,0)
    l=x
    while st and st[-1][0]>h:
        v,l=st.pop()
        ans=max(ans,v*(x-l))
    if not st or st[-1][0]<h:
        st.append((h,l))
    x+=w
print(ans)`,
},
{
title:"The Drowned Dispatch",treasure:"Drowned Dispatch Tube",
intro:"The courier's roll uses repetitions nested inside repetitions. The investigator needs one letter from a dispatch too large to unroll.",
statement:"An expression is a nonempty concatenation of lowercase letters and terms d[E], where d is one digit 2..9 and E is another expression. A term expands to d copies of E. Print the k-th character (1-based) of the expansion or -1 if it is too short.",
input:"k, followed by the expression on the next line.",output:"One lowercase letter or -1.",
constraints:"1 ≤ k ≤ 10^18. The expression is valid and has at most 60000 characters.",
samples:[["8\na2[b3[c]]d\n","c","The eight-letter prefix is abcccbcc."],["7\n2[ab]z\n","-1","The complete expansion has five letters."]],
hidden:[["1\nz\n","z"],["6\n2[a2[bc]]\n","a"],["1000000000000000000\n"+"9[".repeat(19999)+"z"+"]".repeat(19999)+"\n","z"]],
hints:["You only need the expanded length of each term, capped at k.","Save each parent's accumulated length before descending into a bracket.","Skip short terms wholesale. Within a repeated term, reduce the index modulo the child length."],
editorial:"Parse once with an explicit stack. When a term closes, record its child length, its repeated length capped at k, and the index after the closing bracket. During lookup skip terms shorter than the requested suffix index and subtract their length. Otherwise map the index into one copy and enter the term. Capping cannot affect a skip or modulo that would distinguish the true length: whenever a child was capped, the current index is already within that first copy. Each scan advances through the encoded text.",
time:"O(n)",space:"O(n)",
cpp:String.raw`long long k;string s;cin>>k>>s;int n=s.size();vector<long long> child(n),len(n);vector<int>end(n);vector<pair<int,long long>> st;long long sum=0;
for(int i=0;i<n;i++){char c=s[i];if(c>='2'&&c<='9'){st.push_back({i,sum});sum=0;}else if(c==']'){auto [p,old]=st.back();st.pop_back();child[p]=sum;len[p]=min(k,sum*(s[p]-'0'));end[p]=i+1;sum=min(k,old+len[p]);}else if(c!='[')sum=min(k,sum+1);}
if(sum<k){cout<<-1;return 0;}for(int i=0;i<n;){char c=s[i];if(c>='a'){if(--k==0){cout<<c;break;}i++;}else if(len[i]<k){k-=len[i];i=end[i];}else{k=(k-1)%child[i]+1;i+=2;}}`,
java:String.raw`long k=num();String s=token();int n=s.length(),top=0;long[] child=new long[n],len=new long[n],old=new long[n];int[] end=new int[n],start=new int[n];long sum=0;
for(int i=0;i<n;i++){char c=s.charAt(i);if(c>='2'&&c<='9'){start[top]=i;old[top++]=sum;sum=0;}else if(c==']'){int p=start[--top];child[p]=sum;len[p]=Math.min(k,sum*(s.charAt(p)-'0'));end[p]=i+1;sum=Math.min(k,old[top]+len[p]);}else if(c!='[')sum=Math.min(k,sum+1);}
if(sum<k){System.out.print(-1);return;}for(int i=0;i<n;){char c=s.charAt(i);if(c>='a'){if(--k==0){System.out.print(c);break;}i++;}else if(len[i]<k){k-=len[i];i=end[i];}else{k=(k-1)%child[i]+1;i+=2;}}`,
py:`k=I()
s=next(tokens).decode()
child=[0]*len(s)
length=child.copy()
end=child.copy()
st=[]
total=0
for i,c in enumerate(s):
    if c.isdigit():
        st.append((i,total))
        total=0
    elif c==']':
        p,old=st.pop()
        child[p]=total
        length[p]=min(k,total*int(s[p]))
        end[p]=i+1
        total=min(k,old+length[p])
    elif c!='[':
        total=min(k,total+1)
if total<k:
    print(-1)
else:
    i=0
    while True:
        c=s[i]
        if c.isalpha():
            k-=1
            if not k:
                print(c)
                break
            i+=1
        elif length[i]<k:
            k-=length[i]
            i=end[i]
        else:
            k=(k-1)%child[i]+1
            i+=2`,
},
{
title:"The Tide Window Heist",treasure:"Tidal Queue Ledger",
intro:"The tide gate only stays open for a bounded stretch. Search the salvage ledger for the most valuable voyage that can fit between those bells.",
statement:"Find the largest sum of a contiguous segment whose length is between L and R inclusive. At least one segment must be selected.",
input:"n L R, then n signed values.",output:"The largest segment sum.",
constraints:"1 ≤ L ≤ R ≤ n ≤ 60000. Absolute values are at most 10^9.",
samples:[["5 2 3\n-8 5 -1 6 -9\n","10","The three values 5, -1, 6 form the best segment."],["4 2 4\n-8 -2 -3 -9\n","-5","Even though every total is negative, a segment must be selected."]],
hidden:[["1 1 1\n-1000000000\n","-1000000000"],["4 4 4\n8 -4 2 -1\n","5"],["60000 1 60000\n"+line(repeat(60000,1000000000)),"60000000000000"]],
hints:["Write a segment sum as a difference of two prefixes.","For each right endpoint, the left prefix belongs to one sliding interval.","Keep prefix indices in a deque in nondecreasing prefix value."],
editorial:"For an exclusive right index j the legal left indices are j-R through j-L. Expire old indices and insert j-L, discarding larger or equal values at the back. Any discarded index has a newer replacement with no larger value, which is eligible for at least as long. The front is therefore the minimum legal prefix, giving the best sum ending at j. Maximize over all j.",
time:"O(n)",space:"O(n)",
cpp:String.raw`int n,l,r;cin>>n>>l>>r;vector<long long> p(n+1);for(int i=1;i<=n;i++){cin>>p[i];p[i]+=p[i-1];}deque<int> q;long long ans=LLONG_MIN;for(int j=l;j<=n;j++){while(!q.empty()&&q.front()<j-r)q.pop_front();int i=j-l;while(!q.empty()&&p[q.back()]>=p[i])q.pop_back();q.push_back(i);ans=max(ans,p[j]-p[q.front()]);}cout<<ans;`,
java:String.raw`int n=integer(),l=integer(),r=integer(),head=0,tail=0;long[] p=new long[n+1];int[] q=new int[n+1];for(int i=1;i<=n;i++)p[i]=p[i-1]+num();long ans=Long.MIN_VALUE;for(int j=l;j<=n;j++){while(head<tail&&q[head]<j-r)head++;int i=j-l;while(head<tail&&p[q[tail-1]]>=p[i])tail--;q[tail++]=i;ans=Math.max(ans,p[j]-p[q[head]]);}System.out.print(ans);`,
py:`from collections import deque
n,l,r=I(),I(),I()
p=[0]
for _ in range(n):
    p.append(p[-1]+I())
q=deque()
ans=-10**30
for j in range(l,n+1):
    while q and q[0]<j-r:
        q.popleft()
    i=j-l
    while q and p[q[-1]]>=p[i]:
        q.pop()
    q.append(i)
    ans=max(ans,p[j]-p[q[0]])
print(ans)`,
}
]);
