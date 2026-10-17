// Royal Agar Attar v2 — small, dependency-free behaviour.
(function () {
  var WA = '8801819420122';
  window.dataLayer = window.dataLayer || [];
  function track(event, params) { var o = { event: event }; for (var k in params) if (params[k]) o[k] = params[k]; window.dataLayer.push(o); }

  var header = document.querySelector('.site-header');
  var bar = document.querySelector('.action-bar');
  var hero = document.querySelector('.hero');
  var quote = document.getElementById('quote');
  var quoteVisible = false;

  function onScroll() {
    var y = window.scrollY;
    header.toggleAttribute('data-scrolled', y > 8);
    if (bar && hero) bar.toggleAttribute('data-show', y > hero.offsetHeight * 0.6 && !quoteVisible);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  if ('IntersectionObserver' in window) {
    // Hide the action bar while the form is on screen: it would cover the fields.
    if (quote) new IntersectionObserver(function (e) { quoteVisible = e[0].isIntersecting; onScroll(); }, { threshold: 0.15 }).observe(quote);

    var io = new IntersectionObserver(function (entries) {
      entries.filter(function (e) { return e.isIntersecting; }).forEach(function (e, i) {
        e.target.style.transitionDelay = Math.min(i * 60, 240) + 'ms';
        e.target.setAttribute('data-visible', '');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.06 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.setAttribute('data-visible', ''); });
  }
  onScroll();

  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-wa]');
    if (a) track('whatsapp_click', { click_location: a.getAttribute('data-wa'), product: a.getAttribute('data-product') });
  });

  var note = document.getElementById('form-note');
  if (quote) quote.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = quote.elements;
    var need = ['name', 'country', 'buyer', 'oil', 'qty'];
    var missing = need.filter(function (n) { return !String(f[n].value || '').trim(); });
    if (missing.length) {
      f[missing[0]].focus();
      note.setAttribute('data-error', '');
      note.textContent = 'Please fill in your name, country, business type, grade and quantity.';
      return;
    }
    note.removeAttribute('data-error');
    var v = function (n) { return String(f[n].value || '').trim(); };
    var lines = [
      'Hello Royal Agar Attar, I would like a wholesale quote.', '',
      'Name: ' + v('name'),
      v('company') ? 'Business: ' + v('company') : null,
      'Type: ' + v('buyer'),
      'Country: ' + v('country'),
      'Grade: ' + v('oil'),
      'Quantity: ' + v('qty'),
      v('message') ? 'Notes: ' + v('message') : null
    ].filter(function (l) { return l !== null; });
    track('generate_lead', { lead_source: 'quote_form', oil: v('oil'), quantity: v('qty'), country: v('country'), buyer_type: v('buyer') });
    note.textContent = 'Opening WhatsApp…';
    window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
    setTimeout(function () { note.textContent = 'If WhatsApp did not open, message us at +880 1819 420122.'; }, 1200);
  });

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
