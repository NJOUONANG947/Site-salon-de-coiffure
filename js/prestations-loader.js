/**
 * Charge les prestations depuis l'API et remplit :
 * - la page prestations.html (#liste-prestations)
 * - le select du formulaire rendez-vous (#rdv-prestation)
 * Ne fait rien si la page est ouverte en file://
 */
(function () {
  if (window.location.protocol === 'file:') return;

  function escapeHtml(s) {
    if (s == null) return '';
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function loadPrestations() {
    fetch('/api/prestations')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        var list = data.prestations || [];
        // Page Services & Prices : remplir #liste-prestations
        var container = document.getElementById('liste-prestations');
        if (container && list.length > 0) {
          container.innerHTML = list.map(function (p) {
            var name = escapeHtml(p.name || '');
            var price = (p.price != null && p.price !== '') ? ('$' + String(p.price).trim()) : '';
            var imgSrc = (p.image && p.image !== 'placeholder.svg') ? ('images/' + p.image) : 'images/placeholder.svg';
            return '<div class="prestation-ligne">' +
              '<div class="prestation-image">' +
              '<img src="' + imgSrc + '" alt="' + name + '" loading="lazy" onerror="this.style.display=\'none\';if(this.nextElementSibling)this.nextElementSibling.style.display=\'flex\';">' +
              '<div class="insert-image">Insert your image here</div>' +
              '</div>' +
              '<div class="prestation-infos">' +
              '<h3>' + name + '</h3>' +
              '<p class="prix">' + price + '</p>' +
              '</div></div>';
          }).join('');
        }
        // Formulaire Book : remplir #rdv-prestation
        var select = document.getElementById('rdv-prestation');
        if (select && list.length > 0) {
          select.innerHTML = '';
          var opt0 = document.createElement('option');
          opt0.value = '';
          opt0.textContent = 'Choose a service';
          select.appendChild(opt0);
          list.forEach(function (p) {
            var opt = document.createElement('option');
            opt.value = p.id || '';
            opt.textContent = (p.name || '') + (p.price != null && p.price !== '' ? ' – $' + String(p.price).trim() : '');
            select.appendChild(opt);
          });
          var other = document.createElement('option');
          other.value = 'autre';
          other.textContent = 'Other';
          select.appendChild(other);
        }
      })
      .catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadPrestations);
  } else {
    loadPrestations();
  }
})();
