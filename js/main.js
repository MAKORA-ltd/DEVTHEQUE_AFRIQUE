// Animation du scroll smooth
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Animation des cartes au scroll
const cards = document.querySelectorAll('.card');
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'all 0.5s ease-out';
    observer.observe(card);
});

// Navbar transparente au scroll
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
    } else {
        navbar.classList.remove('navbar-scrolled');
    }
});

// Formulaire de contact
const contactForm = document.querySelector('#contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Ici, vous pouvez ajouter la logique d'envoi du formulaire
        alert('Message envoyé avec succès !');
        contactForm.reset();
    });
}

// Compteur de statistiques
const stats = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const targetNumber = parseInt(target.getAttribute('data-target'));
            let currentNumber = 0;
            const increment = targetNumber / 100;
            
            const updateNumber = () => {
                if (currentNumber < targetNumber) {
                    currentNumber += increment;
                    target.textContent = Math.round(currentNumber);
                    setTimeout(updateNumber, 10);
                } else {
                    target.textContent = targetNumber;
                }
            };
            
            updateNumber();
            statsObserver.unobserve(target);
        }
    });
}, { threshold: 0.5 });

stats.forEach(stat => statsObserver.observe(stat));

document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour ouvrir la modale de connexion
    function openLoginModal() {
        const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
        loginModal.show();
    }

    // Fonction pour ouvrir la modale d'inscription
    function openRegisterModal() {
        const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
        registerModal.show();
    }

    // Gérer tous les boutons qui nécessitent une authentification
    document.querySelectorAll('.requires-auth').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            openLoginModal();
        });
    });
});

function showLoadingState(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';
    submitButton.disabled = true;
}

function redirectToDashboard() {
    showLoadingState(this);
    setTimeout(() => {
        window.location.href = 'dashboard.html';
    }, 1000); // Délai d'une seconde pour montrer l'animation
}

loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    redirectToDashboard.call(this);
});

registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    redirectToDashboard.call(this);
}); 