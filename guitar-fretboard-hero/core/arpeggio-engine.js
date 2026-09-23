(() => {
  'use strict';
  const FORMULAS={major:[0,4,7],minor:[0,3,7],maj7:[0,4,7,11],min7:[0,3,7,10],dom7:[0,4,7,10]};
  const pitchClasses=(rootPC,type='major')=>(FORMULAS[type]||FORMULAS.major).map(i=>MusicTheory.mod(rootPC+i));
  const occurrences=({engine,rootPC,type='major',maxFret=engine.maxFret})=>{
    const pcs=new Set(pitchClasses(rootPC,type)),out=[];
    for(let s=0;s<engine.stringCount;s++)for(let f=0;f<=maxFret;f++){const pc=engine.noteAt(s,f);if(pcs.has(pc))out.push({string:s,fret:f,pc});}
    return out;
  };
  window.ArpeggioEngine={FORMULAS,pitchClasses,occurrences};
})();
