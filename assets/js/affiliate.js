/* Affiliate, Band 2: Akkordeon der Affiliate-FAQs.
   Kundenvorgabe: beim Laden ist nur die oberste Antwort offen, und es
   ist immer nur eine gleichzeitig offen. Der Ausgangszustand steht
   schon im Markup (Items 2 bis 11 tragen lvaf-fq-closed), damit die
   Seite auch ohne JavaScript richtig aussieht und beim Laden nichts
   aufblitzt. Das Skript sorgt nur noch fuer das Umschalten:
   Aufklappen schliesst alle anderen, ein erneuter Klick auf die
   offene Frage klappt sie wieder zu. */
(function () {
  var list = document.querySelector('.lvaf-fq-list');
  if (!list) { return; }

  function setzen(item, offen) {
    var btn = item.querySelector('.lvaf-fq-btn');
    item.classList.toggle('lvaf-fq-closed', !offen);
    if (btn) { btn.setAttribute('aria-expanded', offen ? 'true' : 'false'); }
  }

  list.addEventListener('click', function (event) {
    var btn = event.target.closest('.lvaf-fq-btn');
    if (!btn || !list.contains(btn)) { return; }

    var item = btn.closest('.lvaf-fq-item');
    if (!item) { return; }

    var warOffen = !item.classList.contains('lvaf-fq-closed');
    var alle = list.querySelectorAll('.lvaf-fq-item');
    for (var i = 0; i < alle.length; i++) { setzen(alle[i], false); }
    if (!warOffen) { setzen(item, true); }
  });
})();