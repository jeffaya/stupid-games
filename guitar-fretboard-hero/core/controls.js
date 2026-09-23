(() => {
  'use strict';
  function bindDrawer({root=document,name}){const $=s=>root.querySelector(s),drawer=$('#'+name+'Drawer'),btn=$('#'+name+'MenuBtn'),close=$('#'+name+'MenuClose'),backdrop=$('#'+name+'DrawerBackdrop');if(!drawer||!btn)return;const setOpen=open=>{drawer.classList.toggle('open',open);backdrop?.classList.toggle('show',open);drawer.setAttribute('aria-hidden',String(!open));btn.setAttribute('aria-expanded',String(open))};btn.addEventListener('click',()=>setOpen(!drawer.classList.contains('open')));close?.addEventListener('click',()=>setOpen(false));backdrop?.addEventListener('click',()=>setOpen(false))}
  function context(profile,mode){const m=profile.modes?.[mode];if(!m)return null;return {label:m.context?.label||'',values:m.context?.values||['all'],defaultValue:m.context?.defaultValue||'all'}}
  window.FretboardControls={bindDrawer,context};
})();
