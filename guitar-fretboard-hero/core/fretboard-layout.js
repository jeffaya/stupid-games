(() => {
  'use strict';
  function create({portrait,stringCount,maxFret,width,height}){
    const W=width??(portrait?520:1500),H=height??(portrait?1500:430);
    const fretStart=portrait?110:90,fretEnd=portrait?H-70:W-40,stringStart=portrait?85:70,stringEnd=portrait?W-55:H-48;
    const fretPos=f=>fretStart+(fretEnd-fretStart)*(f/maxFret);
    const stringPos=s=>stringStart+(stringEnd-stringStart)*(s/Math.max(1,stringCount-1));
    return {isP:portrait,W,H,fretStart,fretEnd,stringStart,stringEnd,fretPos,stringPos,maxFret};
  }
  window.FretboardLayout={create};
})();
