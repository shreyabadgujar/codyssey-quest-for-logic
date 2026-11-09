const cpp = [
  'long long s=0;for(auto x:a)s+=x;cout<<s;',
  'long long x;cin>>x;vector<long long>b;for(auto v:a)if(v!=x)b.push_back(v);cout<<b.size()<<"\\n";for(auto v:b)cout<<v<<" ";',
  'long long k;cin>>k;k%=n;for(int i=0;i<n;i++)cout<<a[(i+n-k)%n]<<" ";',
  'map<long long,int>f;for(auto x:a)f[x]++;long long v=0;int best=0;for(auto [x,c]:f)if(c>best){best=c;v=x;}cout<<v<<" "<<best;',
  'vector<long long>p(n+1);for(int i=0;i<n;i++)p[i+1]=p[i]+a[i];int q;cin>>q;while(q--){int l,r;cin>>l>>r;cout<<p[r]-p[l-1]<<"\\n";}',
  'long long b,s=0;cin>>b;int l=0,ans=0;for(int r=0;r<n;r++){s+=a[r];while(s>b)s-=a[l++];ans=max(ans,r-l+1);}cout<<ans;',
  'long long cur=a[0],best=cur;for(int i=1;i<n;i++){cur=max(a[i],cur+a[i]);best=max(best,cur);}cout<<best;',
  'long long k,s=0,ans=0;cin>>k;unordered_map<long long,long long>f;f[0]=1;for(auto x:a){s+=x;ans+=f[s-k];f[s]++;}cout<<ans;',
  'long long k,ans=0;cin>>k;sort(a.begin(),a.end());int l=0,r=n-1;while(l<r){long long s=a[l]+a[r];if(s<k)l++;else if(s>k)r--;else if(a[l]==a[r]){long long c=r-l+1;ans+=c*(c-1)/2;break;}else{long long x=a[l],y=a[r],c=0,d=0;while(l<=r&&a[l]==x){c++;l++;}while(r>=l&&a[r]==y){d++;r--;}ans+=c*d;}}cout<<ans;',
  'long long k;cin>>k;int g=0;for(auto x:a)g+=(x<=k);if(g==0){cout<<0;return 0;}int bad=0;for(int i=0;i<g;i++)bad+=(a[i]>k);int ans=bad;for(int i=g;i<n;i++){bad+=(a[i]>k)-(a[i-g]>k);ans=min(ans,bad);}cout<<ans;',
  'long long k;cin>>k;vector<long long>p(n+1);for(int i=0;i<n;i++)p[i+1]=p[i]+a[i];deque<int>d;int ans=n+1;for(int i=0;i<=n;i++){while(!d.empty()&&p[i]-p[d.front()]>=k){ans=min(ans,i-d.front());d.pop_front();}while(!d.empty()&&p[d.back()]>=p[i])d.pop_back();d.push_back(i);}cout<<(ans==n+1?-1:ans);',
  'int k;cin>>k;auto atMost=[&](int cap){unordered_map<long long,int>f;int l=0;long long ans=0;for(int r=0;r<n;r++){f[a[r]]++;while((int)f.size()>cap){if(--f[a[l]]==0)f.erase(a[l]);l++;}ans+=r-l+1;}return ans;};cout<<atMost(k)-atMost(k-1);',
  'vector<long long>b=a;sort(b.begin(),b.end());b.erase(unique(b.begin(),b.end()),b.end());vector<int>bit(b.size()+1);long long ans=0;for(int i=n-1;i>=0;i--){int x=lower_bound(b.begin(),b.end(),a[i])-b.begin()+1;for(int j=x-1;j>0;j-=j&-j)ans+=bit[j];for(int j=x;j<(int)bit.size();j+=j&-j)bit[j]++;}cout<<ans;',
  'const long long MOD=1000000007;vector<int>s;long long ans=0;for(int r=0;r<=n;r++){while(!s.empty()&&(r==n||a[s.back()]>=a[r])){int i=s.back();s.pop_back();int l=s.empty()?-1:s.back();ans=(ans+(a[i]*(i-l)%MOD)*(r-i))%MOD;}s.push_back(r);}cout<<ans;',
  'int k,m;cin>>k>>m;vector<long long>p(n+1);for(int i=0;i<n;i++)p[i+1]=p[i]+a[i];const long long NEG=-(1LL<<60);vector<long long>prev(n+1,0);for(int j=1;j<=m;j++){vector<long long>cur(n+1,NEG);for(int i=1;i<=n;i++){cur[i]=cur[i-1];if(i>=k&&prev[i-k]!=NEG)cur[i]=max(cur[i],prev[i-k]+p[i]-p[i-k]);}prev=cur;}cout<<prev[n];',
];
const python = [
  'print(sum(a))',
  'x=next(it)\nb=[v for v in a if v!=x]\nprint(len(b))\nprint(*b)',
  'k=next(it)%n\nprint(*(a[-k:]+a[:-k] if k else a))',
  'from collections import Counter\nf=Counter(a)\nv=min(f,key=lambda x:(-f[x],x))\nprint(v,f[v])',
  'p=[0]\nfor x in a: p.append(p[-1]+x)\nq=next(it)\nfor _ in range(q):\n l=next(it); r=next(it); print(p[r]-p[l-1])',
  'b=next(it); s=0; l=0; ans=0\nfor r,x in enumerate(a):\n s+=x\n while s>b: s-=a[l]; l+=1\n ans=max(ans,r-l+1)\nprint(ans)',
  'cur=best=a[0]\nfor x in a[1:]:\n cur=max(x,cur+x); best=max(best,cur)\nprint(best)',
  'k=next(it); f={0:1}; s=ans=0\nfor x in a:\n s+=x; ans+=f.get(s-k,0); f[s]=f.get(s,0)+1\nprint(ans)',
  'k=next(it); a.sort(); l=0; r=n-1; ans=0\nwhile l<r:\n s=a[l]+a[r]\n if s<k: l+=1\n elif s>k: r-=1\n elif a[l]==a[r]:\n  c=r-l+1; ans+=c*(c-1)//2; break\n else:\n  x=a[l]; y=a[r]; c=d=0\n  while l<=r and a[l]==x: c+=1; l+=1\n  while r>=l and a[r]==y: d+=1; r-=1\n  ans+=c*d\nprint(ans)',
  'k=next(it); g=sum(x<=k for x in a); bad=sum(x>k for x in a[:g]); ans=bad\nfor i in range(g,n):\n bad+=(a[i]>k)-(a[i-g]>k); ans=min(ans,bad)\nprint(ans)',
  'from collections import deque\nk=next(it); p=[0]\nfor x in a: p.append(p[-1]+x)\nd=deque(); ans=n+1\nfor i in range(n+1):\n while d and p[i]-p[d[0]]>=k: ans=min(ans,i-d.popleft())\n while d and p[d[-1]]>=p[i]: d.pop()\n d.append(i)\nprint(-1 if ans==n+1 else ans)',
  'k=next(it)\ndef at_most(cap):\n f={}; l=0; ans=0\n for r,x in enumerate(a):\n  f[x]=f.get(x,0)+1\n  while len(f)>cap:\n   y=a[l]; f[y]-=1; l+=1\n   if f[y]==0: del f[y]\n  ans+=r-l+1\n return ans\nprint(at_most(k)-at_most(k-1))',
  'rank={x:i+1 for i,x in enumerate(sorted(set(a)))}; bit=[0]*(len(rank)+1); ans=0\nfor x in reversed(a):\n j=rank[x]-1\n while j>0: ans+=bit[j]; j-=j&-j\n j=rank[x]\n while j<len(bit): bit[j]+=1; j+=j&-j\nprint(ans)',
  'mod=1000000007; stack=[]; ans=0\nfor r in range(n+1):\n while stack and (r==n or a[stack[-1]]>=a[r]):\n  i=stack.pop(); l=stack[-1] if stack else -1; ans=(ans+a[i]*(i-l)*(r-i))%mod\n stack.append(r)\nprint(ans)',
  'k=next(it); m=next(it); p=[0]\nfor x in a: p.append(p[-1]+x)\nneg=-10**30; prev=[0]*(n+1)\nfor j in range(1,m+1):\n cur=[neg]*(n+1)\n for i in range(1,n+1):\n  cur[i]=cur[i-1]\n  if i>=k and prev[i-k]!=neg: cur[i]=max(cur[i],prev[i-k]+p[i]-p[i-k])\n prev=cur\nprint(prev[n])',
];
const java = [
  'long sum=0;for(long x:a)sum+=x;out.append(sum);',
  'long x=f.next();int c=0;for(long v:a)if(v!=x)c++;out.append(c).append("\\n");for(long v:a)if(v!=x)out.append(v).append(" ");',
  'int k=(int)(f.next()%n);for(int i=0;i<n;i++)out.append(a[(i+n-k)%n]).append(" ");',
  'TreeMap<Long,Integer>freq=new TreeMap<>();for(long x:a)freq.merge(x,1,Integer::sum);long v=0;int best=0;for(var e:freq.entrySet())if(e.getValue()>best){v=e.getKey();best=e.getValue();}out.append(v).append(" ").append(best);',
  'long[] p=new long[n+1];for(int i=0;i<n;i++)p[i+1]=p[i]+a[i];int q=(int)f.next();while(q-->0){int l=(int)f.next(),r=(int)f.next();out.append(p[r]-p[l-1]).append("\\n");}',
  'long b=f.next(),sum=0;int l=0,ans=0;for(int r=0;r<n;r++){sum+=a[r];while(sum>b)sum-=a[l++];ans=Math.max(ans,r-l+1);}out.append(ans);',
  'long cur=a[0],best=cur;for(int i=1;i<n;i++){cur=Math.max(a[i],cur+a[i]);best=Math.max(best,cur);}out.append(best);',
  'long k=f.next(),s=0,ans=0;HashMap<Long,Long>freq=new HashMap<>();freq.put(0L,1L);for(long x:a){s+=x;ans+=freq.getOrDefault(s-k,0L);freq.merge(s,1L,Long::sum);}out.append(ans);',
  'long k=f.next(),ans=0;Arrays.sort(a);int l=0,r=n-1;while(l<r){long s=a[l]+a[r];if(s<k)l++;else if(s>k)r--;else if(a[l]==a[r]){long c=r-l+1;ans+=c*(c-1)/2;break;}else{long x=a[l],y=a[r],c=0,d=0;while(l<=r&&a[l]==x){c++;l++;}while(r>=l&&a[r]==y){d++;r--;}ans+=c*d;}}out.append(ans);',
  'long k=f.next();int g=0;for(long x:a)if(x<=k)g++;int bad=0;for(int i=0;i<g;i++)if(a[i]>k)bad++;int ans=bad;for(int i=g;i<n;i++){bad+=(a[i]>k?1:0)-(a[i-g]>k?1:0);ans=Math.min(ans,bad);}out.append(ans);',
  'long k=f.next();long[]p=new long[n+1];for(int i=0;i<n;i++)p[i+1]=p[i]+a[i];ArrayDeque<Integer>d=new ArrayDeque<>();int ans=n+1;for(int i=0;i<=n;i++){while(!d.isEmpty()&&p[i]-p[d.peekFirst()]>=k)ans=Math.min(ans,i-d.removeFirst());while(!d.isEmpty()&&p[d.peekLast()]>=p[i])d.removeLast();d.addLast(i);}out.append(ans==n+1?-1:ans);',
  'int k=(int)f.next();long[] totals=new long[2];for(int z=0;z<2;z++){int cap=k-z,l=0;HashMap<Long,Integer>freq=new HashMap<>();for(int r=0;r<n;r++){freq.merge(a[r],1,Integer::sum);while(freq.size()>cap){long x=a[l++];int count=freq.get(x)-1;if(count==0)freq.remove(x);else freq.put(x,count);}totals[z]+=r-l+1;}}out.append(totals[0]-totals[1]);',
  'long[] b=a.clone();Arrays.sort(b);int[]bit=new int[n+1];long ans=0;for(int i=n-1;i>=0;i--){int lo=0,hi=n;while(lo<hi){int mid=(lo+hi)/2;if(b[mid]<a[i])lo=mid+1;else hi=mid;}int x=lo+1;for(int j=x-1;j>0;j-=j&-j)ans+=bit[j];for(int j=x;j<=n;j+=j&-j)bit[j]++;}out.append(ans);',
  'long mod=1000000007,ans=0;ArrayDeque<Integer>s=new ArrayDeque<>();for(int r=0;r<=n;r++){while(!s.isEmpty()&&(r==n||a[s.peekLast()]>=a[r])){int i=s.removeLast(),l=s.isEmpty()?-1:s.peekLast();ans=(ans+(a[i]*(i-l)%mod)*(r-i))%mod;}s.addLast(r);}out.append(ans);',
  'int k=(int)f.next(),m=(int)f.next();long[]p=new long[n+1];for(int i=0;i<n;i++)p[i+1]=p[i]+a[i];long neg=Long.MIN_VALUE/4;long[]prev=new long[n+1];for(int j=1;j<=m;j++){long[]cur=new long[n+1];Arrays.fill(cur,neg);for(int i=1;i<=n;i++){cur[i]=cur[i-1];if(i>=k&&prev[i-k]!=neg)cur[i]=Math.max(cur[i],prev[i-k]+p[i]-p[i-k]);}prev=cur;}out.append(prev[n]);',
];
const javaHead = `import java.io.*; import java.util.*;
public class Main {
 static class FastScanner { InputStream in=System.in; byte[] b=new byte[65536]; int p=0,l=0;
  int read() throws Exception {if(p>=l){l=in.read(b);p=0;if(l<0)return -1;}return b[p++];}
  long next() throws Exception {int c;do{c=read();}while(c<=32&&c!=-1);if(c==-1)throw new EOFException();long s=1,v=0;if(c==45){s=-1;c=read();}while(c>32&&c!=-1){v=v*10+c-48;c=read();}return v*s;}}
 public static void main(String[]args)throws Exception{FastScanner f=new FastScanner();int n=(int)f.next();long[]a=new long[n];for(int i=0;i<n;i++)a[i]=f.next();StringBuilder out=new StringBuilder();
`;
function references(level) {
  return {
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\nint main(){ios::sync_with_stdio(false);cin.tie(nullptr);int n;cin>>n;vector<long long>a(n);for(auto &x:a)cin>>x;\n'+cpp[level-1]+'\nreturn 0;}\n',
    java: javaHead+java[level-1]+'\nSystem.out.print(out);}}\n',
    python: 'import sys\nit=iter(map(int,sys.stdin.buffer.read().split()))\nn=next(it)\na=[next(it) for _ in range(n)]\n'+python[level-1]+'\n',
  };
}
function starters(level) {
  const extra = level===5 ? ['int q; cin >> q; // Then read q pairs l, r.','int q=(int)f.next(); // Then read q pairs l, r.','q = next(it)  # Then read q pairs l, r.']
    : level===15 ? ['int k,m; cin >> k >> m;','int k=(int)f.next(),m=(int)f.next();','k, m = next(it), next(it)']
    : [2,3,6,8,9,10,11,12].includes(level) ? ['long long k; cin >> k;','long k=f.next();','k = next(it)'] : ['', '', ''];
  return {
    cpp: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios::sync_with_stdio(false);\n    cin.tie(nullptr);\n    int n; cin >> n;\n    vector<long long> a(n);\n    for (auto &x : a) cin >> x;\n    '+extra[0]+'\n\n    // Compute the answer and write it to standard output.\n\n    return 0;\n}\n',
    java: javaHead+extra[1]+'\n// Compute the answer and append it to out.\n\nSystem.out.print(out);\n}\n}\n',
    python: 'import sys\n\nit = iter(map(int, sys.stdin.buffer.read().split()))\nn = next(it)\na = [next(it) for _ in range(n)]\n'+extra[2]+'\n\n# Compute the answer and print it.\n',
  };
}
module.exports = { references, starters };
