(() => {
  'use strict';
  const {NOTES,PC,INTERVALS:intervals,mod,noteName}=MusicTheory;
  const product=window.FRETBOARD_ACTIVE_PRODUCT;
  if(!product) throw new Error('No active Fretboard Hero product was configured');
  const instrument=FRETBOARD_INSTRUMENTS[product.instrument];
  if(!instrument) throw new Error(`Missing instrument profile: ${product.instrument}`);
  const engine=FretboardEngine.createInstrumentEngine(instrument);
  const tuning=engine.tuning,STRING_COUNT=engine.stringCount;
  const defaultFretCount=()=>window.innerWidth<=800?12:((navigator.maxTouchPoints||0)>1&&window.innerWidth<=1366?15:21);
  const firstMode=ModeRegistry.list(instrument)[0]?.id||'';
  const state={screen:'home',mode:firstMode,root:'A',quality:'minor',pattern:ModeRegistry.context(instrument,'penta')?.defaultValue||'all',triadStrings:instrument.defaultTriadSet||ModeRegistry.context(instrument,'triad')?.defaultValue||'all',chordShape:ModeRegistry.context(instrument,'chord')?.defaultValue||'all',arpeggioType:ModeRegistry.context(instrument,'arpeggio')?.defaultValue||'triad',maxFret:defaultFretCount(),fretManual:false,degreeFilter:'all',mapMaxFret:defaultFretCount(),mapFretManual:false,mapNote:'all',quiz:null,quizReveal:null,circleKey:0,circleMaxFret:15};
  const modeKind=()=>ModeRegistry.kind(instrument,state.mode);
  const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
  const rootPC=()=>PC[state.root];
  const thirdPC=()=>mod(rootPC()+intervals[state.quality].third);
  const fifthPC=()=>mod(rootPC()+7);
  function go(screen){state.screen=screen;$$('.screen').forEach(x=>x.classList.remove('active'));$('#'+screen).classList.add('active');if(screen==='practice') renderPractice();if(screen==='fretmap') renderFretboardMap();if(screen==='circle') renderCircle();if(screen==='quiz') prepareQuiz();}
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.go)));
  // Shared controls live in core/controls.js.
  ['practice','map'].forEach(name=>FretboardControls.bindDrawer({name}));

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

  // Build instrument-dependent controls from the active profile.
  const modeHost=$('#modeControls');if(modeHost){modeHost.innerHTML='';ModeRegistry.list(instrument).forEach((m,i)=>{const b=document.createElement('button');b.type='button';b.dataset.mode=m.id;b.textContent=m.label;b.classList.toggle('active',m.id===state.mode||(i===0&&!instrument.modes[state.mode]));modeHost.appendChild(b)});if(!instrument.modes[state.mode])state.mode=ModeRegistry.list(instrument)[0]?.id||'';}
  const fretHost=$('#fretCountControls .control-options');if(fretHost){fretHost.innerHTML='';engine.fretOptions.forEach(f=>{const b=document.createElement('button');b.type='button';b.dataset.frets=String(f);b.textContent=`${f} FT`;fretHost.appendChild(b)});}
  state.triadStrings=instrument.defaultTriadSet||state.triadStrings;
  NOTES.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.dataset.root=n;if(n==='A')b.classList.add('active');$('#rootControls').appendChild(b)});
  $('#rootControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.root=b.dataset.root;$$('#rootControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#modeControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.mode=b.dataset.mode;const key=ModeRegistry.stateKey(instrument,state.mode),ctx=ModeRegistry.context(instrument,state.mode);state[key]=(key==='triadStrings'?instrument.defaultTriadSet:null)||ctx?.defaultValue||ctx?.values?.[0]||'all';$$('#modeControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#qualityControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.quality=b.dataset.quality;$$('#qualityControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#fretCountControls').addEventListener('click',e=>{const b=e.target.closest('button[data-frets]');if(!b)return;state.maxFret=Number(b.dataset.frets);state.fretManual=true;renderPractice()});
  $('#practicePositionButtons').addEventListener('click',e=>{const b=e.target.closest('button[data-value]');if(!b)return;state[ModeRegistry.stateKey(instrument,state.mode)]=b.dataset.value;renderPractice()});
  let resizeRenderFrame=0;
  window.addEventListener('resize',()=>{
    if(resizeRenderFrame)return;
    resizeRenderFrame=requestAnimationFrame(()=>{
      resizeRenderFrame=0;
      if(!state.fretManual)state.maxFret=defaultFretCount();
      if(!state.mapFretManual)state.mapMaxFret=defaultFretCount();
      if(state.screen==='practice')renderPractice();
      if(state.screen==='fretmap')renderFretboardMap();
      if(state.screen==='circle')renderCircle();
      if(state.screen==='quiz')renderQuizBoard();
    });
  });

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
  function renderFretboardMap(){
    requestAnimationFrame(refreshAllSelects);
    const svg=$('#mapFretboard');if(!svg)return;
    const maxFret=Math.min(engine.maxFret,state.mapMaxFret);
    $$('#mapFretControls button[data-map-frets]').forEach(b=>b.classList.toggle('active',Number(b.dataset.mapFrets)===maxFret));
    $$('#mapNoteControls button[data-map-note]').forEach(b=>{const on=b.dataset.mapNote===state.mapNote;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    FretboardMap.render({svg,engine,maxFret,selectedNote:state.mapNote,renderCore:renderFretboardCore,svgEl,noteName});
  }

  function renderCircle(){
    const wheel=$('#circleWheel');if(!wheel)return;
    const key=CircleOfFifths.getKey(state.circleKey);
    CircleRenderer.render({svg:wheel,selected:state.circleKey,onSelect:index=>{state.circleKey=index;renderCircle()}});
    $('#circleKeyTitle').textContent=`${key.name} MAJOR`;
    $('#circleRelative').textContent=`Relative minor • ${key.minor}`;
    $('#circleSignature').textContent=key.accidentals;
    $('#circleScale').innerHTML=key.scale.map((n,i)=>`<span${i===0?' class="root"':''}>${n}</span>`).join('');
    $('#circleChords').innerHTML=key.chords.map(c=>`<div><small>${c.degree}</small><strong>${c.name}</strong></div>`).join('');
    $('#circleProgressions').innerHTML=key.progressions.map(p=>`<div>${p.map(d=>`<span>${d}</span>`).join('<b>→</b>')}</div>`).join('');
    $('#circleFretboardTitle').textContent=`${key.name} MAJOR ON THE FRETBOARD`;
    renderCircleFretboard(key);
  }
  function renderCircleFretboard(key){
    const svg=$('#circleFretboard');if(!svg)return;
    const maxFret=Math.min(engine.maxFret,state.circleMaxFret);
    const core=renderFretboardCore(svg,{prefix:'circle',maxFret});
    const {isP,fretPos,visualStringPos}=core,pcs=new Set(key.scalePCs);
    const palette=['#27d7ff','#5cffb2','#ff3ec9','#ff9d3f','#ffd14f','#9b6cff','#35d1b0'];
    for(let string=0;string<STRING_COUNT;string++)for(let fret=0;fret<=maxFret;fret++){
      const pc=engine.noteAt(string,fret),degree=key.scalePCs.indexOf(pc);if(!pcs.has(pc)||degree<0)continue;
      const centerF=fret===0?fretPos(0)-17:(fretPos(fret-1)+fretPos(fret))/2,centerS=visualStringPos(string),x=isP?centerS:centerF,y=isP?centerF:centerS;
      const root=degree===0,col=palette[degree];
      svg.append(svgEl('circle',{cx:x,cy:y,r:isP?20:13,fill:root?'#f8fbff':'#0a1118',stroke:col,'stroke-width':root?4:2.4}));
      svg.append(svgEl('text',{x,y,fill:root?'#071016':col,'font-size':isP?18:10,'font-weight':1000,'text-anchor':'middle','dominant-baseline':'middle'},key.scale[degree]));
    }
  }


  const noteAt=(stringIndex,fret)=>engine.noteAt(stringIndex,fret);
  function degreeFor(pc){const diff=mod(pc-rootPC());if(diff===0)return 'root';if(pc===thirdPC())return 'third';if(diff===2)return 'second';if(diff===5)return 'fourth';if(diff===7)return 'fifth';if(diff===9)return 'sixth';if(diff===10||diff===11)return 'seventh';return null}
  function pentaPCs(){return intervals[state.quality].penta.map(i=>mod(rootPC()+i))}
  function formula(){const ints=state.quality==='minor'?['1','♭3','4','5','♭7']:['1','2','3','5','6'];return pentaPCs().map(noteName).join(' • ')+'   '+ints.join(' • ')}
  function updatePracticeLegend(){
    const fourth=$('#legendFourth'),seventh=$('#legendSeventh');
    if(!fourth||!seventh)return;
    const showFourth=modeKind()==='pentatonic'&&state.quality==='minor';
    const showSeventh=modeKind()==='pentatonic'&&state.quality==='minor';
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
    const gaugeMax=4.15,gaugeMin=1.15,g=gaugeMax-(gaugeMax-gaugeMin)*(s/Math.max(1,STRING_COUNT-1));
    const attrs=isP?{x1:p,x2:p,y1:start,y2:end}:{x1:start,x2:end,y1:p,y2:p};
    const far=isP?{...attrs,x1:p+4.6,x2:p+4.6}:{...attrs,y1:p+4.6,y2:p+4.6};
    const near=isP?{...attrs,x1:p+2.2,x2:p+2.2}:{...attrs,y1:p+2.2,y2:p+2.2};
    // Contact shadows create the visual gap between string and fretboard.
    svg.append(svgEl('line',{...far,stroke:'#000','stroke-width':g+5.5,opacity:.24,filter:`url(#${prefix}StringShadow)`}));
    svg.append(svgEl('line',{...near,stroke:'#000','stroke-width':g+2.4,opacity:.52}));
    // Metallic body.
    svg.append(svgEl('line',{...attrs,stroke:s<(instrument.woundStrings||0)?`url(#${prefix}Wound)`:'#aebbc3','stroke-width':g+1.15,'stroke-linecap':'round'}));
    svg.append(svgEl('line',{...attrs,stroke:s<(instrument.woundStrings||0)?'#dce8ed':'#f0f8fb','stroke-width':Math.max(.72,g*.30),opacity:s<(instrument.woundStrings||0)?.56:.82,'stroke-linecap':'round'}));
    // Razor specular reflection on the crown.
    const hi=isP?{...attrs,x1:p-.55,x2:p-.55}:{...attrs,y1:p-.55,y2:p-.55};
    svg.append(svgEl('line',{...hi,stroke:'#fff','stroke-width':.42,opacity:.9,'stroke-linecap':'round'}));
  }


  // V7 FRETBOARD CORE — one structural/visual neck renderer for Practice, Map and Quiz.
  // Modes only add their own overlays, notes and interactions on top of this shared core.
  function renderFretboardCore(svg,{prefix,maxFret,onSurface,fretOffset=0}={}){
    const layout=FretboardLayout.create({portrait:portrait(),stringCount:STRING_COUNT,maxFret});
    const {isP,W,H,fretStart,fretEnd,stringStart,stringEnd,fretPos,stringPos}=layout;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
    const visualStringPos=s=>stringPos(engine.visualStringIndex(s,isP));
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
    const middleLo=Math.max(0,Math.floor((STRING_COUNT-1)/2)),middleHi=Math.min(STRING_COUNT-1,Math.ceil((STRING_COUNT-1)/2));
    const singleInlayCenter=centerBetween(middleLo,middleHi);
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
        const upperA=Math.max(0,Math.floor((STRING_COUNT-1)*.25)),upperB=Math.min(STRING_COUNT-1,upperA+1);
        const lowerA=Math.max(0,Math.floor((STRING_COUNT-1)*.75)-1),lowerB=Math.min(STRING_COUNT-1,lowerA+1);
        drawInlay(f,centerBetween(upperA,upperB));
        drawInlay(f,centerBetween(lowerA,lowerB));
      }else drawInlay(f,singleInlayCenter);
    });
    tuning.forEach((st,s)=>{
      const p=visualStringPos(s),physicalCount=Math.max(1,st.physicalStrings||st.pairIntervals?.length||1),pairGap=physicalCount>1?5:0;
      for(let i=0;i<physicalCount;i++)premiumString(svg,isP,p+(i-(physicalCount-1)/2)*pairGap,fretStart,fretEnd,s,prefix);
      svg.append(svgEl('text',isP?{x:p,y:35,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'}:{x:24,y:p+6,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'},st.name));
    });
    return {svg,isP,W,H,fretStart,fretEnd,stringStart,stringEnd,fretPos,stringPos,visualStringPos,maxFret};
  }

  function patternWindows(){
    // Position spans are derived from the active instrument's pentatonic geometry.
    // No Guitar tuning/fret limit is assumed by the shared application shell.
    const geom=instrument.pentatonic?.stringPairs;if(!geom)return[];
    const anchor=pentaAnchorFret(),out=[];
    Object.keys(geom).map(Number).sort((a,b)=>a-b).forEach(id=>{
      const flat=geom[id].flat(),minOffset=Math.min(...flat),maxOffset=Math.max(...flat);
      for(let shift=-24;shift<=engine.maxFret+24;shift+=12){
        const minFret=anchor+minOffset+shift,maxFret=anchor+maxOffset+shift;
        if(minFret<0||minFret>engine.maxFret||maxFret<0)continue;
        out.push({id,minFret,maxFret:Math.min(engine.maxFret,maxFret)});
      }
    });
    return out;
  }

  const TRIAD_SETS=instrument.triadSets;
  function triadShapes(){return TriadEngine.findShapes({engine,rootPC:rootPC(),quality:state.quality,maxFret:state.maxFret,set:state.triadStrings})}

  function chordShapes(){
    const system=instrument.chords||instrument.caged;if(!system)return[];
    return ChordEngine.templateShapes({engine,templates:system.templates,anchors:system.anchors,order:system.order,shape:state.chordShape,rootPC:rootPC(),quality:state.quality,maxFret:state.maxFret});
  }

  function arpeggioShapes(){
    const selected=state.arpeggioType||'triad',type=selected==='7th'?(state.quality==='minor'?'min7':'maj7'):(state.quality==='minor'?'minor':'major');
    const pcs=ArpeggioEngine.pitchClasses(rootPC(),type),degreeByPc=new Map(pcs.map(pc=>[pc,degreeFor(pc)]));
    const notes=ArpeggioEngine.occurrences({engine,rootPC:rootPC(),type,maxFret:state.maxFret}).map(n=>({...n,degree:degreeByPc.get(n.pc)}));
    return [{shape:type,notes}];
  }
  function selectedPracticeShapes(){const kind=modeKind();return kind==='triads'?triadShapes():kind==='chords'?chordShapes():kind==='arpeggios'?arpeggioShapes():[]}
  function selectedNoteKeys(shapes){const keys=new Set();shapes.forEach(sh=>sh.notes.forEach(n=>keys.add(n.string+':'+n.fret)));return keys}
  function renderContextControls(){
    const label=$('#practicePositionLabel'),wrap=$('#practicePositionButtons');if(!label||!wrap)return;
    const ctx=FretboardControls.context(instrument,state.mode);if(!ctx)return;
    label.textContent=ctx.label;let current=state[ModeRegistry.stateKey(instrument,state.mode)];
    wrap.innerHTML='';ctx.values.forEach(v=>{const b=document.createElement('button');b.type='button';b.dataset.value=v;b.textContent=v==='all'?'ALL':v;b.classList.toggle('active',v===current);wrap.appendChild(b)});
  }

  function renderPractice(){
    requestAnimationFrame(refreshAllSelects);
    const title=state.root+' '+state.quality.toUpperCase();
    $('#practiceTitle').textContent=title;
    const kind=modeKind();
    $('#practiceFormula').textContent=(instrument.modes[state.mode]?.label||state.mode).toUpperCase();
    $$('#fretCountControls button').forEach(b=>b.classList.toggle('active',Number(b.dataset.frets)===state.maxFret));
    renderContextControls();updatePracticeLegend();updateDegreeFilterUI();
    const shapes=selectedPracticeShapes();
    if(kind==='pentatonic')$('#practiceHint').textContent='All connected positions are visible. Select one to isolate it.';
    else if(kind==='triads'){const groups=Object.keys(instrument.triadSets||{});$('#practiceHint').textContent=state.triadStrings==='all'?`All close-voicing triads across ${groups.join(', ')}.`:`All root, 1st and 2nd inversion triads on ${state.triadStrings}.`;}
    else if(kind==='chords'){const label=(instrument.chords||instrument.caged)?.systemLabel||'chord';$('#practiceHint').textContent=state.chordShape==='all'?`All available ${label} shapes across the fretboard.`:`${state.chordShape} ${label} shape across the fretboard.`;}
    else if(kind==='arpeggios')$('#practiceHint').textContent='Chord tones across the full visible fretboard.';
    else $('#practiceHint').textContent='';
    renderFretboard($('#practiceFretboard'),{interactive:false,mode:state.mode,visibleKeys:selectedNoteKeys(shapes),shapes});
  }

  const DEGREE_COLORS={root:'#00bfff',third:'#ff2fb3',fourth:'#ff6b00',fifth:'#d99a00',seventh:'#20b94b',second:'#7357ff',sixth:'#008f8f'};
  // Pentatonic positions deliberately reuse the site's degree-legend palette.
  // P1 Root cyan, P2 3rd pink, P3 4th orange, P4 5th yellow, P5 7th green.
  const PENTA_POSITION_COLORS=[DEGREE_COLORS.root,DEGREE_COLORS.third,DEGREE_COLORS.fourth,DEGREE_COLORS.fifth,DEGREE_COLORS.seventh];
  function fretCenter(fret,fretPos){return fret===0?fretPos(0)-15:(fretPos(fret-1)+fretPos(fret))/2}
  function visiblePentaWindows(maxFret){return patternWindows().filter(w=>w.minFret<=maxFret&&(state.pattern==='all'||String(w.id)===String(state.pattern)))}
  // Instrument-specific position geometry is supplied by the active profile.
  const PENTA_STRING_PAIRS=instrument.pentatonic?.stringPairs;
  function pentaAnchorFret(){
    const anchorQuality=state.quality==='minor'?rootPC():mod(rootPC()-3),anchorString=instrument.pentatonic?.anchorCourse||0;
    return mod(anchorQuality-tuning[anchorString].pc);
  }
  function visiblePentaPairs(maxFret){return PentatonicRenderer.visiblePairs({profile:instrument,anchor:pentaAnchorFret(),maxFret,selected:state.pattern})}
  function pentaNotesOnString(window,string,maxFret){
    // Kept for label placement/backward compatibility; derive visible notes from exact string pair.
    const pair=window.pairs?window.pairs[string]:null;if(pair)return pair.filter(f=>f>=0&&f<=maxFret);
    const pcs=new Set(pentaPCs()),notes=[];
    for(let fret=Math.max(0,window.minFret);fret<=Math.min(window.maxFret,maxFret);fret++)if(pcs.has(noteAt(string,fret)))notes.push(fret);
    return notes;
  }
  function renderPentaSegments(svg,{isP,fretPos,visualStringPos,maxFret}){PentatonicRenderer.renderSegments({svg,windows:visiblePentaPairs(maxFret),colors:PENTA_POSITION_COLORS,stringCount:STRING_COUNT,isPortrait:isP,fretPos,stringPos:visualStringPos,maxFret,fretCenter,svgEl})}
  function renderPentaPositionLabels(svg,{isP,fretPos,visualStringPos,maxFret}){
    visiblePentaPairs(maxFret).forEach(window=>{
      const notes=[];for(let string=0;string<STRING_COUNT;string++)notes.push(...pentaNotesOnString(window,string,maxFret));if(!notes.length)return;
      const min=Math.min(...notes),max=Math.max(...notes),mid=(fretCenter(min,fretPos)+fretCenter(max,fretPos))/2,color=PENTA_POSITION_COLORS[window.id-1];
      const edgeString=STRING_COUNT-1,x=isP?visualStringPos(edgeString)-34:mid,y=isP?mid:visualStringPos(edgeString)-25;
      const label=svgEl('g',{'pointer-events':'none'});label.append(svgEl('rect',{x:x-18,y:y-14,width:36,height:24,rx:8,fill:'#05080c',stroke:color,'stroke-width':2.2,opacity:.94}));label.append(svgEl('text',{x,y:y+3,fill:color,'font-size':13,'font-weight':1000,'text-anchor':'middle'},`P${window.id}`));svg.append(label);
    });
  }
  function renderFretboard(svg,opt){
    const maxFret=Math.min(engine.maxFret,state.maxFret);
    const core=renderFretboardCore(svg,{prefix:'practice',maxFret,onSurface:ctx=>{if(ModeRegistry.kind(instrument,opt.mode)==='pentatonic')renderPentaSegments(svg,ctx)}});
    const {isP,fretPos,visualStringPos}=core;
    if(ModeRegistry.kind(instrument,opt.mode)==='pentatonic')renderPentaPositionLabels(svg,core);
    const renderKind=ModeRegistry.kind(instrument,opt.mode),activeSet=renderKind==='pentatonic'?new Set(pentaPCs()):renderKind==='arpeggios'?new Set(arpeggioShapes()[0]?.notes.map(n=>n.pc)||[]):new Set([rootPC(),thirdPC(),fifthPC()]);
    const visibleKeys=opt.visibleKeys||null,pentaPairs=ModeRegistry.kind(instrument,opt.mode)==='pentatonic'?visiblePentaPairs(maxFret):[];
    for(let s=0;s<STRING_COUNT;s++)for(let f=0;f<=maxFret;f++){
      const pc=noteAt(s,f);if(!activeSet.has(pc))continue;if(ModeRegistry.kind(instrument,opt.mode)==='pentatonic'&&!pentaPairs.some(w=>{const pair=w.pairs[s];return f===pair[0]||f===pair[1]}))continue;
      const centerF=fretCenter(f,fretPos),centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS;
      const d=degreeFor(pc);if(!d)continue;if(state.degreeFilter!=='all'&&d!==state.degreeFilter)continue;
      if(ModeRegistry.kind(instrument,opt.mode)!=='pentatonic'&&visibleKeys&&!visibleKeys.has(s+':'+f))continue;
      const degreeColor=DEGREE_COLORS[d]||'#52606b';
      if(ModeRegistry.kind(instrument,opt.mode)==='pentatonic'){
        const g=svgEl('g',{opacity:1});g.append(svgEl('circle',{cx:x,cy:y,r:isP?20:13,fill:'#fff',stroke:'#dce8ef','stroke-width':2.2,'data-string':s,'data-fret':f}));g.append(svgEl('text',{x,y,fill:degreeColor,'font-size':isP?20:(noteName(pc).length>1?8.5:10.5),'font-weight':1000,'text-anchor':'middle','dominant-baseline':'middle','pointer-events':'none'},degreeLabel(pc)));svg.append(g)
      }else{
        const col=degreeColor,g=svgEl('g',{opacity:1});const c=svgEl('circle',{cx:x,cy:y,r:isP?20:13,fill:col,stroke:'#ffffffb0','stroke-width':1.6,'data-string':s,'data-fret':f});g.append(c);g.append(svgEl('text',{x,y:isP?y:y+4,fill:d==='fifth'?'#3c2b00':'#06131b','font-size':isP?20:(noteName(pc).length>1?8.5:10.5),'font-weight':1000,'text-anchor':'middle','dominant-baseline':isP?'middle':'auto','pointer-events':'none'},degreeLabel(pc)));svg.append(g)
      }
    }
  }

  const QUIZ_DURATION_MS=product.quiz?.durationMs??QuizEngine.DURATION_MS,QUIZ_BASE_POINTS=product.quiz?.basePoints??QuizEngine.BASE_POINTS,QUIZ_MAX_MULTIPLIER=product.quiz?.maxMultiplier??QuizEngine.MAX_MULTIPLIER,QUIZ_MAX_FRET=product.quiz?.maxFret??15;
  const quizSeconds=()=>Math.round(QUIZ_DURATION_MS/1000);
  const QUIZ_RANKS=product.ranks||[];
  const QUIZ_WINDOWS=product.quiz?.windows||QuizEngine.defaultWindows(QUIZ_MAX_FRET,QUIZ_MAX_MULTIPLIER);
  function pickQuizWindow(multiplier){
    const choices=QUIZ_WINDOWS[multiplier]||QUIZ_WINDOWS[1],total=choices.reduce((n,x)=>n+x.w,0);let r=Math.random()*total;
    for(const x of choices){r-=x.w;if(r<=0)return x.range.slice()}return choices[0].range.slice();
  }
  function quizRank(score){
    return QuizEngine.rankFor(score,QUIZ_RANKS);
  }
  let rankLadderReturn='score';
  function resetQuizHud(){
    $('#scoreCount').textContent='0';$('#comboCount').textContent='1';$('#liveRank').textContent='—';$('#quizTime').textContent=(QUIZ_DURATION_MS/1000).toFixed(1);
    const meter=$('#rankProgress');if(meter)meter.style.width='0%';
    $('.hud-time')?.classList.remove('time-warning','time-critical');$('.quiz-hud')?.classList.remove('hud-hot','hud-on-fire');
  }
  function prepareQuiz(){
    if(state.quiz?.timer)clearInterval(state.quiz.timer);
    state.quiz={correct:0,multiplier:1,score:0,current:null,locked:true,inputEnabledAt:Infinity,questionId:0,timer:null,endsAt:null,finished:false,started:false};
    state.quizReveal=null;resetQuizHud();
    $('#quizChord').textContent='READY?';$('#quizPrompt').innerHTML='Find the <strong>NOTE</strong>';$('#quizFeedback').textContent='The clock starts when you press START QUIZ.';
    const board=$('#quizFretboard');if(board)board.replaceChildren();
    showQuizIntro();
  }
  function showQuizIntro(){
    rankLadderReturn='intro';
    $('#quizResultView').hidden=true;$('#rankLadderView').hidden=true;$('#quizIntroView').hidden=false;
    $('#resultModal').classList.add('show');$('#resultModal').setAttribute('aria-hidden','false');
  }
  function startQuiz(){
    if(state.quiz?.timer)clearInterval(state.quiz.timer);
    const now=performance.now();
    state.quiz={correct:0,multiplier:1,score:0,current:null,locked:false,inputEnabledAt:0,questionId:0,timer:null,endsAt:now+QUIZ_DURATION_MS,finished:false,started:true};
    state.quizReveal=null;resetQuizHud();$('#resultModal').classList.remove('show');$('#resultModal').setAttribute('aria-hidden','true');
    $('#quizIntroView').hidden=true;$('#rankLadderView').hidden=true;$('#quizResultView').hidden=false;
    nextQuestion();updateQuizTimer();state.quiz.timer=setInterval(updateQuizTimer,100);
  }
  function randomQuestion(multiplier=1){
    const root=NOTES[Math.floor(Math.random()*NOTES.length)],quality=Math.random()<.5?'major':'minor';
    let target='root';
    if(multiplier>=3){const weights=multiplier===3?[['root',60],['fifth',30],['third',10]]:multiplier===4?[['root',40],['fifth',35],['third',25]]:[['root',34],['fifth',33],['third',33]];let r=Math.random()*weights.reduce((n,x)=>n+x[1],0);for(const [name,w] of weights){r-=w;if(r<=0){target=name;break}}}
    return{root,quality,target}
  }
  function targetPC(q){const r=PC[q.root];return q.target==='root'?r:q.target==='third'?mod(r+intervals[q.quality].third):mod(r+7)}
  function nextQuestion(){
    const qz=state.quiz;if(!qz||qz.finished)return;if(performance.now()>=qz.endsAt){finishQuiz();return}
    const questionMultiplier=Math.max(1,Math.min(QUIZ_MAX_MULTIPLIER,Number(qz.multiplier)||1));qz.current=randomQuestion(questionMultiplier);if(questionMultiplier<3)qz.current.target='root';qz.current.multiplierAtStart=questionMultiplier;qz.current.window=pickQuizWindow(questionMultiplier);qz.questionId++;qz.locked=false;qz.inputEnabledAt=performance.now()+120;
    const chordEl=$('#quizChord');chordEl.textContent=`${qz.current.root} ${qz.current.quality.toUpperCase()}`;
    const lab=qz.current.target==='root'?'ROOT':qz.current.target==='third'?(qz.current.quality==='minor'?'♭3RD':'3RD'):'5TH';
    $('#quizPrompt').innerHTML=`Find the <strong>${lab}</strong>`;const targetEl=$('#quizPrompt strong');
    [chordEl,targetEl].forEach(el=>{if(!el)return;el.classList.remove('quiz-target-change');void el.offsetWidth;el.classList.add('quiz-target-change')});
    $('#quizFeedback').textContent=`Frets ${qz.current.window[0]}–${qz.current.window[1]} • Touch any correct occurrence.`;
    updateQuizStats();renderQuizBoard();
  }
  function updateQuizTimer(){
    const qz=state.quiz;if(!qz||qz.finished)return;const remaining=Math.max(0,qz.endsAt-performance.now()),n=$('#quizTime');
    if(n)n.textContent=(remaining/1000).toFixed(1);const timeCell=$('.hud-time');timeCell?.classList.toggle('time-warning',remaining<=10000&&remaining>0);timeCell?.classList.toggle('time-critical',remaining<=5000&&remaining>0);
    if(remaining<=0)finishQuiz();
  }
  function animateHud(el,cls,duration=650){if(!el)return;el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),duration)}
  function animateScore(el,from,to){if(!el)return;const safeFrom=Math.min(from,to),token=String((Number(el.dataset.scoreAnim)||0)+1);el.dataset.scoreAnim=token;const start=performance.now(),duration=460;function tick(now){if(el.dataset.scoreAnim!==token)return;const t=Math.min(1,(now-start)/duration),ease=1-Math.pow(1-t,3),v=Math.max(safeFrom,Math.round(safeFrom+(to-safeFrom)*ease));el.textContent=v.toLocaleString('en-US');if(t<1)requestAnimationFrame(tick);else el.textContent=to.toLocaleString('en-US')}requestAnimationFrame(tick)}
  function quizRankProgress(score){if(score<=0)return 0;const current=quizRank(score);const idx=QUIZ_RANKS.findIndex(r=>r[2]===current.rank);if(idx<=0)return 100;const next=QUIZ_RANKS[idx-1][0],floor=current.min;return Math.max(0,Math.min(100,((score-floor)/(next-floor))*100))}
  function updateQuizStats({scoreGain=0,rankChanged=false,multiplierChanged=false,previousScore=null,error=false}={}){
    if(!state.quiz)return;const qz=state.quiz;
    const score=$('#scoreCount'),combo=$('#comboCount'),rank=$('#liveRank'),meter=$('#rankProgress'),hud=$('.quiz-hud');
    if(score){if(scoreGain&&previousScore!==null)animateScore(score,previousScore,qz.score);else score.textContent=qz.score.toLocaleString('en-US')}if(combo)combo.textContent=qz.multiplier;
    const r=qz.score>0?quizRank(qz.score):null;if(rank)rank.textContent=r?`${r.emoji} ${r.rank}`:'—';if(meter)meter.style.width=`${quizRankProgress(qz.score)}%`;
    if(scoreGain){const gain=$('#scoreGain');if(gain){gain.textContent=`+${scoreGain.toLocaleString('en-US')}`;animateHud(gain,'hud-gain-pop',720)}animateHud(score,'hud-score-pop',520)}
    if(multiplierChanged){animateHud($('#comboWrap'),error?'hud-combo-break':'hud-flip',620);animateHud($('.hud-combo'),error?'hud-cell-break':'hud-cell-charge',620)}
    if(rankChanged){animateHud($('.hud-rank'),'hud-rank-card-up',900);animateHud(rank,'hud-rank-up',900);animateHud(hud,'hud-rank-flash',900)}
    hud?.classList.toggle('hud-hot',qz.multiplier===4);hud?.classList.toggle('hud-on-fire',qz.multiplier>=5);
  }
  function renderQuizBoard(){const svg=$('#quizFretboard');const q=state.quiz?.current;if(!q)return;const prev={root:state.root,quality:state.quality};state.root=q.root;state.quality=q.quality;renderFretboardQuiz(svg,q);state.root=prev.root;state.quality=prev.quality}
  function renderFretboardQuiz(svg,q){
    const [startFret,endFret]=q.window||[0,6],hasOpen=startFret===0,localMax=hasOpen?endFret:(endFret-startFret+1);
    const {isP,fretPos,visualStringPos}=renderFretboardCore(svg,{prefix:'quiz',maxFret:localMax,fretOffset:startFret});
    const defs=svg.querySelector('defs');const glow=svgEl('filter',{id:'qglow',x:'-50%',y:'-50%',width:'200%',height:'200%'});glow.append(svgEl('feGaussianBlur',{stdDeviation:'6',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}),svgEl('feMergeNode',{in:'SourceGraphic'}));glow.append(merge);defs?.append(glow);
    const localForFret=f=>hasOpen?f:(f-startFret+1);
    const fretBounds=f=>{
      if(hasOpen&&f===0){const nut=fretPos(0);return[nut-38,nut]}
      const local=localForFret(f);return[fretPos(local-1),fretPos(local)];
    };
    const stringBounds=s=>{
      const center=visualStringPos(s),prev=s>0?visualStringPos(s-1):null,next=s<STRING_COUNT-1?visualStringPos(s+1):null;
      const a=prev===null?center-(next-center)/2:(center+prev)/2,b=next===null?center+(center-prev)/2:(center+next)/2;
      return[Math.min(a,b),Math.max(a,b)];
    };
    // Quiz-only interaction layer: each hit zone covers the full string lane between two frets.
    // Practice and Fretboard Map continue to use the shared core without this overlay.
    for(let s=0;s<STRING_COUNT;s++)for(let f=startFret;f<=endFret;f++){
      const [fa,fb]=fretBounds(f),[sa,sb]=stringBounds(s),centerF=(fa+fb)/2,centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS;
      const hit=isP
        ?svgEl('rect',{x:sa,y:fa,width:sb-sa,height:fb-fa,rx:7,class:'quiz-hit-zone',fill:'transparent','data-string':s,'data-fret':f})
        :svgEl('rect',{x:fa,y:sa,width:fb-fa,height:sb-sa,rx:7,class:'quiz-hit-zone',fill:'transparent','data-string':s,'data-fret':f});
      const reveal=state.quizReveal,isCorrectReveal=reveal&&reveal.string===s&&reveal.fret===f;
      if(isCorrectReveal)hit.classList.add('quiz-hit-correct');
      svg.append(hit);
      if(isCorrectReveal){
        const scoreX=isP?Math.min(sb-4,x+Math.max(25,(sb-sa)*.28)):x,scoreY=isP?y-30:Math.max(sa+12,y-22);
        svg.append(svgEl('text',{x:scoreX,y:scoreY,class:'quiz-hit-score','font-size':isP?18:15},`+${reveal.gain.toLocaleString('en-US')}`));
      }
    }
    const renderedQuestionId=state.quiz?.questionId;svg.onclick=e=>{const qz=state.quiz,c=e.target.closest('.quiz-hit-zone[data-string]');if(!qz||!c||qz.locked||qz.questionId!==renderedQuestionId||performance.now()<qz.inputEnabledAt)return;answerQuiz(+c.dataset.string,+c.dataset.fret,c,renderedQuestionId)};
  }
  function answerQuiz(s,f,node,questionId){
    const qz=state.quiz;if(!qz||qz.finished||qz.locked||qz.questionId!==questionId||performance.now()<qz.inputEnabledAt)return;if(performance.now()>=qz.endsAt){finishQuiz();return}const q=qz.current,pc=noteAt(s,f);
    if(pc===targetPC(q)){
      qz.locked=true;qz.correct++;const oldRank=qz.score>0?quizRank(qz.score).rank:null,usedMultiplier=qz.multiplier,gain=QUIZ_BASE_POINTS*usedMultiplier,previousScore=qz.score;qz.score+=gain;
      const oldMultiplier=qz.multiplier;qz.multiplier=Math.min(QUIZ_MAX_MULTIPLIER,qz.multiplier+1);const newRank=quizRank(qz.score).rank;
      state.quizReveal={string:s,fret:f,gain};$('#quizFeedback').textContent=`Correct — ${noteName(pc)} • +${gain.toLocaleString('en-US')} pts`;
      renderQuizBoard();updateQuizStats({scoreGain:gain,rankChanged:newRank!==oldRank,multiplierChanged:qz.multiplier!==oldMultiplier,previousScore});
      setTimeout(()=>{if(!state.quiz||state.quiz!==qz||qz.finished)return;state.quizReveal=null;nextQuestion()},250);
    }else{
      const changed=qz.multiplier!==1;qz.multiplier=1;node.classList.add('quiz-hit-error');$('#quizFeedback').textContent='Not this one — try again.';updateQuizStats({multiplierChanged:changed,error:true});
      setTimeout(()=>{if(node.isConnected)node.classList.remove('quiz-hit-error')},280);
    }
  }
  function renderRankLadder(preview=false){
    const qz=state.quiz||{score:0,correct:0},current=quizRank(qz.score),currentIndex=QUIZ_RANKS.findIndex(r=>r[2]===current.rank),list=$('#rankLadderList'),summary=$('#rankLadderSummary');
    if(!list||!summary||currentIndex<0)return;
    summary.hidden=preview;summary.innerHTML=preview?'':`<span>YOUR RANK</span><strong>${qz.score.toLocaleString('en-US')} PTS</strong><b>${current.emoji} ${current.rank}</b><em>${qz.correct.toLocaleString('en-US')} CORRECT ANSWERS</em>`;
    list.innerHTML='';
    QUIZ_RANKS.forEach((row,index)=>{
      const item=document.createElement('div');item.className=`rank-ladder-item${!preview&&index===currentIndex?' is-current':''}`;item.setAttribute('role','listitem');item.dataset.rankIndex=index;
      const position=index+1,threshold=row[0].toLocaleString('en-US');
      item.innerHTML=`<span class="rank-ladder-position">${String(position).padStart(2,'0')}</span><span class="rank-ladder-name"><b>${row[1]} ${row[2]}</b></span><span class="rank-ladder-threshold">${threshold}</span>`;
      list.append(item);
    });
    requestAnimationFrame(()=>{if(preview){list.scrollTop=0;return}const currentRow=list.querySelector('.is-current');if(currentRow)currentRow.scrollIntoView({block:'center',behavior:'auto'})});
  }
  function showRankLadder(from='score'){rankLadderReturn=from;const preview=from==='intro';renderRankLadder(preview);$('#quizIntroView').hidden=true;$('#quizResultView').hidden=true;$('#rankLadderView').hidden=false;const kicker=$('#rankLadderKicker');if(kicker)kicker.textContent=preview?'THE ROAD TO VIRTUOSO':'YOUR PLACE ON THE NECK';const back=$('#backToScore');if(back)back.textContent=preview?'← BACK':'← BACK TO MY SCORE'}
  function showScoreResult(){rankLadderReturn='score';$('#quizIntroView').hidden=true;$('#rankLadderView').hidden=true;$('#quizResultView').hidden=false}
  function backFromRankLadder(){if(rankLadderReturn==='intro')showQuizIntro();else showScoreResult()}
  function finishQuiz(){
    const qz=state.quiz;if(!qz||qz.finished)return;qz.finished=true;qz.locked=true;if(qz.timer){clearInterval(qz.timer);qz.timer=null}state.quizReveal=null;const time=$('#quizTime');if(time)time.textContent='0.0';const {emoji,rank,copy}=quizRank(qz.score);
    $('#resultRank').textContent=`${emoji} ${rank}`;$('#resultScore').textContent=qz.score.toLocaleString('en-US');
    $('#resultCopy').textContent=`${copy} ${qz.correct} ${qz.correct===1?'correct answer':'correct answers'} in ${quizSeconds()} seconds.`;
    rankLadderReturn='score';showScoreResult();$('#resultModal').classList.add('show');$('#resultModal').setAttribute('aria-hidden','false');
  }
  $('#startQuizButton')?.addEventListener('click',startQuiz);
  $('#introRankLadder')?.addEventListener('click',()=>showRankLadder('intro'));
  $('#replayQuiz').addEventListener('click',startQuiz);
  $('#viewRankLadder')?.addEventListener('click',()=>showRankLadder('score'));
  $('#backToScore')?.addEventListener('click',backFromRankLadder);
  $('#shareScore').addEventListener('click',async()=>{const qz=state.quiz||{score:0,correct:0},{emoji,rank}=quizRank(qz.score);const text=`${emoji} I reached ${rank} with ${qz.score.toLocaleString('en-US')} points and ${qz.correct} correct answers in ${quizSeconds()} seconds on ${product.name} ${product.shareEmoji||''}\nWhat's your rank?`,url=product.url||location.href;try{if(navigator.share)await navigator.share({title:product.name,text,url});else{await navigator.clipboard.writeText(`${text}\n${url}`);const shareLabel=$('#shareScore span');if(shareLabel){shareLabel.textContent='COPIED!';setTimeout(()=>shareLabel.textContent='SHARE MY SCORE',1400)}}}catch{}});
  renderPractice();
})();
