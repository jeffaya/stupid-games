(() => {
  'use strict';
  const NOTES=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
  const PC=Object.fromEntries(NOTES.map((n,i)=>[n,i]));
  const INTERVALS={major:{third:4,penta:[0,2,4,7,9]},minor:{third:3,penta:[0,3,5,7,10]}};
  const mod=(n,m=12)=>((n%m)+m)%m;
  const noteName=pc=>NOTES[mod(pc)];
  const chordTones=(root,quality)=>({root:mod(root),third:mod(root+INTERVALS[quality].third),fifth:mod(root+7)});
  const pentatonicPCs=(root,quality)=>INTERVALS[quality].penta.map(i=>mod(root+i));
  const degreeFor=(pc,root,quality)=>{const t=chordTones(root,quality),d=mod(pc-root);if(d===0)return'root';if(pc===t.third)return'third';if(d===2)return'second';if(d===5)return'fourth';if(d===7)return'fifth';if(d===9)return'sixth';if(d===10||d===11)return'seventh';return null};
  window.MusicTheory={NOTES,PC,INTERVALS,mod,noteName,chordTones,pentatonicPCs,degreeFor};
})();
