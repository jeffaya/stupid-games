(() => {'use strict';
const pc=n=>window.MusicTheory.PC[n];
const base=[['E',40],['A',45],['D',50],['G',55],['B',59],['E',64]];
const courses=base.map(([name,midi],i)=>({name,pc:pc(name),midi,physicalStrings:2,pairIntervals:i<4?[0,12]:[0,0]}));
const profile={id:'guitar-12',family:'guitar',label:'12-string Guitar',physicalStrings:12,courses,fretOptions:[12,15,17,21],maxFret:21,woundStrings:3,
modes:{penta:{plugin:'pentatonic',label:'PENTATONIC',context:{label:'POSITIONS',values:['all','1','2','3','4','5'],defaultValue:'all'}},triad:{plugin:'triads',label:'TRIADS',context:{label:'STRINGS',values:['all','EAD','ADG','DGB','GBE'],defaultValue:'GBE'}},chord:{plugin:'chords',label:'CAGED CHORDS',context:{label:'SHAPE',values:['all','C','A','G','E','D'],defaultValue:'all'}}},
triadSets:{EAD:[0,1,2],ADG:[1,2,3],DGB:[2,3,4],GBE:[3,4,5]},defaultTriadSet:'GBE',pentatonic:{anchorCourse:0,stringPairs:{1:[[0,3],[0,2],[0,2],[0,2],[0,3],[0,3]],2:[[3,5],[2,5],[2,5],[2,4],[3,5],[3,5]],3:[[5,7],[5,7],[5,7],[4,7],[5,8],[5,7]],4:[[7,10],[7,10],[7,9],[7,9],[8,10],[7,10]],5:[[10,12],[10,12],[9,12],[9,12],[10,12],[10,12]]}},
caged:{systemLabel:'CAGED chord',templates:{C:[[1,3,'root'],[2,2,'third'],[3,0,'fifth'],[4,1,'root'],[5,0,'third']],A:[[1,0,'root'],[2,2,'fifth'],[3,2,'root'],[4,2,'third'],[5,0,'fifth']],G:[[0,3,'root'],[1,2,'third'],[2,0,'fifth'],[3,0,'root'],[4,0,'third'],[5,3,'root']],E:[[0,0,'root'],[1,2,'fifth'],[2,2,'root'],[3,1,'third'],[4,0,'fifth'],[5,0,'root']],D:[[2,0,'root'],[3,2,'fifth'],[4,3,'root'],[5,2,'third']]},anchors:{C:[1,3],A:[1,0],G:[0,3],E:[0,0],D:[2,0]},order:['C','A','G','E','D']}};
window.FRETBOARD_INSTRUMENTS=window.FRETBOARD_INSTRUMENTS||{};window.FRETBOARD_INSTRUMENTS.guitar12=profile;})();
