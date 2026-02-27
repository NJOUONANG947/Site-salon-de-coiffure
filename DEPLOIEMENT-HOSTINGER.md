# Héberger le site sur Hostinger

Ce projet est une **application Node.js (Express)**. Vous avez **deux options** selon l’offre Hostinger.

---

## Quel plan choisir ?

| Plan        | Prix (ex. promo) | Node.js | Pour ce site |
|------------|-------------------|--------|---------------|
| **Premium** | 2,99 €/mois       | ❌ Aucune app Node.js | Ne convient pas |
| **Business** | **1,99 €/mois** | ✅ **5 applications Node.js infogérées** | **Recommandé** |
| **Cloud Startup** | 9,99 €/mois | ✅ 10 applications Node.js | Si vous avez plusieurs apps |

→ Pour ce site, le plan **Business** suffit (1 app Node.js sur les 5 incluses).

---

# Option A : Hébergement Web Business (Node.js infogéré)

Pas besoin de VPS ni de SSH : Hostinger gère tout depuis **hPanel**.

## 1. Souscrire au plan Business

- Sur [hostinger.com](https://www.hostinger.com), choisir **Hébergement web** → **Business** (1,99 €/mois en promo).
- Finaliser la commande (domaine inclus 1 an, SSL gratuit, etc.).

## 2. Créer une application Node.js dans hPanel

- Connectez-vous à **hPanel** (panel Hostinger).
- Allez dans **Applications web** ou **Sites** → **Créer une application** / **Node.js** (libellé selon l’interface).
- Choisir **Nouvelle application Node.js**.

## 3. Connecter le projet

Une des options suivantes :

- **GitHub** : connecter votre dépôt (si le code est sur GitHub), choisir la branche (ex. `main`).
- **ZIP** : préparer une archive du projet **sans** le dossier `node_modules`, puis l’importer.
- **Déploiement depuis l’IDE** : si Hostinger propose l’extension (VS Code / Cursor), suivre leur guide.

Le serveur détecte en général `package.json` et lance `npm install` puis la commande de démarrage.

## 4. Configurer le démarrage

- **Commande de démarrage** : `npm start` ou `node server.js`.
- **Racine du projet** : le dossier où se trouvent `server.js` et `package.json` (souvent la racine du dépôt ou du ZIP).

## 5. Variables d’environnement (obligatoire en production)

Dans la fiche de l’application Node.js, section **Variables d’environnement** (ou **Env**), ajouter :

| Variable         | Valeur (exemple)                          |
|------------------|-------------------------------------------|
| `ADMIN_PASSWORD` | Un mot de passe fort pour l’admin         |
| `SESSION_SECRET` | Une longue chaîne aléatoire               |
| `NODE_ENV`       | `production`                               |

Ne pas mettre de PORT en général : Hostinger assigne le port.

## 6. Domaine et SSL

- Dans hPanel : **Domaines** → attacher votre domaine à l’hébergement.
- Associer l’**application Node.js** à ce domaine (souvent dans la config de l’app ou sous « Domaines »).
- Le **SSL gratuit** Hostinger est en général activé automatiquement pour le domaine.

## 7. Après déploiement

- **Site** : `https://votredomaine.com`
- **Admin** : `https://votredomaine.com/admin/`
- Mot de passe admin = valeur de `ADMIN_PASSWORD`.

En cas de souci, consulter l’onglet **Logs** ou **Build** de l’application dans hPanel, ou le support Hostinger (24/7).

---

# Option B : VPS (SSH, tout contrôler vous‑même)

Si vous préférez un **VPS** (accès SSH, Nginx, PM2), suivez les étapes ci‑dessous.

---

## 1. Choisir l’offre Hostinger (VPS)

- Allez sur [hostinger.com](https://www.hostinger.com) → **VPS**.
- Choisir un plan VPS (ex. **KVM 1** ou **KVM 2**).
- Les VPS avec Node.js incluent souvent Ubuntu, Node.js et un serveur web. Vérifiez que Node.js est bien proposé sur le plan.

---

## 2. Accéder au serveur

- Dans le panel Hostinger : **VPS** → votre serveur → **SSH**.
- Notez : **adresse IP**, **utilisateur** (souvent `root`), **mot de passe** (ou clé SSH).
- Sur votre PC, ouvrez un terminal et connectez-vous :
  ```bash
  ssh root@VOTRE_IP
  ```
  (remplacez `VOTRE_IP` par l’IP du VPS).

---

## 3. Installer Node.js (si pas déjà installé)

Sur Ubuntu :
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
npm -v
```

---

## 4. Envoyer le projet sur le serveur

**Option A – Git (si le projet est sur GitHub/GitLab)**  
Sur le serveur :
```bash
cd /var/www
sudo git clone https://github.com/VOTRE_UTILISATEUR/VOTRE_REPO.git site-coiffure
cd site-coiffure
```

**Option B – Fichiers à la main (FTP / gestionnaire de fichiers)**  
- Dans le panel Hostinger : **Fichiers** (ou FTP).
- Créez un dossier, ex. `site-coiffure`.
- Envoyez **tout** le contenu du projet (dossier du site) **sauf** `node_modules` :
  - `server.js`, `package.json`, `package-lock.json`
  - dossiers : `admin`, `css`, `js`, `images`
  - fichiers : `index.html`, `apropos.html`, `contact.html`, etc.
  - `content.json`, `bookings.json` (s’ils existent)
  - `.env.example` (pour rappel ; vous créerez `.env` sur le serveur)

Puis en SSH, allez dans ce dossier :
```bash
cd /chemin/vers/site-coiffure
```

---

## 5. Installer les dépendances et configurer

```bash
npm install
```

Créer le fichier `.env` (production) :
```bash
nano .env
```

Contenu minimal (à adapter) :
```env
ADMIN_PASSWORD=UnMotDePasseTresFortEtLong
SESSION_SECRET=UneChaineAleatoireLonguePourLesSessions
PORT=3000
NODE_ENV=production
```

Sauvegardez (`Ctrl+O`, Entrée, `Ctrl+X`).

---

## 6. Faire tourner le site en continu (PM2)

Pour que le site reste en ligne après déconnexion SSH :

```bash
sudo npm install -g pm2
pm2 start server.js --name "site-coiffure"
pm2 save
pm2 startup
```

(Exécutez la commande que `pm2 startup` affiche si elle vous le demande.)

Vérifier :
```bash
pm2 status
pm2 logs site-coiffure
```

Le site écoute sur le **port 3000** en interne.

---

## 7. Ouvrir le site sur le port 80 (HTTP) / 443 (HTTPS)

Le trafic doit arriver sur le port 80 (et 443 pour HTTPS). Il faut donc faire « passer » par votre app Node (port 3000).

**A – Avec Nginx (recommandé)**  
Installer Nginx :
```bash
sudo apt update
sudo apt install nginx -y
```

Créer un fichier de configuration :
```bash
sudo nano /etc/nginx/sites-available/site-coiffure
```

Contenu (remplacez `VOTRE_DOMAINE` par votre domaine, ex. `www.africanhairbraiding.com`) :
```nginx
server {
    listen 80;
    server_name VOTRE_DOMAINE;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Activer le site et recharger Nginx :
```bash
sudo ln -s /etc/nginx/sites-available/site-coiffure /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**B – Sans Nginx (pour test uniquement)**  
Vous pouvez lancer le serveur sur le port 80 en mettant dans `.env` :
```env
PORT=80
```
Puis `pm2 restart site-coiffure`. En production, Nginx + PM2 est préférable.

---

## 8. Domaine et SSL (HTTPS)

- Dans le **panel Hostinger** : **Domaines** → attachez votre domaine au VPS (A record vers l’IP du VPS).
- Pour le **SSL (cadenas)** :  
  - Soit utiliser **Let’s Encrypt** avec Nginx :
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d VOTRE_DOMAINE
    ```
  - Soit le **SSL fourni par Hostinger** si vous passez par leur outil (suivez leur doc).

---

## 9. Récapitulatif des URLs

- **Site** : `https://VOTRE_DOMAINE` (ex. `https://www.africanhairbraiding.com`)
- **Admin** : `https://VOTRE_DOMAINE/admin/`
- **Mot de passe admin** : celui défini dans `ADMIN_PASSWORD` du fichier `.env`.

---

## 10. Points importants

1. **Ne jamais commiter `.env`** : il reste uniquement sur le serveur.
2. **Sauvegardes** : `content.json`, `bookings.json` et le dossier `images/` contiennent vos données ; sauvegardez-les régulièrement (backups Hostinger ou script).
3. **Mises à jour** : après modification du code, re-upload des fichiers puis :
   ```bash
   pm2 restart site-coiffure
   ```
   Si vous utilisez Git : `git pull` puis `pm2 restart site-coiffure`.

---

## En cas de problème

- **Le site ne répond pas** : vérifier `pm2 status` et `pm2 logs site-coiffure`, et que le port 3000 est bien utilisé par Node.
- **502 Bad Gateway** : Nginx ne joint pas Node ; vérifier que l’app tourne (`pm2 list`) et que `proxy_pass http://127.0.0.1:3000` est correct.
- **Admin inaccessible** : vérifier que vous allez bien sur `https://VOTRE_DOMAINE/admin/` et que `ADMIN_PASSWORD` est défini dans `.env`.
