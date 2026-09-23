(() => {
  'use strict';
  function templateShapes({engine,templates={},anchors={},order=[],shape='all',rootPC,quality='major',maxFret=engine.maxFret}){
    const wanted=shape==='all'?order:[shape],third=quality==='major'?4:3,shapes=[];
    const expectedFor=degree=>degree==='root'?rootPC:degree==='third'?MusicTheory.mod(rootPC+third):MusicTheory.mod(rootPC+7);
    for(const id of wanted){
      const template=templates[id],anchor=anchors[id];if(!template||!anchor)continue;
      for(let base=-Math.max(12,maxFret);base<=maxFret;base++){
        const anchorFret=base+anchor[1];
        if(anchorFret<0||anchorFret>maxFret||engine.noteAt(anchor[0],anchorFret)!==rootPC)continue;
        const notes=[];let valid=true;
        for(const [string,rel,degree] of template){
          const fret=base+rel+(quality==='minor'&&degree==='third'?-1:0);
          if(fret<0||fret>maxFret){valid=false;break;}
          const pc=engine.noteAt(string,fret);if(pc!==expectedFor(degree)){valid=false;break;}
          notes.push({string,fret,pc,degree,midi:engine.midiAt(string,fret)});
        }
        if(valid)shapes.push({shape:id,notes,min:Math.min(...notes.map(n=>n.fret)),max:Math.max(...notes.map(n=>n.fret))});
      }
    }
    const seen=new Set();return shapes.filter(sh=>{const key=sh.shape+'|'+sh.notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(key))return false;seen.add(key);return true;}).sort((a,b)=>a.min-b.min||order.indexOf(a.shape)-order.indexOf(b.shape));
  }
  window.ChordEngine={templateShapes};
})();
