document.addEventListener('DOMContentLoaded', async function() {
    const db = window.db || {};
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Récupération des données du formulaire
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            
            // Afficher une animation de chargement
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connexion...';
            submitBtn.disabled = true;
            
            try {
                // Appel à l'API d'authentification
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Erreur d'authentification');
                }
                
                // Enregistrer le token JWT
                localStorage.setItem('token', data.token);
                
                // Enregistrer les infos de base de l'utilisateur
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    points: data.user.points || 0,
                    lastLogin: new Date().toISOString()
                }));
                
                // Redirection vers le dashboard
                window.location.href = 'dashboard-home.html';
            } catch (error) {
                console.error('Erreur de connexion:', error);
                
                // Afficher l'erreur à l'utilisateur
                const errorElement = document.getElementById('login-error');
                if (errorElement) {
                    errorElement.textContent = error.message;
                    errorElement.style.display = 'block';
                }
                
                // Restaurer le bouton
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Récupération des données du formulaire
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            
            // Afficher une animation de chargement
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscription...';
            submitBtn.disabled = true;
            
            try {
                // Appel à l'API d'inscription
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        name, 
                        email, 
                        password,
                        points: 500, // Points de bienvenue
                        registrationDate: new Date().toISOString(),
                        lastLogin: new Date().toISOString()
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Erreur d\'inscription');
                }
                
                // Enregistrer le token JWT
                localStorage.setItem('token', data.token);
                
                // Enregistrer les infos de base de l'utilisateur
                localStorage.setItem('currentUser', JSON.stringify({
                    id: data.user._id,
                    name: data.user.name,
                    email: data.user.email,
                    points: data.user.points || 500, // Points de bienvenue
                    registrationDate: new Date().toISOString(),
                    lastLogin: new Date().toISOString()
                }));
                
                // Afficher le message de bienvenue
                showWelcomeMessage(name, 500);
                
                // Redirection vers le dashboard après un délai
                setTimeout(() => {
                    window.location.href = 'dashboard-home.html';
                }, 3000);
            } catch (error) {
                console.error('Erreur d\'inscription:', error);
                
                // Afficher l'erreur à l'utilisateur
                const errorElement = document.getElementById('register-error');
                if (errorElement) {
                    errorElement.textContent = error.message;
                    errorElement.style.display = 'block';
                }
                
                // Restaurer le bouton
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Fonction pour afficher le message de bienvenue
    function showWelcomeMessage(name, points) {
        // Code existant pour afficher le message de bienvenue
    }
    
    // Vérification de l'état de connexion
    function checkLoginState() {
        const token = localStorage.getItem('token');
        const currentPage = window.location.pathname.split('/').pop();
        
        // Si l'utilisateur est connecté (a un token)
        if (token) {
            // Vérifier la validité du token
            fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(response => {
                if (!response.ok) {
                    // Token invalide, déconnexion
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    
                    // Si l'utilisateur est sur une page protégée, rediriger
                    if (currentPage === 'dashboard-home.html' || 
                        currentPage === 'dashboard.html' || 
                        currentPage === 'profile.html' || 
                        currentPage === 'bibliotheque.html') {
                        window.location.href = 'index.html';
                    }
                } else if (currentPage === 'index.html' || currentPage === '') {
                    // Token valide et sur la page d'accueil, rediriger vers dashboard
                    window.location.href = 'dashboard-home.html';
                }
            })
            .catch(err => {
                console.error('Erreur de vérification du token:', err);
                // En cas d'erreur, déconnecter par sécurité
                localStorage.removeItem('token');
                localStorage.removeItem('currentUser');
                
                // Si sur une page protégée, rediriger
                if (currentPage === 'dashboard-home.html' || 
                    currentPage === 'dashboard.html' || 
                    currentPage === 'profile.html' || 
                    currentPage === 'bibliotheque.html') {
                    window.location.href = 'index.html';
                }
            });
        } else {
            // Pas de token, vérifier si l'utilisateur est sur une page protégée
            if (currentPage === 'dashboard-home.html' || 
                currentPage === 'dashboard.html' || 
                currentPage === 'profile.html' || 
                currentPage === 'bibliotheque.html') {
                window.location.href = 'index.html';
            }
        }
    }
    
    // Fonction de déconnexion
    function setupLogout() {
        const logoutLinks = document.querySelectorAll('.dropdown-item.text-danger');
        logoutLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Appel à l'API de déconnexion
                fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                .then(() => {
                    // Supprimer les données utilisateur
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    
                    // Rediriger vers la page d'accueil
                    window.location.href = 'index.html';
                })
                .catch(err => {
                    console.error('Erreur de déconnexion:', err);
                    // Déconnecter localement même en cas d'erreur
                    localStorage.removeItem('token');
                    localStorage.removeItem('currentUser');
                    window.location.href = 'index.html';
                });
            });
        });
    }
    
    // Exécuter ces fonctions au chargement
    checkLoginState();
    setupLogout();
});

// Fonction pour récupérer les données utilisateur depuis MongoDB
async function getUserData() {
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            throw new Error('Token non trouvé');
        }
        
        const response = await fetch('/api/user/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des données utilisateur');
        }
        
        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Erreur:', error);
        return null;
    }
} 