(() => {
  'use strict';
  const DURATION_MS=60000,BASE_POINTS=100,MAX_MULTIPLIER=5;
  const nextMultiplier=m=>Math.min(MAX_MULTIPLIER,m+1);
  const scoreGain=(m,base=BASE_POINTS)=>base*m;
  const resetMultiplier=()=>1;
  const targetPC=({rootPC,quality,target,mod})=>target==='root'?rootPC:target==='third'?mod(rootPC+(quality==='major'?4:3)):mod(rootPC+7);
  const rankFor=(score,ranks)=>{if(!ranks?.length)return{emoji:'',rank:'UNRANKED',copy:'',min:0};const row=ranks.find(r=>score>=r[0])||ranks[ranks.length-1];return{emoji:row[1],rank:row[2],copy:row[3],min:row[0]};};
  const defaultWindows=(maxFret=15,maxMultiplier=MAX_MULTIPLIER)=>{const width=Math.min(6,maxFret),starts=[0,3,5,8,9].map(n=>Math.min(n,Math.max(0,maxFret-width)));const ranges=starts.map(s=>[s,Math.min(maxFret,s+width)]);const weights=[[6,4,1,0,0],[2,5,4,1,0],[0,2,5,5,1],[0,0,2,6,4],[0,0,1,5,6]];const out={};for(let m=1;m<=maxMultiplier;m++){out[m]=ranges.map((range,i)=>({range:range.slice(),w:weights[Math.min(m,5)-1][i]||0})).filter(x=>x.w>0)}return out;};
  window.QuizEngine={DURATION_MS,BASE_POINTS,MAX_MULTIPLIER,nextMultiplier,scoreGain,resetMultiplier,targetPC,rankFor,defaultWindows};
})();
