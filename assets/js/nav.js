// Minimal behavior for the real header/footer markup (burger menu, copy code, countdown, year).
document.addEventListener('DOMContentLoaded', () => {
  const burger = document.querySelector('[data-lvf-burger]');
  const menu = document.getElementById('lvf-s01-menu');
  if (burger && menu) {
    burger.addEventListener('click', () => {
      const open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('lvf-s01-menu--open', !open);
    });
  }

  const copyBtn = document.querySelector('[data-lvf-copy]');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const code = copyBtn.getAttribute('data-lvf-copy');
      navigator.clipboard?.writeText(code).catch(() => {});
      copyBtn.classList.add('lvf-s01-copy--done');
      setTimeout(() => copyBtn.classList.remove('lvf-s01-copy--done'), 1500);
    });
  }

  const yearEl = document.querySelector('[data-lvf-jahr]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  const timer = document.querySelector('[data-lvf-countdown]');
  if (timer) {
    function endOfMonthUTC() {
      const now = new Date();
      return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 0));
    }
    function tick() {
      const diff = endOfMonthUTC().getTime() - Date.now();
      if (diff <= 0) { timer.textContent = '00d : 00h : 00m : 00s'; return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      timer.textContent = `${String(d).padStart(2,'0')}d : ${String(h).padStart(2,'0')}h : ${String(m).padStart(2,'0')}m : ${String(s).padStart(2,'0')}s`;
    }
    tick();
    setInterval(tick, 1000);
  }
});
