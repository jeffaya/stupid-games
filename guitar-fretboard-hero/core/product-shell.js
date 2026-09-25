(() => {
  'use strict';
  const q=(sel)=>document.querySelector(sel);
  const setAttr=(sel,attr,value)=>{const el=q(sel);if(el&&value!=null)el.setAttribute(attr,String(value));};
  const setMeta=(selector,value)=>setAttr(selector,'content',value);
  const absolute=(base,path)=>{try{return new URL(path,base.endsWith('/')?base:`${base}/`).href}catch{return path}};
  const setText=(sel,value)=>{const el=q(sel);if(el&&value!=null)el.textContent=String(value)};
  const setAria=(sel,value)=>setAttr(sel,'aria-label',value);

  function apply(product,instrument){
    if(!product) throw new Error('ProductShell requires an active product');
    const branding=product.branding||{};
    const instrumentId=window.FRETBOARD_SITE_CONFIG?.instrument||instrument?.id||'';
    const seo={...(product.seo||{}),...((product.seoByInstrument||{})[instrumentId]||{})};
    const pwa={...(product.pwa||{}),...((product.pwaByInstrument||{})[instrumentId]||{})};
    const assets=product.assets||{};
    const home=product.home||{};
    const name=branding.name||product.name||'Fretboard Hero';
    const url=(seo.canonical||product.url||location.href).replace(/\/$/,'')+'/';
    const ogImage=absolute(url,assets.ogImage||'og.jpg');

    document.title=seo.title||name;
    setMeta('meta[name="application-name"]',name);
    setMeta('meta[name="apple-mobile-web-app-title"]',pwa.shortName||name);
    setMeta('meta[name="description"]',seo.description||'Interactive fretboard trainer.');
    setMeta('meta[name="keywords"]',(seo.keywords||[]).join(', '));
    setAttr('link[rel="canonical"]','href',url);
    setMeta('meta[property="og:title"]',seo.ogTitle||seo.title||name);
    setMeta('meta[property="og:description"]',seo.ogDescription||seo.description||'Interactive fretboard trainer.');
    setMeta('meta[property="og:site_name"]',seo.siteName||'Stupid Games');
    setMeta('meta[property="og:url"]',url);
    setMeta('meta[property="og:image"]',ogImage);
    setMeta('meta[property="og:image:alt"]',seo.ogImageAlt||`${name} fretboard trainer`);
    setMeta('meta[name="twitter:title"]',seo.twitterTitle||seo.ogTitle||seo.title||name);
    setMeta('meta[name="twitter:description"]',seo.twitterDescription||seo.ogDescription||seo.description||'Interactive fretboard trainer.');
    setMeta('meta[name="twitter:image"]',ogImage);

    const structured=q('#productStructuredData');
    if(structured){
      structured.textContent=JSON.stringify({
        '@context':'https://schema.org','@type':['VideoGame','WebApplication'],name,url,image:ogImage,
        description:seo.structuredDescription||seo.description||'Interactive fretboard trainer.',
        applicationCategory:'EducationalApplication',gamePlatform:['Web Browser','Mobile Web','Tablet'],operatingSystem:'Any',
        isAccessibleForFree:true,inLanguage:'en',keywords:(seo.keywords||[]).join(', '),
        genre:['Music','Education'],featureList:seo.featureList||[],
        author:{'@type':'Person',name:'Jean-François Seignemorte'},
        publisher:{'@type':'Organization',name:'Stupid Games',url:'https://stupid-games.seignemorte.com/'}
      });
    }

    const words=branding.heroWords||['FRETBOARD','HERO'];
    const hero=q('.hero-logo');
    if(hero){
      hero.innerHTML=words.map((word,i)=>`<span class="${i===0?'hero-guitar':i===1?'hero-fret':'hero-hero'}">${String(word)}</span>`).join('');
      hero.setAttribute('aria-label',name);
    }
    setAria('#home',`${name} home`);
    setText('.tagline',home.tagline||'SEE IT • LEARN IT • PLAY IT');
    const tagline=q('.tagline');
    if(tagline&&home.taglineHtml)tagline.innerHTML=home.taglineHtml;
    setText('[data-go="practice"] small',home.practiceDescription);
    setText('[data-go="fretmap"] small',home.mapDescription);
    setText('[data-go="circle"] small',home.circleDescription);
    setText('[data-go="quiz"] small',home.quizDescription);

    const instrumentLabel=(instrument?.label||branding.instrumentName||'instrument').toLowerCase();
    setAria('#practiceFretboard',`Interactive ${instrumentLabel} fretboard`);
    setAria('#mapFretboard',`All ${instrumentLabel} notes on the fretboard`);
    setAria('#quizFretboard',`Quiz ${instrumentLabel} fretboard`);

    const iconMap={
      'link[rel="shortcut icon"]':assets.faviconIco,
      'link[rel="icon"][type="image/svg+xml"]':assets.faviconSvg,
      'link[rel="icon"][sizes="16x16"]':assets.favicon16,
      'link[rel="icon"][sizes="32x32"]':assets.favicon32,
      'link[rel="icon"][sizes="48x48"]':assets.favicon48,
      'link[rel="icon"][sizes="192x192"]':assets.icon192,
      'link[rel="icon"][sizes="512x512"]':assets.icon512,
      'link[rel="apple-touch-icon"]':assets.appleTouchIcon
    };
    Object.entries(iconMap).forEach(([sel,href])=>{if(href)setAttr(sel,'href',href)});

    const manifest={
      name:pwa.name||name,short_name:pwa.shortName||'Fretboard Hero',description:pwa.description||seo.description||'Interactive fretboard trainer.',
      id:'./',start_url:'./',scope:'./',display:'standalone',orientation:'any',background_color:pwa.backgroundColor||'#05070b',theme_color:pwa.themeColor||'#05070b',
      categories:pwa.categories||['education','music','games'],icons:[
        {src:assets.icon192||'icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},
        {src:assets.icon512||'icon-512.png',sizes:'512x512',type:'image/png',purpose:'any'},
        {src:assets.maskable512||'icon-maskable-512.png',sizes:'512x512',type:'image/png',purpose:'maskable'}
      ]
    };
    let manifestLink=q('link[rel="manifest"]');
    if(!manifestLink){manifestLink=document.createElement('link');manifestLink.rel='manifest';document.head.appendChild(manifestLink)}
    manifestLink.href=pwa.manifest||'manifest.webmanifest';
    document.documentElement.dataset.productReady='true';
    window.FRETBOARD_ACTIVE_BRANDING=Object.freeze({name,url,ogImage,manifest});
  }
  window.ProductShell=Object.freeze({apply});
})();
