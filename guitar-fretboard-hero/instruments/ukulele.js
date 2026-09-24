(() => {'use strict';
const pc=n=>window.MusicTheory.PC[n];
const courses=[['G',67],['C',60],['E',64],['A',69]].map(([name,midi])=>({name,pc:pc(name),midi,physicalStrings:1,pairIntervals:[0]}));
const profile={id:'ukulele',family:'ukulele',label:'Ukulele',physicalStrings:4,reentrant:true,courses,fretOptions:[12,15,17],maxFret:17,woundStrings:0,
modes:{penta:{plugin:'pentatonic',label:'PENTATONIC',context:{label:'POSITIONS',values:['all','1','2','3','4','5'],defaultValue:'all'}},triad:{plugin:'triads',label:'TRIADS',context:{label:'STRINGS',values:['all','GCE','CEA'],defaultValue:'CEA'}},chord:{plugin:'chords',label:'CHORDS',context:{label:'SHAPE',values:['all','C','A','G','F'],defaultValue:'all'}},arpeggio:{plugin:'arpeggios',label:'ARPEGGIOS',context:{label:'TYPE',values:['triad','7th'],defaultValue:'triad'}}},
triadSets:{GCE:[0,1,2],CEA:[1,2,3]},defaultTriadSet:'CEA',
pentatonic:{anchorCourse:3,stringPairs:{1:[[0,2],[0,2],[0,3],[0,3]],2:[[2,5],[2,4],[3,5],[3,5]],3:[[5,7],[4,7],[5,8],[5,7]],4:[[7,9],[7,9],[8,10],[7,10]],5:[[9,12],[9,12],[10,12],[10,12]]}},
chords:{systemLabel:'ukulele chord',templates:{C:[[0,0,'fifth'],[1,0,'root'],[2,0,'third'],[3,3,'root']],A:[[0,2,'root'],[1,1,'third'],[2,0,'fifth'],[3,0,'root']],G:[[0,0,'root'],[1,2,'fifth'],[2,3,'root'],[3,2,'third']],F:[[0,2,'third'],[1,0,'fifth'],[2,1,'root'],[3,0,'third']]},anchors:{C:[1,0],A:[0,2],G:[0,0],F:[2,1]},order:['C','A','G','F']}};
window.FRETBOARD_INSTRUMENTS=window.FRETBOARD_INSTRUMENTS||{};window.FRETBOARD_INSTRUMENTS.ukulele=profile;})();
