(() => {
  'use strict';
  const NOTES=['A','A#','B','C','C#','D','D#','E','F','F#','G','G#'];
  const PC={A:0,'A#':1,B:2,C:3,'C#':4,D:5,'D#':6,E:7,F:8,'F#':9,G:10,'G#':11};
  const PC_TO_NAME=NOTES;
  const tuning=[{name:'E',pc:7,midi:40},{name:'A',pc:0,midi:45},{name:'D',pc:5,midi:50},{name:'G',pc:10,midi:55},{name:'B',pc:2,midi:59},{name:'E',pc:7,midi:64}];
  const intervals={major:{third:4,penta:[0,2,4,7,9]},minor:{third:3,penta:[0,3,5,7,10]}};
  const defaultFretCount=()=>window.innerWidth<=800?12:((navigator.maxTouchPoints||0)>1&&window.innerWidth<=1366?15:21);
  const state={screen:'home',mode:'penta',root:'A',quality:'minor',pattern:'all',shapeIndex:0,maxFret:defaultFretCount(),fretManual:false,degreeFilter:'all',mapMaxFret:defaultFretCount(),mapFretManual:false,mapNote:'all',quiz:null,quizReveal:null};
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
  NOTES.forEach(n=>{const b=document.createElement('button');b.textContent=n;b.dataset.root=n;if(n==='A')b.classList.add('active');$('#rootControls').appendChild(b)});
  $('#rootControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.root=b.dataset.root;state.shapeIndex=0;$$('#rootControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#modeControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.mode=b.dataset.mode;state.shapeIndex=0;$$('#modeControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#qualityControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.quality=b.dataset.quality;state.shapeIndex=0;$$('#qualityControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#patternControls').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;state.pattern=b.dataset.pattern;$$('#patternControls button').forEach(x=>x.classList.toggle('active',x===b));renderPractice()});
  $('#fretCountControls').addEventListener('click',e=>{const b=e.target.closest('button[data-frets]');if(!b)return;state.maxFret=Number(b.dataset.frets);state.fretManual=true;renderPractice()});
  $('#prevShape').addEventListener('click',()=>{const shapes=getShapes();state.shapeIndex=mod(state.shapeIndex-1,Math.max(shapes.length,1));renderPractice()});
  $('#nextShape').addEventListener('click',()=>{const shapes=getShapes();state.shapeIndex=mod(state.shapeIndex+1,Math.max(shapes.length,1));renderPractice()});
  window.addEventListener('resize',()=>{if(!state.fretManual)state.maxFret=defaultFretCount();if(!state.mapFretManual)state.mapMaxFret=defaultFretCount();if(state.screen==='practice')renderPractice();if(state.screen==='fretmap')renderFretboardMap();if(state.screen==='quiz')renderQuizBoard()});

  $$('.map-controls button[data-map-frets]').forEach(b=>b.addEventListener('click',()=>{state.mapMaxFret=Number(b.dataset.mapFrets);state.mapFretManual=true;renderFretboardMap()}));
  // Practice legend: tap a degree to isolate it; tap the active pill again to show everything.
  $('.practice-legend')?.addEventListener('click',e=>{
    const b=e.target.closest('[data-degree-filter]');if(!b||b.classList.contains('legend-muted'))return;
    const next=b.dataset.degreeFilter;state.degreeFilter=state.degreeFilter===next?'all':next;renderPractice();
  });

  // Fretboard Map: all notes by default, or isolate one pitch class while learning it.
  NOTES.forEach(n=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.dataset.mapNote=n;$('#mapNoteControls')?.appendChild(b)});
  $('#mapNoteControls')?.addEventListener('click',e=>{const b=e.target.closest('button[data-map-note]');if(!b)return;state.mapNote=b.dataset.mapNote;renderFretboardMap()});
  const MAP_COLORS={A:'#4f9dff','A#':'#9b6cff',B:'#c48b5b',C:'#35d1b0','C#':'#26b9d5',D:'#d15a91','D#':'#b864d8',E:'#82bd58',F:'#ff745e','F#':'#ff4f93',G:'#ff9d3f','G#':'#ffd14f'};
  function renderFretboardMap(){
    const svg=$('#mapFretboard'); if(!svg)return;
    const isP=portrait(),maxFret=Math.min(21,state.mapMaxFret),W=isP?520:1500,H=isP?1500:430;
    svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
    $$('.map-controls button[data-map-frets]').forEach(b=>b.classList.toggle('active',Number(b.dataset.mapFrets)===maxFret));
    $$('#mapNoteControls button[data-map-note]').forEach(b=>{const on=b.dataset.mapNote===state.mapNote;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
    const defs=svgEl('defs');const filter=svgEl('filter',{id:'mapGlow',x:'-80%',y:'-80%',width:'260%',height:'260%'});filter.append(svgEl('feGaussianBlur',{stdDeviation:'3',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}));merge.append(svgEl('feMergeNode',{in:'SourceGraphic'}));filter.append(merge);defs.append(filter);svg.append(defs);
    const fretStart=isP?110:90,fretEnd=isP?H-70:W-40,stringStart=isP?85:70,stringEnd=isP?W-55:H-48;
    const fretPos=f=>fretStart+(fretEnd-fretStart)*(f/maxFret),stringPos=s=>stringStart+(stringEnd-stringStart)*(s/5),visualStringPos=s=>stringPos(isP?s:5-s);
    for(let f=0;f<=maxFret;f++){const p=fretPos(f);svg.append(svgEl('line',isP?{x1:55,x2:W-55,y1:p,y2:p,stroke:f===0?'#e9ded0':'#8f8a84','stroke-width':f===0?5:2}:{x1:p,x2:p,y1:45,y2:H-50,stroke:f===0?'#e9ded0':'#8f8a84','stroke-width':f===0?5:2}));if(f===0||[3,5,7,9,12,15,17,19,21].includes(f)){const lp=f===0?fretPos(0):(fretPos(f-1)+fretPos(f))/2;svg.append(svgEl('text',isP?{x:28,y:lp+5,fill:'#8fa8b9','font-size':13,'font-weight':800,'text-anchor':'middle'}:{x:lp,y:H-15,fill:'#8fa8b9','font-size':13,'font-weight':800,'text-anchor':'middle'},String(f)))}}
    [3,5,7,9,12,15,17,19,21].filter(f=>f<=maxFret).forEach(f=>{const p=(fretPos(f-1)+fretPos(f))/2;if(f===12){[-14,14].forEach(o=>svg.append(svgEl('circle',isP?{cx:W/2+o,cy:p,r:4,fill:'#53616c'}:{cx:p,cy:H/2+o,r:4,fill:'#53616c'})))}else svg.append(svgEl('circle',isP?{cx:W/2,cy:p,r:4,fill:'#53616c'}:{cx:p,cy:H/2,r:4,fill:'#53616c'}))});
    tuning.forEach((st,s)=>{const p=visualStringPos(s),gauge=2.15-s*.22;svg.append(svgEl('line',isP?{x1:p,x2:p,y1:fretStart,y2:fretEnd,stroke:'#d2d9de','stroke-width':gauge}:{x1:fretStart,x2:fretEnd,y1:p,y2:p,stroke:'#d2d9de','stroke-width':gauge}));svg.append(svgEl('text',isP?{x:p,y:35,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'}:{x:24,y:p+6,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'},st.name))});
    for(let s=0;s<6;s++)for(let f=0;f<=maxFret;f++){const pc=noteAt(s,f),name=noteName(pc);if(state.mapNote!=='all'&&name!==state.mapNote)continue;const centerF=f===0?fretPos(0)-17:(fretPos(f-1)+fretPos(f))/2,centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS,col=MAP_COLORS[name]||'#fff';svg.append(svgEl('circle',{cx:x,cy:y,r:isP?12:13,fill:col,stroke:'#ffffffb8','stroke-width':1.4,filter:'url(#mapGlow)'}));svg.append(svgEl('text',{x,y:y+4,fill:'#071016','font-size':name.length>1?8.5:10.5,'font-weight':1000,'text-anchor':'middle'},name))}
  }

  function noteAt(stringIndex,fret){return mod(tuning[stringIndex].pc+fret)}
  function degreeFor(pc){const diff=mod(pc-rootPC());if(diff===0)return 'root';if(pc===thirdPC())return 'third';if(diff===7)return 'fifth';if(diff===10||diff===11)return 'seventh';if(diff===2)return 'ninth';return 'other'}
  function pentaPCs(){return intervals[state.quality].penta.map(i=>mod(rootPC()+i))}
  function formula(){const ints=state.quality==='minor'?['1','♭3','4','5','♭7']:['1','2','3','5','6'];return pentaPCs().map(noteName).join(' • ')+'   '+ints.join(' • ')}
  function updatePracticeLegend(){
    const seventh=$('#legendSeventh');const ninth=$('#legendNinth');
    if(!seventh||!ninth)return;
    // Keep the legend truthful to the currently displayed notes: minor pentatonic contains 7 (♭7), major pentatonic contains 9 (2).
    if(state.mode==='penta'){
      seventh.classList.toggle('legend-muted',state.quality!=='minor');
      ninth.classList.toggle('legend-muted',state.quality!=='major');
    }else{
      seventh.classList.add('legend-muted');
      ninth.classList.add('legend-muted');
    }
  }
  function updateDegreeFilterUI(){
    $$('.practice-legend [data-degree-filter]').forEach(b=>{const on=state.degreeFilter===b.dataset.degreeFilter;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on))});
  }
  function degreeLabel(pc){const d=degreeFor(pc);return d==='root'?'R':d==='third'?'3':d==='fifth'?'5':d==='seventh'?'7':d==='ninth'?'9':'•'}
  function portrait(){return matchMedia('(max-width:800px) and (orientation:portrait)').matches}
  function svgEl(tag,attrs={},text=''){const e=document.createElementNS('http://www.w3.org/2000/svg',tag);Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,v));if(text)e.textContent=text;return e}

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

  function triadShapes(){
    const pcs=[rootPC(),thirdPC(),fifthPC()]; const labels=['root','third','fifth']; const shapes=[];
    for(let s=0;s<=3;s++){
      const candidates=[];
      for(let i=0;i<3;i++){const arr=[];for(let f=0;f<=21;f++){const pc=noteAt(s+i,f);const di=pcs.indexOf(pc);if(di>=0)arr.push({string:s+i,fret:f,pc,degree:labels[di],midi:tuning[s+i].midi+f})}candidates.push(arr)}
      for(const a of candidates[0])for(const b of candidates[1])for(const c of candidates[2]){
        const combo=[a,b,c], deg=new Set(combo.map(x=>x.degree)); if(deg.size<3)continue;
        const frets=combo.map(x=>x.fret), span=Math.max(...frets)-Math.min(...frets); if(span>4)continue;
        const min=Math.min(...frets); if(Math.max(...frets)-min>4)continue;
        const lowest=[...combo].sort((x,y)=>x.midi-y.midi)[0].degree;
        const inv=lowest==='root'?'Root position':lowest==='third'?'1st inversion':'2nd inversion';
        shapes.push({notes:combo,stringSet:tuning.slice(s,s+3).map(x=>x.name).join('–'),min,max:Math.max(...frets),inversion:inv});
      }
    }
    const seen=new Set();return shapes.filter(sh=>{const k=sh.notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.min-b.min||a.max-b.max).slice(0,40)
  }

  function chordShapes(){
    // Compact playable 4-string voicings generated from exact chord tones only.
    const pcs=[rootPC(),thirdPC(),fifthPC()]; const labels=['root','third','fifth']; const shapes=[];
    for(let s=0;s<=2;s++){
      const cand=[];for(let i=0;i<4;i++){const arr=[];for(let f=0;f<=21;f++){const pc=noteAt(s+i,f),di=pcs.indexOf(pc);if(di>=0)arr.push({string:s+i,fret:f,pc,degree:labels[di],midi:tuning[s+i].midi+f})}cand.push(arr)}
      for(const a of cand[0])for(const b of cand[1])for(const c of cand[2])for(const d of cand[3]){
        const combo=[a,b,c,d], deg=new Set(combo.map(x=>x.degree));if(deg.size<3)continue;const fr=combo.map(x=>x.fret),span=Math.max(...fr)-Math.min(...fr);if(span>4)continue;
        const cost=span+combo.filter(x=>x.fret===0).length*-.2;shapes.push({notes:combo,stringSet:tuning.slice(s,s+4).map(x=>x.name).join('–'),min:Math.min(...fr),max:Math.max(...fr),cost});
      }
    }
    const seen=new Set();return shapes.filter(sh=>{const k=sh.notes.map(n=>n.string+':'+n.fret).join('|');if(seen.has(k))return false;seen.add(k);return true}).sort((a,b)=>a.min-b.min||a.cost-b.cost).slice(0,50)
  }
  function getShapes(){const shapes=state.mode==='triad'?triadShapes():state.mode==='chord'?chordShapes():[];return shapes.filter(sh=>sh.max<=state.maxFret)}

  function renderPractice(){
    const title=state.root+' '+state.quality.toUpperCase()+' '+(state.mode==='penta'?'PENTATONIC':state.mode==='triad'?'TRIADS':'CHORD VOICINGS');
    $('#practiceTitle').textContent=title;
    $('#practiceFormula').textContent=state.mode==='penta'?formula():`${state.root} • ${noteName(thirdPC())} • ${noteName(fifthPC())}`;
    $$('#fretCountControls button').forEach(b=>b.classList.toggle('active',Number(b.dataset.frets)===state.maxFret));
    $('#patternControls').classList.toggle('hidden',state.mode!=='penta');
    updatePracticeLegend();
    $('#shapeControls').classList.toggle('hidden',state.mode==='penta');
    const shapes=getShapes(); if(shapes.length&&state.shapeIndex>=shapes.length)state.shapeIndex=0;
    if(state.mode==='triad'&&shapes.length){const sh=shapes[state.shapeIndex];$('#shapeTitle').textContent=`Triad ${state.shapeIndex+1} / ${shapes.length}`;$('#shapeSub').textContent=`${sh.stringSet} • ${sh.inversion}`;$('#practiceHint').textContent='Connected dots are one playable triad shape. Use arrows to explore the neck.'}
    else if(state.mode==='chord'&&shapes.length){const sh=shapes[state.shapeIndex];$('#shapeTitle').textContent=`Voicing ${state.shapeIndex+1} / ${shapes.length}`;$('#shapeSub').textContent=`${sh.stringSet} • frets ${sh.min}–${sh.max}`;$('#practiceHint').textContent='Each voicing contains root, 3rd and 5th. Use arrows to discover compact playable positions.'}
    else if(state.mode==='penta'){$('#practiceHint').textContent='All 5 connected positions are visible. Select one to isolate it.'}
    renderFretboard($('#practiceFretboard'),{interactive:false,mode:state.mode,shape:shapes[state.shapeIndex]});
  }

  function renderFretboard(svg,opt){
    const isP=portrait(),maxFret=Math.min(21,state.maxFret), W=isP?520:1500,H=isP?1500:430;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';
    const padA=isP?80:58,padB=isP?58:80; const fretStart=isP?110:90,fretEnd=isP?H-70:W-40; const stringStart=isP?85:70,stringEnd=isP?W-55:H-48;
    const fretPos=f=>fretStart+(fretEnd-fretStart)*(f/maxFret), stringPos=s=>stringStart+(stringEnd-stringStart)*(s/5), visualStringPos=s=>stringPos(isP?s:5-s);
    const defs=svgEl('defs'); const glow=svgEl('filter',{id:'glow',x:'-50%',y:'-50%',width:'200%',height:'200%'});glow.append(svgEl('feGaussianBlur',{stdDeviation:'5',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}),svgEl('feMergeNode',{in:'SourceGraphic'}));glow.append(merge);defs.append(glow);svg.append(defs);
    // wood
    svg.append(svgEl('rect',{x:0,y:0,width:W,height:H,fill:'#0a0d12'}));
    if(opt.mode==='penta'){
      const colors=['#ff3ec9','#35e78f','#ff5366','#ffd53c','#27d7ff'];
      patternWindows().forEach(w=>{if(w.minFret>maxFret)return;if(state.pattern!=='all'&&String(w.id)!==String(state.pattern))return;const visibleMax=Math.min(w.maxFret,maxFret),a=fretPos(Math.max(0,w.minFret-1)),b=fretPos(visibleMax);const attrs=isP?{x:45,y:a,width:W-90,height:Math.max(8,b-a),fill:colors[w.id-1]+'15',stroke:colors[w.id-1], 'stroke-width':2,rx:12}:{x:a,y:32,width:Math.max(8,b-a),height:H-62,fill:colors[w.id-1]+'15',stroke:colors[w.id-1],'stroke-width':2,rx:12};svg.append(svgEl('rect',attrs));const tx=isP?W-10:a+8,ty=isP?a+20:52;svg.append(svgEl('text',{x:tx,y:ty,fill:colors[w.id-1],'font-size':14,'font-weight':900,'text-anchor':isP?'end':'start'},`P${w.id}`))})
    }
    // frets and numbers. Fret labels sit inside the fret they identify (as on scale/tab diagrams), not on the fret wire.
    for(let f=0;f<=maxFret;f++){
      const p=fretPos(f);
      const line=svgEl('line',isP?{x1:52,x2:W-48,y1:p,y2:p,stroke:f===0?'#d6c5a6':'#81776c','stroke-width':f===0?8:2}:{y1:48,y2:H-42,x1:p,x2:p,stroke:f===0?'#d6c5a6':'#81776c','stroke-width':f===0?8:2});
      svg.append(line);
      if([0,3,5,7,9,12,15,17,19,21].includes(f)){
        const labelPos=f===0?fretPos(0):(fretPos(f-1)+fretPos(f))/2;
        const t=svgEl('text',isP?{x:18,y:labelPos+5,fill:'#8fa2b0','font-size':14}:{x:labelPos,y:H-14,fill:'#8fa2b0','font-size':14,'text-anchor':'middle'},String(f));
        svg.append(t);
      }
    }
    // inlays
    [3,5,7,9,12,15,17,19,21].filter(f=>f<=maxFret).forEach(f=>{const p=(fretPos(f-1)+fretPos(f))/2;if(f===12){[-14,14].forEach(o=>svg.append(svgEl('circle',isP?{cx:W/2+o,cy:p,r:5,fill:'#59636b'}:{cx:p,cy:H/2+o,r:5,fill:'#59636b'})))}else svg.append(svgEl('circle',isP?{cx:W/2,cy:p,r:5,fill:'#59636b'}:{cx:p,cy:H/2,r:5,fill:'#59636b'}))});
    // strings. Portrait keeps the physical low→high order left-to-right; desktop follows tablature convention top-to-bottom: e B G D A E.
    tuning.forEach((st,s)=>{const p=visualStringPos(s),gauge=2.15-s*.22;svg.append(svgEl('line',isP?{x1:p,x2:p,y1:fretStart,y2:fretEnd,stroke:'#d2d9de','stroke-width':gauge}:{x1:fretStart,x2:fretEnd,y1:p,y2:p,stroke:'#d2d9de','stroke-width':gauge}));svg.append(svgEl('text',isP?{x:p,y:35,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'}:{x:24,y:p+6,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'},st.name))});
    const activeSet=opt.mode==='penta'?new Set(pentaPCs()):new Set([rootPC(),thirdPC(),fifthPC()]);
    let shapeKey=new Set();if(opt.shape)opt.shape.notes.forEach(n=>shapeKey.add(n.string+':'+n.fret));
    if(opt.shape&&opt.shape.notes.length>=3){const pts=opt.shape.notes.map(n=>{const fp=(fretPos(Math.max(0,n.fret-1))+fretPos(n.fret))/2,sp=visualStringPos(n.string);return isP?[sp,fp]:[fp,sp]});svg.append(svgEl('polyline',{points:pts.map(p=>p.join(',')).join(' '),fill:'none',stroke:'#ffffff88','stroke-width':4,'stroke-linecap':'round','stroke-linejoin':'round',filter:'url(#glow)'}))}
    for(let s=0;s<6;s++)for(let f=0;f<=maxFret;f++){
      const pc=noteAt(s,f);if(!activeSet.has(pc))continue;
      const centerF=f===0?fretPos(0)-15:(fretPos(f-1)+fretPos(f))/2;const centerS=visualStringPos(s);const x=isP?centerS:centerF,y=isP?centerF:centerS;
      const d=degreeFor(pc);if(state.degreeFilter!=='all'&&d!==state.degreeFilter)continue;let col=d==='root'?'#27d7ff':d==='third'?'#ff3ec9':d==='fifth'?'#ffd53c':d==='seventh'?'#62ef75':d==='ninth'?'#ff8b3d':'#99a7b2';let opacity=d==='other'?.42:1;
      const inShape=shapeKey.has(s+':'+f);if(opt.shape&&!inShape)opacity=.10;
      const g=svgEl('g',{opacity});const c=svgEl('circle',{cx:x,cy:y,r:inShape?15:(d==='other'?9:12),fill:col,stroke:'#ffffff99','stroke-width':inShape?2:1,filter:d==='other'?'':'url(#glow)','data-string':s,'data-fret':f});g.append(c);g.append(svgEl('text',{x,y:y+4,fill:d==='fifth'?'#3c2b00':'#06131b','font-size':inShape?11:10,'font-weight':1000,'text-anchor':'middle','pointer-events':'none'},degreeLabel(pc)));svg.append(g)
    }
  }

  function startQuiz(){
    state.quiz={round:0,attempts:0,correct:0,current:null,locked:false};state.quizReveal=null;$('#resultModal').classList.remove('show');nextQuestion();
  }
  function randomQuestion(){const root=NOTES[Math.floor(Math.random()*NOTES.length)],quality=Math.random()<.5?'major':'minor',targets=['root','third','fifth'],target=targets[Math.floor(Math.random()*targets.length)];return{root,quality,target}}
  function targetPC(q){const r=PC[q.root];return q.target==='root'?r:q.target==='third'?mod(r+intervals[q.quality].third):mod(r+7)}
  function nextQuestion(){const qz=state.quiz;if(qz.round>=10){finishQuiz();return}qz.round++;qz.current=randomQuestion();qz.locked=false;$('#roundNum').textContent=qz.round;$('#quizChord').textContent=`${qz.current.root} ${qz.current.quality.toUpperCase()}`;const lab=qz.current.target==='root'?'ROOT':qz.current.target==='third'?(qz.current.quality==='minor'?'♭3rd':'3rd'):'5th';$('#quizPrompt').innerHTML=`Find the <strong>${lab}</strong>`;$('#quizFeedback').textContent='Touch any correct occurrence on the fretboard.';updateQuizStats();renderQuizBoard()}
  function updateQuizStats(){if(!state.quiz)return;const a=$('#attemptCount'),c=$('#correctCount'),h=$('#quizAttempts');if(a)a.textContent=state.quiz.attempts;if(c)c.textContent=state.quiz.correct;if(h)h.textContent=`${state.quiz.attempts} ATTEMPTS`}
  function renderQuizBoard(){const svg=$('#quizFretboard');const q=state.quiz?.current;if(!q)return;const prev={root:state.root,quality:state.quality};state.root=q.root;state.quality=q.quality;renderFretboardQuiz(svg,q);state.root=prev.root;state.quality=prev.quality}
  function renderFretboardQuiz(svg,q){
    const isP=portrait(),maxFret=Math.min(21,defaultFretCount()),W=isP?520:1500,H=isP?1500:430;svg.setAttribute('viewBox',`0 0 ${W} ${H}`);svg.innerHTML='';const fretStart=isP?110:90,fretEnd=isP?H-70:W-40,stringStart=isP?85:70,stringEnd=isP?W-55:H-48;const fretPos=f=>fretStart+(fretEnd-fretStart)*(f/maxFret),stringPos=s=>stringStart+(stringEnd-stringStart)*(s/5),visualStringPos=s=>stringPos(isP?s:5-s);
    const defs=svgEl('defs');const glow=svgEl('filter',{id:'qglow',x:'-50%',y:'-50%',width:'200%',height:'200%'});glow.append(svgEl('feGaussianBlur',{stdDeviation:'6',result:'b'}));const merge=svgEl('feMerge');merge.append(svgEl('feMergeNode',{in:'b'}),svgEl('feMergeNode',{in:'SourceGraphic'}));glow.append(merge);defs.append(glow);svg.append(defs,svgEl('rect',{x:0,y:0,width:W,height:H,fill:'#090b0e'}));
    for(let f=0;f<=maxFret;f++){
      const p=fretPos(f);
      svg.append(svgEl('line',isP?{x1:52,x2:W-48,y1:p,y2:p,stroke:f===0?'#d6c5a6':'#776f66','stroke-width':f===0?8:2}:{y1:48,y2:H-42,x1:p,x2:p,stroke:f===0?'#d6c5a6':'#776f66','stroke-width':f===0?8:2}));
      if([0,3,5,7,9,12,15,17,19,21].includes(f)){
        const labelPos=f===0?fretPos(0):(fretPos(f-1)+fretPos(f))/2;
        svg.append(svgEl('text',isP?{x:18,y:labelPos+5,fill:'#8193a0','font-size':14}:{x:labelPos,y:H-14,fill:'#8193a0','font-size':14,'text-anchor':'middle'},String(f)));
      }
    }
    tuning.forEach((st,s)=>{const p=visualStringPos(s),gauge=2.15-s*.22;svg.append(svgEl('line',isP?{x1:p,x2:p,y1:fretStart,y2:fretEnd,stroke:'#d0d7dd','stroke-width':gauge}:{x1:fretStart,x2:fretEnd,y1:p,y2:p,stroke:'#d0d7dd','stroke-width':gauge}));svg.append(svgEl('text',isP?{x:p,y:35,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'}:{x:24,y:p+6,fill:'#dbe8ef','font-size':18,'font-weight':800,'text-anchor':'middle'},st.name))});
    const tpc=targetPC(q);
    for(let s=0;s<6;s++)for(let f=0;f<=maxFret;f++){
      const centerF=f===0?fretPos(0)-15:(fretPos(f-1)+fretPos(f))/2,centerS=visualStringPos(s),x=isP?centerS:centerF,y=isP?centerF:centerS;
      const hit=svgEl('circle',{cx:x,cy:y,r:17,fill:'transparent',stroke:'transparent','data-string':s,'data-fret':f,style:'cursor:pointer'});svg.append(hit)
      if(state.quizReveal&&noteAt(s,f)===state.quizReveal){svg.append(svgEl('circle',{cx:x,cy:y,r:11,fill:'#27d7ff',stroke:'#fff','stroke-width':1.5,filter:'url(#qglow)'}));svg.append(svgEl('text',{x,y:y+4,fill:'#06131b','font-size':10,'font-weight':1000,'text-anchor':'middle'},noteName(tpc)))}
    }
    svg.onclick=e=>{const c=e.target.closest('circle[data-string]');if(!c||state.quiz.locked)return;answerQuiz(+c.dataset.string,+c.dataset.fret,c)};
  }
  function answerQuiz(s,f,node){const qz=state.quiz,q=qz.current;const pc=noteAt(s,f);qz.attempts++;if(pc===targetPC(q)){qz.correct++;qz.locked=true;state.quizReveal=pc;$('#quizFeedback').textContent=`Correct — ${noteName(pc)} is the ${q.target==='root'?'root':q.target==='third'?(q.quality==='minor'?'♭3rd':'3rd'):'5th'} of ${q.root} ${q.quality}.`;renderQuizBoard();updateQuizStats();setTimeout(()=>{state.quizReveal=null;nextQuestion()},850)}else{node.setAttribute('fill','#ff4d62');node.setAttribute('stroke','#ff8897');node.setAttribute('filter','url(#qglow)');$('#quizFeedback').textContent=`Not this one — try again.`;updateQuizStats();setTimeout(()=>{if(node.isConnected){node.setAttribute('fill','transparent');node.setAttribute('stroke','transparent');node.removeAttribute('filter')}},280)}}
  function finishQuiz(){const a=state.quiz.attempts;let rank='KEEP PRACTICING',copy='Every attempt builds the map in your head.';if(a===10){rank='VIRTUOSO';copy='Perfect run. You know your neck.'}else if(a<=13){rank='ROCKSTAR';copy='Fast, accurate and confident.'}else if(a<=17){rank='SHREDDER';copy='Strong fretboard knowledge.'}else if(a<=24){rank='PLAYER';copy='Solid base. One more run will sharpen it.'}$('#resultRank').textContent=rank;$('#resultAttempts').textContent=a;$('#resultCopy').textContent=copy;$('#resultModal').classList.add('show');$('#resultModal').setAttribute('aria-hidden','false')}
  $('#replayQuiz').addEventListener('click',startQuiz);
  $('#shareScore').addEventListener('click',async()=>{const a=state.quiz?.attempts??0,text=`I scored ${a} attempts on Guitar Fretboard Hero 🎸 Can you beat me?`,url='https://stupid-games.seignemorte.com/guitar-fretboard-hero/';try{if(navigator.share)await navigator.share({title:'Guitar Fretboard Hero',text,url});else{await navigator.clipboard.writeText(`${text} ${url}`);$('#shareScore').textContent='COPIED!';setTimeout(()=>$('#shareScore').textContent='SHARE MY SCORE',1400)}}catch{}});

  renderPractice();
})();
