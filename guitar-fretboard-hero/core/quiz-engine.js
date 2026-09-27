(() => {
  'use strict';
  const DURATION_MS=60000,BASE_POINTS=100,MAX_MULTIPLIER=5,DEFAULT_SCORE_TABLE=[100,250,500,800,1200];
  const nextMultiplier=m=>Math.min(MAX_MULTIPLIER,m+1);
  const scoreGain=(m,base=BASE_POINTS,table=DEFAULT_SCORE_TABLE)=>table?.[Math.max(1,Math.min(MAX_MULTIPLIER,Number(m)||1))-1]??base*m;
  const resetMultiplier=()=>1;
  const targetPC=({rootPC,quality,target,mod})=>target==='root'?rootPC:target==='third'?mod(rootPC+(quality==='major'?4:3)):mod(rootPC+7);
  const rankFor=(score,ranks)=>{if(!ranks?.length)return{emoji:'',rank:'UNRANKED',copy:'',min:0};const row=ranks.find(r=>score>=r[0])||ranks[ranks.length-1];return{emoji:row[1],rank:row[2],copy:row[3],min:row[0]};};
  const progressionMaxFret=(correct=0,maxFret=15)=>Math.min(maxFret,correct<5?5:correct<10?7:correct<15?9:correct<20?12:15);
  const progressionWindow=(correct=0,maxFret=15)=>[0,progressionMaxFret(correct,maxFret)];
  window.QuizEngine={DURATION_MS,BASE_POINTS,MAX_MULTIPLIER,DEFAULT_SCORE_TABLE,nextMultiplier,scoreGain,resetMultiplier,targetPC,rankFor,progressionMaxFret,progressionWindow};
})();
