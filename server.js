/**
 * Serveur admin – Upload d'images + édition du contenu
 * Lancer avec: npm start (après npm install)
 * Site: http://localhost:3000   Admin: http://localhost:3000/admin/
 */

const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const CONTENT_FILE = path.join(__dirname, 'content.json');
const BOOKINGS_FILE = path.join(__dirname, 'bookings.json');
const IMAGES_DIR = path.join(__dirname, 'images');
const isProduction = process.env.NODE_ENV === 'production';

// Mot de passe admin : obligatoire en production, sinon admin123 en dev
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || (isProduction ? '' : 'admin123');
if (isProduction && !ADMIN_PASSWORD) {
  console.error('En production, définissez ADMIN_PASSWORD dans .env');
  process.exit(1);
}

// Rate limit login : 5 tentatives max, puis blocage 15 min
const loginAttempts = new Map();
const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000;

function getClientKey(req) {
  return req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
}

function isLoginBlocked(req) {
  const key = getClientKey(req);
  const entry = loginAttempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.lastAttempt > LOCK_DURATION_MS) {
    loginAttempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordLoginAttempt(req, success) {
  const key = getClientKey(req);
  if (success) {
    loginAttempts.delete(key);
    return;
  }
  const entry = loginAttempts.get(key) || { count: 0, lastAttempt: 0 };
  entry.count++;
  entry.lastAttempt = Date.now();
  loginAttempts.set(key, entry);
}

// Destinations autorisées (évite path traversal)
const ALLOWED_DESTINATIONS = ['images'];
const ALLOWED_FILENAMES = /^[0-9]{2}\.(jpe?g|png|webp|gif)$/i; // 01.jpeg, 02.png, etc.

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dest = (req.body && req.body.destination || 'images').trim();
    if (!ALLOWED_DESTINATIONS.includes(dest)) {
      return cb(new Error('Destination non autorisée'));
    }
    const dir = path.join(__dirname, dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const name = (req.body && req.body.filename || file.originalname || '').trim();
    const safe = name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9._-]/g, '');
    if (!safe) return cb(new Error('Nom de fichier invalide'));
    const ext = (path.extname(safe) || path.extname(file.originalname) || '.jpg').toLowerCase();
    if (!/^\.(jpe?g|png|gif|webp)$/.test(ext)) return cb(new Error('Extension non autorisée'));
    cb(null, safe);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname);
    if (allowed) cb(null, true);
    else cb(new Error('Format accepté : JPG, PNG, GIF, WebP'));
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'changez-moi-en-production-' + Date.now(),
  resave: false,
  saveUninitialized: false,
  name: 'sid',
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(express.static(__dirname, { index: false }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// ——— API Admin ———

function requireAuth(req, res, next) {
  if (req.session && req.session.admin) return next();
  return res.status(401).json({ error: 'Session expirée. Reconnectez-vous.' });
}

// Login avec rate limit
app.post('/api/login', (req, res) => {
  if (isLoginBlocked(req)) {
    return res.status(429).json({
      error: 'Trop de tentatives. Réessayez dans 15 minutes.'
    });
  }
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    recordLoginAttempt(req, true);
    req.session.admin = true;
    req.session.loginAt = Date.now();
    return res.json({ ok: true });
  }
  recordLoginAttempt(req, false);
  res.status(401).json({ error: 'Mot de passe incorrect' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session && req.session.admin) {
    return res.json({ ok: true, loginAt: req.session.loginAt });
  }
  res.status(401).json({ error: 'Non connecté' });
});

// Lire le contenu (public pour le site)
app.get('/api/content', (req, res) => {
  try {
    if (!fs.existsSync(CONTENT_FILE)) {
      return res.json({});
    }
    const data = fs.readFileSync(CONTENT_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (e) {
    res.status(500).json({ error: 'Fichier content.json invalide' });
  }
});

app.put('/api/content', requireAuth, (req, res) => {
  try {
    const current = fs.existsSync(CONTENT_FILE)
      ? JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'))
      : {};
    const updated = { ...current, ...req.body };
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(updated, null, 2), 'utf8');
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Réservations / demandes de rendez-vous (public)
app.post('/api/booking', (req, res) => {
  try {
    const { nom, telephone, email, prestation, date, creneau, message } = req.body || {};
    if (!nom || !telephone || !email) {
      return res.status(400).json({ error: 'Name, phone and email are required.' });
    }
    const booking = {
      id: Date.now(),
      nom: String(nom).trim(),
      telephone: String(telephone).trim(),
      email: String(email).trim(),
      prestation: prestation ? String(prestation).trim() : '',
      date: date ? String(date).trim() : '',
      creneau: creneau ? String(creneau).trim() : '',
      message: message ? String(message).trim() : '',
      createdAt: new Date().toISOString()
    };
    let list = [];
    if (fs.existsSync(BOOKINGS_FILE)) {
      list = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
    }
    if (!Array.isArray(list)) list = [];
    list.push(booking);
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(list, null, 2), 'utf8');
    res.json({ ok: true, id: booking.id });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Server error' });
  }
});

app.post('/api/upload', requireAuth, upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Aucun fichier reçu' });
  const url = '/' + path.relative(__dirname, req.file.path).replace(/\\/g, '/');
  res.json({ ok: true, url, filename: req.file.filename });
}, (err, req, res, next) => {
  res.status(400).json({ error: err.message || 'Erreur upload' });
});

app.get('/api/images', requireAuth, (req, res) => {
  const list = [];
  function scan(dir, base = '') {
    if (!fs.existsSync(dir)) return;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const rel = path.join(base, item.name);
      if (item.isDirectory()) scan(path.join(dir, item.name), rel);
      else if (/\.(jpe?g|png|gif|webp)$/i.test(item.name)) {
        list.push({ path: rel.replace(/\\/g, '/'), name: item.name });
      }
    }
  }
  scan(IMAGES_DIR, 'images');
  list.sort((a, b) => (a.name || '').localeCompare(b.name || '', undefined, { numeric: true }));
  res.json({ images: list });
});

// Supprimer une image (admin uniquement) – ex: DELETE /api/images/01.jpeg
app.delete('/api/images/:filename', requireAuth, (req, res) => {
  const filename = (req.params.filename || '').replace(/\.\./g, '');
  if (!/^[0-9]{2}\.(jpe?g|png|webp|gif)$/i.test(filename)) {
    return res.status(400).json({ error: 'Nom de fichier non autorisé' });
  }
  const fullPath = path.join(IMAGES_DIR, filename);
  if (!fullPath.startsWith(IMAGES_DIR) || !fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'Image introuvable' });
  }
  try {
    fs.unlinkSync(fullPath);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Liste des réservations (admin)
app.get('/api/bookings', requireAuth, (req, res) => {
  try {
    if (!fs.existsSync(BOOKINGS_FILE)) return res.json({ bookings: [] });
    const list = JSON.parse(fs.readFileSync(BOOKINGS_FILE, 'utf8'));
    res.json({ bookings: Array.isArray(list) ? list.reverse() : [] });
  } catch (e) {
    res.json({ bookings: [] });
  }
});

// Page admin : protégée côté client (le HTML charge, le JS redirige si non connecté)
app.get('/admin/', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (!/\.(html?|htm)$/i.test(page)) return next();
  const file = path.join(__dirname, page);
  if (fs.existsSync(file) && fs.statSync(file).isFile())
    return res.sendFile(file);
  next();
});

app.listen(PORT, () => {
  console.log('Site + Admin démarrés.');
  console.log('  Site  : http://localhost:' + PORT);
  console.log('  Admin : http://localhost:' + PORT + '/admin/');
  if (!isProduction && !process.env.ADMIN_PASSWORD) {
    console.log('  Mot de passe admin (dev) : admin123');
    console.log('  En production, définissez ADMIN_PASSWORD dans .env');
  }
});

