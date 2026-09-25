(() => {
  'use strict';
  const NS='http://www.w3.org/2000/svg';
  const el=(tag,attrs={},text='')=>{const n=document.createElementNS(NS,tag);Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v));if(text)n.textContent=text;return n};
  function render({svg,selected=0,onSelect}){
    svg.setAttribute('viewBox','0 0 600 600');svg.innerHTML='';
    const defs=el('defs'),glow=el('filter',{id:'circleGlow',x:'-80%',y:'-80%',width:'260%',height:'260%'});glow.append(el('feGaussianBlur',{stdDeviation:'7',result:'b'}));const m=el('feMerge');m.append(el('feMergeNode',{in:'b'}),el('feMergeNode',{in:'SourceGraphic'}));glow.append(m);defs.append(glow);svg.append(defs);
    svg.append(el('circle',{cx:300,cy:300,r:247,fill:'#071018',stroke:'#1a3345','stroke-width':2}));
    CircleOfFifths.keys.forEach((key,i)=>{
      const a=(i*30-90)*Math.PI/180,x=300+Math.cos(a)*205,y=300+Math.sin(a)*205,active=i===selected;
      const g=el('g',{class:'circle-key'+(active?' active':''),'data-circle-key':i,role:'button',tabindex:'0','aria-label':`${key.name} major, ${key.minor} relative minor`});
      g.append(el('circle',{cx:x,cy:y,r:active?48:43,fill:active?'#102735':'#0a141d',stroke:active?'#27d7ff':'#365064','stroke-width':active?4:2,filter:active?'url(#circleGlow)':''}));
      g.append(el('text',{x,y:y-3,fill:active?'#f8fbff':'#d9e8ef','font-size':active?27:24,'font-weight':900,'text-anchor':'middle','dominant-baseline':'middle'},key.name));
      g.append(el('text',{x,y:y+24,fill:active?'#ff3ec9':'#8ca4b5','font-size':14,'font-weight':800,'text-anchor':'middle'},key.minor));
      g.addEventListener('click',()=>onSelect(i));g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(i)}});svg.append(g);
    });
    svg.append(el('circle',{cx:300,cy:300,r:112,fill:'#05090d',stroke:'#ff3ec9','stroke-width':2,opacity:.96}));
    svg.append(el('text',{x:300,y:278,fill:'#829bad','font-size':15,'font-weight':800,'text-anchor':'middle','letter-spacing':2},'SELECTED KEY'));
    const k=CircleOfFifths.getKey(selected);svg.append(el('text',{x:300,y:320,fill:'#f8fbff','font-size':43,'font-weight':1000,'text-anchor':'middle'},`${k.name} MAJOR`));
    svg.append(el('text',{x:300,y:350,fill:'#27d7ff','font-size':17,'font-weight':900,'text-anchor':'middle'},`RELATIVE ${k.minor}`));
  }
  window.CircleRenderer=Object.freeze({render});
})();
