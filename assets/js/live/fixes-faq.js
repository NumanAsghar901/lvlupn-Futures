/* ===================================================================
   fixes-faq.js - Verhalten der FAQ-Akkordeons
   Ergaenzung zu lvlup-home.js (Block s09) und evaluation.js (Block e7-faq).
   Kaans Dateien bleiben unangetastet.

   Kundenvorgabe 09.08.2026: In jedem FAQ-Akkordeon ist beim Laden nur das
   oberste Element offen, und es kann immer nur eines gleichzeitig offen sein.

   ERHEBUNG am 09.08.2026, Live-DOM, alle acht Seiten geprueft:

     /            .lvf-s09-list > .lvf-s09-item > button.lvf-s09-q      6 Stueck
                  Marker der Liste: data-lvf-s09-accordion
                  gemessen: Laden true,false,false,false,false,false
                            Klick 3 -> nur 3 offen, Klick 5 -> nur 5 offen
                  => erfuellt die Vorgabe bereits (lvlup-home.js)

     /evaluation/ .lvev-e7-list > .lvev-e7-item > button.lvev-e7-q      6 Stueck
                  Marker der Liste: data-lvev-e7-accordion
                  gleiches Verhalten gemessen
                  => erfuellt die Vorgabe bereits (evaluation.js)

     /elite/      kein Akkordeon im Dokument (kein Schalter mit aria-expanded
                  ausserhalb von Kopfleiste und Cookie-Banner)
     /rules/      kein Akkordeon im Dokument, dito

     /faq/        .lvfq-list  > .lvfq-item  > button.lvfq-q       80 Stueck
     /affiliate/  .lvaf-fq-list > .lvaf-fq-item > button.lvaf-fq-btn 11 Stueck
                  regeln ihr Verhalten selbst und sind hier ausgenommen

   ARBEITSWEISE
   Drei Betriebsarten je erkannter Liste:

     passiv         Die Liste bringt nachweislich eigene Logik mit
                    (data-lvf-s09-accordion / data-lvev-e7-accordion).
                    Es wird KEIN Klick abgefangen. Nur der Startzustand wird
                    geprueft und ausschliesslich dann berichtigt, wenn er von
                    der Vorgabe abweicht. Auf den heutigen Seiten weicht er
                    nicht ab, hier passiert also nichts.

     pruefen        Unbekannte Struktur. Beim ersten Klick wird nur beobachtet,
                    ob sich der Zustand von allein aendert. Danach steht fest,
                    wer zustaendig ist.

     nurschliessen  Beim ersten Klick hat sich der Zustand von allein geaendert,
                    die Seite hat also eine eigene Logik. Ab jetzt wird nur noch
                    die Einzeloeffnung durchgesetzt, nie selbst umgeschaltet.

     eigen          Beim ersten Klick ist nichts passiert. Niemand ist
                    zustaendig, also uebernimmt dieses Skript das Umschalten.

   Dadurch kann nichts doppelt geschaltet werden: entweder schaltet die Seite
   oder dieses Skript, nie beide.
   =================================================================== */

(function () {
  'use strict';

  /* Bereiche, die dieses Skript unter keinen Umstaenden anfasst: die beiden
     selbstverwalteten Seiten, die Kopfleiste, der Cookie-Banner und die
     Akkordeon-Widgets von Elementor. */
  var TABU = [
    '[class*="lvfq-"]',
    '[class*="lvaf-"]',
    '.lvf-s01',
    '[class*="cmplz"]',
    '.elementor-accordion',
    '.elementor-toggle',
    '.elementor-tab-title'
  ].join(',');

  /* Listen mit nachgewiesener eigener Umschaltlogik. */
  var EIGENLOGIK = '[data-lvf-s09-accordion],[data-lvev-e7-accordion]';

  var SCHALTER = 'button[aria-expanded][aria-controls]';

  var gruppen = [];
  var gesehen = (typeof WeakSet === 'function') ? new WeakSet() : null;

  var sanft = false;
  try {
    sanft = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { sanft = false; }

  function tabu(el) {
    try { return !!(el && el.closest && el.closest(TABU)); } catch (e) { return true; }
  }

  function offen(btn) {
    return btn.getAttribute('aria-expanded') === 'true';
  }

  function panelZu(btn) {
    var id = btn.getAttribute('aria-controls');
    return id ? document.getElementById(id) : null;
  }

  function schalterDerSeite() {
    var raus = [];
    var alle;
    try { alle = document.querySelectorAll(SCHALTER); } catch (e) { return raus; }
    Array.prototype.forEach.call(alle, function (b) { if (!tabu(b)) { raus.push(b); } });
    return raus;
  }

  /* Liste = naechster Vorfahr, unter dem mindestens zwei Schalter haengen.
     Bewusst ohne Klassennamen, damit auch eine spaeter ergaenzte Struktur
     erkannt wird. */
  function listeZu(btn, alle) {
    var el = btn.parentElement;
    var tiefe = 0;
    while (el && el !== document.body && tiefe < 12) {
      var treffer = 0;
      for (var i = 0; i < alle.length; i++) {
        if (el.contains(alle[i])) { treffer++; }
        if (treffer > 1) { return el; }
      }
      el = el.parentElement;
      tiefe++;
    }
    return null;
  }

  /* Der Eintrag, der die Klasse fuer "offen" traegt: das direkte Kind der
     Liste, in dem der Schalter steckt. */
  function eintragZu(liste, btn) {
    var el = btn;
    while (el && el.parentElement && el.parentElement !== liste) {
      el = el.parentElement;
    }
    return (el && el.parentElement === liste) ? el : null;
  }

  /* Welche Klasse markiert "offen"? Aus dem Ist-Zustand ableiten statt raten. */
  function offenKlasse(eintraege, schalter) {
    var auf = null, zu = null, i;
    for (i = 0; i < schalter.length; i++) {
      if (offen(schalter[i])) { if (!auf) { auf = eintraege[i]; } }
      else if (!zu) { zu = eintraege[i]; }
    }
    if (auf && zu) {
      var zuKlassen = ' ' + zu.className + ' ';
      var neu = String(auf.className).split(/\s+/).filter(function (c) {
        return c && zuKlassen.indexOf(' ' + c + ' ') === -1;
      });
      if (neu.length === 1) { return { klasse: neu[0], sicher: true }; }
      for (i = 0; i < neu.length; i++) {
        if (/open|expand|active/i.test(neu[i])) { return { klasse: neu[i], sicher: true }; }
      }
    }
    /* Alle gleich (etwa: alle offen). Dann die Klasse am Namen erkennen. */
    var quelle = auf || eintraege[0];
    if (quelle) {
      var teile = String(quelle.className).split(/\s+/);
      for (i = 0; i < teile.length; i++) {
        if (teile[i] && /open|expand|active/i.test(teile[i])) {
          return { klasse: teile[i], sicher: true };
        }
      }
    }
    return { klasse: 'is-open', sicher: false };
  }

  /* Bewegung unterdruecken, wenn der Nutzer sie abbestellt hat. Kaans Seiten
     drosseln Uebergaenge bereits in lvlup-theme.css (@media prefers-reduced-
     motion); fuer Strukturen ohne diese Regel wird es hier sichergestellt. */
  function ohneBewegung(elemente, tun) {
    if (!sanft) { tun(); return; }
    var alt = elemente.map(function (el) { return el ? el.style.transition : null; });
    elemente.forEach(function (el) { if (el) { el.style.transition = 'none'; } });
    tun();
    if (elemente[0]) { void elemente[0].offsetHeight; }   /* Reflow erzwingen */
    window.setTimeout(function () {
      elemente.forEach(function (el, i) { if (el) { el.style.transition = alt[i] || ''; } });
    }, 0);
  }

  function setzen(gruppe, i, auf) {
    var btn = gruppe.schalter[i];
    if (!btn || offen(btn) === auf) { return false; }
    var eintrag = gruppe.eintraege[i];
    var panel = panelZu(btn);
    ohneBewegung([eintrag, panel], function () {
      btn.setAttribute('aria-expanded', auf ? 'true' : 'false');
      if (eintrag) {
        if (auf) { eintrag.classList.add(gruppe.klasse); }
        else { eintrag.classList.remove(gruppe.klasse); }
      }
      if (panel && gruppe.nutztHidden) {
        if (auf) { panel.removeAttribute('hidden'); }
        else { panel.setAttribute('hidden', ''); }
      }
    });
    return true;
  }

  /* Nur eines offen: alle ausser dem angegebenen Index schliessen. */
  function nurEines(gruppe, ausser) {
    var zu = 0;
    for (var i = 0; i < gruppe.schalter.length; i++) {
      if (i !== ausser && setzen(gruppe, i, false)) { zu++; }
    }
    return zu;
  }

  function zustand(gruppe) {
    return gruppe.schalter.map(function (b) { return offen(b) ? '1' : '0'; }).join('');
  }

  /* Startzustand: nur der oberste Eintrag offen. Wird auch bei passiven Listen
     geprueft, aber nur dann angefasst, wenn er tatsaechlich abweicht.
     Aufgemacht wird nur, wenn die Klasse fuer "offen" sicher abgeleitet werden
     konnte oder die Struktur mit dem hidden-Attribut arbeitet. Sonst wird
     ausschliesslich geschlossen: lieber alles zu als eine falsche Klasse. */
  function startzustand(gruppe) {
    var vorher = zustand(gruppe);
    if (vorher === '1' + new Array(gruppe.schalter.length).join('0')) { return false; }
    nurEines(gruppe, 0);
    if (gruppe.klasseSicher || gruppe.nutztHidden) { setzen(gruppe, 0, true); }
    return zustand(gruppe) !== vorher;
  }

  function aufnehmen() {
    var alle = schalterDerSeite();
    if (alle.length < 2) { return; }

    alle.forEach(function (btn) {
      var liste = listeZu(btn, alle);
      if (!liste) { return; }
      if (gesehen) {
        if (gesehen.has(liste)) { return; }
      } else if (liste.getAttribute('data-lvfix-faq')) {
        return;
      }

      var schalter = [], eintraege = [];
      Array.prototype.forEach.call(liste.querySelectorAll(SCHALTER), function (b) {
        if (tabu(b)) { return; }
        var e = eintragZu(liste, b);
        if (!e) { return; }
        schalter.push(b);
        eintraege.push(e);
      });
      if (schalter.length < 2) { return; }

      var kl = offenKlasse(eintraege, schalter);
      var eigenLogik = false;
      try {
        eigenLogik = !!(liste.matches(EIGENLOGIK) || liste.closest(EIGENLOGIK) || liste.querySelector(EIGENLOGIK));
      } catch (e) { eigenLogik = false; }

      var gruppe = {
        liste: liste,
        schalter: schalter,
        eintraege: eintraege,
        klasse: kl.klasse,
        klasseSicher: kl.sicher,
        nutztHidden: schalter.some(function (b) {
          var p = panelZu(b);
          return !!(p && p.hasAttribute('hidden'));
        }),
        modus: eigenLogik ? 'passiv' : 'pruefen'
      };

      if (gesehen) { gesehen.add(liste); } else { liste.setAttribute('data-lvfix-faq', gruppe.modus); }

      var berichtigt = startzustand(gruppe);
      gruppen.push(gruppe);

      if (window.console && window.console.debug) {
        window.console.debug('[lvlup-fixes] Akkordeon erkannt:',
          liste.className || liste.tagName,
          '| Eintraege', schalter.length,
          '| Betriebsart', gruppe.modus,
          '| Klasse offen', gruppe.klasse + (kl.sicher ? '' : ' (unsicher)'),
          '| Startzustand berichtigt', berichtigt);
      }
    });
  }

  function gruppeZu(btn) {
    for (var i = 0; i < gruppen.length; i++) {
      if (gruppen[i].schalter.indexOf(btn) > -1) { return gruppen[i]; }
    }
    return null;
  }

  /* Ein einziger Zuhoerer fuer das ganze Dokument, ohne capture, damit der
     Handler der Seite zuerst laeuft. Die Auswertung passiert erst im naechsten
     Takt, damit die Seite ihren Zustand gesetzt hat. */
  function klick(ev) {
    var btn = (ev.target && ev.target.closest) ? ev.target.closest(SCHALTER) : null;
    if (!btn || tabu(btn)) { return; }
    var gruppe = gruppeZu(btn);
    if (!gruppe || gruppe.modus === 'passiv') { return; }

    var i = gruppe.schalter.indexOf(btn);
    var vorher = zustand(gruppe);
    var warOffen = vorher.charAt(i) === '1';

    window.setTimeout(function () {
      var nachher = zustand(gruppe);

      if (gruppe.modus === 'pruefen') {
        gruppe.modus = (nachher !== vorher) ? 'nurschliessen' : 'eigen';
        if (!gesehen) { gruppe.liste.setAttribute('data-lvfix-faq', gruppe.modus); }
      }

      if (gruppe.modus === 'eigen') {
        setzen(gruppe, i, !warOffen);
      }
      if (offen(gruppe.schalter[i])) { nurEines(gruppe, i); }
    }, 0);
  }

  function start() {
    aufnehmen();
    /* Nachzuegler: Elementor und LiteSpeed schieben Inhalte teils spaeter nach. */
    window.setTimeout(aufnehmen, 400);
    window.setTimeout(aufnehmen, 1500);
  }

  document.addEventListener('click', klick, false);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
  window.addEventListener('load', aufnehmen);
})();
