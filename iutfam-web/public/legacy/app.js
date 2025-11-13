// ============================================
// Application state
// ============================================
const API_URL = 'http://localhost:4000'; // backend NestJS (port 4000)

// Simulated "database" fallback (non utilisé pour le moment)
let users = [];
let currentUser = null;

// ============================================
// Fonctions utilitaires
// ============================================
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// ============================================
// Helpers d'affichage
// ============================================
function showLoginPage() {
  // masque toutes les pages
  document.querySelectorAll('.page').forEach(el => (el.style.display = 'none'));
  // ⬇️ cache aussi l'application principale
  const app = document.getElementById('main-app');
  if (app) app.style.display = 'none';
  // affiche la page de login
  const login = document.getElementById('login-page');
  if (login) login.style.display = 'block';
}

// ➕ (ajout demandé) helper pour afficher la page d'inscription
function showRegisterPage() {
  // cache tout
  document.querySelectorAll('.page').forEach(el => (el.style.display = 'none'));
  const app = document.getElementById('main-app');
  if (app) app.style.display = 'none';
  // montre l'inscription
  const reg = document.getElementById('register-page');
  if (reg) reg.style.display = 'block';
}

// Navigation entre les pages (conserve la logique existante)
function showHomePage() {
  // masque les pages connues
  const $login = document.getElementById("login-page");
  const $register = document.getElementById("register-page");
  const $home = document.getElementById("home-page");

  if ($login) $login.style.display = "none";
  if ($register) $register.style.display = "none";
  if ($home) $home.style.display = "block";

  // message d’accueil
  const w = document.getElementById("welcome-message");
  if (w && currentUser) {
    w.textContent = `Bienvenue, ${currentUser.displayName || currentUser.username || ''} !`;
  }
}

// ============================================
// Inscription (connectée à ton backend NestJS)
// ============================================
async function register(ev) {
  ev.preventDefault();
  const firstName = (document.getElementById('firstName').value || '').trim();
  const lastName  = (document.getElementById('lastName').value || '').trim();
  const email     = (document.getElementById('email').value || '').trim();
  const password  = (document.getElementById('password').value || '').trim();
  const department= (document.getElementById('department').value || '').trim();
  const year      = (document.getElementById('year').value || '').trim();

  // username simple basé sur prénom.nom
  const username = (firstName && lastName)
    ? `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g,'')
    : email.split('@')[0];

  // 👉 IMPORTANT : envoyer un className pour que le back ne plante pas
  // Par ex : "GEA-1", "RT-2", etc.
  const className = `${department || 'GEN'}-${year || '1'}`;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password,
        displayName: `${firstName} ${lastName}`.trim(),
        className,   // 👈 ajouté pour que le controller puisse créer la classe
      }),
    });

    const data = await res.json().catch(() => ({}));

    // on considère succès si HTTP OK + { ok: true }
    if (!res.ok || data.ok !== true) {
      throw new Error(data.message || `Erreur ${res.status}`);
    }

    const display =
      data.user?.displayName ||
      `${firstName} ${lastName}`.trim() ||
      username ||
      email;

    document.getElementById('currentUserName').textContent = display;
    document.getElementById('dashboardUserName').textContent = display;

    backToApp();          // ouvre l’app
    showSection('events'); // onglet événements
  } catch (err) {
    alert(`Inscription impossible : ${err.message || err}`);
  }
  return false;
}
window.register = register;


// ============================================
// Connexion ( pour éviter la page blanche)
// ============================================
async function login(event) {
  if (event) event.preventDefault();

  const emailInput = document.getElementById("login-email") || document.getElementById("loginEmail");
  const passInput  = document.getElementById("login-password") || document.getElementById("loginPassword");
  const email = emailInput?.value.trim();
  const password = passInput?.value;

  if (!email || !password) {
    alert("Email et mot de passe requis.");
    return false;
  }

  try {
  const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) {
      const msg = data?.message || data?.error || `Erreur ${res.status}`;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    // profil minimal pour l'affichage
    currentUser = (data && data.user) ? data.user : null;
    
    // 🔐 Sauvegarder le token JWT pour la page /events/new
    if (data && data.access_token) {
      localStorage.setItem('jwt', data.access_token);
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token', data.access_token);
    }

    // 1) cacher login/register/profile
    ["login-page", "register-page", "profile-page"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = "none";
    });

    // 2) montrer l'application principale
    const app = document.getElementById('main-app');
    if (app) app.style.display = 'block';

    // 3) n'afficher que la section dashboard au départ
    const sections = document.querySelectorAll('#main-app .section');
    sections.forEach(sec => {
      if (sec.id === 'dashboard') {
        sec.style.display = 'block';
        sec.classList.add('active');
      } else {
        sec.style.display = 'none';
        sec.classList.remove('active');
      }
    });

    // 4) mettre à jour les noms affichés
    const name = currentUser?.displayName || currentUser?.username || 'Utilisateur';
    const u1 = document.getElementById('currentUserName');     if (u1) u1.textContent = name;
    const u2 = document.getElementById('dashboardUserName');   if (u2) u2.textContent = name;

    // 5) activer l'onglet Accueil dans la barre
    document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
    const homeBtn = document.querySelector('.nav-link[data-section="dashboard"]');
    if (homeBtn) homeBtn.classList.add('active');

    return false;
  } catch (err) {
    console.error('[login] error:', err);
    alert(String(err.message || err));
    return false;
  }
}
//BOUTON retour a la page d'aceuil
function showLandingPage() {
  // cache toutes les pages
  document.querySelectorAll('.page').forEach(el => (el.style.display = 'none'));
  // cache l’app principale
  const app = document.getElementById('main-app');
  if (app) app.style.display = 'none';
  // montre la landing
  const landing = document.getElementById('landing-page');
  if (landing) landing.style.display = 'block';
}

//fonction de navigation
function showSection(id) {
  const app = document.getElementById('main-app');
  if (app) app.style.display = 'block';

  // bascule l’affichage des sections
  document.querySelectorAll('#main-app .section').forEach(sec => {
    const isActive = sec.id === id;
    sec.style.display = isActive ? 'block' : 'none';
    sec.classList.toggle('active', isActive);
  });

  // met à jour l’état "active" dans la barre
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-section') === id);
  });

  // si on arrive sur "events", on recharge les données
  if (id === 'events') {
    loadEventsLegacy();
  }
}

//Brancher tous les boutons de la barre
function wireNav() {
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-section');
      if (target) showSection(target);
    });
  });
}

// --- DÉLÉGATION GLOBALE POUR LA NAVBAR ---
document.addEventListener('click', (ev) => {
  const btn = ev.target.closest('.nav-link');
  if (!btn) return;
  const section = btn.getAttribute('data-section');
  if (!section) return;
  ev.preventDefault();
  showSection(section);
});

// ➕ (ajout demandé) DÉLÉGATION LIENS login/register
// liens "S’inscrire" et "Retour / Se connecter"
document.addEventListener('click', (e) => {
  const a = e.target.closest('[data-action]');
  if (!a) return;
  const act = a.getAttribute('data-action');
  if (act === 'go-register') {
    e.preventDefault();
    showRegisterPage();
  } else if (act === 'go-login') {
    e.preventDefault();
    showLoginPage();
  }
});

// ============================================
// Déconnexion
// ============================================
function logout() {
  currentUser = null;

  // 🔐 Nettoyer les tokens pour ne plus être "connecté" côté /events/new
  localStorage.removeItem('jwt');
  localStorage.removeItem('access_token');
  localStorage.removeItem('token');

  wireNav();        // ⬅️ branche la navbar
  showLoginPage();
}

function backToApp() {
  // cacher toutes les pages "simples" (landing / login / register / profil)
  document.querySelectorAll('.page').forEach(el => (el.style.display = 'none'));

  // afficher l'application principale
  const app = document.getElementById('main-app');
  if (app) app.style.display = 'block';

  // par défaut, on montre le dashboard
  document.querySelectorAll('#main-app .section').forEach(sec => {
    const isDashboard = sec.id === 'dashboard';
    sec.style.display = isDashboard ? 'block' : 'none';
    sec.classList.toggle('active', isDashboard);
  });

  // activer le bouton "Accueil" dans la barre de nav
  document.querySelectorAll('.nav-link').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-section') === 'dashboard');
  });
}

// rendre accessible depuis le HTML (onclick="backToApp()")
window.backToApp = backToApp;

// ============================================
// ÉVÉNEMENTS (legacy)
// ============================================

// formate la date comme "10 mars 2025"
function formatEventDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// construit le texte "Organisé par NOM (RT-1ère année)" etc.
function buildOrganiserLabel(createdBy) {
  if (!createdBy) return "Anonyme";

  const creatorName =
    createdBy.displayName ||
    createdBy.username ||
    createdBy.id ||
    "Anonyme";

  // on essaye de récupérer la formation via la première classe
  let formation = createdBy.department || null;

  if (!formation && Array.isArray(createdBy.classes) && createdBy.classes.length > 0) {
    const cg = (createdBy.classes[0] && createdBy.classes[0].classGroup) || {};
    // dans notre cas, name ressemble souvent à "RT-1ère année", "GEA-2ème année", etc.
    formation = cg.name || cg.code || cg.department || null;
  }

  return formation ? `${creatorName} (${formation})` : creatorName;
}

// rend les cartes dans le conteneur de la page legacy
function renderEventsLegacy(events) {
  const container = document.getElementById("events-list");
  if (!container) {
    console.warn("[events] conteneur #events-list introuvable");
    return;
  }

  container.innerHTML = "";

  events.forEach(ev => {
    const card = document.createElement("div");
    card.className = "event-card"; // garde ta classe existante

    const organiserLabel = buildOrganiserLabel(ev.createdBy);

    card.innerHTML = `
      <div class="event-card-header">
        <div class="event-title">${ev.title}</div>
        <div class="event-date">${formatEventDate(ev.startsAt)}</div>
      </div>

      <div class="event-card-body">
        <p>📍 ${ev.location || "Lieu à définir"}</p>
        <p>👥 Aucun participant pour le moment</p>
        <p>Organisé par ${organiserLabel}</p>
      </div>

      <div class="event-card-footer">
        <button class="event-btn event-btn-primary" disabled>
          Participer
        </button>
        <a href="/events/${ev.id}" class="event-btn event-btn-secondary">
          Détails
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

// va chercher les événements depuis l'API Nest
async function loadEventsLegacy() {
  const container = document.getElementById("events-list");
  if (!container) return;

  container.innerHTML = "<p>Chargement des événements...</p>";

  try {
    const res = await fetch(`${API_URL}/events`, { credentials: "include" });
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    const events = await res.json(); // tableau
    renderEventsLegacy(events);
  } catch (err) {
    console.error("[events] erreur:", err);
    container.innerHTML = `<p class="text-red">Impossible de charger les événements : ${
      err.message || err
    }</p>`;
  }
}

// on le rend dispo au besoin
window.loadEventsLegacy = loadEventsLegacy;


// ============================================
// Initialisation
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  showLoginPage();

  // ✅ branche les formulaires
  document.getElementById('register-form')?.addEventListener('submit', e => register(e));
  document.getElementById('login-form')?.addEventListener('submit', e => login(e));
});
