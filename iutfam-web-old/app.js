// Simulated "database" of users
let users = [];
let currentUser = null;

// Utility: validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Show login page
function showLoginPage() {
  document.getElementById("login-page").style.display = "block";
  document.getElementById("register-page").style.display = "none";
  document.getElementById("home-page").style.display = "none";
}

// Show register page
function showRegisterPage() {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("register-page").style.display = "block";
  document.getElementById("home-page").style.display = "none";
}

// Show home page after login
function showHomePage() {
  document.getElementById("login-page").style.display = "none";
  document.getElementById("register-page").style.display = "none";
  document.getElementById("home-page").style.display = "block";
  document.getElementById("welcome-message").textContent =
    `Bienvenue, ${currentUser.displayName || currentUser.username} !`;
}

// Register function (local only)
function register() {
  const firstName  = document.getElementById("firstName").value.trim();
  const lastName   = document.getElementById("lastName").value.trim();
  const email      = document.getElementById("email").value.trim();
  const password   = document.getElementById("password").value;
  const department = document.getElementById("department").value;
  const year       = document.getElementById("year").value;

  if (!firstName || !lastName || !email || !password || !department || !year) {
    alert("Veuillez remplir tous les champs.");
    return false;
  }

  if (!validateEmail(email)) {
    alert("Adresse email invalide.");
    return false;
  }

  // Check if user already exists
  if (users.some(u => u.email === email)) {
    alert("Cet utilisateur existe déjà !");
    return false;
  }

  const newUser = {
    firstName,
    lastName,
    email,
    password,
    department,
    year,
    username: (firstName + "." + lastName).toLowerCase(),
    displayName: firstName + " " + lastName
  };

  users.push(newUser);
  alert("Inscription réussie ! Vous pouvez maintenant vous connecter.");
  showLoginPage();
  return false;
}

// Login function (local only)
function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  const found = users.find(u => u.email === email && u.password === password);
  if (!found) {
    alert("Email ou mot de passe incorrect.");
    return false;
  }

  currentUser = found;
  showHomePage();
  return false;
}

// Logout
function logout() {
  currentUser = null;
  showLoginPage();
}

// Initialize default view
document.addEventListener("DOMContentLoaded", () => {
  showLoginPage();
});
