(() => {
  'use strict';
  const plugins=window.FRETBOARD_MODES=window.FRETBOARD_MODES||{};
  const register=(id,plugin)=>{plugins[id]=Object.freeze({id,...plugin});};
  const declaration=(profile,id)=>profile?.modes?.[id]||null;
  const plugin=(profile,id)=>plugins[declaration(profile,id)?.plugin||id]||null;
  const list=profile=>Object.entries(profile?.modes||{}).map(([id,config])=>({id,...config,plugin:plugin(profile,id)}));
  const get=(profile,id)=>declaration(profile,id);
  const context=(profile,id)=>get(profile,id)?.context||null;
  const kind=(profile,id)=>plugin(profile,id)?.kind||id;
  const stateKey=(profile,id)=>plugin(profile,id)?.stateKey||'modeValue';
  window.ModeRegistry={register,list,get,context,plugin,kind,stateKey};
})();
