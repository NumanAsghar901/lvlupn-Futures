/* Lvlup Home V2 - Seiten-Sektionen s02-s10. Nicht von Hand aendern. */
(function () {
/* ===== s02 ===== */
(function(){
/* s02 Hero + Stats + Zertifikats-Ticker:
   Marquee-Pause, Hero-Video-Quelle (nachträglich), Zähl-Animation der Statistiken.
   Die Marquee-Bewegung selbst läuft rein per CSS (@keyframes lvf-s02-marquee). */
(function () {
  'use strict';

  var MOTION_QUERY = '(prefers-reduced-motion: reduce)';
  var COUNT_MS = 1100;   /* Dauer der Zähl-Animation */
  var COUNT_MIN = 5;     /* darunter lohnt das Hochzählen nicht */

  function mq() {
    return window.matchMedia ? window.matchMedia(MOTION_QUERY) : null;
  }

  function reduced() {
    var m = mq();
    return !!(m && m.matches);
  }

  function onMotionChange(fn) {
    var m = mq();
    if (!m) return;
    if (m.addEventListener) m.addEventListener('change', fn);
    else if (m.addListener) m.addListener(fn);
  }

  /* Direkte Kinder mit Klasse, ohne ":scope"-Selektor. */
  function childrenByClass(parent, cls) {
    var out = [];
    if (!parent) return out;
    var node = parent.firstElementChild;
    while (node) {
      if (node.classList && node.classList.contains(cls)) out.push(node);
      node = node.nextElementSibling;
    }
    return out;
  }

  /* ------------------------------------------------------------ Marquee */

  function initMarquee(root) {
    var strip = root.querySelector('[data-lvf-marquee]');
    if (!strip) return;

    var rows = strip.querySelectorAll('.lvf-s02-row');
    if (!rows.length) return;

    /* 1. Nahtlosigkeit: Die CSS-Keyframe schiebt um calc(-50% - gap/2), das
       entspricht exakt der Breite EINES Satzes plus Lücke. Dafür braucht jede
       Reihe genau zwei identische Sätze. Im HTML sind sie bereits doppelt
       angelegt; hier wird nur der Fall "nur ein Satz vorhanden" repariert.
       Bei drei oder mehr Sätzen wird nichts verändert, weil die -50 % dann
       nicht mehr passen und ein Eingriff das Layout verschlechtern würde. */
    Array.prototype.forEach.call(rows, function (row) {
      var sets = childrenByClass(row, 'lvf-s02-set');
      if (sets.length !== 1) return;
      var clone = sets[0].cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      var imgs = clone.querySelectorAll('img');
      Array.prototype.forEach.call(imgs, function (img) { img.setAttribute('alt', ''); });
      row.appendChild(clone);
    });

    /* 2. Pause-Logik. Das CSS pausiert bereits bei :hover und :focus-within
       auf .lvf-s02-strip; hier kommt derselbe Zustand als Attribut dazu
       (Selektor .lvf-s02-strip[data-lvf-paused] existiert im fragment.css). */
    var reasons = {};

    function sync() {
      var any = false;
      for (var key in reasons) {
        if (Object.prototype.hasOwnProperty.call(reasons, key) && reasons[key]) { any = true; break; }
      }
      if (any) strip.setAttribute('data-lvf-paused', '');
      else strip.removeAttribute('data-lvf-paused');
    }

    function set(key, value) {
      reasons[key] = !!value;
      sync();
    }

    strip.addEventListener('mouseenter', function () { set('hover', true); });
    strip.addEventListener('mouseleave', function () { set('hover', false); });

    /* Tastaturfokus: Innerhalb des Streifens gibt es kein fokussierbares
       Element, der einzige Tabstopp der Ticker-Region ist der Link
       "View All Payouts". Deshalb hängt die Fokus-Pause am umgebenden
       .lvf-s02-ticker statt am Streifen selbst. */
    var region = (strip.closest && strip.closest('.lvf-s02-ticker')) || strip.parentNode || strip;

    region.addEventListener('focusin', function () { set('focus', true); });
    region.addEventListener('focusout', function (ev) {
      var next = ev.relatedTarget;
      if (next && region.contains && region.contains(next)) return;
      set('focus', false);
    });

    /* Nicht sichtbarer Tab: Animation anhalten, spart Rechenzeit. */
    document.addEventListener('visibilitychange', function () {
      set('hidden', document.hidden === true);
    });
    set('hidden', document.hidden === true);

    /* Reduzierte Bewegung: CSS setzt animation-name auf none, das Attribut
       hält den Zustand zusätzlich fest, auch bei späterem Umschalten. */
    set('motion', reduced());
    onMotionChange(function () { set('motion', reduced()); });
  }

  /* ------------------------------------------------------------ Hero-Video */

  function initVideo(root) {
    var video = root.querySelector('[data-lvf-hero-video]');
    if (!video) return;

    var applied = '';
    var observer = null;
    var visible = true;

    function play() {
      if (!applied) return;
      if (!visible) return;
      if (reduced()) return;   /* kein Autoplay bei reduzierter Bewegung */
      var promise;
      try { promise = video.play(); } catch (e) { return; }
      if (promise && typeof promise.catch === 'function') promise.catch(function () { /* Autoplay abgelehnt */ });
    }

    function watch() {
      if (observer || !('IntersectionObserver' in window)) return;
      observer = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          visible = entries[i].isIntersecting;
          if (visible) play();
          else if (!video.paused) { try { video.pause(); } catch (e) { /* egal */ } }
        }
      }, { threshold: 0 });
      observer.observe(video);
    }

    /* Quelle wird erst später gesetzt. Ohne data-lvf-video-src passiert nichts,
       insbesondere kein leeres src-Attribut und damit kein Konsolenfehler. */
    function apply() {
      var src = video.getAttribute('data-lvf-video-src');
      if (!src || src === applied) return;
      applied = src;
      video.muted = true;              /* Autoplay ist nur stumm erlaubt */
      video.setAttribute('preload', 'metadata');
      video.setAttribute('src', src);
      try { video.load(); } catch (e) { /* egal */ }
      watch();
      play();
    }

    apply();

    if (window.MutationObserver) {
      var mo = new MutationObserver(apply);
      mo.observe(video, { attributes: true, attributeFilter: ['data-lvf-video-src'] });
    }

    onMotionChange(function () {
      if (reduced()) { try { video.pause(); } catch (e) { /* egal */ } }
      else play();
    });
  }

  /* ------------------------------------------------------------ Statistiken */

  /* Zerlegt "100%" in Präfix "", Zahl 100, Suffix "%".
     Nur eindeutige Fälle werden animiert: genau eine Zahl im Text und
     mindestens COUNT_MIN. "Five" (keine Zahl), "24/7" (zwei Zahlen) und
     "$1M" (Wert 1) bleiben deshalb unverändert stehen. */
  function parseValue(text) {
    var all = text.match(/\d[\d.,]*/g);
    if (!all || all.length !== 1) return null;

    var token = all[0];
    var plain = token.replace(/,/g, '');
    var value = parseFloat(plain);
    if (!isFinite(value) || value < COUNT_MIN) return null;

    var dot = plain.indexOf('.');
    var at = text.indexOf(token);

    return {
      prefix: text.slice(0, at),
      suffix: text.slice(at + token.length),
      value: value,
      decimals: dot === -1 ? 0 : plain.length - dot - 1,
      grouped: token.indexOf(',') !== -1
    };
  }

  function format(n, spec) {
    var s = spec.decimals ? n.toFixed(spec.decimals) : String(Math.round(n));
    if (spec.grouped) {
      var parts = s.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = parts.join('.');
    }
    return spec.prefix + s + spec.suffix;
  }

  function countUp(el, spec, target) {
    /* Breite vor dem Umschreiben festhalten, damit die Zeile beim Zählen
       nicht springt. Danach wieder freigeben. */
    var width = el.offsetWidth;
    if (width) el.style.minWidth = width + 'px';

    var startedAt = null;
    var fertig = false;

    function abschliessen() {
      if (fertig) return;
      fertig = true;
      el.textContent = target;   /* exakt der Zieltext aus dem HTML */
      el.style.minWidth = '';
      if (sicherung) { window.clearTimeout(sicherung); sicherung = null; }
    }

    function step(now) {
      if (fertig) return;
      if (startedAt === null) startedAt = now;
      var t = Math.min(1, (now - startedAt) / COUNT_MS);
      var eased = 1 - Math.pow(1 - t, 3);

      if (t < 1) {
        el.textContent = format(spec.value * eased, spec);
        window.requestAnimationFrame(step);
      } else {
        abschliessen();
      }
    }

    /* Sicherheitsnetz: In einem Hintergrund-Tab drosselt der Browser
       requestAnimationFrame oder haelt es ganz an. Ohne diesen Timer bliebe der
       Zaehler dann auf einem Zwischenwert stehen ("21%" statt "100%") und wuerde
       den Nutzer beim Zurueckwechseln mit falschen Zahlen begruessen. */
    var sicherung = window.setTimeout(abschliessen, COUNT_MS + 400);

    el.textContent = format(0, spec);
    window.requestAnimationFrame(step);
  }

  function initStats(root) {
    if (reduced()) return;
    if (!('IntersectionObserver' in window) || !window.requestAnimationFrame) return;

    var nums = root.querySelectorAll('.lvf-s02-stat-num');
    if (!nums.length) return;

    var jobs = [];
    Array.prototype.forEach.call(nums, function (el) {
      var target = (el.textContent || '').trim();
      var spec = parseValue(target);
      if (!spec) return;
      jobs.push({ el: el, spec: spec, target: target });
    });
    if (!jobs.length) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      Array.prototype.forEach.call(entries, function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        if (reduced()) return;   /* zwischenzeitlich umgeschaltet */
        /* Seite im Hintergrund: nicht animieren, sondern direkt den Zielwert
           zeigen. Sonst laeuft die Animation ohne Zuschauer ab. */
        if (document.visibilityState === 'hidden') return;
        for (var i = 0; i < jobs.length; i++) {
          if (jobs[i].el === entry.target) {
            countUp(jobs[i].el, jobs[i].spec, jobs[i].target);
            break;
          }
        }
      });
    }, { threshold: 0.4, rootMargin: '0px 0px -10% 0px' });

    jobs.forEach(function (job) { observer.observe(job.el); });
  }

  /* ------------------------------------------------------------ Start */

  function init() {
    var roots = document.querySelectorAll('.lvf-s02');
    Array.prototype.forEach.call(roots, function (root) {
      if (root.hasAttribute('data-lvf-s02-ready')) return;
      root.setAttribute('data-lvf-s02-ready', '');
      initMarquee(root);
      initVideo(root);
      initStats(root);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
})();

/* ===== s04 ===== */
(function(){
/* Lvlup Futures - s04 Pricing + Add-ons
   Umschalter "Lvlup Accounts" / "Starter Accounts" (Vanilla, IIFE, ohne Framework).
   Markup-Vertrag (aus fragment.html, nichts davon wird hier erfunden):
     [data-lvf-s04]                          Sektions-Wurzel
     .lvf-s04-toggle[role="tablist"]         Umschalter
     .lvf-s04-tab[data-lvf-plan="…"]         Tab-Button, aktiv = Klasse .is-active
     .lvf-s04-cards[data-lvf-plan-panel="…"] Kartengruppe, inaktiv = Attribut hidden
   [data-lvf-open="conditions"] gehört s12 und wird hier bewusst NICHT angefasst. */
(function () {
  'use strict';

  var roots = document.querySelectorAll('[data-lvf-s04]');
  if (!roots.length) return;

  Array.prototype.forEach.call(roots, function (root) {
    if (root.dataset.lvfS04Ready === '1') return;

    var list = root.querySelector('.lvf-s04-toggle');
    if (!list) return;

    var tabs = Array.prototype.slice.call(list.querySelectorAll('[data-lvf-plan]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-lvf-plan-panel]'));

    function panelFor(plan) {
      for (var i = 0; i < panels.length; i++) {
        if (panels[i].getAttribute('data-lvf-plan-panel') === plan) return panels[i];
      }
      return null;
    }

    // Paare Tab -> Kartengruppe bilden. Fehlt eine Gruppe, bleibt der Tab bedienbar,
    // es wird dann nur die jeweils andere Gruppe ausgeblendet.
    var items = [];
    tabs.forEach(function (tab) {
      var plan = tab.getAttribute('data-lvf-plan');
      if (!plan) return;
      items.push({ tab: tab, plan: plan, panel: panelFor(plan) });
    });
    if (items.length < 2) return;

    root.dataset.lvfS04Ready = '1';

    var current = -1;

    function indexOfTab(node) {
      for (var i = 0; i < items.length; i++) {
        if (items[i].tab === node || items[i].tab.contains(node)) return i;
      }
      return -1;
    }

    function select(index, moveFocus) {
      if (index < 0 || index >= items.length) return;
      items.forEach(function (item, i) {
        var on = i === index;
        item.tab.classList.toggle('is-active', on);
        item.tab.setAttribute('aria-selected', on ? 'true' : 'false');
        // Rollendes tabindex: nur der aktive Tab liegt in der Tab-Reihenfolge
        if (on) item.tab.removeAttribute('tabindex');
        else item.tab.setAttribute('tabindex', '-1');
        if (item.panel) {
          if (on) item.panel.removeAttribute('hidden');
          else item.panel.setAttribute('hidden', '');
        }
      });
      current = index;
      if (moveFocus && typeof items[index].tab.focus === 'function') items[index].tab.focus();
    }

    // Startzustand aus dem Markup übernehmen und dabei normalisieren
    var start = 0;
    for (var i = 0; i < items.length; i++) {
      if (items[i].tab.classList.contains('is-active') ||
          items[i].tab.getAttribute('aria-selected') === 'true') {
        start = i;
        break;
      }
    }
    select(start, false);

    items.forEach(function (item, index) {
      item.tab.addEventListener('click', function () {
        if (index !== current) select(index, false);
      });
    });

    list.addEventListener('keydown', function (event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      var index = indexOfTab(event.target);
      if (index < 0) return;

      var key = event.key;

      if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
        // <button> löst Enter/Space bereits als click aus, sonst gäbe es hier
        // eine Doppelauswertung. Nur für Nicht-Buttons selbst aktivieren.
        if (items[index].tab.tagName === 'BUTTON') return;
        event.preventDefault();
        select(index, true);
        return;
      }

      var next = -1;
      if (key === 'ArrowRight' || key === 'ArrowDown') next = (index + 1) % items.length;
      else if (key === 'ArrowLeft' || key === 'ArrowUp') next = (index - 1 + items.length) % items.length;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = items.length - 1;
      else return;

      // Manuelle Aktivierung: Pfeile bewegen nur den Fokus, Enter/Space schaltet um.
      event.preventDefault();
      if (typeof items[next].tab.focus === 'function') items[next].tab.focus();
    });
  });
})();
})();

/* ===== s05 ===== */
(function(){
/* s05 Calculator - Live-Berechnung der beiden Schieberegler.
   Monthly = Kapital * Rate / 100, Annual = Monthly * 12. */
(function () {
  var root = document.querySelector('.lvf-s05');
  if (!root) { return; }

  var capital = root.querySelector('[data-lvf-s05-input="capital"]');
  var rate = root.querySelector('[data-lvf-s05-input="rate"]');
  if (!capital || !rate) { return; }

  var out = {
    capital: root.querySelector('[data-lvf-s05-out="capital"]'),
    rate: root.querySelector('[data-lvf-s05-out="rate"]'),
    monthly: root.querySelector('[data-lvf-s05-out="monthly"]'),
    annual: root.querySelector('[data-lvf-s05-out="annual"]')
  };
  var bubble = {
    capital: root.querySelector('[data-lvf-s05-bubble="capital"]'),
    rate: root.querySelector('[data-lvf-s05-bubble="rate"]')
  };
  var slider = {
    capital: root.querySelector('[data-lvf-s05-slider="capital"]'),
    rate: root.querySelector('[data-lvf-s05-slider="rate"]')
  };

  // 1080000 -> "$1,080,000" (bewusst ohne toLocaleString, damit die
  // Trennzeichen unabhaengig von der Browsersprache identisch sind)
  function money(value) {
    var n = Math.round(Math.abs(value));
    var s = String(n);
    var grouped = '';
    var i;
    for (i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) { grouped += ','; }
      grouped += s.charAt(i);
    }
    return (value < 0 ? '-$' : '$') + grouped;
  }

  // 450000 -> "$450K"
  function moneyShort(value) {
    var n = Math.round(Math.abs(value));
    return n >= 1000 ? '$' + Math.round(n / 1000) + 'K' : money(n);
  }

  function percent(value) {
    return String(Math.round(value)) + '%';
  }

  function progress(input) {
    var min = parseFloat(input.min);
    var max = parseFloat(input.max);
    var val = parseFloat(input.value);
    if (!isFinite(min) || !isFinite(max) || max <= min) { return 0; }
    if (!isFinite(val)) { val = min; }
    return Math.min(1, Math.max(0, (val - min) / (max - min)));
  }

  function setText(el, text) {
    if (el && el.textContent !== text) { el.textContent = text; }
  }

  function render(updateProgress) {
    var c = parseFloat(capital.value);
    var r = parseFloat(rate.value);
    if (!isFinite(c)) { c = 0; }
    if (!isFinite(r)) { r = 0; }

    var monthly = c * r / 100;
    var annual = monthly * 12;

    var capitalText = money(c);
    var rateText = percent(r);

    setText(out.capital, capitalText);
    setText(out.rate, rateText);
    setText(out.monthly, money(monthly));
    setText(out.annual, money(annual));
    setText(bubble.capital, moneyShort(c));
    setText(bubble.rate, rateText);

    capital.setAttribute('aria-valuetext', capitalText);
    rate.setAttribute('aria-valuetext', rateText);

    if (updateProgress) {
      if (slider.capital) { slider.capital.style.setProperty('--p', progress(capital)); }
      if (slider.rate) { slider.rate.style.setProperty('--p', progress(rate)); }
    }
  }

  function onInput() { render(true); }

  capital.addEventListener('input', onInput);
  capital.addEventListener('change', onInput);
  rate.addEventListener('input', onInput);
  rate.addEventListener('change', onInput);

  render(true);
})();
})();

/* ===== s07 ===== */
(function(){
/* s07 - Videos + Testimonials
   Fuellt die drei Testimonial-Reihen so weit mit Klonen auf, dass eine
   Haelfte breiter als der Sichtbereich ist, spiegelt sie einmal und
   setzt die Laufzeit passend zur Strecke. Die Bewegung selbst, die
   Richtung und das Pausieren bei Hover kommen aus fragment.css. */
(function () {
  'use strict';

  var ROW_SELECTOR = '[data-lvf-s07-marquee]';
  var TRACK_SELECTOR = '[data-lvf-s07-track]';
  var REVIEWS = [
    { name: 'Adam K.', quote: 'Very smooth experience, support reply fast and rules are clear.' },
    { name: 'Ryan M.', quote: 'Passed my account easy, dashboard is clean and simple to use.' },
    { name: 'Daniel R.', quote: 'Good firm so far, no confusing rules and support helped me quick.' },
    { name: 'Chris T.', quote: 'Really like the rules here, much easier to understand everything.' },
    { name: 'Omar H.', quote: 'Support was very helpful and account setup was super fast.' },
    { name: 'James L.', quote: 'Nice experience till now, platform works good and rules are fair.' },
    { name: 'Ethan P.', quote: 'Everything feels simple, no headache when checking the rules.' },
    { name: 'Samir A.', quote: 'Good prop firm, payout process was clear and team helped me fast.' },
    { name: 'Noah B.', quote: 'I like how simple the account rules are compared to other firms.' },
    { name: 'Lucas D.', quote: 'Very clean dashboard and support answer all my questions quickly.' },
    { name: 'Ali S.', quote: 'Been trading here some days, overall experience is really good.' },
    { name: 'Marcus J.', quote: 'The rules make sense and I did not find any hidden surprises.' },
    { name: 'Zain R.', quote: 'Account came fast and everything was working without any issue.' },
    { name: 'Kevin W.', quote: 'Really good support team, they explained my question very clearly.' },
    { name: 'Hamza N.', quote: 'Easy process from buying account to starting my first trade.' },
    { name: 'Ben C.', quote: 'So far very happy with Lvlup, simple rules and nice experience.' },
    { name: 'Adeel M.', quote: 'Good firm for futures traders, everything feels well organized.' },
    { name: 'Michael S.', quote: 'No daily loss limit is great, gives much more freedom when trading.' },
    { name: 'Yusuf K.', quote: 'Support reply was fast and solved my problem without wasting time.' },
    { name: 'Jake F.', quote: 'Really enjoying the account, rules are clear and easy to follow.' },
    { name: 'Ahmed T.', quote: 'Very simple evaluation and dashboard looks clean and professional.' },
    { name: 'Liam G.', quote: 'One of the better experiences I had with a futures prop firm.' },
    { name: 'Bilal A.', quote: 'I had few questions before buying and support explained everything.' },
    { name: 'David N.', quote: 'Good platform choice and account was ready very quickly for me.' },
    { name: 'Hassan R.', quote: 'Rules are straightforward, I know exactly what I need to follow.' },
    { name: 'Alex P.', quote: 'Nice company, support is active and the whole process feels easy.' },
    { name: 'Ibrahim M.', quote: 'Trading conditions are good and I like how transparent it feels.' },
    { name: 'George T.', quote: 'Bought my account and started trading same day, very smooth setup.' },
    { name: 'Faisal K.', quote: 'Really good first impression, website and dashboard feel premium.' },
    { name: 'Nathan B.', quote: 'Everything working good till now, happy with the overall service.' }
  ];

  function setReview(card, review) {
    var quote = card.querySelector('.lvf-s07-quote');
    var name = card.querySelector('.lvf-s07-name');
    var role = card.querySelector('.lvf-s07-role');
    if (quote) { quote.textContent = '\u201c' + review.quote + '\u201d'; }
    if (name) { name.textContent = review.name; }
    if (role) { role.remove(); }
  }

  function hydrateReviews(rows) {
    var counts = [8, 7, 8, 7];
    var reviewIndex = 0;

    rows.forEach(function (row, rowIndex) {
      var track = row.querySelector(TRACK_SELECTOR);
      if (!track) { return; }
      var cards = Array.prototype.slice.call(track.children);
      var target = counts[rowIndex] || 0;
      if (!cards.length || !target) { return; }

      while (cards.length < target) {
        var extra = cards[cards.length % Math.min(cards.length, 3)].cloneNode(true);
        track.appendChild(extra);
        cards.push(extra);
      }
      while (cards.length > target) {
        track.removeChild(cards.pop());
      }

      cards.forEach(function (card) {
        setReview(card, REVIEWS[reviewIndex]);
        reviewIndex += 1;
      });
    });
  }

  function cloneHidden(node) {
    var clone = node.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    var focusable = clone.querySelectorAll('a, button, input, select, textarea');
    Array.prototype.forEach.call(focusable, function (el) {
      el.setAttribute('tabindex', '-1');
    });
    return clone;
  }

  function build(row) {
    var track = row.querySelector(TRACK_SELECTOR);
    if (!track) { return; }

    if (typeof track.dataset.lvfS07Base === 'string') {
      track.innerHTML = track.dataset.lvfS07Base;
    } else {
      track.dataset.lvfS07Base = track.innerHTML;
    }

    var originals = Array.prototype.slice.call(track.children);
    if (!originals.length) { return; }

    // Eine Haelfte muss den Sichtbereich sicher ueberdecken
    var target = row.clientWidth + 240;
    var guard = 0;
    while (track.scrollWidth < target && guard < 10) {
      originals.forEach(function (node) {
        track.appendChild(cloneHidden(node));
      });
      guard += 1;
    }

    var halfWidth = track.scrollWidth;
    var half = Array.prototype.slice.call(track.children);
    half.forEach(function (node) {
      track.appendChild(cloneHidden(node));
    });

    var speed = parseFloat(row.getAttribute('data-lvf-s07-speed'));
    if (!speed || speed <= 0) { speed = 40; }

    track.style.setProperty('--lvf-s07-dur', Math.max(20, Math.round(halfWidth / speed)) + 's');
  }

  function init() {
    var rows = Array.prototype.slice.call(document.querySelectorAll(ROW_SELECTOR));
    if (!rows.length) { return; }

    hydrateReviews(rows);

    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduce && reduce.matches) { return; }

    rows.forEach(build);

    var timer = null;
    var lastWidth = window.innerWidth;
    window.addEventListener('resize', function () {
      if (Math.abs(window.innerWidth - lastWidth) < 60) { return; }
      lastWidth = window.innerWidth;
      window.clearTimeout(timer);
      timer = window.setTimeout(function () {
        rows.forEach(build);
      }, 200);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
})();

/* Homepage video cards: play in place, with the href retained as the
   indexable/fallback watch-page destination. */
(function () {
  'use strict';

  var modal = document.querySelector('[data-lvf-video-modal]');
  if (!modal) return;
  var frame = modal.querySelector('[data-lvf-video-frame]');
  var title = modal.querySelector('[data-lvf-video-modal-title]');
  var watchLink = modal.querySelector('[data-lvf-video-watch-link]');
  var closeButton = modal.querySelector('.lvf-video-close');
  var cards = document.querySelectorAll('[data-lvf-video-id]');
  var lastTrigger = null;

  function open(card) {
    var id = card.getAttribute('data-lvf-video-id');
    var label = card.getAttribute('data-lvf-video-title') || 'Lvlup Futures video';
    if (!id) return;
    lastTrigger = card;
    title.textContent = label;
    frame.title = label;
    frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    watchLink.href = card.href;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        closeButton.focus();
      });
    });
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    frame.src = 'about:blank';
    window.setTimeout(function () {
      modal.hidden = true;
      if (lastTrigger) lastTrigger.focus();
    }, 220);
  }

  Array.prototype.forEach.call(cards, function (card) {
    card.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      open(card);
    });
  });

  Array.prototype.forEach.call(modal.querySelectorAll('[data-lvf-video-close]'), function (el) {
    el.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hidden) close();
  });
})();

/* ===== s09 ===== */
(function(){
/* Lvlup Futures - s09 FAQ: Akkordeon (Vanilla, IIFE, ohne Framework) */
(function () {
  'use strict';

  var lists = document.querySelectorAll('[data-lvf-s09-accordion]');
  if (!lists.length) return;

  Array.prototype.forEach.call(lists, function (list) {
    if (list.dataset.lvfS09Ready === '1') return;
    list.dataset.lvfS09Ready = '1';

    var items = Array.prototype.slice.call(list.querySelectorAll('[data-lvf-s09-item]'));
    var buttons = items.map(function (item) {
      return item.querySelector('.lvf-s09-q');
    }).filter(Boolean);

    function setOpen(item, open) {
      var btn = item.querySelector('.lvf-s09-q');
      if (!btn) return;
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function toggle(item) {
      var willOpen = !item.classList.contains('is-open');
      items.forEach(function (other) {
        setOpen(other, other === item ? willOpen : false);
      });
    }

    // Startzustand aus dem Markup uebernehmen (erstes Element ist offen)
    items.forEach(function (item) {
      setOpen(item, item.classList.contains('is-open'));
    });

    buttons.forEach(function (btn, index) {
      btn.addEventListener('click', function () {
        toggle(btn.closest('[data-lvf-s09-item]'));
      });

      btn.addEventListener('keydown', function (event) {
        var key = event.key;
        var next = -1;
        if (key === 'ArrowDown') next = (index + 1) % buttons.length;
        else if (key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
        else if (key === 'Home') next = 0;
        else if (key === 'End') next = buttons.length - 1;
        if (next < 0) return;
        event.preventDefault();
        buttons[next].focus();
      });
    });
  });
})();

/* Figma landing popup. The current static project has no working newsletter
   endpoint, so submission is held locally and reports that limitation. */
(function () {
  'use strict';

  var modal = document.querySelector('[data-lvf-landing-modal]');
  if (!modal) return;
  var closeButton = modal.querySelector('.lvf-landing-close');
  var form = modal.querySelector('[data-lvf-landing-form]');
  var status = modal.querySelector('[data-lvf-landing-status]');

  function open() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
        closeButton.focus();
      });
    });
  }

  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    window.setTimeout(function () { modal.hidden = true; }, 240);
  }

  Array.prototype.forEach.call(modal.querySelectorAll('[data-lvf-landing-close]'), function (el) {
    el.addEventListener('click', close);
  });

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    status.textContent = 'Newsletter signup is not connected yet. Please try again later.';
  });

  modal.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(modal.querySelectorAll('button, input, a[href]')).filter(function (el) {
      return !el.disabled && el.getClientRects().length;
    });
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  open();
})();
})();
})();

/* Trading Conditions popup wiring */
(function () {
  var modal = document.querySelector('[data-lvf-conditions-modal]');
  if (!modal) return;
  var openBtns = document.querySelectorAll('[data-lvf-open="conditions"]');
  var closers = modal.querySelectorAll('[data-lvf-conditions-close]');
  var tabs = modal.querySelectorAll('[data-lvf-conditions-tab]');
  var panels = modal.querySelectorAll('[data-lvf-conditions-panel]');

  function open() {
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { modal.classList.add('is-open'); });
    });
  }
  function close() {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { modal.hidden = true; }, 250);
  }

  openBtns.forEach(function (btn) {
    btn.addEventListener('click', open);
  });
  closers.forEach(function (el) { el.addEventListener('click', close); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !modal.hidden) close();
  });

  /* Tabs switching */
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var target = tab.getAttribute('data-lvf-conditions-tab');
      tabs.forEach(function (t) {
        if (t === tab) {
          t.classList.add('is-active');
        } else {
          t.classList.remove('is-active');
        }
      });
      panels.forEach(function (panel) {
        if (panel.getAttribute('data-lvf-conditions-panel') === target) {
          panel.classList.add('is-active');
          panel.hidden = false;
        } else {
          panel.classList.remove('is-active');
          panel.hidden = true;
        }
      });
    });
  });
})();
