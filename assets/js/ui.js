/* ==========================================================================
   Noctis Architect — small body-level interactions
   Everything is delegated or re-applied on DOM changes, so it keeps working
   after app.js swaps <main> during page transitions.
     · live local clock in the home hero
     · screenshot preview that follows the cursor over work rows
     · tag text "A · B · C" → individual chips
     · contact: copy the three-line brief
   ========================================================================== */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var t = function (k) {
    var L = window.NX_I18N || {}, l = H.lang === 'fa' ? 'fa' : 'en';
    return (L[l] && L[l][k]) || (L.en && L.en[k]) || '';
  };
  var reduce = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var fine = window.matchMedia ? matchMedia('(hover: hover) and (pointer: fine)') : { matches: false };

  /* ---------------------------------------------------------------- clock */
  var fmt = null;
  try { fmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tehran', hour12: false }); } catch (e) {}
  function tick() {
    if (!fmt) return;
    var s = fmt.format(new Date());
    $$('.nx-clock').forEach(function (el) { if (el.textContent !== s) el.textContent = s; });
  }
  setInterval(tick, 15000);

  /* ---------------------------------------------------------------- tag chips */
  function chips() {
    $$('.row .tg:not(.chipped)').forEach(function (el) {
      var parts = el.textContent.split('·').map(function (x) { return x.trim(); }).filter(Boolean);
      el.textContent = '';
      parts.forEach(function (p) { var s = D.createElement('span'); s.textContent = p; el.appendChild(s); });
      el.classList.add('chipped');
    });
  }

  /* ---------------------------------------------------------------- work preview */
  var pv = null, pvImg = null, on = false, x = 0, y = 0, cx = 0, cy = 0, raf = 0, cur = null;
  function ensurePreview() {
    if (pv) return;
    pv = D.createElement('div'); pv.className = 'wpv'; pv.setAttribute('aria-hidden', 'true');
    pvImg = D.createElement('img'); pvImg.alt = ''; pvImg.decoding = 'async';
    pv.appendChild(pvImg); D.body.appendChild(pv);
  }
  function loop() {
    cx += (x - cx) * 0.16; cy += (y - cy) * 0.16;
    var tilt = Math.max(-8, Math.min(8, (x - cx) * 0.12));
    pv.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) rotate(' + tilt + 'deg)';
    raf = (on || Math.abs(x - cx) > 0.5 || Math.abs(y - cy) > 0.5) ? requestAnimationFrame(loop) : 0;
  }
  function base() {
    // resolve the screenshot path relative to the site root, whichever page we are on
    var s = D.querySelector('script[src$="assets/js/ui.js"]');
    return s ? s.getAttribute('src').replace(/assets\/js\/ui\.js$/, '') : '';
  }
  D.addEventListener('pointerover', function (e) {
    if (!fine.matches || reduce.matches) return;
    var row = e.target.closest && e.target.closest('.row[data-shot]');
    if (row === cur) return;
    cur = row;
    if (!row) { if (pv) pv.classList.remove('on'); on = false; return; }
    ensurePreview();
    var src = base() + row.getAttribute('data-shot');
    if (pvImg.getAttribute('src') !== src) pvImg.setAttribute('src', src);
    if (!on) { cx = x = e.clientX; cy = y = e.clientY; }
    on = true; pv.classList.add('on');
    if (!raf) raf = requestAnimationFrame(loop);
  });
  D.addEventListener('pointermove', function (e) {
    x = e.clientX; y = e.clientY;
    if (on && !raf) raf = requestAnimationFrame(loop);
  }, { passive: true });
  function hide() { cur = null; on = false; if (pv) pv.classList.remove('on'); }
  D.addEventListener('pointerleave', hide);
  window.addEventListener('scroll', function () { if (on && cur && !cur.matches(':hover')) hide(); }, { passive: true });
  D.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a[data-p]')) hide(); });

  /* ---------------------------------------------------------------- copy brief */
  D.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-copy-brief]');
    if (!b) return;
    var text = t('brief_tpl');
    var lbl = b.querySelector('[data-i]');
    var done = function () {
      b.classList.add('ok');
      if (lbl) lbl.textContent = t('brief_copied');
      clearTimeout(b._t);
      b._t = setTimeout(function () { b.classList.remove('ok'); if (lbl) lbl.textContent = t('brief_copy'); }, 2600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else fallback();
    function fallback() {
      var ta = D.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
      D.body.appendChild(ta); ta.select();
      try { D.execCommand('copy'); done(); } catch (err) {}
      ta.remove();
    }
  });

  /* ---------------------------------------------------------------- (re)apply */
  function enhance() { tick(); chips(); }
  enhance();
  var main = D.getElementById('main');
  if (main && window.MutationObserver) {
    new MutationObserver(function () { hide(); enhance(); }).observe(main, { childList: true });
  }
})();
