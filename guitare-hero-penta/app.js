(() => {
"use strict";

const ROOT_URL = "https://stupid-games.seignemorte.com/guitare-hero-penta/";
const NOTES = [
  {pc:0,label:"C"}, {pc:1,label:"C♯\nD♭"}, {pc:2,label:"D"}, {pc:3,label:"D♯\nE♭"},
  {pc:4,label:"E"}, {pc:5,label:"F"}, {pc:6,label:"F♯\nG♭"}, {pc:7,label:"G"},
  {pc:8,label:"G♯\nA♭"}, {pc:9,label:"A"}, {pc:10,label:"A♯\nB♭"}, {pc:11,label:"B"}
];
const STRINGS = [4,11,7,2,9,4]; // low E -> high E, pitch classes
const PENTA = { minor:[0,3,5,7,10], major:[0,2,4,7,9] };
const TRIAD = { minor:[0,3,7], major:[0,4,7] };
const COLORS = {root:"#ff375f",third:"#18c8ff",fifth:"#ffd33d",other:"#99a4b5"};
const BOX_COLORS = ["#bf5cff","#18f5a1","#ff5b4d","#ffd33d","#18c8ff"];
const SVG_NS = "http://www.w3.org/2000/svg";

let practice = {mode:"minor",root:9,layer:"penta",soloTimer:null,soloIndex:0};
let quiz = {n:0,streak:0,best:0,root:9,mode:"minor",target:0,locked:false,totalAttempts:0,currentAttempts:0};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function showScreen(id){
  $$(".screen").forEach(s=>s.classList.toggle("active",s.id===id));
}
function noteName(pc){ return NOTES.find(n=>n.pc===((pc%12)+12)%12).label.replace("\n","/"); }
function pcAt(stringIndex,fret){ return (STRINGS[stringIndex]+fret)%12; }
function degreeClass(pc,root,mode){
  const rel=(pc-root+12)%12, third=mode==="minor"?3:4;
  if(rel===0)return "root";
  if(rel===third)return "third";
  if(rel===7)return "fifth";
  return "other";
}
function svgEl(tag,attrs={}){
  const e=document.createElementNS(SVG_NS,tag);
  Object.entries(attrs).forEach(([k,v])=>e.setAttribute(k,String(v)));
  return e;
}

function populateNotes(){
  const select=$("#noteSelect");
  select.innerHTML="";
  NOTES.forEach(n=>{
    const o=document.createElement("option");
    o.value=String(n.pc);
    o.textContent=n.label.replace("\n","/");
    select.appendChild(o);
  });
}

function setPracticeRoot(pc){
  practice.root=pc;
  updatePracticeControls();
  renderPractice(true);
}
function updatePracticeControls(){
  $("#modeSelect").value=practice.mode;
  $("#layerSelect").value=practice.layer;
  $("#noteSelect").value=String(practice.root);
}

function drawNeck(svg,opts={}){
  const W=360,H=620,left=78,right=282,top=14,bottom=604;
  const fretCount=15, fh=(bottom-top)/fretCount, sw=(right-left)/5;

  const defs=svgEl("defs");
  const grad=svgEl("linearGradient",{id:"wood",x1:"0",x2:"1"});
  [["0%","#1b110c"],["35%","#58371f"],["55%","#2a1b12"],["100%","#160e0a"]].forEach(([o,c])=>grad.appendChild(svgEl("stop",{offset:o,"stop-color":c})));
  defs.appendChild(grad);
  const glow=svgEl("filter",{id:"glow",x:"-80%",y:"-80%",width:"260%",height:"260%"});
  glow.appendChild(svgEl("feGaussianBlur",{stdDeviation:"4",result:"b"}));
  const merge=svgEl("feMerge"); merge.appendChild(svgEl("feMergeNode",{in:"b"})); merge.appendChild(svgEl("feMergeNode",{in:"SourceGraphic"})); glow.appendChild(merge); defs.appendChild(glow);
  svg.appendChild(defs);

  svg.appendChild(svgEl("rect",{x:left-10,y:top-3,width:right-left+20,height:bottom-top+6,rx:10,fill:"url(#wood)",stroke:"#4c3427","stroke-width":2}));

  if(opts.boxes){
    const anchor = opts.mode==="major" ? (opts.root+9)%12 : opts.root; // relative minor root
    const lowRootFret = (anchor-STRINGS[0]+12)%12;
    const starts=[0,2,4,7,9];
    const widths=[3,3,3,3,3];
    for(let oct=-12; oct<=12; oct+=12){
      starts.forEach((off,i)=>{
        let f1=lowRootFret+off+oct, f2=f1+widths[i];
        const c1=Math.max(0,f1), c2=Math.min(15,f2);
        if(c2<=0||c1>=15||c2<=c1)return;
        const y=top+c1*fh;
        const h=(c2-c1)*fh;
        svg.appendChild(svgEl("rect",{x:left-4,y,width:right-left+8,height:h,rx:9,fill:BOX_COLORS[i],"fill-opacity":.055,stroke:BOX_COLORS[i],"stroke-opacity":.62,"stroke-width":1.4,"stroke-dasharray":"5 4"}));
        const t=svgEl("text",{x:10,y:y+14,fill:BOX_COLORS[i],"font-size":10,"font-weight":800});
        t.textContent=`${i+1}`;
        svg.appendChild(t);
      });
    }
  }

  for(let f=0;f<=fretCount;f++){
    const y=top+f*fh;
    svg.appendChild(svgEl("line",{x1:left-8,y1:y,x2:right+8,y2:y,stroke:f===0?"#d8d8d8":"#81766f","stroke-width":f===0?4:1.6,"stroke-opacity":f===0?1:.7}));
    if([3,5,7,9,12,15].includes(f) && f<fretCount){
      const t=svgEl("text",{x:50,y:y+fh*.58,fill:"#aeb8c8","font-size":11,"text-anchor":"middle"});t.textContent=f;svg.appendChild(t);
    }
  }
  for(let s=0;s<6;s++){
    const x=left+s*sw;
    svg.appendChild(svgEl("line",{x1:x,y1:top,x2:x,y2:bottom,stroke:"#d2d6d9","stroke-width":1.2+s*.22,"stroke-opacity":.82}));
  }
  // inlay dots
  [3,5,7,9].forEach(f=>{
    svg.appendChild(svgEl("circle",{cx:180,cy:top+(f-.5)*fh,r:3.2,fill:"#d5d9df","fill-opacity":.45}));
  });
  [1,2].forEach(i=>svg.appendChild(svgEl("circle",{cx:155+i*50,cy:top+(12-.5)*fh,r:3.2,fill:"#d5d9df","fill-opacity":.45})));
  return {W,H,left,right,top,bottom,fretCount,fh,sw};
}

function visibleNotes(root,mode,layer){
  const penta=PENTA[mode],tri=TRIAD[mode], set=new Set();
  if(layer==="penta")penta.forEach(i=>set.add((root+i)%12));
  if(layer==="triads")tri.forEach(i=>set.add((root+i)%12));
  if(layer==="chords")penta.forEach(i=>set.add((root+i)%12));
  return set;
}


function cagedChordTones(root, mode){
  // CAGED visualization: show chord tones (1, 3/b3, 5) across the entire 15-fret neck.
  const third = mode === "major" ? 4 : 3;
  return [0, third, 7].map(i => (root + i) % 12);
}
function cagedShapeName(fret, root){
  // Five repeating CAGED zones, transposed with the selected root.
  const names=["C","A","G","E","D"];
  const rel=(fret-root+24)%12;
  const idx=Math.floor((rel/12)*5)%5;
  return names[idx];
}

function renderPractice(animated=false){
  stopSolo();
  const svg=$("#fretboard");
  const old=[...svg.querySelectorAll(".note-dot")];
  const oldMap=new Map(old.map(n=>[n.dataset.key,n]));
  svg.innerHTML="";
  const g=drawNeck(svg,{boxes:true,root:practice.root,mode:practice.mode});
  const allowed=visibleNotes(practice.root,practice.mode,practice.layer);
  const coords=[];

  // connection lines first
  for(let s=0;s<5;s++){
    let prev=[];
    for(let f=0;f<15;f++){
      const pc=pcAt(s,f), pc2=pcAt(s+1,f);
      if(allowed.has(pc)) prev.push({s,f,pc});
      for(let d=-4;d<=4;d++){
        const f2=f+d;if(f2<0||f2>=15)continue;
        const bpc=pcAt(s+1,f2);
        if(allowed.has(pc) && allowed.has(bpc)){
          const x1=g.left+s*g.sw,x2=g.left+(s+1)*g.sw,y1=g.top+(f+.5)*g.fh,y2=g.top+(f2+.5)*g.fh;
          if(Math.abs(f2-f)<=3) svg.appendChild(svgEl("line",{x1,y1,x2,y2,stroke:"#57d8ff","stroke-width":.75,"stroke-opacity":practice.layer==="triads"?.16:.21}));
        }
      }
    }
  }

  for(let s=0;s<6;s++)for(let f=0;f<15;f++){
    const pc=pcAt(s,f);
    if(!allowed.has(pc))continue;
    const cls=degreeClass(pc,practice.root,practice.mode);
    if(practice.layer==="triads" && cls==="other")continue;
    const x=g.left+s*g.sw,y=g.top+(f+.5)*g.fh;
    const group=svgEl("g",{"class":"note-dot","data-key":`${s}-${f}`,"data-pc":pc});
    group.dataset.key=`${s}-${f}`;group.dataset.pc=pc;
    const color=COLORS[cls], dim=practice.layer==="chords"&&cls==="other";
    group.appendChild(svgEl("circle",{cx:x,cy:y,r:dim?7:9,fill:color,"fill-opacity":dim?.33:.92,stroke:dim?"#c4ccd6":"white","stroke-opacity":dim?.25:.72,"stroke-width":1.2,filter:dim?"":"url(#glow)"}));
    if(cls!=="other"){
      const txt=svgEl("text",{x,y:y+3.3,fill:cls==="fifth"?"#111":"#fff","font-size":9,"font-weight":900,"text-anchor":"middle"});
      txt.textContent=cls==="root"?"R":cls==="third"?"3":"5";group.appendChild(txt);
    }
    if(animated){
      group.style.transition="opacity .35s ease, transform .45s cubic-bezier(.2,.8,.2,1)";
      group.style.opacity="0";group.style.transform="translateY(10px)";
      requestAnimationFrame(()=>{group.style.opacity="1";group.style.transform="translateY(0)"});
    }
    svg.appendChild(group);coords.push({s,f,pc,x,y,el:group,cls});
  }
  svg._noteCoords=coords;
}

function stopSolo(){
  if(practice.soloTimer){clearInterval(practice.soloTimer);practice.soloTimer=null}
  const b=$("#visualSolo"); if(b)b.innerHTML='<span class="play-icon">▶</span><span>SOLO</span>';
  $$("#fretboard .note-dot").forEach(n=>{n.style.filter="";n.style.transform=""});
}
function startSolo(){
  if(practice.soloTimer){stopSolo();return}
  const coords=($("#fretboard")._noteCoords||[]).filter(n=>n.f>=3&&n.f<=12);
  if(!coords.length)return;
  const path=[...coords].sort((a,b)=>a.f-b.f||a.s-b.s).filter((_,i)=>i%2===0).slice(0,14);
  practice.soloIndex=0;$("#visualSolo").innerHTML='<span class="play-icon">■</span><span>STOP</span>';
  const tick=()=>{
    $$("#fretboard .note-dot").forEach(n=>{n.style.filter="";n.style.transform=""});
    const n=path[practice.soloIndex%path.length];
    n.el.style.filter="drop-shadow(0 0 10px #ffffff) drop-shadow(0 0 16px #18c8ff)";
    n.el.style.transform="scale(1.35)";
    practice.soloIndex++;
    if(practice.soloIndex>=path.length){setTimeout(stopSolo,320)}
  };
  tick(); practice.soloTimer=setInterval(tick,390);
}

function makeQuiz(){
  quiz.n=0;quiz.streak=0;quiz.best=0;quiz.locked=false;quiz.totalAttempts=0;quiz.currentAttempts=0;
  $("#resultModal").classList.remove("open");
  nextQuestion();
}
function nextQuestion(){
  if(quiz.n>=10){finishQuiz();return}
  quiz.n++;
  quiz.root=Math.floor(Math.random()*12);
  quiz.mode=Math.random()<.5?"minor":"major";
  const options=[0,quiz.mode==="minor"?3:4,7];
  quiz.target=options[Math.floor(Math.random()*options.length)];
  quiz.locked=false;quiz.currentAttempts=0;
  const labels={0:"ROOT",3:"3RD (♭3)",4:"3RD",7:"5TH"};
  $("#quizPrompt").textContent=`FIND THE ${labels[quiz.target]}`;
  $("#quizScale").textContent=`${noteName(quiz.root)} ${quiz.mode.toUpperCase()}`;
  $("#quizProgress").style.width=`${quiz.n*10}%`;
  $("#quizFeedback").textContent="Touche la bonne case sur le manche";
  renderQuizBoard();
}
function renderQuizBoard(){
  const svg=$("#quizBoard");svg.innerHTML="";
  const g=drawNeck(svg,{boxes:false});
  const all=PENTA[quiz.mode].map(i=>(quiz.root+i)%12);
  for(let s=0;s<6;s++)for(let f=0;f<15;f++){
    const pc=pcAt(s,f);if(!all.includes(pc))continue;
    const x=g.left+s*g.sw,y=g.top+(f+.5)*g.fh;
    const hit=svgEl("circle",{cx:x,cy:y,r:11,fill:"#aeb7c5","fill-opacity":.42,stroke:"#e6ebf1","stroke-opacity":.24,"stroke-width":1.2});
    hit.style.cursor="pointer";
    hit.addEventListener("click",()=>answerQuiz(pc,hit));
    svg.appendChild(hit);
  }
}
function answerQuiz(pc,el){
  if(quiz.locked)return;
  quiz.totalAttempts++;quiz.currentAttempts++;
  const correctPc=(quiz.root+quiz.target)%12;
  if(pc===correctPc){
    quiz.locked=true;quiz.streak++;quiz.best=Math.max(quiz.best,quiz.streak);
    el.setAttribute("fill","#18f5a1");el.setAttribute("fill-opacity","1");el.setAttribute("stroke","#fff");el.style.filter="url(#glow)";
    $("#quizFeedback").textContent="✓ CORRECT !";
    $("#quizFeedback").className="flex-none min-h-[40px] text-center text-sm font-black text-emerald-300 py-2";
    setTimeout(nextQuestion,480);
  }else{
    quiz.streak=0;
    el.setAttribute("fill","#ff375f");el.setAttribute("fill-opacity",".9");
    $("#quizFeedback").textContent="Pas ici — réessaie";
    $("#quizFeedback").className="flex-none min-h-[40px] text-center text-sm font-black text-rose-300 py-2";
    setTimeout(()=>{el.setAttribute("fill","#aeb7c5");el.setAttribute("fill-opacity",".42")},280);
  }
}
function quizLevel(){
  const a=quiz.totalAttempts;
  if(a<=11)return "VIRTUOSE";
  if(a<=14)return "EXPERT";
  if(a<=18)return "CONFIRMÉ";
  if(a<=24)return "INTERMÉDIAIRE";
  return "DÉBUTANT";
}
function finishQuiz(){
  const level=quizLevel();
  $("#finalLevel").textContent=level;
  $("#finalAttempts").textContent=quiz.totalAttempts;
  $("#finalStreak").textContent=quiz.best;
  $("#resultModal").classList.add("open");
}
async function shareQuiz(){
  const text=`Mon niveau sur Guitare Hero Penta : ${quizLevel()} 🤘\n${quiz.totalAttempts} tentatives sur 10 questions. Tu fais mieux ?`;
  try{
    if(navigator.share){await navigator.share({title:"Guitare Hero Penta",text,url:ROOT_URL});}
    else if(navigator.clipboard){await navigator.clipboard.writeText(`${text}\n${ROOT_URL}`);toast("Score copié !");}
    else{toast("Partage : "+ROOT_URL);}
  }catch(e){}
}
function toast(msg){
  const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),1500);
}

$("#goPractice").addEventListener("click",()=>{showScreen("practice");renderPractice(false)});
$("#goQuiz").addEventListener("click",()=>{showScreen("quiz");makeQuiz()});
$$("[data-home]").forEach(b=>b.addEventListener("click",()=>{stopSolo();showScreen("home")}));
$("#modeSelect").addEventListener("change",e=>{practice.mode=e.target.value;updatePracticeControls();renderPractice(true)});
$("#noteSelect").addEventListener("change",e=>setPracticeRoot(Number(e.target.value)));
$("#layerSelect").addEventListener("change",e=>{practice.layer=e.target.value;updatePracticeControls();renderPractice(false)});
$("#visualSolo").addEventListener("click",startSolo);
$("#replayQuiz").addEventListener("click",makeQuiz);
$("#shareQuiz").addEventListener("click",shareQuiz);

populateNotes();updatePracticeControls();renderPractice(false);
})();
function syncPatternZone(){
  const z=document.getElementById("patternZone");
  const s=document.getElementById("layerSelect");
  if(!z||!s)return;
  z.style.display=s.value==="penta" ? "flex" : "none";
}
document.getElementById("layerSelect")?.addEventListener("change",syncPatternZone);
setTimeout(syncPatternZone,0);

function renderCagedOverlay(){
  const select=document.getElementById("layerSelect");
  const svg=document.getElementById("fretboard");
  if(!select||!svg)return;
  svg.querySelector("#cagedOverlay")?.remove();
  if(select.value!=="chords")return;
  const NS="http://www.w3.org/2000/svg";
  const g=document.createElementNS(NS,"g"); g.id="cagedOverlay";
  const vb=svg.viewBox.baseVal;
  const W=vb.width||360,H=vb.height||650;
  const top=34,bottom=22,usable=H-top-bottom;
  const colors=["#bf5cff","#18f5a1","#ff5b4d","#ffd33d","#18c8ff"];
  ["C","A","G","E","D"].forEach((name,i)=>{
    const y=top+(usable/5)*i;
    const rect=document.createElementNS(NS,"rect");
    rect.setAttribute("x","4");rect.setAttribute("y",String(y+2));
    rect.setAttribute("width",String(W-8));rect.setAttribute("height",String(usable/5-4));
    rect.setAttribute("rx","8");rect.setAttribute("fill",colors[i]+"12");
    rect.setAttribute("stroke",colors[i]);rect.setAttribute("stroke-width","1.2");
    rect.setAttribute("stroke-dasharray","5 4");g.appendChild(rect);
    const t=document.createElementNS(NS,"text");
    t.setAttribute("x","12");t.setAttribute("y",String(y+17));t.setAttribute("fill",colors[i]);
    t.setAttribute("font-size","10");t.setAttribute("font-weight","900");
    t.textContent=name+" SHAPE";g.appendChild(t);
  });
  svg.appendChild(g);
}
document.getElementById("layerSelect")?.addEventListener("change",()=>setTimeout(renderCagedOverlay,0));
document.getElementById("modeSelect")?.addEventListener("change",()=>setTimeout(renderCagedOverlay,0));
document.getElementById("noteSelect")?.addEventListener("change",()=>setTimeout(renderCagedOverlay,0));
