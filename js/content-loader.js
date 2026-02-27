/**
 * Charge le contenu depuis l'API (quand le site est servi par le serveur admin).
 * Ne fait rien si la page est ouverte en file:// (double-clic sur le HTML).
 * Pour que l'admin et le site communiquent, ouvrez toujours le site via le serveur (ex. http://localhost:3000).
 */
(function () {
  if (window.location.protocol === 'file:') return;
  function safeStr(val) {
    if (val == null) return '';
    var s = String(val).trim();
    return s;
  }
  function setHref(el, url) {
    var u = safeStr(url);
    if (u && u !== 'undefined') el.setAttribute('href', u);
  }
  fetch('/api/content')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (data) {
      document.querySelectorAll('[data-content]').forEach(function (el) {
        var key = el.getAttribute('data-content');
        var val = data[key];
        if (val != null && typeof val === 'string') el.textContent = val;
      });
      document.querySelectorAll('[data-content-href]').forEach(function (el) {
        var key = el.getAttribute('data-content-href');
        setHref(el, data[key]);
      });
      document.querySelectorAll('[data-content-tel]').forEach(function (el) {
        var key = el.getAttribute('data-content-tel');
        var val = data[key];
        if (val != null) setHref(el, 'tel:' + String(val).replace(/\s/g, ''));
      });
      document.querySelectorAll('[data-content-mailto]').forEach(function (el) {
        var key = el.getAttribute('data-content-mailto');
        setHref(el, data[key] ? 'mailto:' + data[key] : '');
      });
    })
    .catch(function () {});
})();
