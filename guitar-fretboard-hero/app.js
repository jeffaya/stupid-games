(() => {
  'use strict';
  const NOTES=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
  const PC={A:0,'A#':1,B:2,C:3,'C#':4,D:5,'D#':6,E:7,F:8,'F#':9,G:10,'G#':11};
  const PC_TO_NAME=NOTES;
  const tuning=[{name:'E',pc:7,midi:40},{name:'A',pc:0,midi:45},{name:'D',pc:5,midi:50},{name:'G',pc:10,midi:55},{name:'B',pc:2,midi:59},{name:'E',pc:7,midi:64}];
  const intervals={major:{third:4,penta:[0,2,4,7,9]},minor:{third:3,penta:[0,3,5,7,10]}};
  const defaultFretCount=()=>window.innerWidth<=800?12:((navigator.maxTouchPoints||0)>1&&window.innerWidth<=1366?15:21);
  const state={screen:'home',mode:'penta',root:'A',quality:'minor',pattern:'all',triadStrings:'GBE',chordShape:'all',maxFret:defaultFretCount(),fretManual:false,degreeFilter:'all',mapMaxFret:defaultFretCount(),mapFretManual:false,mapNote:'all',quiz:null,quizReveal:null};
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const mod=(n,m=12)=>((n%m)+m)%m;
  const noteName=pc=>PC_TO_NAME[mod(pc)];
  const rootPC=()=>PC[state.root];
  const thirdPC=()=>mod(rootPC()+intervals[state.quality].third);
  const fifthPC=()=>mod(rootPC()+7);
  function go(screen){state.screen=screen;$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+screen).classList.add('active');if(screen==='practice') renderPractice();if(screen==='fretmap') renderFretboardMap();if(screen==='quiz') startQuiz();}
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  const practiceDrawer=$('#practiceDrawer'),practiceDrawerBackdrop=$('#practiceDrawerBackdrop'),practiceMenuBtn=$('#practiceMenuBtn');
  function setPracticeMenu(open){if(!practiceDrawer)return;practiceDrawer.classList.toggle('open',open);practiceDrawerBackdrop?.classList.toggle('show',open);practiceDrawer.setAttribute('aria-hidden',String(!open));practiceMenuBtn?.setAttribute('aria-expanded',String(open));}
  practiceMenuBtn?.addEventListener('click',()=>setPracticeMenu(!practiceDrawer.classList.contains('open')));
  $('#practiceMenuClose')?.addEventListener('click',()=>setPracticeMenu(false));
  practiceDrawerBackdrop?.addEventListener('click',()=>setPracticeMenu(false));

  // V6 shared responsive drawers -------------------------------------------------
  function bindDrawer(name){
    const drawer=$('#'+name+'Drawer'), btn=$('#'+name+'MenuBtn'), close=$('#'+name+'MenuClose'), backdrop=$('#'+name+'DrawerBackdrop');
    if(!drawer||!btn)return;
    const set=open=>{drawer.classList.toggle('open',open);backdrop?.classList.toggle('show',open);drawer.setAttribute('aria-hidden',String(!open));btn.setAttribute('aria-expanded',String(open));};
    btn.addEventListener('click',()=>set(!drawer.classList.contains('open'))); close?.addEventListener('click',()=>set(false)); backdrop?.addEventListener('click',()=>set(false));
  }
  bindDrawer('map');

  // V6 custom select-buttons. They proxy the existing buttons, so gameplay has
  // one source of truth regardless of responsive presentation.
  function sourceButtonsFor(host){
    const key=host.dataset.selectFor;
    if(key==='mapFrets')return $$('#mapFretControls button[data-map-frets]');
    const src=$('#'+key); if(!src)return [];
    if(key==='fretCountControls')return $$('#fretCountControls button[data-frets]');
    return [...src.querySelectorAll('button')].filter(b=>!b.classList.contains('select-trigger'));
  }
  function refreshSelect(host){
    const buttons=sourceButtonsFor(host); if(!buttons.length){host.innerHTML='';return;}
    let trigger=host.querySelector('.select-trigger'), menu=host.querySelector('.select-popover');
    if(!trigger){
      trigger=document.createElement('button');trigger.type='button';trigger.className='select-trigger';trigger.setAttribute('aria-expanded','false');
      menu=document.createElement('div');menu.className='select-popover';host.append(trigger,menu);
      trigger.addEventListener('click',e=>{e.stopPropagation();const open=host.classList.toggle('select-open');trigger.setAttribute('aria-expanded',String(open));});
    }
    menu.innerHTML='';
    const active=buttons.find(b=>b.classList.contains('active'))||buttons[0];
    trigger.innerHTML=`<span>${active?.textContent?.trim()||'SELECT'}</span><b aria-hidden="true">⌄</b>`;
    buttons.forEach(b=>{const o=document.createElement('button');o.type='button';o.className='select-option'+(b.classList.contains('active')?' active':'');o.textContent=b.textContent.trim();o.addEventListener('click',()=>{b.click();host.classList.remove('select-open');trigger.setAttribute('aria-expanded','false');requestAnimationFrame(refreshAllSelects)});menu.append(o)});
  }
  function refreshAllSelects(){ $$('.control-select').forEach(refreshSelect); requestAnimationFrame(updateAdaptiveControls); }
  document.addEventListener('click',e=>{if(!e.target.closest('.control-select'))$$('.control-select.select-open').forEach(x=>{x.classList.remove('select-open');x.querySelector('.select-trigger')?.setAttribute('aria-expanded','false')})});

  function updateAdaptiveControls(){
    const mobile=matchMedia('(max-width:767px), (orientation:landscape) and (max-width:1000px) and (max-height:599px)').matches;
    const toolbars=[$('#practiceDrawer'),$('#mapDrawer')].filter(Boolean);
    toolbars.forEach(toolbar=>toolbar.querySelectorAll('.control-group').forEach(g=>g.classList.remove('is-select')));
    if(mobile)return;

    toolbars.forEach(toolbar=>{
      const row=toolbar.querySelector('.control-panel')||toolbar;
      const groups=[...toolbar.querySelectorAll('.control-group')];
      // Do not rely on scrollWidth here: several legacy children use visible overflow,
      // which can report a row as fitting even when the groups visually spill/wrap.
      // Measure the canonical groups themselves against the real panel width.
      const fits=()=>{
        const style=getComputedStyle(row);
        const gap=parseFloat(style.columnGap||style.gap)||0;
        const required=groups.reduce((sum,g)=>sum+g.getBoundingClientRect().width,0)+gap*Math.max(0,groups.length-1);
        return required<=row.getBoundingClientRect().width+1;
      };
      // Same degradation order on Practice and Map. Wide controls collapse first.
      const order=['fretboard','root','note','context','quality','mode'];
      for(const type of order){
        if(fits())break;
        groups.filter(g=>g.dataset.controlGroup===type).forEach(g=>g.classList.add('is-select'));
      }
    });
  }
  const adaptiveObserver=new ResizeObserver(()=>requestAnimationFrame(()=>{refreshAllSelects();updateAdaptiveControls()}));
  $$('.control-panel').forEach(el=>adaptiveObserver.observe(el));
  window.addEventListener('resize',()=>requestAnimationFrame(()=>{refreshAllSelects();updateAdaptiveControls()}));
  document.addEventListener('fullscreenchange',()=>setTimeout(()=>{refreshAllSelects();updateAdaptiveControls()},50));

  NOTES.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.dataset.root=n;if(n==='A')b.classList.add('active');$('#rootControls').appendChild(b)});
  $('#rootControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.root=b.dataset.root;$$('#rootControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#modeControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.mode=b.dataset.mode;if(state.mode==='penta')state.pattern='all';else if(state.mode==='triad')state.triadStrings='GBE';else state.chordShape='all';$$('#modeControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#qualityControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.quality=b.dataset.quality;$$('#qualityControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#fretCountControls').addEventListener('click',e=>{const b=e.target.closest('button[data-frets]');if(!b)return;state.maxFret=Number(b.dataset.frets);state.fretManual=true;renderPractice()});
  $('#practicePositionButtons').addEventListener('click',e=>{const b=e.target.closest('button[data-value]');if(!b)return;const v=b.dataset.value;if(state.mode==='penta')state.pattern=v;else if(state.mode==='triad')state.triadStrings=v;else state.chordShape=v;renderPractice()});
  window.addEventListener('resize',()=>{if(!state.fretManual)state.maxFret=defaultFretCount();if(!state.mapFretManual)state.mapMaxFret=defaultFretCount();if(state.screen==='practice')renderPractice();if(state.screen==='fretmap')renderFretboardMap();if(state.screen==='quiz')renderQuizBoard()});

  $$('#mapFretControls button[data-map-frets]').forEach(b=>b.addEventListener('click',()=>{state.mapMaxFret=Number(b.dataset.mapFrets);state.mapFretManual=true;renderFretboardMap()}));
  // Practice legend: tap a degree to isolate it; tap the active pill again to show everything.
  $('.practice-legend')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-degree-filter]');if(!b||b.classList.contains('legend-muted'))return;
    const next=b.dataset.degreeFilter;state.degreeFilter=state.degreeFilter===next?'all':next;renderPractice();
  });

  // Fretboard Map: all notes by default, or isolate one pitch class while learning it.
  NOTES.forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.dataset.mapNote=n;$('#mapNoteControls')?.appendChild(b)});
  $('#mapNoteControls')?.addEventListener('click',e=>{const b=e.target.closest('button[data-map-note]');if(!b)return;state.mapNote=b.dataset.mapNote;renderFretboardMap()});
  requestAnimationFrame(refreshAllSelects);
  const MAP_COLORS={A:'#4f9dff','A#':'#9b6cff',B:'#c48b5b',C:'#35d1b0','C#':'#26b9d5',D:'#d15a91','D#':'#b864d8',E:'#82bd58',F:'#ff745e','F#':'#ff4f93',G:'#ff9d3f','G#':'#ffd14f'};
  function renderFretboardMap(){
    requestAnimationFrame(refreshAllSelects);
    const svg=$('#mapFretboard'); if(!svg)return;
    const maxFret=Math.min(21,state.mapMaxFret);
    $$('#mapFretControls button[data-map-frets]').forEach(b=>b.classList.toggle('active',Number(b.dataset.mapFrets)===maxFret));
    $$('#mapNoteControls button[data-map-note]').forEach(b=>{const on=b.dataset.mapNote===state.mapNote;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    const {isP,fretPos,visualStringPos}=renderFretboardCore(svg,{prefix:'map',maxFret});
    const defs=svg.querySelector('defs');const filter=svgEl('filter',{id:'mapGlow',x:'-80%',y:'-80%',width:'260%',height:'260%'});filter.append(svgEl('feGaussianBlur',{stdDeviation:'3',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}));merge.append(svgEl('feMergeNode',{in:'SourceGraphic'}));filter.append(merge);defs?.append(filter);
    for(let s=0;s<6;s++)for(let f=0;f<=maxFret;f++){const pc=noteAt(s,f),name=noteName(pc);if(state.mapNote!=='all'&&name!==state.mapNote)continue;const centerF=f===0?fretPos(0)-17:(fretPos(f-1)+fretPos(f))/2,centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS,col=MAP_COLORS[name]||'#fff';svg.append(svgEl('circle',{cx:x,cy:y,r:isP?20:13,fill:col,stroke:'#ffffffb8','stroke-width':1.4,filter:'url(#mapGlow)'}));svg.append(svgEl('text',{x,y,fill:'#071016','font-size':isP?20:(name.length>1?8.5:10.5),'font-weight':1000,'text-anchor':'middle','dominant-baseline':isP?'middle':'auto'},name))}
  }

  function noteAt(stringIndex,fret){return mod(tuning[stringIndex].pc+fret)}
  function degreeFor(pc){const diff=mod(pc-rootPC());if(diff===0)return 'root';if(pc===thirdPC())return 'third';if(diff===2)return 'second';if(diff===5)return 'fourth';if(diff===7)return 'fifth';if(diff===9)return 'sixth';if(diff===10||diff===11)return 'seventh';return null}
  function pentaPCs(){return intervals[state.quality].penta.map(i=>mod(rootPC()+i))}
  function formula(){const ints=state.quality==='minor'?['1','♭3','4','5','♭7']:['1','2','3','5','6'];return pentaPCs().map(noteName).join(' • ')+'   '+ints.join(' • ')}
  function updatePracticeLegend(){
    const fourth=$('#legendFourth'),seventh=$('#legendSeventh');
    if(!fourth||!seventh)return;
    const showFourth=state.mode==='penta'&&state.quality==='minor';
    const showSeventh=state.mode==='penta'&&state.quality==='minor';
    fourth.classList.toggle('legend-muted',!showFourth);
    seventh.classList.toggle('legend-muted',!showSeventh);
    if((state.degreeFilter==='fourth'&&!showFourth)||(state.degreeFilter==='seventh'&&!showSeventh))state.degreeFilter='all';
  }
  function updateDegreeFilterUI(){
    $$('.practice-legend [data-degree-filter]').forEach(b=>{const on=state.degreeFilter===b.dataset.degreeFilter;const filtered=state.degreeFilter!=='all';b.classList.toggle('active',on);b.classList.toggle('filter-dimmed',filtered&&!on);b.setAttribute('aria-pressed',String(on))});
  }
  function degreeLabel(pc){return noteName(pc)}
  function portrait(){return matchMedia('(max-width:1199px) and (orientation:portrait)').matches}
  function svgEl(tag,attrs={},text=''){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;return e}
  function premiumDefs(svg,prefix){
    const defs=svgEl('defs');
    const wood=svgEl('linearGradient',{id:prefix+'Wood',x1:'0%',y1:'0%',x2:'0%',y2:'100%'});
    [['0%','#172431'],['10%','#071018'],['27%','#18232d'],['48%','#05090d'],['70%','#14212b'],['90%','#080d12'],['100%','#1b2833']].forEach(([offset,stop])=>wood.append(svgEl('stop',{offset,'stop-color':stop})));
    const neckLight=svgEl('linearGradient',{id:prefix+'NeckLight',x1:'0%',y1:'0%',x2:'0%',y2:'100%'});
    [['0%','#79dcff'],['8%','#174d66'],['30%','#ffffff'],['47%','#17232d'],['72%','#05080b'],['94%','#14455c'],['100%','#4ed7ff']].forEach(([offset,stop])=>neckLight.append(svgEl('stop',{offset,'stop-color':stop,'stop-opacity':offset==='30%'?.13:.28})));
    const steel=svgEl('linearGradient',{id:prefix+'Steel',x1:'0%',y1:'0%',x2:'100%',y2:'0%'});
    [['0%','#4d5154'],['18%','#eef4f6'],['42%','#8b9296'],['63%','#f9ffff'],['100%','#3f4447']].forEach(([offset,stop])=>steel.append(svgEl('stop',{offset,'stop-color':stop})));
    const wound=svgEl('pattern',{id:prefix+'Wound',width:5,height:5,patternUnits:'userSpaceOnUse',patternTransform:'rotate(28)'});
    wound.append(svgEl('rect',{width:5,height:5,fill:'#78838b'}),svgEl('line',{x1:0,y1:0,x2:0,y2:5,stroke:'#e8f0f4','stroke-width':1.25}),svgEl('line',{x1:2.8,y1:0,x2:2.8,y2:5,stroke:'#424b52','stroke-width':.9}));
    const grain=svgEl('filter',{id:prefix+'Grain',x:'-10%',y:'-10%',width:'120%',height:'120%'});
    grain.append(svgEl('feTurbulence',{type:'fractalNoise',baseFrequency:'.012 .18',numOctaves:'3',seed:'19',result:'noise'}));
    grain.append(svgEl('feColorMatrix',{in:'noise',type:'matrix',values:'0.25 0 0 0 0  0 0.18 0 0 0  0 0 0.12 0 0  0 0 0 .42 0',result:'grain'}));
    const blend=svgEl('feBlend',{in:'SourceGraphic',in2:'grain',mode:'soft-light'});grain.append(blend);
    const shadow=svgEl('filter',{id:prefix+'StringShadow',x:'-30%',y:'-100%',width:'160%',height:'300%'});
    shadow.append(svgEl('feGaussianBlur',{stdDeviation:'1.8'}));
    const fretGlow=svgEl('filter',{id:prefix+'FretGlow',x:'-100%',y:'-30%',width:'300%',height:'160%'});
    fretGlow.append(svgEl('feGaussianBlur',{stdDeviation:'1.15',result:'blur'}));
    const fm=svgEl('feMerge');fm.append(svgEl('feMergeNode',{in:'blur'}),svgEl('feMergeNode',{in:'SourceGraphic'}));fretGlow.append(fm);
    // V7.1.1 restrained gunmetal nail-head inlays: readable landmarks without competing with learning notes.
    const inlay=svgEl('radialGradient',{id:prefix+'Inlay',cx:'36%',cy:'32%',r:'70%'});
    [['0%','#b7bec3'],['24%','#858d93'],['58%','#596168'],['82%','#3b4248'],['100%','#242a2f']].forEach(([offset,stop])=>inlay.append(svgEl('stop',{offset,'stop-color':stop})));
    const inlayShadow=svgEl('filter',{id:prefix+'InlayShadow',x:'-80%',y:'-80%',width:'260%',height:'260%'});
    inlayShadow.append(svgEl('feDropShadow',{dx:'1.1',dy:'1.5',stdDeviation:'1.15','flood-color':'#000','flood-opacity':'.62'}));
    defs.append(wood,neckLight,steel,wound,grain,shadow,fretGlow,inlay,inlayShadow);svg.append(defs);
  }
  function premiumSurface(svg,isP,W,H,prefix){
    premiumDefs(svg,prefix);
    svg.append(svgEl('rect',{x:0,y:0,width:W,height:H,fill:'#08090b'}));
    const neck=isP?{x:48,y:72,width:W-96,height:H-112,rx:14}:{x:54,y:34,width:W-92,height:H-70,rx:14};
    svg.append(svgEl('rect',{...neck,fill:`url(#${prefix}Wood)`,filter:`url(#${prefix}Grain)`,stroke:'#19394b','stroke-width':2}));
    svg.append(svgEl('rect',{...neck,fill:`url(#${prefix}NeckLight)`,opacity:.34}));
    const edgeA=isP?{x1:neck.x,y1:neck.y,x2:neck.x+neck.width,y2:neck.y}:{x1:neck.x,y1:neck.y,x2:neck.x,y2:neck.y+neck.height};
    const edgeB=isP?{x1:neck.x,y1:neck.y+neck.height,x2:neck.x+neck.width,y2:neck.y+neck.height}:{x1:neck.x+neck.width,y1:neck.y,x2:neck.x+neck.width,y2:neck.y+neck.height};
    svg.append(svgEl('line',{...edgeA,stroke:'#27d7ff','stroke-width':1.4,opacity:.55}));
    svg.append(svgEl('line',{...edgeB,stroke:'#ff3ec9','stroke-width':1.05,opacity:.25}));
    // irregular longitudinal grain highlights
    for(let i=0;i<9;i++){
      const pos=(i+1)/10,op=.035+(i%3)*.018;
      svg.append(svgEl('path',isP?{d:`M ${neck.x+neck.width*pos} ${neck.y} C ${neck.x+neck.width*(pos+.035)} ${neck.y+neck.height*.27}, ${neck.x+neck.width*(pos-.025)} ${neck.y+neck.height*.68}, ${neck.x+neck.width*(pos+.012)} ${neck.y+neck.height}`,fill:'none',stroke:'#91b9cc','stroke-width':1.15,opacity:op*.72}:{d:`M ${neck.x} ${neck.y+neck.height*pos} C ${neck.x+neck.width*.28} ${neck.y+neck.height*(pos+.035)}, ${neck.x+neck.width*.68} ${neck.y+neck.height*(pos-.025)}, ${neck.x+neck.width} ${neck.y+neck.height*(pos+.012)}`,fill:'none',stroke:'#91b9cc','stroke-width':1.15,opacity:op*.72}));
    }
    // subtle edge light
    svg.append(svgEl('rect',{...neck,fill:'none',stroke:'#a8bed0','stroke-width':1,opacity:.16}));
  }
  function premiumFret(svg,isP,p,W,H,isNut,prefix){
    const attrs=isP?{x1:52,x2:W-48,y1:p,y2:p}:{y1:48,y2:H-42,x1:p,x2:p};
    if(!isNut){
      svg.append(svgEl('line',{...attrs,stroke:'#000','stroke-width':8.5,opacity:.58}));
      svg.append(svgEl('line',{...attrs,stroke:'#0a1015','stroke-width':6.4,opacity:.7}));
      svg.append(svgEl('line',{...attrs,stroke:`url(#${prefix}Steel)`,'stroke-width':4.4,filter:`url(#${prefix}FretGlow)`}));
      svg.append(svgEl('line',{...attrs,stroke:'#eaffff','stroke-width':1.05,opacity:.88}));
      svg.append(svgEl('line',{...attrs,stroke:'#27d7ff','stroke-width':.45,opacity:.28}));
    }else{
      svg.append(svgEl('line',{...attrs,stroke:'#2a2118','stroke-width':11,opacity:.7}));
      svg.append(svgEl('line',{...attrs,stroke:'#eee1c4','stroke-width':8}));
      svg.append(svgEl('line',{...attrs,stroke:'#fff8df','stroke-width':1.2,opacity:.9}));
    }
  }
  function premiumString(svg,isP,p,start,end,s,prefix){
    const gauges=[4.15,3.55,3.0,2.05,1.55,1.15],g=gauges[s];
    const attrs=isP?{x1:p,x2:p,y1:start,y2:end}:{x1:start,x2:end,y1:p,y2:p};
    const far=isP?{...attrs,x1:p+4.6,x2:p+4.6}:{...attrs,y1:p+4.6,y2:p+4.6};
    const near=isP?{...attrs,x1:p+2.2,x2:p+2.2}:{...attrs,y1:p+2.2,y2:p+2.2};
    // Contact shadows create the visual gap between string and fretboard.
    svg.append(svgEl('line',{...far,stroke:'#000','stroke-width':g+5.5,opacity:.24,filter:`url(#${prefix}StringShadow)`}));
    svg.append(svgEl('line',{...near,stroke:'#000','stroke-width':g+2.4,opacity:.52}));
    // Metallic body.
    svg.append(svgEl('line',{...attrs,stroke:s<=2?`url(#${prefix}Wound)`:'#aebbc3','stroke-width':g+1.15,'stroke-linecap':'round'}));
    svg.append(svgEl('line',{...attrs,stroke:s<=2?'#dce8ed':'#f0f8fb','stroke-width':Math.max(.72,g*.30),opacity:s<=2?.56:.82,'stroke-linecap':'round'}));
    // Razor specular reflection on the crown.
    const hi=isP?{...attrs,x1:p-.55,x2:p-.55}:{...attrs,y1:p-.55,y2:p-.55};
    svg.append(svgEl('line',{...hi,stroke:'#fff','stroke-width':.42,opacity:.9,'stroke-linecap':'round'}));
  }


  // V7 FRETBOARD CORE — one structural/visual neck renderer for Practice, Map and Quiz.
  // Modes only add their own overlays, notes and interactions on top of this shared core.
  function renderFretboardCore(svg,{prefix,maxFret,onSurface,fretOffset=0}={}){
    const isP=portrait(),W=isP?520:1500,H=isP?1500:430;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
    const fretStart=isP?110:90,fretEnd=isP?H-70:W-40,stringStart=isP?85:70,stringEnd=isP?W-55:H-48;
    const fretPos=f=>fretStart+(fretEnd-fretStart)*(f/maxFret);
    const stringPos=s=>stringStart+(stringEnd-stringStart)*(s/5);
    const visualStringPos=s=>stringPos(isP?s:5-s);
    premiumSurface(svg,isP,W,H,prefix);
    if(onSurface)onSurface({svg,isP,W,H,fretStart,fretEnd,stringStart,stringEnd,fretPos,stringPos,visualStringPos,maxFret});
    for(let f=0;f<=maxFret;f++){
      const p=fretPos(f),isNut=f===0&&fretOffset===0;premiumFret(svg,isP,p,W,H,isNut,prefix);
      const actualFret=fretOffset===0?f:(fretOffset+f-1);
      if(fretOffset===0?(f===0||[3,5,7,9,12,15,17,19,21].includes(f)):(f>0&&[3,5,7,9,12,15,17,19,21].includes(actualFret))){
        const lp=fretOffset===0&&f===0?fretPos(0):(fretPos(Math.max(0,f-1))+fretPos(f))/2;
        svg.append(svgEl('text',isP?{x:18,y:lp+5,fill:'#8fa2b0','font-size':14,'font-weight':800,'text-anchor':'middle'}:{x:lp,y:H-14,fill:'#8fa2b0','font-size':14,'font-weight':800,'text-anchor':'middle'},String(actualFret)));
      }
    }
    // Standard markers: singles are centred between D/G. At fret 12, the two markers
    // are centred in the neighbouring string lanes: A/D and G/B.
    const centerBetween=(a,b)=>(visualStringPos(a)+visualStringPos(b))/2;
    const singleInlayCenter=centerBetween(2,3);
    const drawInlay=(f,cross)=>{
      const p=(fretPos(f-1)+fretPos(f))/2;
      const base=isP?{cx:cross,cy:p}:{cx:p,cy:cross};
      svg.append(svgEl('circle',{...base,r:9.1,fill:'#090c0f',opacity:.58,filter:`url(#${prefix}InlayShadow)`}));
      svg.append(svgEl('circle',{...base,r:7.8,fill:`url(#${prefix}Inlay)`,stroke:'#8c969d','stroke-width':.8,opacity:.88}));
      svg.append(svgEl('circle',{...base,r:5.55,fill:'none',stroke:'#20262b','stroke-width':.9,opacity:.64}));
      const highlight=isP?{cx:cross-1.8,cy:p-1.9}:{cx:p-1.8,cy:cross-1.9};
      svg.append(svgEl('circle',{...highlight,r:1.25,fill:'#dce2e6',opacity:.42}));
    };
    [3,5,7,9,12,15,17,19,21].filter(actual=>actual>=fretOffset&&actual<=(fretOffset===0?maxFret:fretOffset+maxFret-1)).forEach(actual=>{
      const f=fretOffset===0?actual:(actual-fretOffset+1);
      if(actual===12){
        drawInlay(f,centerBetween(1,2)); // G/B
        drawInlay(f,centerBetween(3,4)); // D/A
      }else drawInlay(f,singleInlayCenter);
    });
    tuning.forEach((st,s)=>{
      const p=visualStringPos(s);premiumString(svg,isP,p,fretStart,fretEnd,s,prefix);
      svg.append(svgEl('text',isP?{x:p,y:35,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'}:{x:24,y:p+6,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'},st.name));
    });
    return {svg,isP,W,H,fretStart,fretEnd,stringStart,stringEnd,fretPos,stringPos,visualStringPos,maxFret};
  }

  function patternWindows(){
    // Five standard pentatonic boxes, expressed as the inclusive fret span used by the notes.
    // Example: G minor => Pattern 1 spans frets 3–6, Pattern 2 5–8, Pattern 3 7–10,
    // Pattern 4 10–13 and Pattern 5 12–15. This matches the usual guitar scale diagrams.
    // Major keeps the same physical five-box system by anchoring to its relative minor.
    const anchorQuality=state.quality==='minor'?rootPC():mod(rootPC()-3);
    const lowE=7;
    const r=mod(anchorQuality-lowE); // anchor/root fret on the low E string within the first octave
    const offsets=[[0,3],[2,5],[4,7],[7,10],[9,12]];
    const out=[];
    for(const [idx,o] of offsets.entries()){
      for(const shift of [-12,0,12,24]){
        const minFret=r+o[0]+shift, maxFret=r+o[1]+shift;
        // Do not invent a truncated shape before the nut. Right-edge partial repeats are useful up to fret 24.
        if(minFret<0 || minFret>21 || maxFret<0) continue;
        out.push({id:idx+1,minFret,maxFret:Math.min(21,maxFret)});
      }
    }
    return out;
  }

  const TRIAD_SETS={EAD:[0,1,2],ADG:[1,2,3],DGB:[2,3,4],GBE:[3,4,5]};
  function triadShapes(){
    const wanted=state.triadStrings==='all'?Object.entries(TRIAD_SETS):[[state.triadStrings,TRIAD_SETS[state.triadStrings]||TRIAD_SETS.GBE]];
    const pcs=[rootPC(),thirdPC(),fifthPC()],labels=['root','third','fifth'],shapes=[];
    wanted.forEach(([setName,strings])=>{
      const candidates=strings.map(si=>{const arr=[];for(let f=0;f<=state.maxFret;f++){const pc=noteAt(si,f),di=pcs.indexOf(pc);if(di>=0)arr.push({string:si,fret:f,pc,degree:labels[di],midi:tuning[si].midi+f})}return arr});
      for(const a of candidates[0])for(const b of candidates[1])for(const c of candidates[2]){
        const combo=[a,b,c],degrees=new Set(combo.map(x=>x.degree));if(degrees.size<3)continue;
        const frets=combo.map(x=>x.fret),span=Math.max(...frets)-Math.min(...frets);if(span>4)continue;
        const midis=combo.map(x=>x.midi).sort((x,y)=>x-y);if(midis[2]-midis[0]>12)continue; // close voicing: within one octave
        const lowest=[...combo].sort((x,y)=>x.midi-y.midi)[0].degree;
        shapes.push({notes:combo,stringSet:setName,min:Math.min(...frets),max:Math.max(...frets),inversion:lowest==='root'?'Root position':lowest==='third'?'1st inversion':'2nd inversion'});
      }
    });
    const seen=new Set();return shapes.filter(sh=>{const k=sh.notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.min-b.min||a.max-b.max);
  }

  // CAGED templates are the five familiar open chord forms expressed as movable shapes.
  // Each entry is [stringIndex, fretRelativeToShapeBase, degree]. Minor flattens every 3rd by one fret.
  const CAGED={
    C:[[1,3,'root'],[2,2,'third'],[3,0,'fifth'],[4,1,'root'],[5,0,'third']],
    A:[[1,0,'root'],[2,2,'fifth'],[3,2,'root'],[4,2,'third'],[5,0,'fifth']],
    G:[[0,3,'root'],[1,2,'third'],[2,0,'fifth'],[3,0,'root'],[4,0,'third'],[5,3,'root']],
    E:[[0,0,'root'],[1,2,'fifth'],[2,2,'root'],[3,1,'third'],[4,0,'fifth'],[5,0,'root']],
    D:[[2,0,'root'],[3,2,'fifth'],[4,3,'root'],[5,2,'third']]
  };
  const CAGED_ANCHOR={C:[1,3],A:[1,0],G:[0,3],E:[0,0],D:[2,0]};
  function cagedShapes(){
    const wanted=state.chordShape==='all'?['C','A','G','E','D']:[state.chordShape];
    const shapes=[];
    wanted.forEach(shape=>{
      const template=CAGED[shape],anchor=CAGED_ANCHOR[shape];if(!template)return;
      for(let base=-4;base<=state.maxFret;base++){
        const anchorFret=base+anchor[1];if(anchorFret<0||anchorFret>state.maxFret||noteAt(anchor[0],anchorFret)!==rootPC())continue;
        const notes=[];let valid=true;
        for(const [string,rel,degree] of template){
          const fret=base+rel+(state.quality==='minor'&&degree==='third'?-1:0);
          if(fret<0||fret>state.maxFret){valid=false;break}
          const pc=noteAt(string,fret),expected=degree==='root'?rootPC():degree==='third'?thirdPC():fifthPC();
          if(pc!==expected){valid=false;break}
          notes.push({string,fret,pc,degree,midi:tuning[string].midi+fret});
        }
        if(valid)shapes.push({shape,notes,min:Math.min(...notes.map(n=>n.fret)),max:Math.max(...notes.map(n=>n.fret))});
      }
    });
    const seen=new Set();return shapes.filter(sh=>{const k=sh.shape+'|'+sh.notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.min-b.min||'CAGED'.indexOf(a.shape)-'CAGED'.indexOf(b.shape));
  }

  function selectedPracticeShapes(){return state.mode==='triad'?triadShapes():state.mode==='chord'?cagedShapes():[]}
  function selectedNoteKeys(shapes){const keys=new Set();shapes.forEach(sh=>sh.notes.forEach(n=>keys.add(n.string+':'+n.fret)));return keys}
  function renderContextControls(){
    const label=$('#practicePositionLabel'),wrap=$('#practicePositionButtons');if(!label||!wrap)return;
    let values,current;
    if(state.mode==='penta'){label.textContent='POSITIONS';values=['all','1','2','3','4','5'];current=state.pattern}
    else if(state.mode==='triad'){label.textContent='STRINGS';values=['all','EAD','ADG','DGB','GBE'];current=state.triadStrings}
    else{label.textContent='SHAPE';values=['all','C','A','G','E','D'];current=state.chordShape}
    wrap.innerHTML='';values.forEach(v=>{const b=document.createElement('button');b.type='button';b.dataset.value=v;b.textContent=v==='all'?'ALL':v;b.classList.toggle('active',v===current);wrap.appendChild(b)});
  }

  function renderPractice(){
    requestAnimationFrame(refreshAllSelects);
    const title=state.root+' '+state.quality.toUpperCase()+' '+(state.mode==='penta'?'PENTATONIC':state.mode==='triad'?'TRIADS':'CAGED CHORDS');
    $('#practiceTitle').textContent=title;
    $('#practiceFormula').textContent=state.mode==='penta'?formula():`${state.root} • ${noteName(thirdPC())} • ${noteName(fifthPC())}`;
    $$('#fretCountControls button').forEach(b=>b.classList.toggle('active',Number(b.dataset.frets)===state.maxFret));
    renderContextControls();updatePracticeLegend();updateDegreeFilterUI();
    const shapes=selectedPracticeShapes();
    if(state.mode==='penta')$('#practiceHint').textContent='All 5 connected positions are visible. Select one to isolate it.';
    else if(state.mode==='triad')$('#practiceHint').textContent=state.triadStrings==='all'?'All close-voicing triads across EAD, ADG, DGB and GBE.':'All root, 1st and 2nd inversion triads on '+state.triadStrings+'.';
    else $('#practiceHint').textContent=state.chordShape==='all'?'All five CAGED chord shapes across the fretboard.':'CAGED '+state.chordShape+' shape across the fretboard.';
    renderFretboard($('#practiceFretboard'),{interactive:false,mode:state.mode,visibleKeys:selectedNoteKeys(shapes),shapes});
  }

  function renderFretboard(svg,opt){
    const maxFret=Math.min(21,state.maxFret);
    const core=renderFretboardCore(svg,{prefix:'practice',maxFret,onSurface:({isP,W,H,fretPos})=>{
      if(opt.mode!=='penta')return;
      const colors=['#ff3ec9','#35e78f','#ff5366','#ffd53c','#27d7ff'];
      patternWindows().forEach(w=>{if(w.minFret>maxFret)return;if(state.pattern!=='all'&&String(w.id)!==String(state.pattern))return;const visibleMax=Math.min(w.maxFret,maxFret),a=fretPos(Math.max(0,w.minFret-1)),b=fretPos(visibleMax);const attrs=isP?{x:45,y:a,width:W-90,height:Math.max(8,b-a),fill:colors[w.id-1]+'15',stroke:colors[w.id-1], 'stroke-width':2,rx:12}:{x:a,y:32,width:Math.max(8,b-a),height:H-62,fill:colors[w.id-1]+'15',stroke:colors[w.id-1],'stroke-width':2,rx:12};svg.append(svgEl('rect',attrs));const tx=isP?W-10:a+8,ty=isP?a+20:52;svg.append(svgEl('text',{x:tx,y:ty,fill:colors[w.id-1],'font-size':14,'font-weight':900,'text-anchor':isP?'end':'start'},`P${w.id}`))})
    }});
    const {isP,fretPos,visualStringPos}=core;
    const activeSet=opt.mode==='penta'?new Set(pentaPCs()):new Set([rootPC(),thirdPC(),fifthPC()]);
    const visibleKeys=opt.visibleKeys||null;
    for(let s=0;s<6;s++)for(let f=0;f<=maxFret;f++){
      const pc=noteAt(s,f);if(!activeSet.has(pc))continue;if(opt.mode==='penta'&&state.pattern!=='all'&&!patternWindows().some(w=>String(w.id)===String(state.pattern)&&f>=w.minFret&&f<=Math.min(w.maxFret,maxFret)))continue;
      const centerF=f===0?fretPos(0)-15:(fretPos(f-1)+fretPos(f))/2;const centerS=visualStringPos(s);const x=isP?centerS:centerF,y=isP?centerF:centerS;
      const d=degreeFor(pc);if(!d)continue;if(state.degreeFilter!=='all'&&d!==state.degreeFilter)continue;
      if(opt.mode!=='penta'&&visibleKeys&&!visibleKeys.has(s+':'+f))continue;
      let col=d==='root'?'#27d7ff':d==='third'?'#ff3ec9':d==='fourth'?'#ff8b3d':d==='fifth'?'#ffd53c':d==='seventh'?'#62ef75':'#91a3b1';
      const g=svgEl('g',{opacity:1});const c=svgEl('circle',{cx:x,cy:y,r:isP?20:13,fill:col,stroke:'#ffffffb0','stroke-width':1.6,filter:'url(#glow)','data-string':s,'data-fret':f});g.append(c);g.append(svgEl('text',{x,y:isP?y:y+4,fill:d==='fifth'?'#3c2b00':'#06131b','font-size':isP?20:(noteName(pc).length>1?8.5:10.5),'font-weight':1000,'text-anchor':'middle','dominant-baseline':isP?'middle':'auto','pointer-events':'none'},degreeLabel(pc)));svg.append(g)
    }
  }

  const QUIZ_WINDOWS={
    1:[{range:[0,6],w:6},{range:[3,9],w:4},{range:[5,11],w:1}],
    2:[{range:[0,6],w:2},{range:[3,9],w:5},{range:[5,11],w:4},{range:[8,14],w:1}],
    3:[{range:[3,9],w:2},{range:[5,11],w:5},{range:[8,14],w:4},{range:[11,17],w:1}],
    4:[{range:[5,11],w:1},{range:[8,14],w:5},{range:[11,17],w:4},{range:[15,21],w:1}],
    5:[{range:[5,11],w:1},{range:[8,14],w:2},{range:[11,17],w:5},{range:[15,21],w:5}]
  };
  const QUIZ_MULTIPLIERS={1:1,2:1.15,3:1.30,4:1.50,5:1.75};
  const QUIZ_RANKS=[
    [14000,'🏆','VIRTUOSO','Perfect control of the neck.'],[13250,'👑','GUITAR HERO','Legendary fretboard control.'],[12600,'⭐','ROCKSTAR','Fast, accurate and stage-ready.'],
    [12000,'⚡','SHREDDER','The neck is starting to fear you.'],[11400,'🔥','SOLO MASTER','Strong fretboard instincts.'],[10900,'💀','RIFF LORD','You command the riffs.'],
    [10400,'🤘','HEADLINER','Ready for the big stage.'],[9900,'🎵','LEAD GUITARIST','Solid lead-player territory.'],[9400,'🔥','AXE SLINGER','You know how to handle that axe.'],
    [8900,'🎸','GIG PLAYER','Good enough to survive the set.'],[8400,'🎶','JAMMER','You can find your way through a jam.'],[7900,'🔊','AMPLIFIED','Getting louder. Getting sharper.'],
    [7400,'🎼','PLAYER','A solid base is taking shape.'],[6900,'🎧','PRACTICER','The repetitions are paying off.'],[6400,'🌱','ROOKIE','The journey has officially begun.'],
    [5900,'🎸','BEGINNER','You found the guitar. Now find the notes.'],[5400,'🎵','CHORD CHASER','Always one fret behind the chord.'],[4900,'🧭','FRET EXPLORER','Boldly exploring unknown frets.'],
    [4400,'🐣','NEWBIE','Fresh strings. Fresh mistakes.'],[3900,'📖','STUDENT','Homework: learn the neck.'],[3400,'🧠','NOTE HUNTER','The notes are hiding. Keep hunting.'],
    [3000,'🐌','SLOW HAND','Slow is smooth. Eventually.'],[2600,'😵','FRET LOST','Somewhere between fret 1 and 21.'],[2200,'🗺️','NECK TOURIST','Nice neck. First time here?'],
    [1800,'🙈','FRET GUESSER','Confidence: high. Accuracy: adventurous.'],[1300,'🛠️','KEEP PRACTICING','Every answer builds the map in your head.'],[800,'😬','NEEDS A TUNER','The guitar might be fine. We should still check.'],
    [0,'💀','AIR GUITARIST','At least air guitar has no wrong frets.']
  ];
  function pickQuizWindow(multiplier){
    const choices=QUIZ_WINDOWS[multiplier]||QUIZ_WINDOWS[1],total=choices.reduce((n,x)=>n+x.w,0);let r=Math.random()*total;
    for(const x of choices){r-=x.w;if(r<=0)return x.range.slice()}return choices[0].range.slice();
  }
  function quizBasePoints(seconds){if(seconds<=5)return 1000;if(seconds<=7.5)return 900;if(seconds<=10)return 800;if(seconds<=15)return 650;if(seconds<=20)return 500;if(seconds<=30)return 350;return 250}
  function quizRank(score,errors=0){
    let row=QUIZ_RANKS.find(r=>score>=r[0])||QUIZ_RANKS[QUIZ_RANKS.length-1];
    if(row[2]==='VIRTUOSO'&&errors>0)row=QUIZ_RANKS[1];
    return{emoji:row[1],rank:row[2],copy:row[3],min:row[0]};
  }
  function startQuiz(){
    if(state.quiz?.timer)clearInterval(state.quiz.timer);
    state.quiz={round:0,attempts:0,errors:0,correct:0,multiplier:1,score:0,current:null,locked:false,questionStarted:0,timer:null,lastRank:null};
    state.quizReveal=null;$('#resultModal').classList.remove('show');$('#resultModal').setAttribute('aria-hidden','true');nextQuestion();
  }
  function randomQuestion(){const root=NOTES[Math.floor(Math.random()*NOTES.length)],quality=Math.random()<.5?'major':'minor',targets=['root','third','fifth'],target=targets[Math.floor(Math.random()*targets.length)];return{root,quality,target}}
  function targetPC(q){const r=PC[q.root];return q.target==='root'?r:q.target==='third'?mod(r+intervals[q.quality].third):mod(r+7)}
  function nextQuestion(){
    const qz=state.quiz;if(qz.timer){clearInterval(qz.timer);qz.timer=null}if(qz.round>=10){finishQuiz();return}
    qz.round++;qz.current=randomQuestion();qz.current.window=pickQuizWindow(qz.multiplier);qz.locked=false;qz.questionStarted=performance.now();
    $('#roundNum').textContent=qz.round;$('#quizChord').textContent=`${qz.current.root} ${qz.current.quality.toUpperCase()}`;
    const lab=qz.current.target==='root'?'ROOT':qz.current.target==='third'?(qz.current.quality==='minor'?'♭3rd':'3rd'):'5th';
    $('#quizPrompt').innerHTML=`Find the <strong>${lab}</strong>`;$('#quizFeedback').textContent=`Frets ${qz.current.window[0]}–${qz.current.window[1]} • Touch any correct occurrence.`;
    updateQuizStats();updateQuizTimer();qz.timer=setInterval(updateQuizTimer,100);renderQuizBoard();
  }
  function updateQuizTimer(){if(!state.quiz||state.quiz.locked)return;const sec=(performance.now()-state.quiz.questionStarted)/1000;const n=$('#quizTime');if(n)n.textContent=sec.toFixed(1)}
  function animateHud(el,cls,duration=650){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),duration)}
  function animateScore(el,from,to){if(!el){return}const start=performance.now(),duration=460;function tick(now){const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3),v=Math.round(from+(to-from)*ease);el.textContent=v.toLocaleString('en-US');if(t<1)requestAnimationFrame(tick)}requestAnimationFrame(tick)}
  function quizRankProgress(score,errors=0){if(score<=0)return 0;const current=quizRank(score,errors);const idx=QUIZ_RANKS.findIndex(r=>r[2]===current.rank);if(idx<=0)return 100;const next=QUIZ_RANKS[idx-1][0],floor=current.min;return Math.max(0,Math.min(100,((score-floor)/(next-floor))*100))}
  function updateQuizStats({scoreGain=0,rankChanged=false,multiplierChanged=false,previousScore=null,error=false}={}){
    if(!state.quiz)return;const qz=state.quiz;
    const score=$('#scoreCount'),combo=$('#comboCount'),rank=$('#liveRank'),h=$('#quizAttempts'),meter=$('#rankProgress'),hud=$('.quiz-hud');
    if(score){if(scoreGain&&previousScore!==null)animateScore(score,previousScore,qz.score);else score.textContent=qz.score.toLocaleString('en-US')}if(combo)combo.textContent=qz.multiplier;if(h)h.textContent=`${qz.attempts} ATTEMPTS`;
    const r=qz.score>0?quizRank(qz.score,qz.errors):null;if(rank)rank.textContent=r?`${r.emoji} ${r.rank}`:'—';if(meter)meter.style.width=`${quizRankProgress(qz.score,qz.errors)}%`;
    if(scoreGain){const gain=$('#scoreGain');if(gain){gain.textContent=`+${scoreGain.toLocaleString('en-US')}`;animateHud(gain,'hud-gain-pop',720)}animateHud(score,'hud-score-pop',520)}
    if(multiplierChanged){animateHud($('#comboWrap'),error?'hud-combo-break':'hud-flip',620);animateHud($('.hud-combo'),error?'hud-cell-break':'hud-cell-charge',620)}
    if(rankChanged){animateHud($('.hud-rank'),'hud-rank-card-up',900);animateHud(rank,'hud-rank-up',900);animateHud(hud,'hud-rank-flash',900)}
    if(qz.multiplier>=5)hud?.classList.add('hud-on-fire');else hud?.classList.remove('hud-on-fire');
  }
  function renderQuizBoard(){const svg=$('#quizFretboard');const q=state.quiz?.current;if(!q)return;const prev={root:state.root,quality:state.quality};state.root=q.root;state.quality=q.quality;renderFretboardQuiz(svg,q);state.root=prev.root;state.quality=prev.quality}
  function renderFretboardQuiz(svg,q){
    const [startFret,endFret]=q.window||[0,6],hasOpen=startFret===0,localMax=hasOpen?endFret:(endFret-startFret+1);
    const {isP,fretPos,visualStringPos}=renderFretboardCore(svg,{prefix:'quiz',maxFret:localMax,fretOffset:startFret});
    const defs=svg.querySelector('defs');const glow=svgEl('filter',{id:'qglow',x:'-50%',y:'-50%',width:'200%',height:'200%'});glow.append(svgEl('feGaussianBlur',{stdDeviation:'6',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}),svgEl('feMergeNode',{in:'SourceGraphic'}));glow.append(merge);defs?.append(glow);
    const tpc=targetPC(q);
    const centerForFret=f=>{if(hasOpen&&f===0)return fretPos(0)-15;const local=hasOpen?f:(f-startFret+1);return(fretPos(local-1)+fretPos(local))/2};
    for(let s=0;s<6;s++)for(let f=startFret;f<=endFret;f++){
      const centerF=centerForFret(f),centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS;
      const hit=svgEl('circle',{cx:x,cy:y,r:isP?23:17,fill:'transparent',stroke:'transparent','data-string':s,'data-fret':f,style:'cursor:pointer'});svg.append(hit);
      if(state.quizReveal&&noteAt(s,f)===state.quizReveal){svg.append(svgEl('circle',{cx:x,cy:y,r:isP?20:11,fill:'#27d7ff',stroke:'#fff','stroke-width':1.5,filter:'url(#qglow)'}));svg.append(svgEl('text',{x,y:isP?y:y+4,fill:'#06131b','font-size':isP?20:10,'font-weight':1000,'text-anchor':'middle','dominant-baseline':isP?'middle':'auto'},noteName(tpc)))}
    }
    svg.onclick=e=>{const c=e.target.closest('circle[data-string]');if(!c||state.quiz.locked)return;answerQuiz(+c.dataset.string,+c.dataset.fret,c)};
  }
  function answerQuiz(s,f,node){
    const qz=state.quiz,q=qz.current,pc=noteAt(s,f);qz.attempts++;
    if(pc===targetPC(q)){
      qz.correct++;qz.locked=true;if(qz.timer){clearInterval(qz.timer);qz.timer=null}const seconds=(performance.now()-qz.questionStarted)/1000;$('#quizTime').textContent=seconds.toFixed(1);
      const oldRank=qz.score>0?quizRank(qz.score,qz.errors).rank:null,usedMultiplier=qz.multiplier,base=quizBasePoints(seconds),gain=Math.round(base*QUIZ_MULTIPLIERS[usedMultiplier]),previousScore=qz.score;qz.score+=gain;
      const oldMultiplier=qz.multiplier;qz.multiplier=Math.min(5,qz.multiplier+1);const newRank=quizRank(qz.score,qz.errors).rank;
      state.quizReveal=pc;$('#quizFeedback').textContent=`Correct — ${noteName(pc)} • +${gain.toLocaleString('en-US')} pts`;
      renderQuizBoard();updateQuizStats({scoreGain:gain,rankChanged:newRank!==oldRank,multiplierChanged:qz.multiplier!==oldMultiplier,previousScore});
      setTimeout(()=>{state.quizReveal=null;nextQuestion()},950);
    }else{
      qz.errors++;const changed=qz.multiplier!==1;qz.multiplier=1;node.setAttribute('fill','#ff4d62');node.setAttribute('stroke','#ff8897');node.setAttribute('filter','url(#qglow)');$('#quizFeedback').textContent='Not this one — try again.';updateQuizStats({multiplierChanged:changed,error:true});
      setTimeout(()=>{if(node.isConnected){node.setAttribute('fill','transparent');node.setAttribute('stroke','transparent');node.removeAttribute('filter')}},280);
    }
  }
  function finishQuiz(){
    const qz=state.quiz;if(qz.timer){clearInterval(qz.timer);qz.timer=null}const {emoji,rank,copy}=quizRank(qz.score,qz.errors);
    $('#resultRank').textContent=`${emoji} ${rank}`;$('#resultAttempts').textContent=qz.score.toLocaleString('en-US');
    const accuracy=qz.attempts?Math.round((qz.correct/qz.attempts)*100):100;$('#resultCopy').textContent=`${copy} ${accuracy}% accuracy • ${qz.errors} ${qz.errors===1?'mistake':'mistakes'}.`;
    $('#resultModal').classList.add('show');$('#resultModal').setAttribute('aria-hidden','false');
  }
  $('#replayQuiz').addEventListener('click',startQuiz);
  $('#shareScore').addEventListener('click',async()=>{const qz=state.quiz||{score:0,errors:0},{emoji,rank}=quizRank(qz.score,qz.errors);const text=`${emoji} I reached ${rank} with ${qz.score.toLocaleString('en-US')} points on Guitar Fretboard Hero 🎸\nWhat's your rank?`,url='https://guitar-fretboard-hero.seignemorte.com';try{if(navigator.share)await navigator.share({title:'Guitar Fretboard Hero',text,url});else{await navigator.clipboard.writeText(`${text}\n${url}`);const shareLabel=$('#shareScore span');if(shareLabel){shareLabel.textContent='COPIED!';setTimeout(()=>shareLabel.textContent='SHARE MY SCORE',1400)}}}catch{}});

  renderPractice();
})();
