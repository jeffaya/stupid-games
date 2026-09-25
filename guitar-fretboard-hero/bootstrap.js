(() => {
  'use strict';
  const CATALOG={
    'guitar':{instrumentKey:'guitar',instrument:'./instruments/guitar.js?v=10.4.3',productKey:'guitar',product:'./products/guitar-fretboard-hero.js?v=10.4.3'},
    'bass-4':{instrumentKey:'bass4',instrument:'./instruments/bass-4.js?v=10.4.3',productKey:'bass',product:'./products/bass-fretboard-hero.js?v=10.4.3'},
    'ukulele':{instrumentKey:'ukulele',instrument:'./instruments/ukulele.js?v=10.4.3',productKey:'ukulele',product:'./products/ukulele-fretboard-hero.js?v=10.4.3'},
    'guitar-12':{instrumentKey:'guitar12',instrument:'./instruments/guitar-12.js?v=10.4.3',productKey:'guitar',product:'./products/guitar-fretboard-hero.js?v=10.4.3'}
  };
  const CORE=['music-theory','tuning','fretboard-engine','fretboard-layout','fretboard-map','pentatonic-renderer','triad-engine','arpeggio-engine','chord-engine','quiz-engine','controls','mode-registry','product-shell'].map(n=>`./core/${n}.js?v=10.4.3`);
  const MODES=['pentatonic','triads','chords','arpeggios'].map(n=>`./modes/${n}.js?v=10.4.3`);
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=()=>reject(new Error(`Unable to load ${src}`));document.head.appendChild(s);});
  const fail=err=>{console.error(err);document.body.innerHTML=`<main style="min-height:100vh;display:grid;place-items:center;background:#05080b;color:#f8fbff;font-family:system-ui;padding:24px"><div><h1 style="color:#ff3ec9">CONFIGURATION ERROR</h1><p>${String(err.message||err)}</p><p>Check <code>site.config.json</code> and README.md.</p></div></main>`;};
  (async()=>{
    try{
      const response=await fetch('./site.config.json',{cache:'no-store'});if(!response.ok)throw new Error(`site.config.json returned HTTP ${response.status}`);
      const config=await response.json(),entry=CATALOG[config.instrument];if(!entry)throw new Error(`Unknown instrument "${config.instrument}". Supported: ${Object.keys(CATALOG).join(', ')}`);
      window.FRETBOARD_SITE_CONFIG=Object.freeze({...config});
      for(const src of CORE)await load(src);for(const src of MODES)await load(src);
      await load(entry.instrument);await load(entry.product);
      const instrument=window.FRETBOARD_INSTRUMENTS?.[entry.instrumentKey],product=window.FRETBOARD_PRODUCTS?.[entry.productKey];
      if(!instrument)throw new Error(`Instrument profile did not register: ${entry.instrumentKey}`);if(!product)throw new Error(`Product profile did not register: ${entry.productKey}`);
      window.FRETBOARD_ACTIVE_PRODUCT=product;window.FRETBOARD_ACTIVE_INSTRUMENT=instrument;
      document.documentElement.dataset.instrument=config.instrument;
      window.ProductShell.apply(product,instrument);
      await load('./app.js?v=10.4.9');
    }catch(err){fail(err);}
  })();
})();
