(() => {
  'use strict';
  const normalizeCourse=(course,index)=>({
    name:course.name||`S${index+1}`,
    pc:Number(course.pc), midi:Number(course.midi),
    physicalStrings:course.physicalStrings??1,
    pairIntervals:course.pairIntervals||[0]
  });
  const normalize=profile=>({...profile,courses:(profile.courses||[]).map(normalizeCourse)});
  window.TuningEngine={normalize,normalizeCourse};
})();
