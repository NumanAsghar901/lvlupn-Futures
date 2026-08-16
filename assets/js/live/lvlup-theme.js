(function(){
/* s01 */
(function(){
/* s01 Banner + Nav: Countdown, Code kopieren, Burger-Overlay */
(function () {
  'use strict';

  var DESKTOP_MIN = 1024;

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  /* Ende des Monats von d, 23:59:00 UTC. offset = Monate weiter. */
  function monthEndUTC(d, offset) {
    return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1 + (offset || 0), 0, 23, 59, 0, 0);
  }

  function initCountdown(root) {
    var out = root.querySelector('[data-lvf-countdown]');
    if (!out) return;

    var fixed = null;
    var raw = root.getAttribute('data-lvf-deadline');
    if (raw) {
      var parsed = Date.parse(raw);
      if (!isNaN(parsed)) fixed = parsed;
    }

    var target = fixed !== null ? fixed : monthEndUTC(new Date(), 0);

    function tick() {
      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        if (fixed !== null) {
          out.textContent = '00d : 00h : 00m : 00s';
          return;
        }
        /* Ohne festes Ziel rollt der Timer auf das naechste Monatsende weiter. */
        target = monthEndUTC(new Date(now), 1);
        diff = target - now;
      }

      var s = Math.floor(diff / 1000);
      var d = Math.floor(s / 86400);
      var h = Math.floor((s % 86400) / 3600);
      var m = Math.floor((s % 3600) / 60);
      var sec = s % 60;
      out.textContent = pad(d) + 'd : ' + pad(h) + 'h : ' + pad(m) + 'm : ' + pad(sec) + 's';
    }

    tick();
    setInterval(tick, 1000);
  }

  function initCopy(root) {
    var btn = root.querySelector('[data-lvf-copy]');
    if (!btn) return;
    var status = root.querySelector('[data-lvf-copy-status]');
    var label = root.querySelector('[data-lvf-copy-label]');
    var text = btn.getAttribute('data-lvf-copy') || '';
    var resetTimer = null;

    function fallback(value) {
      var ta = document.createElement('textarea');
      ta.value = value;
      ta.setAttribute('readonly', 'readonly');
      ta.style.position = 'fixed';
      ta.style.top = '-1000px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      return ok;
    }

    function done(ok) {
      if (status) status.textContent = ok ? ('Code ' + text + ' copied') : ('Copy failed, code is ' + text);
      if (!ok) return;
      btn.classList.add('is-done');
      if (label) label.textContent = 'Code ' + text + ' copied';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(function () {
        btn.classList.remove('is-done');
        if (label) label.textContent = 'Copy discount code ' + text;
        if (status) status.textContent = '';
      }, 2000);
    }

    btn.addEventListener('click', function () {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(fallback(text)); });
      } else {
        done(fallback(text));
      }
    });
  }

  function initMenu(root) {
    var btn = root.querySelector('[data-lvf-burger]');
    var menu = root.querySelector('[data-lvf-menu]');
    if (!btn || !menu) return;
    var label = root.querySelector('[data-lvf-burger-label]');
    var prevOverflow = '';
    var open = false;

    function focusables() {
      var list = menu.querySelectorAll('a[href], button:not([disabled])');
      return Array.prototype.slice.call(list).filter(function (el) {
        return el.offsetWidth > 0 || el.offsetHeight > 0;
      });
    }

    function setOpen(next) {
      if (next === open) return;
      open = next;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.classList.toggle('is-open', open);
      if (label) label.textContent = open ? 'Close menu' : 'Open menu';

      if (open) {
        prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        var first = focusables()[0];
        if (first) first.focus();
      } else {
        document.body.style.overflow = prevOverflow;
        btn.focus();
      }
    }

    btn.addEventListener('click', function () { setOpen(!open); });

    menu.addEventListener('click', function (ev) {
      var link = ev.target.closest ? ev.target.closest('a[href]') : null;
      if (link) setOpen(false);
    });

    document.addEventListener('keydown', function (ev) {
      if (!open) return;
      if (ev.key === 'Escape' || ev.key === 'Esc') {
        ev.preventDefault();
        setOpen(false);
        return;
      }
      if (ev.key !== 'Tab') return;

      var items = focusables();
      items.unshift(btn);
      if (!items.length) return;
      var firstEl = items[0];
      var lastEl = items[items.length - 1];
      if (ev.shiftKey && document.activeElement === firstEl) {
        ev.preventDefault();
        lastEl.focus();
      } else if (!ev.shiftKey && document.activeElement === lastEl) {
        ev.preventDefault();
        firstEl.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (open && window.innerWidth >= DESKTOP_MIN) setOpen(false);
    });
  }

  function init() {
    var roots = document.querySelectorAll('[data-lvf-s01]');
    Array.prototype.forEach.call(roots, function (root) {
      if (root.hasAttribute('data-lvf-s01-ready')) return;
      root.setAttribute('data-lvf-s01-ready', '');
      initCountdown(root);
      initCopy(root);
      initMenu(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
})();

/* s11 */
(function(){
// Copyright-Jahr im Footer auf das laufende Jahr setzen.
//
// Im HTML steht 2026 fest verdrahtet, damit ohne JavaScript nichts Falsches
// dasteht. Hier wird daraus das echte Jahr, damit die Zeile nicht wieder
// veraltet - genau das war die Beanstandung: der Footer stand noch auf 2025,
// weil der Entwurf von 2025 stammt.
//
// Laeuft ueber assemble-theme.js in lvlup-theme.js und damit auf allen acht
// Seiten, weil der Footer dieselbe Elementor-Vorlage 67 ist.
var jahr = String(new Date().getFullYear());
var felder = document.querySelectorAll('[data-lvf-jahr]');
for (var i = 0; i < felder.length; i++) {
  // Nur anfassen, wenn sich wirklich etwas aendert. Sonst stuenden bei einer
  // falsch gestellten Systemuhr im Besucherrechner unnoetige Schreibzugriffe an.
  if (felder[i].textContent !== jahr) felder[i].textContent = jahr;
}
})();

/* Nav: aktiven Punkt markieren + Gold-Logo auf der Elite-Seite */
(function(){
  var pfad = location.pathname.replace(/\/+$/, '') || '/';
  document.querySelectorAll('.lvf-s01-link').forEach(function(a){
    var ziel = a.getAttribute('href') || '';
    if (ziel.charAt(0) === '#') return;
    var zielPfad = ziel.split('#')[0].replace(/\/+$/, '') || '/';
    if (zielPfad !== '/' && zielPfad === pfad) a.classList.add('is-active');
  });
  if (document.body.classList.contains('lvf-gold')) {
    var logo = document.querySelector('.lvf-s01-logo-img');
    if (logo) logo.src = 'https://lvlup.tivaosagencytempdomains.de/wp-content/uploads/2026/08/lvlup-logo-nav-gold.webp';
  }
})();
})();
