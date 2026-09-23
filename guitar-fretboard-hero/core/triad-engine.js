(() => {
  'use strict';
  function findShapes({engine,rootPC,quality,maxFret,set='all'}){
    const sets=engine.profile.triadSets||{}, wanted=set==='all'?Object.entries(sets):[[set,sets[set]||sets[engine.profile.defaultTriadSet]]];
    const third=(rootPC+(quality==='major'?4:3))%12,fifth=(rootPC+7)%12,pcs=[rootPC,third,fifth],labels=['root','third','fifth'],out=[];
    wanted.forEach(([setName,strings])=>{if(!strings)return;const candidates=strings.map(si=>{const a=[];for(let f=0;f<=maxFret;f++){const pc=engine.noteAt(si,f),di=pcs.indexOf(pc);if(di>=0)a.push({string:si,fret:f,pc,degree:labels[di],midi:engine.midiAt(si,f)})}return a});
      if(candidates.length!==3)return;for(const a of candidates[0])for(const b of candidates[1])for(const c of candidates[2]){const combo=[a,b,c];if(new Set(combo.map(x=>x.degree)).size<3)continue;const frets=combo.map(x=>x.fret);if(Math.max(...frets)-Math.min(...frets)>4)continue;const midis=combo.map(x=>x.midi).sort((x,y)=>x-y);if(midis[2]-midis[0]>12)continue;const low=[...combo].sort((x,y)=>x.midi-y.midi)[0].degree;out.push({notes:combo,stringSet:setName,min:Math.min(...frets),max:Math.max(...frets),inversion:low==='root'?'Root position':low==='third'?'1st inversion':'2nd inversion'})}}
    );const seen=new Set();return out.filter(s=>{const k=s.notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.min-b.min||a.max-b.max);
  }
  window.TriadEngine={findShapes};
})();
