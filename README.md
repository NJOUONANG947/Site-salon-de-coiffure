# African Hair Braiding by Alvine – Site vitrine

Site vitrine pour **African Hair Braiding by Alvine** (Rose), San Antonio, Texas 78252. Présentation de l’activité, services et tarifs (braids, knotless, boho, cornrows…), galerie, prise de rendez-vous et contact.

## Contenu du site

- **Home** – Hero, présentation, lien vers booking et services  
- **About** – Parcours de Rose, salon privé à San Antonio  
- **Services & Prices** – Liste des coiffures avec prix et zone pour insérer une photo par prestation  
- **Gallery** – Photos des réalisations (à remplir dans `images/galerie/`)  
- **Book** – Formulaire de demande de RDV (rappel : dépôt $10)  
- **Contact** – Hamrick Circle, téléphone, email, carte Google, infos importantes, formulaire  
- **Legal & Privacy** – Mentions légales et confidentialité  

## Ouvrir le site en local

1. Ouvrir le dossier du projet.  
2. Double-cliquer sur `index.html` pour l’ouvrir dans le navigateur.  
   **Ou** lancer un serveur local (recommandé pour éviter les soucis de chemins) :  
   - Avec Python : `python -m http.server 8000` puis aller sur `http://localhost:8000`  
   - Avec Node : `npx serve`  

## Administration (upload d’images et modification du contenu)

Un **système d’administration** permet d’uploader les images et de modifier le contenu du site (nom, téléphone, e-mail, adresse, textes d’accueil et À propos) sans toucher au code.

### Démarrer le serveur avec l’admin

1. Installer Node.js si besoin, puis dans le dossier du projet :  
   `npm install`  
2. Lancer le serveur :  
   `npm start`  
3. Ouvrir dans le navigateur :  
   - **Site** : http://localhost:3000  
   - **Admin** : http://localhost:3000/admin/  

### Connexion à l’admin

- **Mot de passe par défaut** : `admin123`  
- Pour le modifier : créer un fichier `.env` à la racine (voir `.env.example`) et définir `ADMIN_PASSWORD=votre_mot_de_passe`.  

### Dans l’admin vous pouvez

- **Upload d’images** : choisir l’emplacement (accueil, à propos, galerie 1 à 6, prestations 1 à 14), sélectionner le fichier, envoyer. L’image remplace celle déjà en place (ex. `01.jpeg`, `03.jpeg`, etc.).  
- **Modifier le contenu** : nom du business, téléphone, e-mail, adresse, ville, liens Facebook et Google Maps, titre et sous-titre de la page d’accueil, textes de la page À propos. Cliquer sur « Enregistrer le contenu ».  

Les changements sont enregistrés dans `content.json` et dans le dossier `images/`. Quand le site est consulté via le serveur (`npm start`), le contenu de `content.json` est appliqué automatiquement aux pages (accueil, contact, pied de page).  

Sans serveur (fichiers ouverts en `file://` ou avec un autre hébergeur statique), le site affiche le contenu par défaut des fichiers HTML ; les images uploadées via l’admin restent utilisées si elles sont dans `images/`.  

## Personnalisation

Le site est déjà configuré avec :

- **Nom** : African Hair Braiding by Alvine  
- **Lieu** : Hamrick Circle, San Antonio, TX 78252  
- **Téléphone** : (267) 504-8573  
- **Email** : africanhairbraidingbyalvine@gmail.com  
- **Google Maps** : [lien](https://maps.app.goo.gl/H9T6pZWH8DgsRgXq8?g_st=ic)  
- **Facebook** : [lien](https://www.facebook.com/share/1DpMEGNFhg/?mibextid=wwXIfr)  

Vous pouvez modifier les textes, tarifs et horaires directement dans les fichiers HTML. Pour les **prestations**, ajouter les images dans chaque zone prévue (voir section Images).  

## Images

- **Accueil** : `images/coiffeuse.jpg` – photo de Rose ou du salon.  
- **À propos** : `images/salon.jpg` – intérieur du salon.  
- **Galerie** : ajouter les photos dans `images/galerie/` en les nommant `01.jpg`, `02.jpg`, … `06.jpg` (ou adapter les noms dans `galerie.html`).  
- **Services & Prices (prestations)** : pour afficher une photo à côté de chaque coiffure, ajouter une balise `<img>` dans la zone « Insert your image here ». Exemple : à l’intérieur de `<div class="prestation-image">`, ajouter avant le div « Insert your image here » :  
  `<img src="images/prestations/two-cornrow.jpg" alt="Two cornrow Jumbo">`  
  Le texte « Insert your image here » sera masqué automatiquement quand une image est présente. Créer le dossier `images/prestations/` et y déposer vos photos (nommer les fichiers selon la prestation).  
- Optimiser les images pour le web (poids, dimensions) pour le référencement et la performance.

## Formulaires (contact et rendez-vous)

Les formulaires affichent un message de succès après envoi mais **n’envoient pas encore les données** à un serveur. Pour une mise en production :

- Brancher le formulaire de contact sur un script d’envoi d’e-mail (PHP, service type Formspree, Netlify Forms, etc.).  
- Brancher le formulaire de rendez-vous sur un système de réservation (agenda en ligne, prise de RDV, ou envoi par e-mail vers le salon).  

## SEO local

- Remplacer `[Ville]` et `[Nom]` partout pour des meta descriptions et titres cohérents.  
- Compléter les balises `meta name="description"` et `meta name="keywords"` sur chaque page (déjà présentes, à ajuster).  
- Renseigner les attributs `alt` des images avec des descriptions pertinentes.  
- Créer ou mettre à jour la fiche **Google Business Profile** (ex-Google My Business) avec la même adresse, téléphone, horaires et lien vers le site.  

## Certificat SSL

Le certificat SSL (HTTPS) se configure chez **l’hébergeur** du site (option souvent gratuite avec Let’s Encrypt). Aucune modification du code n’est nécessaire.

## Structure des fichiers

```
Site coiffure/
├── index.html
├── apropos.html
├── prestations.html
├── galerie.html
├── rendez-vous.html
├── contact.html
├── mentions-legales.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   ├── placeholder.svg
│   ├── coiffeuse.jpg    (à ajouter)
│   ├── salon.jpg       (à ajouter)
│   └── galerie/
│       ├── 01.jpg … 06.jpg  (à ajouter)
└── README.md
```

## Maintenance

- Faire des **sauvegardes** régulières du site et des éventuelles bases de données.  
- Mettre à jour les tarifs, horaires et textes selon l’activité du salon.  
- Vérifier périodiquement les liens (contact, réseaux sociaux, mentions légales).  

---

*Site réalisé selon le cahier des charges « Site internet pour coiffeuse » – responsive, formulaires, SEO local, mentions légales et RGPD.*
