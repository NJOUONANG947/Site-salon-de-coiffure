/**
 * Site coiffeuse – Script principal
 * Navigation mobile, formulaires, comportements
 */

document.addEventListener('DOMContentLoaded', function () {
  // Menu mobile
  const boutonMenu = document.querySelector('.bouton-menu');
  const nav = document.querySelector('.nav-principale');
  if (boutonMenu && nav) {
    boutonMenu.addEventListener('click', function () {
      nav.classList.toggle('ouvert');
      boutonMenu.setAttribute('aria-expanded', nav.classList.contains('ouvert'));
    });
    // Fermer en cliquant sur un lien
    nav.querySelectorAll('a').forEach(function (lien) {
      lien.addEventListener('click', function () {
        nav.classList.remove('ouvert');
        boutonMenu.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Marquer la page courante dans la nav
  const path = window.location.pathname || '';
  const page = path.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-principale a').forEach(function (a) {
    const href = a.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      a.setAttribute('aria-current', 'page');
    }
  });

  // Formulaire de contact
  const formContact = document.getElementById('formulaire-contact');
  if (formContact) {
    formContact.addEventListener('submit', function (e) {
      e.preventDefault();
      var blocContact = formContact.closest('.formulaire-bloc');
      const msg = (blocContact ? blocContact.querySelector('.message-formulaire') : null) || formContact.querySelector('.message-formulaire');
      // Simulation envoi (à remplacer par vrai envoi backend / service)
      if (msg) {
        msg.textContent = 'Merci pour votre message. Nous vous recontacterons rapidement.';
        msg.classList.remove('erreur');
        msg.classList.add('succes', 'visible');
        formContact.reset();
      }
    });
  }

  // Formulaire de rendez-vous
  const formRdv = document.getElementById('formulaire-rendez-vous');
  if (formRdv) {
    formRdv.addEventListener('submit', function (e) {
      e.preventDefault();
      var bloc = formRdv.closest('.formulaire-bloc');
      const msg = (bloc ? bloc.querySelector('.message-formulaire') : null) || formRdv.querySelector('.message-formulaire');
      const btn = formRdv.querySelector('button[type="submit"]');
      if (!msg) return;
      function showSuccess() {
        msg.textContent = 'Your appointment request has been sent. We will confirm by phone or email.';
        msg.classList.remove('erreur');
        msg.classList.add('succes', 'visible');
        formRdv.reset();
      }
      function showError(text) {
        msg.textContent = text || 'Unable to send. Please call (267) 504-8573 to book.';
        msg.classList.remove('succes');
        msg.classList.add('erreur', 'visible');
      }
      if (window.location.protocol === 'file:') {
        showError('To send your request online, open the site at http://localhost:3000 (run npm start). Or call us to book.');
        return;
      }
      if (btn) btn.disabled = true;
      const data = {
        nom: (formRdv.querySelector('[name="nom"]') || {}).value || '',
        telephone: (formRdv.querySelector('[name="telephone"]') || {}).value || '',
        email: (formRdv.querySelector('[name="email"]') || {}).value || '',
        prestation: (formRdv.querySelector('[name="prestation"]') || {}).value || '',
        date: (formRdv.querySelector('[name="date"]') || {}).value || '',
        creneau: (formRdv.querySelector('[name="creneau"]') || {}).value || '',
        message: (formRdv.querySelector('[name="message"]') || {}).value || ''
      };
      fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json().then(function (body) { return { status: r.status, body: body }; }); })
        .then(function (result) {
          if (result.status === 200 && result.body && result.body.ok) {
            showSuccess();
          } else {
            showError(result.body && result.body.error ? result.body.error : 'Request failed. Please try again or call us.');
          }
        })
        .catch(function () {
          showError('Network error. Please call (267) 504-8573 to book.');
        })
        .finally(function () {
          if (btn) btn.disabled = false;
        });
    });
  }
});
