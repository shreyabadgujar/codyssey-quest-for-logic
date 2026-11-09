const {build,repeat}=require("./build");
module.exports=build("stringwood-forest",[
{
title:"The One Scar Dispatch",treasure:"Scarred Dispatch Lens",
intro:"A spy can alter one letter of a dispatch. Find how many windows could still contain the original message.",
statement:"Count starting positions where a length-|P| substring of T differs from P in at most one position. The comparison allows substitution only.",
input:"Pattern P, then text T, each on its own line.",output:"The number of qualifying starting positions.",
constraints:"Both strings are nonempty lowercase ASCII, each at most 100000 characters.",
samples:[["aba\nabacaba\n","3","The windows starting at 1, 3 and 5 are aba, aca and aba."],["abcd\nabxdabyd\n","2","abxd and abyd each differ only at the third character."]],
hidden:[["a\nabczz\n","5"],["abc\nab\n","0"],["a".repeat(50000)+"\n"+"a".repeat(100000)+"\n","50001"]],
hints:["Compare a window with the pattern from both ends.","One mismatch can remain only between the longest matching prefix and suffix.","Use the Z algorithm on P#T and on their reversals to obtain these lengths for all windows."],
editorial:"Compute Z values for pattern, separator, then text to obtain each window's matching prefix length. Repeat with reversed strings; the window starting at i maps to reversed start |T|-i-|P|. If the two matching lengths sum to at least |P|-1, all positions except possibly one are covered. Conversely any valid window has such prefix and suffix coverage. A separator outside the alphabet bounds the match to the pattern. Z boxes reuse prior matches and process each combined string in linear time.",
time:"O(|P|+|T|)",space:"O(|P|+|T|)",
cpp:String.raw`string p,t;cin>>p>>t;auto z=[](const string&s){int n=s.size(),l=0,r=0;vector<int>a(n);for(int i=1;i<n;i++){if(i<r)a[i]=min(r-i,a[i-l]);while(i+a[i]<n&&s[a[i]]==s[i+a[i]])a[i]++;if(i+a[i]>r){l=i;r=i+a[i];}}return a;};int m=p.size(),n=t.size(),ans=0;auto a=z(p+"#"+t);reverse(p.begin(),p.end());reverse(t.begin(),t.end());auto b=z(p+"#"+t);for(int i=0;i+m<=n;i++)ans+=a[m+1+i]+b[n-i+1]>=m-1;cout<<ans;`,
java:String.raw`String p=token(),t=token();class Z{int[] run(String s){int n=s.length(),l=0,r=0;int[] a=new int[n];for(int i=1;i<n;i++){if(i<r)a[i]=Math.min(r-i,a[i-l]);while(i+a[i]<n&&s.charAt(a[i])==s.charAt(i+a[i]))a[i]++;if(i+a[i]>r){l=i;r=i+a[i];}}return a;}}Z z=new Z();int m=p.length(),n=t.length(),ans=0;int[] a=z.run(p+"#"+t),b=z.run(new StringBuilder(p).reverse().toString()+"#"+new StringBuilder(t).reverse());for(int i=0;i+m<=n;i++)if(a[m+1+i]+b[n-i+1]>=m-1)ans++;System.out.print(ans);`,
py:`p,t=next(tokens),next(tokens)
def z(s):
    a=[0]*len(s)
    l=r=0
    for i in range(1,len(s)):
        v=min(r-i,a[i-l]) if i<r else 0
        while i+v<len(s) and s[v]==s[i+v]:
            v+=1
        a[i]=v
        if i+v>r:
            l,r=i,i+v
    return a
a=z(p+b'#'+t)
b=z(p[::-1]+b'#'+t[::-1])
m,n=len(p),len(t)
print(sum(a[m+1+i]+b[n-i+1]>=m-1 for i in range(n-m+1)))`,
},
{
title:"The Shared Ink Fragment",treasure:"Shared Ink Vial",
intro:"Two altered letters share an unbroken passage of the original. Recover the length of their longest shared ink fragment.",
statement:"Find the length of the longest substring that occurs in both strings. Characters in a substring must be consecutive.",
input:"Strings S and T, each on its own line.",output:"The maximum length, or 0 if no character is shared.",
constraints:"Each string has 1 to 40000 lowercase ASCII characters.",
samples:[["ababc\nbabca\n","4","The fragment babc occurs in both."],["abca\ndeed\n","0","No letter occurs in both strings."]],
hidden:[["x\nx\n","1"],["aabaaab\nabaabaa\n","5"],["a".repeat(40000)+"\n"+"b"+"a".repeat(39999)+"\n","39999"]],
hints:["Many different substrings of S share the same possible right continuations.","A suffix automaton stores those continuation classes and links to shorter suffixes.","Scan T, extending the current match when possible and falling back through suffix links otherwise."],
editorial:"Build a suffix automaton of S. Each state stores transitions, the largest length it represents and a suffix link. On extension, add the new state and clone a state when a transition target's length is too large for the required split, preserving its old outgoing transitions and redirecting only the affected incoming transitions. While scanning T, maintain the longest suffix already matched in S. On a failed transition, follow suffix links and reduce the length to the reached class's maximum until extension is possible or the root fails. This considers the longest common substring ending at every character of T. The scan is linear because each fallback decreases length and each character increases it at most once.",
time:"O(|S|+|T|) for the fixed alphabet",space:"O(|S|) for the fixed alphabet",
cpp:String.raw`string s,t;cin>>s>>t;struct State{array<int,26> go{};int len=0,link=-1;};vector<State>a(2*s.size());int size=1,last=0;for(char ch:s){int x=ch-'a',p=last,k=size++;a[k].len=a[p].len+1;for(;p>=0&&!a[p].go[x];p=a[p].link)a[p].go[x]=k;if(p<0)a[k].link=0;else{int q=a[p].go[x];if(a[p].len+1==a[q].len)a[k].link=q;else{int c=size++;a[c]=a[q];a[c].len=a[p].len+1;while(p>=0&&a[p].go[x]==q){a[p].go[x]=c;p=a[p].link;}a[q].link=a[k].link=c;}}last=k;}int u=0,len=0,ans=0;for(char ch:t){int x=ch-'a';while(u&&!a[u].go[x]){u=a[u].link;len=a[u].len;}if(a[u].go[x]){u=a[u].go[x];len++;ans=max(ans,len);}else len=0;}cout<<ans;`,
java:String.raw`String s=token(),t=token();int cap=2*s.length(),size=1,last=0;int[][] g=new int[cap][26];int[] len=new int[cap],link=new int[cap];link[0]=-1;for(int i=0;i<s.length();i++){int x=s.charAt(i)-'a',p=last,k=size++;len[k]=len[p]+1;while(p>=0&&g[p][x]==0){g[p][x]=k;p=link[p];}if(p>=0){int q=g[p][x];if(len[p]+1==len[q])link[k]=q;else{int c=size++;g[c]=g[q].clone();link[c]=link[q];len[c]=len[p]+1;while(p>=0&&g[p][x]==q){g[p][x]=c;p=link[p];}link[q]=link[k]=c;}}last=k;}int u=0,l=0,ans=0;for(int i=0;i<t.length();i++){int x=t.charAt(i)-'a';while(u!=0&&g[u][x]==0){u=link[u];l=len[u];}if(g[u][x]!=0){u=g[u][x];ans=Math.max(ans,++l);}else l=0;}System.out.print(ans);`,
py:`s,t=next(tokens),next(tokens)
g=[{}]
link=[-1]
length=[0]
last=0
for x in s:
    k=len(g)
    g.append({})
    link.append(0)
    length.append(length[last]+1)
    p=last
    while p>=0 and x not in g[p]:
        g[p][x]=k
        p=link[p]
    if p>=0:
        q=g[p][x]
        if length[p]+1==length[q]:
            link[k]=q
        else:
            c=len(g)
            g.append(g[q].copy())
            length.append(length[p]+1)
            link.append(link[q])
            while p>=0 and g[p].get(x)==q:
                g[p][x]=c
                p=link[p]
            link[q]=link[k]=c
    last=k
u=l=ans=0
for x in t:
    while u and x not in g[u]:
        u=link[u]
        l=length[u]
    if x in g[u]:
        u=g[u][x]
        l+=1
        ans=max(ans,l)
    else:
        l=0
print(ans)`,
},
{
title:"The Whispering Dictionary",treasure:"Whispering Pattern Index",
intro:"The forest's witness list contains hundreds of codewords, including repeated names. Count every appearance in a single dispatch without rereading it for each witness.",
statement:"For each input pattern, count its substring occurrences in T. Occurrences can overlap, and duplicate patterns have separate outputs.",
input:"Text T, then q, then q lowercase patterns on separate lines.",output:"q counts in input order, one per line.",
constraints:"1 ≤ |T| ≤ 100000. 1 ≤ q ≤ 10000. Patterns are nonempty. Their total length is at most 50000. All letters are lowercase ASCII.",
samples:[["aaaa\n4\na\naa\naaa\naa\n","4\n3\n2\n3","Overlaps count, and the duplicate aa queries have the same answer."],["ushers\n3\nhe\nshe\nhers\n","1\n1\n1","The matching suffixes and their extensions all count."]],
hidden:[["x\n2\nx\ny\n","1\n0"],["ababa\n3\naba\nba\nbab\n","2\n2\n1"],["a".repeat(100000)+"\n10000\n"+"aaaaa\n".repeat(10000),repeat(10000,99996).join("\n")]],
hints:["Build one trie for all patterns and remember each terminal node.","A failure link leads to the longest proper suffix that is also a trie prefix.","Count text visits to automaton states, then propagate counts in reverse breadth-first order."],
editorial:"Construct a trie and build its failure links by breadth-first traversal. Fill absent transitions with the corresponding failure-state transition. After reading a text letter, the current state represents the longest matching trie prefix ending there. Each other matching pattern ending at that character lies on its failure chain. Instead of walking the chain at each character, count state visits and add counts to failure parents in reverse BFS order. This transfers each occurrence once to every required suffix. Duplicate patterns point to the same terminal and are printed independently.",
time:"O(|T|+P) for a fixed alphabet, where P is the total pattern length",space:"O(P) for a fixed alphabet",
cpp:String.raw`string t,s;int q;cin>>t>>q;vector<array<int,26>>g(1);vector<int>term(q);for(int i=0;i<q;i++){cin>>s;int u=0;for(char ch:s){int x=ch-'a';if(!g[u][x]){g[u][x]=g.size();g.emplace_back();}u=g[u][x];}term[i]=u;}vector<int> f(g.size()),d(g.size()),b;for(int v:g[0])if(v)b.push_back(v);for(int i=0;i<(int)b.size();i++){int u=b[i];for(int x=0;x<26;x++){int v=g[u][x];if(v){f[v]=g[f[u]][x];b.push_back(v);}else g[u][x]=g[f[u]][x];}}int u=0;for(char x:t){u=g[u][x-'a'];d[u]++;}for(int i=(int)b.size()-1;i>=0;i--)d[f[b[i]]]+=d[b[i]];for(int v:term)cout<<d[v]<<'\n';`,
java:String.raw`String t=token();int q=integer(),size=1;int[][] g=new int[50001][26];int[] term=new int[q],f=new int[50001],d=new int[50001],b=new int[50001];for(int i=0;i<q;i++){String s=token();int u=0;for(int j=0;j<s.length();j++){int x=s.charAt(j)-'a';if(g[u][x]==0)g[u][x]=size++;u=g[u][x];}term[i]=u;}int k=0;for(int v:g[0])if(v!=0)b[k++]=v;for(int i=0;i<k;i++){int u=b[i];for(int x=0;x<26;x++){int v=g[u][x];if(v!=0){f[v]=g[f[u]][x];b[k++]=v;}else g[u][x]=g[f[u]][x];}}int u=0;for(int i=0;i<t.length();i++){u=g[u][t.charAt(i)-'a'];d[u]++;}for(int i=k-1;i>=0;i--)d[f[b[i]]]+=d[b[i]];StringBuilder out=new StringBuilder();for(int v:term)out.append(d[v]).append('\n');System.out.print(out);`,
py:`t=next(tokens)
q=I()
g=[[0]*26]
term=[]
for _ in range(q):
    u=0
    for x in next(tokens):
        x-=97
        if not g[u][x]:
            g[u][x]=len(g)
            g.append([0]*26)
        u=g[u][x]
    term.append(u)
f=[0]*len(g)
d=f.copy()
b=[v for v in g[0] if v]
for u in b:
    fallback=g[f[u]]
    for x,v in enumerate(g[u]):
        if v:
            f[v]=fallback[x]
            b.append(v)
        else:
            g[u][x]=fallback[x]
u=0
for x in t:
    u=g[u][x-97]
    d[u]+=1
for u in reversed(b):
    d[f[u]]+=d[u]
print(chr(10).join(str(d[u]) for u in term))`,
}
]);
