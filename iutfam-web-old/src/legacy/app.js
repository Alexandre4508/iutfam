// Application state
const API = 'http://localhost:4000';
let currentUser = null;
let users = [
    {
        id: 1,
        firstName: "Marie",
        lastName: "Dubois",
        email: "marie.dubois@iut.re",
        department: "GEA",
        year: "2Ã¨me annÃ©e",
        password: "password123"
    },
    {
        id: 2,
        firstName: "Thomas",
        lastName: "Martin", 
        email: "thomas.martin@iut.re",
        department: "RT",
        year: "1Ã¨re annÃ©e",
        password: "password123"
    },
    {
        id: 3,
        firstName: "Sarah",
        lastName: "Leroy",
        email: "sarah.leroy@univ-reunion.fr",
        department: "GB",
        year: "3Ã¨me annÃ©e",
        password: "password123"
    },
    {
        id: 4,
        firstName: "Lucas",
        lastName: "Bernard",
        email: "lucas.bernard@iut.re",
        department: "GCCD",
        year: "2Ã¨me annÃ©e",
        password: "password123"
    }
];

let messages = [
    {
        id: 1,
        author: "Marie",
        department: "GEA",
        content: "Salut tout le monde ! Quelqu'un pour la cantine ce midi ?",
        timestamp: "10:45"
    },
    {
        id: 2,
        author: "Thomas",
        department: "RT", 
        content: "Oui je suis partant ! On se retrouve Ã  12h ?",
        timestamp: "10:47"
    },
    {
        id: 3,
        author: "Sarah",
        department: "GB",
        content: "Super idÃ©e ! Moi aussi je viens ðŸ˜Š",
        timestamp: "10:50"
    }
];

let friends = [
    { userId: 1, friendId: 2, status: "accepted" },
    { userId: 1, friendId: 3, status: "accepted" },
    { userId: 2, friendId: 1, status: "accepted" },
    { userId: 3, friendId: 1, status: "accepted" }
];

let events = [
    {
        id: 1,
        title: "Repas cantine ensemble",
        date: "2025-09-15",
        location: "Cantine IUT",
        type: "Repas",
        organizer: "Marie",
        participants: 5
    },
    {
        id: 2,
        title: "SoirÃ©e Ã©tudiante au port",
        date: "2025-09-20", 
        location: "Port de Saint-Pierre",
        type: "Sortie",
        organizer: "Thomas",
        participants: 12
    }
];

// Navigation functions
function showPage(pageId) {
    console.log('Showing page:', pageId);
    
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Hide main app
    document.getElementById('main-app').classList.remove('active');
    
    // Show target page
    if (pageId === 'app' || pageId === 'main-app') {
        document.getElementById('main-app').classList.add('active');
    } else {
        const targetPage = document.getElementById(pageId + '-page');
        if (targetPage) {
            targetPage.classList.add('active');
        }
    }
}

function showLandingPage() {
    showPage('landing');
}

function showLoginPage() {
    showPage('login');
}

function showRegisterPage() {
    showPage('register');
}

function showProfilePage() {
    showPage('profile');
    loadProfile();
}

function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Update navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeNavLink = document.querySelector(`[data-section="${sectionId}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    // Update sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
}

function backToApp() {
    showPage('app');
    showSection('dashboard');
}

// Authentication functions
function validateEmail(email) {
    return email.endsWith('@iut.re') || email.endsWith('@univ-reunion.fr');
}

function fillDemoCredentials(user) {
    if (user === 'marie') {
        document.getElementById('loginEmail').value = 'marie.dubois@iut.re';
        document.getElementById('loginPassword').value = 'password123';
    }
}

async function register() {
  console.log('Register function called');

  const firstName = document.getElementById('firstName').value.trim();
  const lastName  = document.getElementById('lastName').value.trim();
  const email     = document.getElementById('email').value.trim();
  const password  = document.getElementById('password').value;
  const department= document.getElementById('department').value;
  const year      = document.getElementById('year').value;

  console.log('Form data:', { firstName, lastName, email, department, year });

  // Validations existantes (inchangées)
  if (!firstName || !lastName || !email || !password || !department || !year) {
    alert('Veuillez remplir tous les champs');
    return false;
  }
  if (!validateEmail(email)) {
    alert('Veuillez utiliser un email universitaire (@iut.re ou @univ-reunion.fr)');
    return false;
  }

  // Mapping sans changer la forme de ton formulaire :
  // - username = prenom.nom
  // - className = "DEPARTEMENT - ANNÉE" (sera créé côté API si absent)
  const username  = (firstName + '.' + lastName).toLowerCase().replace(/\s+/g, '');
  const className = `${department} - ${year}`;
  const displayName = `${firstName} ${lastName}`;

  try {
    const res = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // pour cookies httpOnly si tu les utilises plus tard
      body: JSON.stringify({ email, username, password, displayName, className }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.message || `Erreur ${res.status}`);
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

function login() {
    console.log('Login function called');
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    console.log('Login attempt:', { email, password: '***' });
    
    if (!email || !password) {
        alert('Veuillez remplir tous les champs');
        return false;
    }
    
    const user = users.find(u => u.email === email && u.password === password);
    console.log('User found:', user);
    
    if (!user) {
        alert('Email ou mot de passe incorrect');
        return false;
    }
    
    // Set current user
    currentUser = user;
    console.log('Current user set:', currentUser);
    
    // Update UI
    updateUserUI();
    
    // Show main app
    showPage('app');
    showSection('dashboard');
    
    return false;
}

function updateUserUI() {
    if (currentUser) {
        document.getElementById('currentUserName').textContent = `${currentUser.firstName} ${currentUser.lastName}`;
        document.getElementById('dashboardUserName').textContent = currentUser.firstName;
        document.getElementById('userDepartment').textContent = currentUser.department;
    }
}

function logout() {
    console.log('Logout called');
    currentUser = null;
    showLandingPage();
    
    // Clear forms
    document.querySelectorAll('form').forEach(form => form.reset());
}

// Demo login function
function demoLogin() {
    console.log('Demo login called');
    currentUser = users[0]; // Marie Dubois
    updateUserUI();
    showPage('app');
    showSection('dashboard');
}

// Chat functions
function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const content = messageInput.value.trim();
    
    if (!content || !currentUser) return;
    
    const newMessage = {
        id: messages.length + 1,
        author: currentUser.firstName,
        department: currentUser.department,
        content: content,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };
    
    messages.push(newMessage);
    
    // Add message to chat
    const chatMessages = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-author">${newMessage.author} (${newMessage.department}) - ${newMessage.timestamp}</div>
        <div class="message-content">${newMessage.content}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    messageInput.value = '';
}

// Private chat functions
function openPrivateChat(friendName) {
    document.getElementById('privateChatUser').textContent = friendName;
    document.getElementById('privateChat').classList.remove('hidden');
}

function closePrivateChat() {
    document.getElementById('privateChat').classList.add('hidden');
}

function sendPrivateMessage() {
    const messageInput = document.getElementById('privateMessageInput');
    const content = messageInput.value.trim();
    
    if (!content) return;
    
    const chatMessages = document.getElementById('privateChatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="message-author">Vous - ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    messageInput.value = '';
}

// Group functions
function openGroupChat() {
    alert(`Chat du groupe ${currentUser ? currentUser.department : 'N/A'} ouvert ! Cette fonctionnalitÃ© sera bientÃ´t disponible.`);
}

function leaveGroup() {
    if (currentUser && confirm(`ÃŠtes-vous sÃ»r de vouloir quitter le groupe ${currentUser.department} ?`)) {
        alert('Vous avez quittÃ© le groupe. Vous pouvez le rejoindre Ã  nouveau Ã  tout moment.');
    }
}

// Event functions
function showCreateEvent() {
    const title = prompt('Titre de l\'Ã©vÃ©nement :');
    if (!title) return;
    
    const date = prompt('Date (YYYY-MM-DD) :');
    if (!date) return;
    
    const location = prompt('Lieu :');
    if (!location) return;
    
    const type = prompt('Type (Sortie, Repas, Ã‰tude, etc.) :');
    if (!type) return;
    
    const newEvent = {
        id: events.length + 1,
        title,
        date,
        location,
        type,
        organizer: currentUser ? `${currentUser.firstName}` : 'Anonyme',
        participants: 1
    };
    
    events.push(newEvent);
    alert('Ã‰vÃ©nement crÃ©Ã© avec succÃ¨s !');
    
    // Refresh events display
    refreshEvents();
}

function refreshEvents() {
    // This would update the events display in a real app
    console.log('Events refreshed', events);
}

// Board functions
function showCreatePost() {
    const title = prompt('Titre du post :');
    if (!title) return;
    
    const content = prompt('Contenu :');
    if (!content) return;
    
    const category = prompt('CatÃ©gorie (Ã‰tudes, Logement, Emploi, Divers) :');
    if (!category) return;
    
    alert('Post crÃ©Ã© avec succÃ¨s !');
}

// Profile functions
function saveProfile() {
    const firstName = document.getElementById('profileFirstName').value.trim();
    const lastName = document.getElementById('profileLastName').value.trim();
    const department = document.getElementById('profileDepartment').value;
    const year = document.getElementById('profileYear').value;
    const interests = document.getElementById('profileInterests').value.trim();
    
    if (!firstName || !lastName) {
        alert('Le prÃ©nom et le nom sont obligatoires');
        return;
    }
    
    if (!currentUser) {
        alert('Erreur : utilisateur non connectÃ©');
        return;
    }
    
    // Update current user
    currentUser.firstName = firstName;
    currentUser.lastName = lastName;
    currentUser.department = department;
    currentUser.year = year;
    currentUser.interests = interests;
    
    // Update user in users array
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        users[userIndex] = { ...currentUser };
    }
    
    // Update UI
    updateUserUI();
    
    alert('Profil mis Ã  jour avec succÃ¨s !');
    backToApp();
}

// Initialize profile form
function loadProfile() {
    if (!currentUser) return;
    
    document.getElementById('profileFirstName').value = currentUser.firstName || '';
    document.getElementById('profileLastName').value = currentUser.lastName || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profileDepartment').value = currentUser.department || '';
    document.getElementById('profileYear').value = currentUser.year || '';
    document.getElementById('profileInterests').value = currentUser.interests || '';
}

// Friends content update
function updateFriendsContent(tabType) {
    const friendsList = document.getElementById('friends-list');
    
    if (tabType === 'friends') {
        friendsList.innerHTML = `
            <div class="friend-card">
                <div class="friend-info">
                    <strong>Marie Dubois</strong>
                    <span>GEA - 2Ã¨me annÃ©e</span>
                </div>
                <button type="button" class="btn btn--primary btn--sm" onclick="openPrivateChat('Marie')">ðŸ’¬ Message</button>
            </div>
            <div class="friend-card">
                <div class="friend-info">
                    <strong>Thomas Martin</strong>
                    <span>RT - 1Ã¨re annÃ©e</span>
                </div>
                <button type="button" class="btn btn--primary btn--sm" onclick="openPrivateChat('Thomas')">ðŸ’¬ Message</button>
            </div>
            <div class="friend-card">
                <div class="friend-info">
                    <strong>Sarah Leroy</strong>
                    <span>GB - 3Ã¨me annÃ©e</span>
                </div>
                <button type="button" class="btn btn--primary btn--sm" onclick="openPrivateChat('Sarah')">ðŸ’¬ Message</button>
            </div>
        `;
    } else if (tabType === 'requests') {
        friendsList.innerHTML = `
            <div class="friend-card">
                <div class="friend-info">
                    <strong>Lucas Bernard</strong>
                    <span>GCCD - 2Ã¨me annÃ©e</span>
                    <small style="color: var(--color-text-secondary);">Demande reÃ§ue il y a 2h</small>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn--primary btn--sm" onclick="acceptFriendRequest('Lucas')">âœ… Accepter</button>
                    <button type="button" class="btn btn--outline btn--sm" onclick="rejectFriendRequest('Lucas')">â�Œ Refuser</button>
                </div>
            </div>
            <div class="friend-card">
                <div class="friend-info">
                    <strong>Emma Moreau</strong>
                    <span>TC - 1Ã¨re annÃ©e</span>
                    <small style="color: var(--color-text-secondary);">Demande reÃ§ue hier</small>
                </div>
                <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn btn--primary btn--sm" onclick="acceptFriendRequest('Emma')">âœ… Accepter</button>
                    <button type="button" class="btn btn--outline btn--sm" onclick="rejectFriendRequest('Emma')">â�Œ Refuser</button>
                </div>
            </div>
        `;
    } else if (tabType === 'search') {
        friendsList.innerHTML = `
            <div class="friend-card">
                <div class="friend-info">
                    <strong>Antoine Dubois</strong>
                    <span>HSE - 3Ã¨me annÃ©e</span>
                </div>
                <button type="button" class="btn btn--primary btn--sm" onclick="sendFriendRequest('Antoine')">ðŸ‘¥ Ajouter</button>
            </div>
            <div class="friend-card">
                <div class="friend-info">
                    <strong>LÃ©a Martin</strong>
                    <span>CS - 2Ã¨me annÃ©e</span>
                </div>
                <button type="button" class="btn btn--primary btn--sm" onclick="sendFriendRequest('LÃ©a')">ðŸ‘¥ Ajouter</button>
            </div>
        `;
    }
}

// Friend request functions
function acceptFriendRequest(friendName) {
    alert(`Demande d'amitiÃ© de ${friendName} acceptÃ©e !`);
    // Refresh to friends tab
    const friendsTab = document.querySelector('.friends-tabs .btn[data-tab="friends"]');
    if (friendsTab) {
        friendsTab.click();
    }
}

function rejectFriendRequest(friendName) {
    alert(`Demande d'amitiÃ© de ${friendName} refusÃ©e.`);
}

function sendFriendRequest(friendName) {
    alert(`Demande d'amitiÃ© envoyÃ©e Ã  ${friendName} !`);
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function showNotification(message, type = 'info') {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--color-${type === 'info' ? 'primary' : type});
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 9999;
        box-shadow: var(--shadow-lg);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Navigation event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
    
    // Chat input enter key
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }
    
    const privateMessageInput = document.getElementById('privateMessageInput');
    if (privateMessageInput) {
        privateMessageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendPrivateMessage();
            }
        });
    }
    
    // Friends tabs
    document.querySelectorAll('.friends-tabs .btn').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove active class from all tabs
            document.querySelectorAll('.friends-tabs .btn').forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            const tabType = this.getAttribute('data-tab');
            updateFriendsContent(tabType);
        });
    });
    
    // Board categories
    document.querySelectorAll('.board-categories .btn').forEach(category => {
        category.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.board-categories .btn').forEach(c => c.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Other tabs (lost&found, transport)
    document.querySelectorAll('.lostfound-tabs .btn, .transport-tabs .btn').forEach(tab => {
        tab.addEventListener('click', function(e) {
            e.preventDefault();
            const parent = this.parentElement;
            parent.querySelectorAll('.btn').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Modal close on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.add('hidden');
            }
        });
    });
    
    // Escape key to close modals
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
    
    // Add sample interactions for demonstration
    setTimeout(() => {
        if (currentUser) {
            showNotification('Bienvenue sur IUTFAM ! ðŸŒº', 'success');
        }
    }, 2000);
    
    console.log('Event listeners initialized');
});

// Debug functions for development
function debugInfo() {
    console.log('Current User:', currentUser);
    console.log('All Users:', users);
    console.log('Messages:', messages);
    console.log('Events:', events);
    console.log('Friends:', friends);
}
