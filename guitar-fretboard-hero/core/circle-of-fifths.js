(() => {
  'use strict';
  const MAJOR=[
    {name:'C',pc:3,minor:'Am',accidentals:'No sharps or flats'},
    {name:'G',pc:10,minor:'Em',accidentals:'1 sharp • F♯'},
    {name:'D',pc:5,minor:'Bm',accidentals:'2 sharps • F♯ C♯'},
    {name:'A',pc:0,minor:'F♯m',accidentals:'3 sharps • F♯ C♯ G♯'},
    {name:'E',pc:7,minor:'C♯m',accidentals:'4 sharps • F♯ C♯ G♯ D♯'},
    {name:'B',pc:2,minor:'G♯m',accidentals:'5 sharps • F♯ C♯ G♯ D♯ A♯'},
    {name:'F♯',pc:9,minor:'D♯m',accidentals:'6 sharps • F♯ C♯ G♯ D♯ A♯ E♯'},
    {name:'D♭',pc:4,minor:'B♭m',accidentals:'5 flats • B♭ E♭ A♭ D♭ G♭'},
    {name:'A♭',pc:11,minor:'Fm',accidentals:'4 flats • B♭ E♭ A♭ D♭'},
    {name:'E♭',pc:6,minor:'Cm',accidentals:'3 flats • B♭ E♭ A♭'},
    {name:'B♭',pc:1,minor:'Gm',accidentals:'2 flats • B♭ E♭'},
    {name:'F',pc:8,minor:'Dm',accidentals:'1 flat • B♭'}
  ];
  const SPELLINGS={
    C:['C','D','E','F','G','A','B'],G:['G','A','B','C','D','E','F♯'],D:['D','E','F♯','G','A','B','C♯'],A:['A','B','C♯','D','E','F♯','G♯'],E:['E','F♯','G♯','A','B','C♯','D♯'],B:['B','C♯','D♯','E','F♯','G♯','A♯'],'F♯':['F♯','G♯','A♯','B','C♯','D♯','E♯'],'D♭':['D♭','E♭','F','G♭','A♭','B♭','C'],'A♭':['A♭','B♭','C','D♭','E♭','F','G'],'E♭':['E♭','F','G','A♭','B♭','C','D'],'B♭':['B♭','C','D','E♭','F','G','A'],F:['F','G','A','B♭','C','D','E']
  };
  const QUALITIES=['','m','m','','','m','°'];
  const ROMAN=['I','ii','iii','IV','V','vi','vii°'];
  const pcOf=n=>MusicTheory.PC[n.replace('♯','#').replace('♭','b')] ?? ({Db:4,Ab:11,Eb:6,Bb:1,Gb:9,Cb:2,Fb:7}[n.replace('♯','#').replace('♭','b')]);
  const normalizePc=n=>{const map={'D♭':4,'A♭':11,'E♭':6,'B♭':1,'G♭':9,'C♭':2,'F♭':7,'F♯':9,'C♯':4,'G♯':11,'D♯':6,'A♯':1,'E♯':8};return map[n]??MusicTheory.PC[n]};
  function getKey(index=0){const i=((index%12)+12)%12,k=MAJOR[i],scale=SPELLINGS[k.name];return {...k,index:i,scale,scalePCs:scale.map(normalizePc),chords:scale.map((n,j)=>({degree:ROMAN[j],name:n+QUALITIES[j]})),progressions:[['I','V','vi','IV'],['I','IV','V','I'],['vi','IV','I','V']]};}
  window.CircleOfFifths=Object.freeze({keys:MAJOR,getKey});
})();
