/* AFD theme front-end (vanilla, no dependencies).
   Header state, mobile menu, click-to-load video/map, staggered scroll reveal, hero slideshow + Ken Burns/parallax,
   counters, step timeline, Texas route draw, gallery filters, accessible lightbox, multi-step quote form, back-to-top.
   Everything animated is skipped when the visitor prefers reduced motion. */
(function(){
  var d=document,root=d.documentElement,W=window;
  var reduce=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  W.afdReady=true;if(reduce){root.classList.remove('js')}
  var $=function(s,c){return (c||d).querySelector(s)},$$=function(s,c){return Array.prototype.slice.call((c||d).querySelectorAll(s))};
  var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};

  /* ---------- header: shadow + shrink, back-to-top ---------- */
  var hdr=$('.site-header'),top=$('.to-top'),ticking=false,scrollFns=[];
  function onScroll(){if(ticking)return;ticking=true;requestAnimationFrame(function(){ticking=false;var y=W.scrollY;
    if(hdr)hdr.classList.toggle('scrolled',y>8);
    if(top)top.classList.toggle('show',y>700);
    for(var i=0;i<scrollFns.length;i++)scrollFns[i](y);})}
  addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});
  if(top)top.addEventListener('click',function(){W.scrollTo({top:0,behavior:reduce?'auto':'smooth'});var b=$('.brand');if(b)b.focus({preventScroll:true})});

  /* ---------- mobile menu ---------- */
  var mb=$('.menu-btn'),nav=d.getElementById('site-nav');
  if(mb&&nav){
    var close=function(){nav.classList.remove('open');mb.setAttribute('aria-expanded','false');d.body.style.overflow=''};
    mb.addEventListener('click',function(){var o=nav.classList.toggle('open');mb.setAttribute('aria-expanded',o?'true':'false');d.body.style.overflow=o?'hidden':''});
    nav.addEventListener('click',function(e){if(e.target.closest('a'))close()});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){close();mb.focus()}});
  }
  $$('.sub-toggle').forEach(function(b){b.addEventListener('click',function(){var s=d.getElementById(b.getAttribute('aria-controls'));if(!s)return;var o=s.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false')})});

  /* ---------- in-page anchors: render skipped (content-visibility) sections first so the jump lands exactly ---------- */
  d.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href*="#"]');if(a&&a.hash&&a.pathname===location.pathname)root.classList.add('cv-off')},true);
  addEventListener('hashchange',function(){root.classList.add('cv-off')});

  /* ---------- click-to-load YouTube + Google Maps ---------- */
  $$('.video[data-yt]').forEach(function(v){v.addEventListener('click',function(){var f=d.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.dataset.yt)+'?autoplay=1&rel=0';f.title=v.getAttribute('aria-label')||'Video';f.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';f.allowFullscreen=true;v.appendChild(f);var p=v.querySelector('.play');if(p)p.remove()},{once:true})});
  $$('.map-facade[data-map]').forEach(function(m){m.addEventListener('click',function(){var f=d.createElement('iframe');f.src='https://www.google.com/maps?q='+encodeURIComponent(m.dataset.map)+'&output=embed';f.title=m.getAttribute('aria-label')||'Map';f.loading='lazy';f.referrerPolicy='no-referrer-when-downgrade';m.innerHTML='';m.appendChild(f)},{once:true})});

  /* ---------- staggered scroll reveal ---------- */
  // staggered groups: CSS hides the children (see .stagger rules); the group gets .in when it scrolls into view
  var STAG='.pillars,.trust-grid,.photo-strip,.counters,.steps,.wp-block-gallery.gallery,.spec-grid,.loc-list,.amen,.pdf-list';
  function done(el){el.classList.add('in');var grp=el.matches(STAG);setTimeout(function(){if(grp){el.classList.remove('reveal');el.classList.add('settled')}else{el.classList.remove('reveal','in','d1','d2','d3')}},grp?2200:1700)}
  var els=$$('.reveal').concat($$(STAG));
  if(!reduce&&'IntersectionObserver' in W){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){done(e.target);io.unobserve(e.target)}})},{rootMargin:'0px 0px -8% 0px',threshold:.01});els.forEach(function(el){io.observe(el)})}
  else{els.forEach(function(el){el.classList.add('in')})}
  function inView(el,fn,opt){if(!('IntersectionObserver' in W)){fn();return}var o=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){fn();o.disconnect()}})},opt||{threshold:.3});o.observe(el)}

  /* ---------- hero: slideshow (or background video), Ken Burns, parallax ---------- */
  var hero=$('.hero');
  if(hero){
    var vid=$('.hero-video video',hero),slides=$$('.hero-slides>figure',hero);
    if(vid){hero.classList.add('has-video');
      // poster <img> is the LCP + fallback; the video only loads for full-motion users on decent connections
      var cn=navigator.connection||{},slow=cn.saveData||/(^|-)2g|3g/.test(cn.effectiveType||'');
      if(reduce||slow){vid.removeAttribute('autoplay');try{vid.pause()}catch(e){}}
      else{
        var vis=true,ready=false,fig=vid.parentNode;
        var play=function(){if(!ready||!vis||d.hidden)return;var pr=vid.play();if(pr&&pr.catch)pr.catch(function(){})};
        var boot=function(){var sm=vid.dataset.srcSm,src=(sm&&W.matchMedia('(max-width: 900px)').matches)?sm:(vid.dataset.src||vid.currentSrc);if(!src)return;
          vid.muted=true;vid.defaultMuted=true;vid.preload='auto';
          vid.addEventListener('playing',function(){fig.classList.add('is-playing')},{once:true});
          vid.addEventListener('canplay',function(){ready=true;play()},{once:true});
          if(vid.dataset.src){vid.src=src;vid.load()}else{ready=true;play()}};
        if('IntersectionObserver' in W){new IntersectionObserver(function(es){vis=es[0].isIntersecting;if(vis)play();else vid.pause()},{threshold:.05}).observe(hero)}
        d.addEventListener('visibilitychange',function(){if(d.hidden)vid.pause();else play()});
        var go2=function(){(W.requestIdleCallback||setTimeout)(boot,{timeout:1500})};
        if(d.readyState==='complete')go2();else W.addEventListener('load',go2);
      }
    }
    else if(slides.length>1&&!reduce){
      var cur=0,timer;
      var load=function(f){var im=$('img',f);if(im&&im.dataset.src){if(im.dataset.srcset){im.srcset=im.dataset.srcset;im.removeAttribute('data-srcset')}im.src=im.dataset.src;im.removeAttribute('data-src')}return im};
      var go=function(n){var a=slides[cur],b=slides[n];var im=load(b);var swap=function(){a.classList.remove('is-on');a.classList.add('was-on');b.classList.remove('was-on');b.classList.add('is-on');setTimeout(function(){a.classList.remove('was-on')},2000);cur=n;load(slides[(n+1)%slides.length])};
        if(im&&!im.complete){im.addEventListener('load',swap,{once:true})}else swap()};
      var start=function(){load(slides[1]);hero.querySelector('.hero-slides').classList.add('run');slides[0].classList.add('is-on');
        timer=setInterval(function(){if(d.hidden)return;go((cur+1)%slides.length)},6500)};
      W.addEventListener('load',function(){setTimeout(start,2500)});
    }
  }
  if(!reduce){var px=$$('.hero .hero-slides,.hero .hero-video,.page-hero .hero-media');
    if(px.length)scrollFns.push(function(y){px.forEach(function(el){var h=el.parentNode.offsetHeight;if(y<h)el.style.transform='translate3d(0,'+(y*.28).toFixed(1)+'px,0)'})});}

  /* ---------- animated counters (numbers count up; [placeholder] values get a digit-roll) ---------- */
  $$('.counter-num').forEach(function(el){
    if(reduce)return;
    inView(el,function(){
      var txt=el.textContent.trim(),m=txt.match(/^(\D*)([\d,.]+)(\D*)$/),target=m?parseFloat(m[2].replace(/,/g,'')):0;
      if(!(m&&target>0)){el.classList.add('counted');return} // placeholders like [00+] are never animated into fake-looking figures
      var span=d.createElement('span');span.setAttribute('aria-hidden','true');span.textContent=txt;
      var sr=d.createElement('span');sr.className='sr-only';sr.textContent=txt;el.textContent='';el.appendChild(span);el.appendChild(sr);
      var t0=performance.now(),dur=1600;el.classList.add('counting');
      (function f(t){var k=clamp((t-t0)/dur,0,1),e=1-Math.pow(1-k,3);
        if(m&&target>0){var v=Math.round(target*e);span.textContent=m[1]+v.toLocaleString('en-US')+m[3]}
        if(k<1)requestAnimationFrame(f);else{span.textContent=txt;el.classList.remove('counting');el.classList.add('counted')}})(t0)});
  });

  /* ---------- step timeline + Texas route: progress tied to scroll ---------- */
  var tl=$$('.steps'),routes=$$('.tx-wrap');
  if(reduce){tl.forEach(function(s){s.style.setProperty('--p',1);$$('.step',s).forEach(function(x){x.classList.add('on')})});routes.forEach(function(r){r.classList.add('drawn')})}
  else if(tl.length||routes.length){
    scrollFns.push(function(){var vh=W.innerHeight,tr=tl.map(function(s){return s.getBoundingClientRect()}),rr=routes.map(function(w){return w.getBoundingClientRect()});
      tl.forEach(function(s,k){var r=tr[k],p=clamp((vh*.78-r.top)/(r.height+vh*.15),0,1);s.style.setProperty('--p',p.toFixed(3));
        $$('.step',s).forEach(function(x,i,a){x.classList.toggle('on',p>=(i+.25)/a.length||p>=.98)})});
      routes.forEach(function(w,k){var r=rr[k],p=clamp((vh*.9-r.top)/(r.height*.75),0,1);w.style.setProperty('--draw',(1-p).toFixed(3));w.classList.toggle('drawn',p>=1)})});
  }

  /* ---------- gallery filters ---------- */
  var gf=$('.gal-filters');
  if(gf){var gal=$('.wp-block-gallery.masonry'),status=$('.gal-status');
    gf.addEventListener('click',function(e){var b=e.target.closest('.gf-btn');if(!b||!gal)return;var f=b.dataset.filter;
      $$('.gf-btn',gf).forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
      var n=0;$$('.wp-block-image',gal).forEach(function(fig,i){var show=f==='all'||fig.classList.contains('cat-'+f);fig.hidden=!show;fig.classList.remove('gf-in');
        if(show){n++;if(!reduce){void fig.offsetWidth;fig.style.animationDelay=Math.min(n,12)*30+'ms';fig.classList.add('gf-in')}}});
      if(status)status.textContent='Showing '+n+' photos'+(f==='all'?'':': '+b.firstChild.textContent.trim())});
  }

  /* ---------- accessible lightbox (keyboard, swipe, focus trap) ---------- */
  var lb,lbImg,lbCap,lbCount,items=[],idx=0,opener;
  function buildLb(){lb=d.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','Photo viewer');lb.hidden=true;
    var ic=function(p){return '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+p+'" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'};
    lb.innerHTML='<figure class="lb-stage"><img class="lb-img" alt=""><figcaption class="lb-cap"><span class="lb-count"></span><span class="lb-alt"></span></figcaption></figure>'+
      '<button type="button" class="lb-btn lb-close" aria-label="Close photo viewer">'+ic('M6 6l12 12M18 6L6 18')+'</button>'+
      '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">'+ic('M15 5l-7 7 7 7')+'</button>'+
      '<button type="button" class="lb-btn lb-next" aria-label="Next photo">'+ic('M9 5l7 7-7 7')+'</button>';
    d.body.appendChild(lb);lbImg=$('.lb-img',lb);lbCap=$('.lb-alt',lb);lbCount=$('.lb-count',lb);
    $('.lb-close',lb).addEventListener('click',closeLb);$('.lb-prev',lb).addEventListener('click',function(){show(idx-1)});$('.lb-next',lb).addEventListener('click',function(){show(idx+1)});
    lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
    lb.addEventListener('keydown',function(e){if(e.key==='Escape'){e.preventDefault();closeLb()}else if(e.key==='ArrowRight'){show(idx+1)}else if(e.key==='ArrowLeft'){show(idx-1)}
      else if(e.key==='Tab'){var f=$$('.lb-btn',lb).filter(function(b){return !b.hidden}),a=f[0],z=f[f.length-1];if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}}});
    var sx=null,sy=0;lb.addEventListener('pointerdown',function(e){sx=e.clientX;sy=e.clientY},{passive:true});
    lb.addEventListener('pointerup',function(e){if(sx===null)return;var dx=e.clientX-sx,dy=e.clientY-sy;sx=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){show(idx+(dx<0?1:-1))}},{passive:true});
  }
  function show(i){var n=items.length;idx=(i+n)%n;var a=items[idx],im=$('img',a);lb.classList.remove('lb-in');void lb.offsetWidth;
    lbImg.src=a.getAttribute('href');lbImg.alt=im?im.alt:'';lbCap.textContent=im?im.alt:'';lbCount.textContent=(idx+1)+' / '+n;lb.classList.add('lb-in');
    $('.lb-prev',lb).hidden=$('.lb-next',lb).hidden=n<2;
    [idx+1,idx-1].forEach(function(j){var x=items[(j+n)%n];if(x){var p=new Image();p.src=x.getAttribute('href')}})}
  function openLb(a){if(!lb)buildLb();var g=a.closest('.afd-lb');items=$$('a',g).filter(function(x){var f=x.closest('figure');return x.querySelector('img')&&!(f&&f.hidden)});
    opener=a;show(items.indexOf(a));lb.hidden=false;d.body.classList.add('lb-open');var s=$('.wp-site-blocks');if(s)s.inert=true;$('.lb-close',lb).focus()}
  function closeLb(){lb.hidden=true;d.body.classList.remove('lb-open');var s=$('.wp-site-blocks');if(s)s.inert=false;if(opener)opener.focus()}
  d.addEventListener('click',function(e){var a=e.target.closest('.afd-lb a');if(!a||!a.querySelector('img')||e.ctrlKey||e.metaKey||e.shiftKey)return;e.preventDefault();openLb(a)});
  $$('.afd-lb a').forEach(function(a){var im=$('img',a);if(im&&!a.hasAttribute('aria-label'))a.setAttribute('aria-label','Open larger photo: '+im.alt)});

  /* ---------- multi-step quote form (Contact Form 7 underneath) ---------- */
  var MSG={req:'Please fill out this field.',email:'Please enter an email address.',tel:'Please enter a telephone number.'};
  $$(".wpcf7 form").forEach(function(form){inView(form,function(){
    var steps=$$('.fstep',form);if(steps.length<2)return;
    form.classList.add('ms');var cur=0,uid='fs'+Math.random().toString(36).slice(2,7);
    var prog=d.createElement('div');prog.className='fprog';
    prog.innerHTML='<ol>'+steps.map(function(s,i){return '<li><span class="fprog-n" aria-hidden="true">'+(i+1)+'</span><span class="fprog-t">'+s.dataset.title+'</span></li>'}).join('')+'</ol><div class="fprog-bar" aria-hidden="true"><span></span></div><p class="sr-only" aria-live="polite"></p>';
    var wrap=$('.fsteps',form);wrap.parentNode.insertBefore(prog,wrap);
    var foot=$('.form-foot',form),submit=$('[type=submit]',form);
    var back=d.createElement('button');back.type='button';back.className='btn btn-outline fback';back.textContent='Back';
    var next=d.createElement('button');next.type='button';next.className='btn fnext';next.innerHTML='Next <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    foot.insertBefore(back,foot.firstChild);foot.appendChild(next);
    function go(n,focus){cur=clamp(n,0,steps.length-1);steps.forEach(function(s,i){var on=i===cur;s.hidden=!on;s.classList.toggle('is-active',on)});
      $$('li',prog).forEach(function(li,i){li.classList.toggle('done',i<cur);li.classList.toggle('cur',i===cur);if(i===cur)li.setAttribute('aria-current','step');else li.removeAttribute('aria-current')});
      $('.fprog-bar span',prog).style.transform='scaleX('+((cur+1)/steps.length)+')';
      $('p',prog).textContent='Step '+(cur+1)+' of '+steps.length+': '+steps[cur].dataset.title;
      back.hidden=cur===0;next.hidden=cur===steps.length-1;submit.hidden=cur!==steps.length-1;foot.classList.toggle('first',cur===0);
      if(focus){var r=form.getBoundingClientRect();if(r.top<70)W.scrollTo({top:W.scrollY+r.top-110,behavior:reduce?'auto':'smooth'});var f=$('input:not([type=hidden]):not([type=file]),textarea,select',steps[cur]);if(f)f.focus({preventScroll:true})}}
    function tip(el,msg){var w=el.closest('.wpcf7-form-control-wrap')||el.parentNode;var t=$('.wpcf7-not-valid-tip',w);if(!t){t=d.createElement('span');t.className='wpcf7-not-valid-tip';t.id=uid+'-'+(el.id||el.name);w.appendChild(t)}
      t.textContent=msg;el.classList.add('wpcf7-not-valid');el.setAttribute('aria-invalid','true');el.setAttribute('aria-describedby',t.id)}
    function clear(el){var w=el.closest('.wpcf7-form-control-wrap')||el.parentNode;var t=$('.wpcf7-not-valid-tip',w);if(t)t.remove();el.classList.remove('wpcf7-not-valid');el.setAttribute('aria-invalid','false')}
    function valid(i){var ok=true,first=null;$$('input,textarea,select',steps[i]).forEach(function(el){if(el.type==='hidden'||el.type==='file')return;var v=(el.value||'').trim(),msg='';
        if(el.getAttribute('aria-required')==='true'&&!v)msg=MSG.req;
        else if(v&&el.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))msg=MSG.email;
        else if(v&&el.type==='tel'&&(v.replace(/\D/g,'').length<7))msg=MSG.tel;
        if(msg){tip(el,msg);ok=false;if(!first)first=el}else clear(el)});
      if(first)first.focus();return ok}
    next.addEventListener('click',function(){if(valid(cur))go(cur+1,true)});
    back.addEventListener('click',function(){go(cur-1,true)});
    form.addEventListener('input',function(e){if(e.target.classList.contains('wpcf7-not-valid')&&e.target.value.trim())clear(e.target)});
    form.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName==='INPUT'&&e.target.type!=='submit'&&cur<steps.length-1){e.preventDefault();next.click()}});
    form.addEventListener('submit',function(e){if(!valid(cur)){e.preventDefault();e.stopImmediatePropagation()}},true);
    var wpc=form.closest('.wpcf7');
    wpc.addEventListener('wpcf7invalid',function(){var bad=$('.wpcf7-not-valid',form);if(bad){var s=bad.closest('.fstep');var i=steps.indexOf(s);if(i>-1&&i!==cur){go(i);bad.focus()}}});
    wpc.addEventListener('wpcf7mailsent',function(){go(0)});
    go(0);
  },{rootMargin:"800px 0px"})});

  /* ---------- load Contact Form 7 scripts on demand (see functions.php) ---------- */
  var lazy=$$('script[data-afd-lazy]'),cf7Loaded=false;
  function loadCf7(){if(cf7Loaded||!lazy.length)return;cf7Loaded=true;var i=0;
    (function next(){if(i>=lazy.length){d.dispatchEvent(new Event('DOMContentLoaded'));return}
      var o=lazy[i++],s=d.createElement('script');if(o.id)s.id=o.id;
      if(o.dataset.src){s.src=o.dataset.src;s.async=false;s.onload=s.onerror=next;o.parentNode.insertBefore(s,o);o.remove()}
      else{s.text=o.text;o.parentNode.insertBefore(s,o);o.remove();next()}})();}
  var forms=$$('.wpcf7');
  if(forms.length&&lazy.length){
    if('IntersectionObserver' in W){var fio=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting})){fio.disconnect();loadCf7()}},{rootMargin:'900px 0px'});forms.forEach(function(f){fio.observe(f)})}else loadCf7();
    d.addEventListener('focusin',function(e){if(e.target.closest&&e.target.closest('.wpcf7'))loadCf7()});
  }

  /* ---------- upload boxes: show chosen file name ---------- */
  $$('.file-hint').forEach(function(h){h.dataset.def=h.textContent});
  $$('.file input[type=file]').forEach(function(fi){var box=fi.closest('.file'),hint=box&&box.querySelector('.file-hint');if(!hint)return;fi.addEventListener('change',function(){hint.textContent=fi.files.length?fi.files[0].name:hint.dataset.def})});
  d.addEventListener('wpcf7mailsent',function(e){$$('.file-hint',e.target).forEach(function(h){h.textContent=h.dataset.def})});
  onScroll();
})();
