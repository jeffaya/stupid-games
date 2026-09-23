(() => {
  'use strict';
  const {mod}=window.MusicTheory;
  function createInstrumentEngine(profile){
    profile=window.TuningEngine?TuningEngine.normalize(profile):profile;
    if(!profile?.courses?.length) throw new Error('Instrument profile requires courses');
    const courses=profile.courses;
    return {
      profile,courses,tuning:courses,stringCount:courses.length,
      physicalStringCount:profile.physicalStrings??courses.reduce((n,c)=>n+(c.physicalStrings||1),0),
      maxFret:profile.maxFret??21,fretOptions:profile.fretOptions??[12,15,17,21],
      noteAt:(courseIndex,fret)=>mod(courses[courseIndex].pc+fret),
      midiAt:(courseIndex,fret)=>courses[courseIndex].midi+fret,
      stringRatio:i=>courses.length===1?.5:i/(courses.length-1),
      visualStringIndex:(i,portrait)=>portrait?i:(courses.length-1-i),
      triadSets:()=>profile.triadSets||{}, pentatonicPairs:()=>profile.pentatonic?.stringPairs||null,
      mode:id=>profile.modes?.[id]||null, supports:id=>!!profile.modes?.[id]
    };
  }
  window.FretboardEngine={createInstrumentEngine};
})();
