/* ==========================================================================
   Noctis Architect — page behaviour
   • language switch (soft dissolve, fonts pre-loaded, scroll position kept)
   • theme switch (circular reveal via View Transitions, graceful fallback)
   • curtain transition between the real pages
   • scroll reveals, header state, card tilt, project filter
   ========================================================================== */
(function () {
  'use strict';

  var D = document, H = D.documentElement, B = D.body;
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var I = window.NX_I18N || { en: {}, fa: {} };
  var Scene = window.NXScene || { init: function () {}, start: function () {}, measure: function () {}, zone: function () {}, theme: function () {}, dir: function () {}, dive: function () {}, setPage: function () {} };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var page = B.getAttribute('data-page') || 'home';
  var lang = H.lang === 'fa' ? 'fa' : 'en';
  var theme = H.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

  var EASE_IO = 'cubic-bezier(.65,0,.35,1)';
  var EASE_OUT = 'cubic-bezier(.16,1,.3,1)';
  var EASE_CURTAIN = 'cubic-bezier(.76,0,.24,1)';

  var sleep = function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); };
  var store = function (k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; };
  var t = function (k) { var d = I[lang]; return (d && d[k] !== undefined) ? d[k] : (I.en[k] || ''); };
  var finished = function (a) { return a.finished.catch(function () {}); };

  /* the 3D cluster must sit in the empty space next to / under the first block of text (measured, not guessed) */
  function measure() {
    var el = $('.ht') || $('.ib');
    if (el) {
      var r = el.getBoundingClientRect(), top = r.bottom + (window.pageYOffset || 0) + 14;
      var nav = $('.mnav'), navShown = nav && getComputedStyle(nav).display !== 'none';
      var box = el.closest('.hero, .intro'), end = box ? box.getBoundingClientRect().bottom + (window.pageYOffset || 0) - 10 : 1e9;
      Scene.zone(top, Math.min(end, (navShown ? nav.getBoundingClientRect().top : window.innerHeight - 16) - 10));
    }
    Scene.measure();
  }

  /* ------------------------------------------------------------ headings: word masks */
  function splitHeading(el) {
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g, ' ').trim());
    var j = 0;
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var f = D.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (s) {
            if (!s) return;
            if (!s.trim()) { f.appendChild(D.createTextNode(s)); return; }
            var o = D.createElement('span'), i = D.createElement('span');
            o.className = 'w'; o.setAttribute('aria-hidden', 'true');
            i.textContent = s; i.style.setProperty('--j', j++);
            o.appendChild(i); f.appendChild(o);
          });
          c.parentNode.replaceChild(f, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(el);
  }

  /* ------------------------------------------------------------ translations */
  function applyText(first) {
    var skipSwap = first && lang === 'en';              // English is already in the markup
    $$('[data-i]').forEach(function (el) {
      if (!skipSwap) { var v = t(el.getAttribute('data-i')); if (v) el.innerHTML = v; }
      if (el.classList.contains('hd')) splitHeading(el);
    });
    $$('[data-i-aria]').forEach(function (el) { el.setAttribute('aria-label', t(el.getAttribute('data-i-aria'))); });
    if (page !== 'project') {                            // project pages carry their own title/description
      D.title = t('t_' + page) || D.title;
      var desc = t('d_' + page);
      [['meta[name="description"]', 'content'], ['meta[property="og:title"]', 'content'], ['meta[property="og:description"]', 'content']].forEach(function (p, n) {
        var m = $(p[0]); if (!m) return;
        var v = n === 1 ? D.title : desc;
        if (v) m.setAttribute(p[1], v);
      });
    }
    var lb = $('#lg span'); if (lb) lb.textContent = lang === 'fa' ? 'EN' : 'FA';
  }

  function commitLang(next) {
    lang = next; store('nx-lang', lang);
    H.lang = lang; H.dir = lang === 'fa' ? 'rtl' : 'ltr';
    applyText(false);
    Scene.dir(lang === 'fa');
    initNavPill(true);
  }

  /* Download the faces we are about to need so the swap never flashes a fallback font */
  function ensureFonts(l) {
    if (!D.fonts || !D.fonts.load) return Promise.resolve();
    var faces = l === 'fa'
      ? ['300 1em Vazirmatn', '400 1em Vazirmatn', '800 1em Vazirmatn']
      : ['400 1em Inter', '600 1em Inter', '400 1em "Instrument Serif"', 'italic 400 1em "Instrument Serif"'];
    var sample = l === 'fa' ? 'آبپچژگکی۰۱۲۳' : 'Aa';
    return Promise.race([
      Promise.all(faces.map(function (f) { return D.fonts.load(f, sample); })),
      sleep(1800)
    ]).catch(function () {});
  }

  /* ------------------------------------------------------------ language switch */
  var busy = false;

  function visibleLeaves() {
    var vh = window.innerHeight, list = [];
    $$('main [data-i]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > vh) return;
      list.push({ el: el, top: r.top });
    });
    list.sort(function (a, b) { return a.top - b.top; });
    return list.map(function (x) { return x.el; });
  }
  function chrome() { return [$('.hdr'), $('main'), $('footer'), $('.mnav')].filter(Boolean); }

  function dissolveOut() {
    var anims = chrome().map(function (el) {
      return el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 460, easing: EASE_IO, fill: 'forwards' });
    });
    visibleLeaves().forEach(function (el, i) {
      anims.push(el.animate(
        [{ opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }, { opacity: 0, filter: 'blur(10px)', transform: 'translateY(-10px)' }],
        { duration: 400, delay: Math.min(i * 14, 180), easing: EASE_IO, fill: 'forwards' }));
    });
    return anims;
  }
  function dissolveIn() {
    var anims = chrome().map(function (el) {
      return el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'cubic-bezier(.33,0,.2,1)', fill: 'backwards' });
    });
    visibleLeaves().forEach(function (el, i) {
      anims.push(el.animate(
        [{ opacity: 0, filter: 'blur(14px)', transform: 'translateY(16px)' }, { opacity: 1, filter: 'blur(0px)', transform: 'translateY(0)' }],
        { duration: 1100, delay: Math.min(i * 40, 640), easing: EASE_OUT, fill: 'backwards' }));
    });
    return anims;
  }

  /* keep whatever the reader was looking at in the same place after the layout flips */
  function anchorCapture() {
    if ((window.pageYOffset || 0) < 12) return null;
    var y = window.innerHeight * 0.38, els = $$('main [data-anchor]');
    for (var i = 0; i < els.length; i++) {
      var r = els[i].getBoundingClientRect();
      if (r.top <= y && r.bottom > y) return { el: els[i], f: (y - r.top) / Math.max(1, r.height), y: y };
    }
    return null;
  }
  function anchorRestore(a) {
    if (!a) return;
    var r = a.el.getBoundingClientRect(), d = r.top + a.f * r.height - a.y;
    if (Math.abs(d) > 1) window.scrollBy(0, d);
  }

  async function switchLang() {
    if (busy || navigating) return;
    busy = true;
    var next = lang === 'fa' ? 'en' : 'fa';
    var fonts = ensureFonts(next);
    var btn = $('#lg');

    if (reduce.matches) {
      await fonts; commitLang(next); measure(); busy = false; return;
    }

    if (btn) btn.classList.add('sw');
    var outs = dissolveOut();
    await Promise.all(outs.map(finished).concat([fonts]));

    var anchor = anchorCapture();
    commitLang(next);                         // text, lang, dir, title, 3D mirror
    if (btn) btn.classList.remove('sw');
    anchorRestore(anchor);
    measure();
    initNavPill(true);

    var ins = dissolveIn();                   // start the fade-in first …
    outs.forEach(function (a) { a.cancel(); });   // … then drop the old hold, in the same task → no frame in between
    await Promise.all(ins.map(finished));
    initNavPill(true);
    busy = false;
  }

  /* ------------------------------------------------------------ theme switch
     the old theme is painted over the page and then dissolves away from the toggle,
     so the new theme is already in place underneath — nothing ever goes blank.
     the content settles back from a soft zoom/blur and a thin accent ring rides the edge. */
  var theming = false;
  var mqLight = window.matchMedia('(prefers-color-scheme: light)');
  function systemTheme() { return mqLight.matches ? 'light' : 'dark'; }
  function paintTheme(next) {
    theme = next; H.setAttribute('data-theme', next);
    var m = $('meta[name="theme-color"]'); if (m) m.setAttribute('content', next === 'light' ? '#f2ede3' : '#0d0e11');
    Scene.theme();
  }
  function applyTheme(next) { paintTheme(next); store('nx-theme', next); }
  /* follow the OS until the reader picks a theme themselves */
  function followSystemTheme() {
    if (store('nx-theme') === 'light' || store('nx-theme') === 'dark') return;
    if (systemTheme() !== theme) paintTheme(systemTheme());
  }
  function onTheme() {
    if (theming) return;
    var next = theme === 'dark' ? 'light' : 'dark';
    if (reduce.matches) { applyTheme(next); return; }

    theming = true;
    var r = this.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) * 1.12;

    var ov = D.createElement('div');
    ov.className = 'tsw';
    ov.style.background = theme === 'light' ? '#f2ede3' : '#0d0e11';
    ov.style.setProperty('--tx', x + 'px');
    ov.style.setProperty('--ty', y + 'px');
    ov.style.setProperty('--tw', '0px');
    B.appendChild(ov);

    var ring = D.createElement('div');
    ring.className = 'tsr';
    ring.style.setProperty('--tx', x + 'px');
    ring.style.setProperty('--ty', y + 'px');
    ring.style.setProperty('--td', (rad * 2) + 'px');
    B.appendChild(ring);

    applyTheme(next);

    [$('.hdr'), $('main'), $('footer'), $('.mnav')].filter(Boolean).forEach(function (el) {
      el.animate(
        [{ opacity: .45, transform: 'scale(1.018)', filter: 'blur(6px)' }, { opacity: 1, transform: 'scale(1)', filter: 'blur(0px)' }],
        { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    });

    requestAnimationFrame(function () {
      ov.style.transition = '--tw 900ms cubic-bezier(.65,0,.35,1)';
      ov.style.setProperty('--tw', rad + 'px');
      ring.animate(
        [{ transform: 'translate(-50%,-50%) scale(.2)', opacity: .9 }, { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }],
        { duration: 900, easing: 'cubic-bezier(.65,0,.35,1)', fill: 'forwards' });
    });
    setTimeout(function () { ov.remove(); ring.remove(); theming = false; }, 980);
  }

  /* ------------------------------------------------------------ portal between pages
     Seamless SPA portal:
     leaving : camera dives INTO wireframe, page zooms out, curtain closes over it
     arriving: DOM swaps in-memory, camera pulls back OUT of new solid, curtain lifts */
  var CV = $('#cv');
  var navigating = false, prefetched = {}, pageCache = {};

  async function fetchPage(url) {
    var cleanUrl = url.split('#')[0];
    if (pageCache[cleanUrl]) return pageCache[cleanUrl];
    try {
      var res = await fetch(cleanUrl);
      if (!res.ok) return null;
      var html = await res.text();
      var parser = new DOMParser();
      var doc = parser.parseFromString(html, 'text/html');
      pageCache[cleanUrl] = doc;
      return doc;
    } catch (e) {
      return null;
    }
  }

  function prefetch(url) {
    var cleanUrl = url.split('#')[0];
    if (prefetched[cleanUrl]) return;
    prefetched[cleanUrl] = 1;
    fetchPage(cleanUrl);
  }

  function resetPortal() {
    navigating = false;
    [CV].concat(chrome()).forEach(function (el) { if (el) el.getAnimations().forEach(function (a) { a.cancel(); }); });
    var m = $('main'); if (m) { m.style.transformOrigin = ''; m.getAnimations().forEach(function (a) { a.cancel(); }); }
    var gl = $('#gl'); if (gl) gl.style.zIndex = '';
    if (CV) CV.classList.remove('on');
    H.classList.remove('nx');
    Scene.dive(0, 0);
  }

  async function leavePage(url, push) {
    if (navigating || busy) return;
    navigating = true;

    var cleanUrl = url.split('#')[0];
    var docPromise = fetchPage(cleanUrl);

    var main = $('main'), y = main ? window.innerHeight * 0.5 - main.getBoundingClientRect().top : 0;
    var curtainDelay = 140;
    var curtainDur = 520;
    var navAt = curtainDelay + curtainDur + 30;

    Scene.dive(1, navAt, 'in');
    if (main) {
      main.style.transformOrigin = '50% ' + y + 'px';
      main.animate(
        [{ transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }, { transform: 'scale(1.10)', opacity: 0, filter: 'blur(10px)' }],
        { duration: navAt - 20, easing: EASE_IO, fill: 'forwards' }
      );
    }
    if (CV) {
      CV.classList.add('on');
      CV.animate([{ opacity: 0 }, { opacity: 1 }], { duration: curtainDur, delay: curtainDelay, easing: EASE_CURTAIN, fill: 'forwards' });
    }

    var doc = await docPromise;
    await sleep(navAt);

    if (!doc) {
      try { sessionStorage.setItem('nx-nav', '1'); } catch (e) {}
      window.location.href = url;
      return;
    }

    // --- SWAP UNDER THE CLOSED CURTAIN ---
    var newPage = doc.body.getAttribute('data-page') || 'home';
    page = newPage;
    B.setAttribute('data-page', page);

    if (push !== false && history.pushState) {
      history.pushState({ page: page, url: url }, '', url);
    }

    var newMain = doc.querySelector('main');
    if (main && newMain) {
      main.innerHTML = newMain.innerHTML;
      main.className = newMain.className;
      main.style.transformOrigin = '';
      main.style.opacity = '0';
    }

    window.scrollTo(0, 0);

    // Update primary nav and mobile nav active states
    $$('.nv a, .mnav a').forEach(function (link) {
      var p = link.getAttribute('data-p');
      if (p === page) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
      link.classList.remove('nx-to', 'nx-go', 'nx-on', 'nx-rev');
    });

    // Update relative hrefs on header links if navigating between root and projects/
    var isProject = page === 'project';
    var prefix = isProject ? '../' : '';
    $$('.nv a, .mnav a').forEach(function (link) {
      var p = link.getAttribute('data-p');
      if (p === 'home') link.setAttribute('href', prefix + 'index.html');
      else if (p === 'work') link.setAttribute('href', prefix + 'work.html');
      else if (p === 'about') link.setAttribute('href', prefix + 'about.html');
      else if (p === 'contact') link.setAttribute('href', prefix + 'contact.html');
    });
    var brand = $('.brand');
    if (brand) brand.setAttribute('href', prefix + 'index.html');

    // Update title
    D.title = doc.title || D.title;

    // Apply translations
    applyText(false);

    // Update 3D wireframe solid for new page
    if (Scene.setPage) Scene.setPage(page);

    // Reposition nav pill
    initNavPill(true);

    // Re-bind work filters
    initFilter();
    measure();

    // Prepare scroll reveals
    startReveal();

    // --- REVEAL NEW PAGE ---
    var gl = $('#gl');
    if (gl) gl.style.zIndex = '35';
    Scene.dive(0, 1000, 'out');

    if (main) {
      main.style.opacity = '';
      main.animate(
        [{ transform: 'scale(1.04)', opacity: 0, filter: 'blur(8px)' }, { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }],
        { duration: 820, easing: EASE_OUT, fill: 'forwards' }
      );
    }
    if (CV) {
      CV.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 680, delay: 60, easing: EASE_IO, fill: 'forwards' });
    }

    await sleep(740);
    if (CV) {
      CV.getAnimations().forEach(function (a) { a.cancel(); });
      CV.classList.remove('on');
    }
    if (main) main.getAnimations().forEach(function (a) { a.cancel(); });
    H.classList.remove('nx');
    if (gl) gl.style.zIndex = '';
    navigating = false;
    measure();
    initNavPill(true);
  }

  async function arrive() {
    var main = $('main');
    var gl = $('#gl');
    if (gl) gl.style.zIndex = '35';
    Scene.dive(0, 1100, 'out');
    if (main) {
      main.animate(
        [{ transform: 'scale(1.04)', opacity: 0, filter: 'blur(8px)' }, { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }],
        { duration: 920, easing: EASE_OUT, fill: 'both' }
      );
    }
    if (CV) {
      CV.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 780, delay: 100, easing: EASE_IO, fill: 'forwards' });
    }
    await sleep(160);
    startReveal();
    await sleep(820);
    if (CV) {
      CV.getAnimations().forEach(function (a) { a.cancel(); });
      CV.classList.remove('on');
    }
    if (main) main.getAnimations().forEach(function (a) { a.cancel(); });
    H.classList.remove('nx');
    if (gl) gl.style.zIndex = '';
    navigating = false;
  }

  /* ------------------------------------------------------------ scroll reveals */
  var io = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  }
  function startReveal() {
    H.classList.add('ready');
    $$('.r, .hd').forEach(function (el) { if (io) io.observe(el); else el.classList.add('in'); });
  }

  /* ------------------------------------------------------------ first-load intro */
  var intro = $('#intro');
  var introOn = !!intro && H.classList.contains('intro-run');
  var introCount = intro && $('.iv-count', intro);
  var introRaf = 0;
  if (intro) {
    var glyph = $('.iv-glyph', intro);
    var brandMark = $('.brand svg');
    if (glyph && brandMark) glyph.appendChild(brandMark.cloneNode(true));

    // each glyph of the wordmark gets its own mask so it can rise in on its own beat
    var word = $('.iv-word', intro);
    if (word) {
      var text = word.textContent.replace(/\s+/g, ' ').trim();
      word.textContent = '';
      Array.prototype.forEach.call(text, function (ch, i) {
        if (ch === ' ') { word.appendChild(D.createTextNode(' ')); return; }
        var box = D.createElement('span'), inner = D.createElement('i');
        box.className = 'iv-ch';
        box.style.setProperty('--n', i);
        inner.textContent = ch;
        box.appendChild(inner);
        word.appendChild(box);
      });
      word.classList.add('split');
    }
  }

  function introCountUp() {
    if (!introCount || !introOn) return;
    var t0 = 0, dur = 1100;
    var tick = function (now) {
      if (!t0) t0 = now;
      var p = Math.min(1, (now - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      introCount.textContent = String(Math.round(eased * 100)).padStart(3, '0');
      if (p < 1 && introOn) introRaf = requestAnimationFrame(tick);
    };
    introRaf = requestAnimationFrame(tick);
  }

  function introExit() {
    if (!introOn) return;
    introOn = false;
    cancelAnimationFrame(introRaf);
    if (introCount) introCount.textContent = '100';

    // let the page and the wireframe develop behind the still-opaque sheet,
    // then open the lens so the wipe lands on a finished frame
    Scene.start();
    startReveal();
    [$('.hdr'), $('.mnav')].filter(Boolean).forEach(function (el) {
      var y = el.classList.contains('mnav') ? 14 : -10;
      el.animate(
        [{ opacity: 0, transform: 'translateY(' + y + 'px)' }, { opacity: 1, transform: 'none' }],
        { duration: 800, delay: 60, easing: EASE_OUT, fill: 'backwards' }
      );
    });

    setTimeout(function () { H.classList.add('intro-out'); }, 240);

    setTimeout(function () {
      H.classList.remove('intro-run', 'intro-in', 'intro-out');
      if (intro && intro.parentNode) intro.remove();
    }, 240 + 1060);
  }

  /* ------------------------------------------------------------ header + progress */
  var hdr = $('.hdr'), pg = $('#pg'), ticking = false;
  function onScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      var y = window.pageYOffset || 0, m = H.scrollHeight - window.innerHeight;
      pg.style.transform = 'scaleX(' + (m > 0 ? Math.min(1, y / m) : 0) + ')';
      hdr.classList.toggle('sc', y > 24);
    });
  }

  /* ------------------------------------------------------------ card tilt */
  var tiltEl = null, tiltRaf = 0;
  function tiltReset(c) { c.classList.remove('tilting'); ['--rx', '--ry', '--ty'].forEach(function (p) { c.style.removeProperty(p); }); }
  function onPointerMove(e) {
    if (e.pointerType === 'touch' || reduce.matches) return;
    var c = e.target.closest && e.target.closest('.card');
    if (!c) { if (tiltEl) { tiltReset(tiltEl); tiltEl = null; } return; }
    if (tiltEl && tiltEl !== c) tiltReset(tiltEl);
    tiltEl = c;
    var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(tiltRaf);
    tiltRaf = requestAnimationFrame(function () {
      c.classList.add('tilting');
      c.style.setProperty('--ry', ((x - 0.5) * 9).toFixed(2) + 'deg');
      c.style.setProperty('--rx', (-(y - 0.5) * 9).toFixed(2) + 'deg');
      c.style.setProperty('--ty', '-6px');
      c.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      c.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
  }
  function onPointerOut(e) {
    var c = e.target.closest && e.target.closest('.card');
    if (c && !c.contains(e.relatedTarget)) { cancelAnimationFrame(tiltRaf); tiltReset(c); if (tiltEl === c) tiltEl = null; }
  }

  /* ------------------------------------------------------------ nav pill — one sliding highlight, readable ink on top */
  function navMetrics(nav, link) {
    var nr = nav.getBoundingClientRect(), br = link.getBoundingClientRect();
    return { x: br.left - nr.left, y: br.top - nr.top, w: br.width, h: br.height };
  }
  function ensureNavPill(nav) {
    var pill = nav.querySelector('.nv-pill');
    if (!pill) {
      pill = D.createElement('span');
      pill.className = 'nv-pill';
      pill.setAttribute('aria-hidden', 'true');
      nav.insertBefore(pill, nav.firstChild);
    }
    return pill;
  }
  function placeNavPill(pill, m, instant) {
    pill.style.width = m.w + 'px';
    pill.style.height = m.h + 'px';
    if (instant) {
      pill.style.transition = 'none';
      pill.style.transform = 'translate3d(' + m.x + 'px,' + m.y + 'px,0)';
      void pill.offsetWidth;
      pill.style.transition = '';
    } else {
      pill.style.transform = 'translate3d(' + m.x + 'px,' + m.y + 'px,0)';
    }
  }
  function syncNavInk(nav) {
    var cur = $('a[aria-current]', nav);
    var to = nav.querySelector('a.nx-to');
    var active = to || cur;
    $$('a', nav).forEach(function (link) {
      link.classList.toggle('nx-ink', link === active);
    });
  }
  function initNavPill(instant) {
    if (reduce.matches) return;
    $$('.nv, .mnav').forEach(function (nav) {
      if (getComputedStyle(nav).display === 'none') return;
      var cur = $('a[aria-current]', nav) || nav.querySelector('a.nx-to') || nav.querySelector('a[data-p="' + page + '"]');
      if (!cur) return;
      var pill = ensureNavPill(nav);
      placeNavPill(pill, navMetrics(nav, cur), instant !== false);
      syncNavInk(nav);
      if (!nav._pillBound) {
        nav._pillBound = true;
        window.addEventListener('resize', function () {
          var active = $('a[aria-current]', nav) || nav.querySelector('a.nx-to') || nav.querySelector('a[data-p="' + page + '"]');
          if (active) placeNavPill(pill, navMetrics(nav, active), true);
        }, { passive: true });
      }
    });
  }
  function navFill(a) {
    var nav = a.closest('.nv, .mnav');
    if (nav) {
      var pill = ensureNavPill(nav);
      var fromEl = $('a[aria-current]', nav);
      $$('a', nav).forEach(function (x) { x.classList.remove('nx-to', 'nx-go', 'nx-on', 'nx-rev'); });
      if (fromEl && fromEl !== a) fromEl.removeAttribute('aria-current');
      placeNavPill(pill, navMetrics(nav, fromEl || a), true);
      syncNavInk(nav);
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          placeNavPill(pill, navMetrics(nav, a), false);
          var inked = false;
          var inkTarget = function () {
            if (inked) return;
            inked = true;
            pill.removeEventListener('transitionend', onEnd);
            a.classList.add('nx-to');
            syncNavInk(nav);
          };
          var onEnd = function (e) {
            if (e.propertyName === 'transform') inkTarget();
          };
          pill.addEventListener('transitionend', onEnd);
          setTimeout(inkTarget, 640);
        });
      });
      return;
    }
  }

  /* ------------------------------------------------------------ project filter */
  function initFilter() {
    var chips = $$('.chips button'); if (!chips.length) return;
    chips.forEach(function (b) {
      b.addEventListener('click', function () {
        var f = b.getAttribute('data-f');
        chips.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        $$('.rw').forEach(function (r) { r.classList.toggle('off', f !== 'all' && r.getAttribute('data-c') !== f); });
        $$('.grp').forEach(function (g) { g.classList.toggle('off', $$('.rw:not(.off)', g).length === 0); });
        setTimeout(measure, 750);
      });
    });
  }

  /* ------------------------------------------------------------ boot */
  function bind() {
    $('#lg').addEventListener('click', switchLang);
    $('#lg').addEventListener('pointerenter', function () { ensureFonts(lang === 'fa' ? 'en' : 'fa'); });
    $('#th').addEventListener('click', onTheme);
    window.addEventListener('scroll', onScroll, { passive: true });
    if (mqLight.addEventListener) mqLight.addEventListener('change', followSystemTheme);
    else if (mqLight.addListener) mqLight.addListener(followSystemTheme);
    D.addEventListener('pointermove', onPointerMove, { passive: true });
    D.addEventListener('pointerout', onPointerOut);

    D.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[data-p]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var key = a.getAttribute('data-p');
      if (key === page) { e.preventDefault(); window.scrollTo({ top: 0, behavior: reduce.matches ? 'auto' : 'smooth' }); return; }
      if (reduce.matches) return;                       // plain navigation
      e.preventDefault();
      navFill(a);
      leavePage(a.href);
    });
    function warm(e) { var a = e.target.closest && e.target.closest('a[data-p]'); if (a && a.getAttribute('data-p') !== page) prefetch(a.href); }
    D.addEventListener('pointerover', warm, { passive: true });
    D.addEventListener('focusin', warm);

    window.addEventListener('popstate', function () {
      if (navigating || busy) return;
      leavePage(window.location.href, false);
    });
    window.addEventListener('pageshow', function (e) { if (e.persisted) resetPortal(); });    // back button / bfcache
    if (window.ResizeObserver) new ResizeObserver(measure).observe(B);
    var narrow = window.matchMedia('(max-width: 720px)'), wasNarrow = narrow.matches;
    var onBreakpoint = function () {
      if (narrow.matches === wasNarrow) return;
      wasNarrow = narrow.matches;
      initNavPill(true);                        // build the pill in the nav that just became visible
    };
    if (narrow.addEventListener) narrow.addEventListener('change', onBreakpoint);
    else if (narrow.addListener) narrow.addListener(onBreakpoint);
    initFilter();
  }

  function boot() {
    applyText(true);
    var nx = H.classList.contains('nx') && !reduce.matches && !!CV;                   // arriving through the portal
    Scene.init({ canvas: $('#gl'), page: page, dive: nx ? 1 : 0 });
    Scene.dir(lang === 'fa', true);
    bind(); onScroll();
    initNavPill(true);

    var fonts = Promise.race([ensureFonts(lang), sleep(introOn ? 620 : 1300)]);
    if (nx) {
      measure();
      Scene.start();
      arrive();
      fonts.then(function () { measure(); initNavPill(true); });
    } else if (introOn) {
      measure();
      initNavPill(true);
      fonts.then(function () {
        measure();
        initNavPill(true);
        if (!introOn) { Scene.start(); startReveal(); return; }   // fallback already removed the sheet
        H.classList.add('intro-in');
        introCountUp();
        setTimeout(introExit, 1280);
      });
    } else {
      if (intro && intro.parentNode) intro.remove();
      fonts.then(function () {
        measure(); Scene.start();
        initNavPill(true);
        H.classList.remove('nx');
        startReveal();
      });
    }

    // quietly warm up the other language's fonts so the first switch is instant
    var idle = window.requestIdleCallback || function (f) { setTimeout(f, 1800); };
    idle(function () { ensureFonts(lang === 'fa' ? 'en' : 'fa'); });
  }

  boot();
})();
