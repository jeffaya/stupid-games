(() => {
  'use strict';
  const DEFAULT_COLORS={A:'#4f9dff','A#':'#9b6cff',B:'#c48b5b',C:'#35d1b0','C#':'#26b9d5',D:'#d15a91','D#':'#b864d8',E:'#82bd58',F:'#ff745e','F#':'#ff4f93',G:'#ff9d3f','G#':'#ffd14f'};
  function render({svg,engine,maxFret,selectedNote='all',renderCore,svgEl,noteName=MusicTheory.noteName,colors=DEFAULT_COLORS}){
    const {isP,fretPos,visualStringPos}=renderCore(svg,{prefix:'map',maxFret});
    const defs=svg.querySelector('defs');
    const filter=svgEl('filter',{id:'mapGlow',x:'-80%',y:'-80%',width:'260%',height:'260%'});
    filter.append(svgEl('feGaussianBlur',{stdDeviation:'3',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}));merge.append(svgEl('feMergeNode',{in:'SourceGraphic'}));filter.append(merge);defs?.append(filter);
    for(let s=0;s<engine.stringCount;s++)for(let f=0;f<=maxFret;f++){
      const pc=engine.noteAt(s,f),name=noteName(pc);if(selectedNote!=='all'&&name!==selectedNote)continue;
      const centerF=f===0?fretPos(0)-17:(fretPos(f-1)+fretPos(f))/2,centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS,col=colors[name]||'#fff';
      svg.append(svgEl('circle',{cx:x,cy:y,r:isP?20:13,fill:col,stroke:'#ffffffb8','stroke-width':1.4,filter:'url(#mapGlow)'}));
      svg.append(svgEl('text',{x,y,fill:'#071016','font-size':isP?20:(name.length>1?8.5:10.5),'font-weight':1000,'text-anchor':'middle','dominant-baseline':'middle'},name));
    }
  }
  window.FretboardMap={render,DEFAULT_COLORS};
})();
