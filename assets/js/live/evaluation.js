(function(){
/* == Shared plan data: pricing-card figures re-used by the e3 configure section == */
var LVEV_PLAN_DATA = {
  'lvlup': {
    '25k': {
      title: '25K Evaluation',
      summaryLabel: '25K Evaluation',
      basePrice: '$117.00',
      summaryPrice: '$117.00 / month',
      totalPrice: '$117.00/mo',
      profitTarget: '$1,500',
      drawdown: '$1,250',
      minDays: '5 days',
      maxContracts: '1 Mini',
      profitSplit: '80%',
      payoutCycle: 'Every 14 days',
      payoutCap: '10% of Balance',
      consistency: '40%'
    },
    '50k': {
      title: '50K Evaluation',
      summaryLabel: '50K Evaluation',
      basePrice: '$201.00',
      summaryPrice: '$201.00 / month',
      totalPrice: '$201.00/mo',
      profitTarget: '$3,000',
      drawdown: '$2,500',
      minDays: '5 days',
      maxContracts: '3 Mini',
      profitSplit: '80%',
      payoutCycle: 'Every 14 days',
      payoutCap: '10% of Balance',
      consistency: '40%'
    },
    '100k': {
      title: '100K Evaluation',
      summaryLabel: '100K Evaluation',
      basePrice: '$345.00',
      summaryPrice: '$345.00 / month',
      totalPrice: '$345.00/mo',
      profitTarget: '$7,000',
      drawdown: '$5,000',
      minDays: '5 days',
      maxContracts: '6 Mini',
      profitSplit: '80%',
      payoutCycle: 'Every 14 days',
      payoutCap: '10% of Balance',
      consistency: '40%'
    },
    '150k': {
      title: '150K Evaluation',
      summaryLabel: '150K Evaluation',
      basePrice: '$453.00',
      summaryPrice: '$453.00 / month',
      totalPrice: '$453.00/mo',
      profitTarget: '$12,000',
      drawdown: '$7,500',
      minDays: '5 days',
      maxContracts: '9 Mini',
      profitSplit: '80%',
      payoutCycle: 'Every 14 days',
      payoutCap: '10% of Balance',
      consistency: '40%'
    }
  },
  'starter': {
    '25k': {
      title: '25K Evaluation',
      summaryLabel: '25K Evaluation',
      basePrice: '$129.00',
      summaryPrice: '$129.00 one-time',
      totalPrice: '$129.00',
      profitTarget: '$1,500',
      drawdown: '$1,000',
      minDays: '5 days',
      maxContracts: '1 Mini',
      profitSplit: '100%',
      payoutCycle: 'Every 5 days',
      payoutCap: '4%',
      consistency: '40%'
    },
    '50k': {
      title: '50K Evaluation',
      summaryLabel: '50K Evaluation',
      basePrice: '$194.00',
      summaryPrice: '$194.00 one-time',
      totalPrice: '$194.00',
      profitTarget: '$3,000',
      drawdown: '$2,000',
      minDays: '5 days',
      maxContracts: '3 Mini',
      profitSplit: '100%',
      payoutCycle: 'Every 5 days',
      payoutCap: '4%',
      consistency: '40%'
    },
    '100k': {
      title: '100K Evaluation',
      summaryLabel: '100K Evaluation',
      basePrice: '$259.00',
      summaryPrice: '$259.00 one-time',
      totalPrice: '$259.00',
      profitTarget: '$7,000',
      drawdown: '$3,000',
      minDays: '5 days',
      maxContracts: '6 Mini',
      profitSplit: '100%',
      payoutCycle: 'Every 5 days',
      payoutCap: '2.5%',
      consistency: '40%'
    },
    '150k': {
      title: '150K Evaluation',
      summaryLabel: '150K Evaluation',
      basePrice: '$324.00',
      summaryPrice: '$324.00 one-time',
      totalPrice: '$324.00',
      profitTarget: '$12,000',
      drawdown: '$4,500',
      minDays: '5 days',
      maxContracts: '9 Mini',
      profitSplit: '100%',
      payoutCycle: 'Every 5 days',
      payoutCap: '2%',
      consistency: '40%'
    }
  }
};

window.LVEV_CURRENT_PLAN_TYPE = 'lvlup';
window.LVEV_CURRENT_PLAN_SIZE = '50k';

function lvevApplyPlanToConfigure() {
  var size = window.LVEV_CURRENT_PLAN_SIZE;
  var type = window.LVEV_CURRENT_PLAN_TYPE;
  var data = LVEV_PLAN_DATA[type][size];
  var e3 = document.querySelector('.lvev-e3');
  if (!data || !e3) return;
  
  Object.keys(data).forEach(function (key) {
    if (key === 'totalPrice') return; // Handled separately
    var els = e3.querySelectorAll('[data-lvev-e3-field="' + key + '"]');
    Array.prototype.forEach.call(els, function (el) {
      el.textContent = data[key];
    });
  });

  // Handle Label for Base Monthly Price vs Base Price
  var basePriceLabel = e3.querySelector('.lvev-e3-row--top .lvev-e3-row-label');
  if (basePriceLabel && !basePriceLabel.hasAttribute('data-lvev-e3-field')) {
      basePriceLabel.textContent = type === 'lvlup' ? 'Base Monthly Price' : 'Base Price';
  }

  lvevUpdateGrandTotal();
}

function lvevUpdateGrandTotal() {
  var e3 = document.querySelector('.lvev-e3');
  if (!e3) return;
  
  var size = window.LVEV_CURRENT_PLAN_SIZE;
  var type = window.LVEV_CURRENT_PLAN_TYPE;
  var data = LVEV_PLAN_DATA[type][size];
  if (!data) return;

  var baseVal = parseFloat(data.basePrice.replace(/[^0-9.]/g, ''));
  
  var addonBtn = e3.querySelector('[data-lvev-e3-addon]');
  var isAddonActive = addonBtn && addonBtn.getAttribute('aria-checked') === 'true';

  var finalVal = baseVal;
  if (isAddonActive) {
      finalVal = baseVal * 1.25; // +25%
  }

  var totalStr = "$" + finalVal.toFixed(2);
  if (type === 'lvlup') {
      totalStr += "/mo";
  }

  var els = e3.querySelectorAll('[data-lvev-e3-field="totalPrice"]');
  Array.prototype.forEach.call(els, function (el) {
    el.textContent = totalStr;
  });
}

window.lvevApplyPlanToConfigure = lvevApplyPlanToConfigure;
window.lvevUpdateGrandTotal = lvevUpdateGrandTotal;

/* e2-pricing */
(function () {
  'use strict';

  var root = document.querySelector('.lvev-e2');
  if (!root) return;

  function updateSelectedCardState(panel) {
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-lvev-e2-select]'));
      chips.forEach(function (c) {
          var on = c.getAttribute('data-lvev-e2-select').toLowerCase() === window.LVEV_CURRENT_PLAN_SIZE.toLowerCase();
          c.classList.toggle('is-selected', on);
          c.setAttribute('aria-pressed', on ? 'true' : 'false');
          var t = c.querySelector('.lvev-e2-chip-t');
          if (t) t.textContent = on ? 'Selected' : 'Select';
          
          var card = c.closest('.lvev-e2-card');
          var cta = card ? card.querySelector('.lvev-e2-cta') : null;
          var ctaT = cta ? cta.querySelector('.lvev-e2-cta-t') : null;
          if (cta && ctaT) {
              cta.classList.toggle('lvev-e2-cta--active', on);
              var size = (card.getAttribute('data-lvev-e2-account') || '').toUpperCase();
              ctaT.textContent = on ? 'Selected $' + size : 'Select';
          }
      });
  }

  function selectCard(chip, typePanelStr) {
      window.LVEV_CURRENT_PLAN_SIZE = chip.getAttribute('data-lvev-e2-select');
      var panels = Array.prototype.slice.call(root.querySelectorAll('.lvev-e2-cards'));
      panels.forEach(function (panel) {
          updateSelectedCardState(panel);
      });
  }

  var allChips = Array.prototype.slice.call(root.querySelectorAll('[data-lvev-e2-select]'));
  allChips.forEach(function (c) {
    c.addEventListener('click', function () { selectCard(c); });
  });

  var ctas = Array.prototype.slice.call(root.querySelectorAll('[data-lvev-e2-cta]'));
  ctas.forEach(function (cta) {
    cta.addEventListener('click', function (event) {
      event.preventDefault();
      var card = cta.closest('.lvev-e2-card');
      if (!card) return;
      var chip = card.querySelector('[data-lvev-e2-select]');
      if (chip) selectCard(chip);
      lvevApplyPlanToConfigure();
      var target = document.getElementById('configure');
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ---------- Tabs Lvlup / Starter ---------- */
  var tabs = Array.prototype.slice.call(root.querySelectorAll('[data-lvev-e2-plan]'));

  function activateTab(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.setAttribute('tabindex', on ? '0' : '-1');
    });
    var planType = tab.getAttribute('data-lvev-e2-plan');
    window.LVEV_CURRENT_PLAN_TYPE = planType;
    
    var panels = root.querySelectorAll('.lvev-e2-cards');
    panels.forEach(function(p) {
        if (p.getAttribute('data-lvev-e2-panel') === planType) {
            p.style.display = '';
            updateSelectedCardState(p);
        } else {
            p.style.display = 'none';
        }
    });
    
    lvevApplyPlanToConfigure();
    
    if (focus) tab.focus();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { activateTab(t, false); });
    t.addEventListener('keydown', function (ev) {
      var dir = ev.key === 'ArrowRight' ? 1 : ev.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      ev.preventDefault();
      activateTab(tabs[(i + dir + tabs.length) % tabs.length], true);
    });
  });

  // Init
  lvevApplyPlanToConfigure();

})();

/* e3-configure */
(function () {
  'use strict';

  var root = document.querySelector('.lvev-e3');
  if (!root) return;

  var platforms = Array.prototype.slice.call(root.querySelectorAll('[data-lvev-e3-platform]'));
  var sumPlatform = root.querySelector('[data-lvev-e3-sum-platform]');
  var platformNames = { dx: 'DX Futures', volumetrica: 'Volumetrica' };

  function selectPlatform(btn) {
    platforms.forEach(function (item) {
      var on = item === btn;
      item.classList.toggle('lvev-e3-opt--on', on);
      item.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    if (sumPlatform) {
      sumPlatform.textContent = platformNames[btn.getAttribute('data-lvev-e3-platform')] || 'DX Futures';
    }
  }

  platforms.forEach(function (btn) {
    btn.addEventListener('click', function () { selectPlatform(btn); });
  });

  var addon = root.querySelector('[data-lvev-e3-addon]');
  var sumAddon = root.querySelector('[data-lvev-e3-sum-addon]');

  if (addon) {
    addon.addEventListener('click', function () {
      var on = addon.getAttribute('aria-checked') !== 'true';
      addon.setAttribute('aria-checked', on ? 'true' : 'false');
      addon.classList.toggle('lvev-e3-opt--on', on);
      if (sumAddon) {
        sumAddon.textContent = on ? 'Applied (+25)' : 'Not applied';
      }
      window.lvevUpdateGrandTotal();
    });
  }
})();

/* e7-faq */
(function () {
  'use strict';

  var lists = document.querySelectorAll('[data-lvev-e7-accordion]');
  if (!lists.length) return;

  Array.prototype.forEach.call(lists, function (list) {
    if (list.dataset.lvevE7Ready === '1') return;
    list.dataset.lvevE7Ready = '1';

    var items = Array.prototype.slice.call(list.querySelectorAll('[data-lvev-e7-item]'));
    var buttons = items.map(function (item) {
      return item.querySelector('.lvev-e7-q');
    }).filter(Boolean);

    function setOpen(item, open) {
      var btn = item.querySelector('.lvev-e7-q');
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

    items.forEach(function (item) {
      setOpen(item, item.classList.contains('is-open'));
    });

    buttons.forEach(function (btn, index) {
      btn.addEventListener('click', function () {
        toggle(btn.closest('[data-lvev-e7-item]'));
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
})();
