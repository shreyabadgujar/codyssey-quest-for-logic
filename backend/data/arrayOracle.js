// Independent small-input oracle: deliberately simple enumeration, not the optimized references.
function oracle(level,a,e) {
  const n=a.length,k=e[0];
  let ans=0;
  if(level===1)return String(a.reduce((s,x)=>s+x,0));
  if(level===2){const b=a.filter(x=>x!==k);return b.length+"\n"+b.join(" ");}
  if(level===3){const b=Array(n);a.forEach((x,i)=>b[(i+k%n)%n]=x);return b.join(" ");}
  if(level===4){const b=[...new Set(a)].map(x=>[x,a.filter(y=>y===x).length]).sort((x,y)=>y[1]-x[1]||x[0]-y[0]);return b[0].join(" ");}
  if(level===5){const out=[];for(let q=0;q<k;q++)out.push(a.slice(e[1+q*2]-1,e[2+q*2]).reduce((s,x)=>s+x,0));return out.join("\n");}
  if(level===9||level===13){for(let i=0;i<n;i++)for(let j=i+1;j<n;j++)if(level===9?a[i]+a[j]===k:a[i]>a[j])ans++;return String(ans);}
  if(level===10){const g=a.filter(x=>x<=k).length;if(!g)return "0";return String(Math.min(...Array.from({length:n-g+1},(_,i)=>a.slice(i,i+g).filter(x=>x>k).length)));}
  if(level===15){const m=e[1];const search=(start,left)=>{if(!left)return 0;let best=-Infinity;for(let i=start;i<=n-left*k;i++)best=Math.max(best,a.slice(i,i+k).reduce((s,x)=>s+x,0)+search(i+k,left-1));return best;};return String(search(0,m));}
  if(level===7)ans=-Infinity;
  if(level===11)ans=Infinity;
  for(let l=0;l<n;l++){
    let sum=0,min=Infinity;const distinct=new Set();
    for(let r=l;r<n;r++){
      sum+=a[r];min=Math.min(min,a[r]);distinct.add(a[r]);
      if(level===6&&sum<=k)ans=Math.max(ans,r-l+1);
      if(level===7)ans=Math.max(ans,sum);
      if(level===8&&sum===k)ans++;
      if(level===11&&sum>=k)ans=Math.min(ans,r-l+1);
      if(level===12&&distinct.size===k)ans++;
      if(level===14)ans=(ans+min)%1000000007;
    }
  }
  return String(ans===Infinity?-1:ans);
}
module.exports={oracle};
