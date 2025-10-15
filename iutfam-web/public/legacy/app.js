// ============================================
// Application state
// ============================================
const API = 'http://localhost:4000'; // backend NestJS (port 4000)

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
async function register(event) {
  if (event) event.preventDefault(); // <-- empêche la soumission native
  console.log('Register function called');

  const firstName  = document.getElementById('firstName')?.value.trim();
  const lastName   = document.getElementById('lastName')?.value.trim();
  const email      = document.getElementById('email')?.value.trim();
  const password   = document.getElementById('password')?.value;
  const department = document.getElementById('department')?.value;
  const year       = document.getElementById('year')?.value;

  console.log('Form data:', { firstName, lastName, email, department, year });

  // Vérifications de base
  if (!firstName || !lastName || !email || !password || !department || !year) {
    alert('Veuillez remplir tous les champs');
    return false;
  }
  if (!validateEmail(email)) {
    alert('Veuillez utiliser un email universitaire (@iut.re ou @univ-reunion.fr)');
    return false;
  }

  // Préparation des données pour le backend
  const username    = (firstName + '.' + lastName).toLowerCase().replace(/\s+/g, '');
  const displayName = `${firstName} ${lastName}`;
  const className   = `${department} - ${year}`;

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, username, password, displayName, className }),
    });

    // essaie de lire la réponse JSON pour remonter un message clair en cas d’erreur
    let data = {};
    try { data = await res.json(); } catch (_) {}

    if (!res.ok) {
      const msg = data?.message || data?.error || `Erreur ${res.status}`;
      throw new Error(Array.isArray(msg) ? msg.join(', ') : msg);
    }

    alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');
    showLoginPage();
    return false;
  } catch (err) {
    console.error(err);
    alert(String(err.message || err));
    return false;
  }
}

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
    const res = await fetch(`${API}/auth/login`, {
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
  wireNav();        // ⬅️ branche la navbar
  showLoginPage();
}

// ============================================
// Initialisation
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  showLoginPage();
});
