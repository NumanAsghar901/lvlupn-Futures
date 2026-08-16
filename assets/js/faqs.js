/* ==========================================================================
   FAQ (lvfq-) - Akkordeon aller zehn Kategorien.
   Plain JavaScript, kein jQuery, keine Bibliothek.

   Kundenvorgabe 09.08.2026:
   - Beim Laden ist je KATEGORIE nur die oberste Frage aufgeklappt, alle
     uebrigen liegen zu. Dieser Startzustand steht im Markup und nicht hier,
     damit er auch ohne JavaScript und ohne Nachladeruckeln stimmt.
   - Es ist immer nur EINE Frage gleichzeitig offen. Wer eine Frage oeffnet,
     schliesst damit alle anderen, auch ueber Kategorie- und Bandgrenzen.
     Ein zweiter Klick auf dieselbe Frage klappt sie wieder zu.

   Die vier Baender schalten mit zwei verschiedenen Mitteln (Klasse bzw.
   data-Attribut), weil ihr CSS darauf aufbaut - deshalb eine Tabelle statt
   einer einzigen Regel. Das Auf- und Zuklappen macht CSS
   (grid-template-rows 1fr/0fr), hier wechselt nur der Zustand.
   ========================================================================== */
(function () {
  var gruppen = [
    { knopf: '.lvfq-q',    karte: '.lvfq-item',    art: 'klasse',   name: 'lvfq-open' },
    { knopf: '.lvfq-b2-q', karte: '.lvfq-b2-item', art: 'klasse',   name: 'lvfq-b2-open' },
    { knopf: '.lvfq-b3-q', karte: '.lvfq-b3-item', art: 'attribut', name: 'data-lvfq-b3-open' },
    { knopf: '.lvfq-b4-q', karte: '.lvfq-b4-item', art: 'attribut', name: 'data-lvfq-b4-open' }
  ];

  function istOffen(karte, grp) {
    return grp.art === 'klasse'
      ? karte.classList.contains(grp.name)
      : karte.getAttribute(grp.name) !== 'false';
  }

  function setzen(karte, grp, offen) {
    if (grp.art === 'klasse') {
      if (offen) { karte.classList.add(grp.name); }
      else { karte.classList.remove(grp.name); }
    } else {
      karte.setAttribute(grp.name, offen ? 'true' : 'false');
    }
    var btn = karte.querySelector(grp.knopf);
    if (btn) { btn.setAttribute('aria-expanded', offen ? 'true' : 'false'); }
  }

  function alleSchliessen() {
    for (var g = 0; g < gruppen.length; g++) {
      var grp = gruppen[g];
      var karten = document.querySelectorAll('.lvfq-page ' + grp.karte);
      for (var k = 0; k < karten.length; k++) {
        if (istOffen(karten[k], grp)) { setzen(karten[k], grp, false); }
      }
    }
  }

  /* Klappt oberhalb der angeklickten Frage etwas zu, rutscht sie unter dem
     Zeiger weg - bei zehn offenen Karten am Anfang um mehrere tausend Pixel.
     Deshalb wird ihre Lage im Sichtfenster ueber die Dauer der CSS-Animation
     nachgefuehrt. Ohne Klick laeuft hier nichts. */
  function ankerHalten(el, aktion) {
    if (!window.requestAnimationFrame) { aktion(); return; }
    var vorher = el.getBoundingClientRect().top;
    aktion();
    var start = null;
    requestAnimationFrame(function schritt(t) {
      if (start === null) { start = t; }
      var diff = el.getBoundingClientRect().top - vorher;
      if (diff) { window.scrollBy(0, diff); }
      if (t - start < 450) { requestAnimationFrame(schritt); }
    });
  }

  function binden(grp) {
    var knoepfe = document.querySelectorAll('.lvfq-page ' + grp.knopf);
    Array.prototype.forEach.call(knoepfe, function (btn) {
      if (btn.getAttribute('data-lvfq-bound') === '1') { return; }
      btn.setAttribute('data-lvfq-bound', '1');

      btn.addEventListener('click', function () {
        var karte = btn.closest(grp.karte);
        if (!karte) { return; }
        var warOffen = istOffen(karte, grp);
        ankerHalten(btn, function () {
          alleSchliessen();
          if (!warOffen) { setzen(karte, grp, true); }
        });
      });
    });
  }

  for (var i = 0; i < gruppen.length; i++) { binden(gruppen[i]); }
})();