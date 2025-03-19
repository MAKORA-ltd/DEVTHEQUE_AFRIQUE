document.addEventListener('DOMContentLoaded', function() {
    // Gestion de l'affichage des sections
    const sections = {
        'dashboard': {
            id: 'dashboard-content',
            title: 'Tableau de Bord',
            icon: 'home'
        },
        'projects': {
            id: 'mes-projets',
            title: 'Mes Projets',
            icon: 'project-diagram'
        },
        'courses': {
            id: 'mes-formations',
            title: 'Mes Formations',
            icon: 'graduation-cap'
        },
        'bibliotheque': {
            id: 'ma-bibliotheque',
            title: 'Bibliothèque',
            icon: 'book',
            subsections: {
                'docs-tech': {
                    title: 'Documentation Technique',
                    icon: 'code'
                },
                'docs-science': {
                    title: 'Documentation Scientifique',
                    icon: 'flask'
                },
                'tutorials': {
                    title: 'Tutoriels',
                    icon: 'chalkboard-teacher'
                },
                'community-docs': {
                    title: 'Documentation Communautaire',
                    icon: 'users'
                }
            }
        },
        'events': {
            id: 'mes-evenements',
            title: 'Événements',
            icon: 'calendar-alt'
        },
        'messages': {
            id: 'mes-messages',
            title: 'Messages',
            icon: 'envelope'
        },
        'network': {
            id: 'mon-reseau',
            title: 'Mon Réseau',
            icon: 'users'
        }
    };

    // Fonction pour afficher une section
    function showSection(sectionKey) {
        // Cacher toutes les sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = 'none';
        });

        // Afficher la section sélectionnée
        const section = sections[sectionKey];
        if (section) {
            const sectionElement = document.getElementById(section.id);
            if (sectionElement) {
                sectionElement.style.display = 'block';
                updateBreadcrumb(section.title);
            }
        }
    }

    // Gestion de la navigation
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionKey = link.getAttribute('href').substring(1);
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.sidebar-nav li').forEach(li => {
                li.classList.remove('active');
            });
            link.parentElement.classList.add('active');

            // Afficher la section correspondante
            showSection(sectionKey);
        });
    });

    // Gestion du menu bibliothèque
    const menuToggle = document.querySelector('.has-submenu .menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const parent = this.parentElement;
            const subMenu = parent.querySelector('.sub-menu');
            
            parent.classList.toggle('active');
            
            if (parent.classList.contains('active')) {
                subMenu.style.maxHeight = subMenu.scrollHeight + "px";
                subMenu.classList.add('expanded');
            } else {
                subMenu.style.maxHeight = '0';
                subMenu.classList.remove('expanded');
            }
        });
    }

    // Gestion des sous-sections de la bibliothèque
    document.querySelectorAll('.sub-menu a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const sectionKey = this.getAttribute('href').substring(1);
            const section = sections.bibliotheque.subsections[sectionKey];
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.sub-menu a').forEach(a => {
                a.classList.remove('active');
            });
            this.classList.add('active');
            
            // Afficher le contenu de la sous-section
            loadBibliothequeContent(sectionKey);
            updateBreadcrumb(sections.bibliotheque.title, section.title);
        });
    });

    // Fonction pour mettre à jour le fil d'Ariane
    function updateBreadcrumb(mainSection, subSection = null) {
        const breadcrumb = document.querySelector('.dashboard-breadcrumb');
        if (breadcrumb) {
            breadcrumb.innerHTML = `
                <i class="fas fa-home"></i>
                <span>${mainSection}</span>
                ${subSection ? `<i class="fas fa-chevron-right"></i><span>${subSection}</span>` : ''}
            `;
        }
    }

    // Afficher la section dashboard par défaut
    showSection('dashboard');

    // Gestion du menu mobile
    const toggleSidebar = () => {
        document.querySelector('.sidebar').classList.toggle('active');
    };

    // Gestion des notifications
    const notifications = document.querySelector('.notifications');
    if (notifications) {
        notifications.addEventListener('click', () => {
            // Logique pour afficher les notifications
            console.log('Affichage des notifications');
        });
    }

    // Gestion du menu profil
    const profileDropdown = document.querySelector('.profile-dropdown');
    if (profileDropdown) {
        profileDropdown.addEventListener('click', () => {
            // Logique pour afficher le menu profil
            console.log('Affichage du menu profil');
        });
    }

    // Animation des statistiques
    const animateValue = (element, start, end, duration) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.innerHTML = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // Gestion du responsive
    const handleResize = () => {
        if (window.innerWidth <= 768) {
            document.querySelector('.sidebar').classList.remove('active');
        }
    };

    window.addEventListener('resize', handleResize);

    // Gestion des liens de la bibliothèque
    const menuToggles = document.querySelectorAll('.menu-toggle');
    
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(e) {
            const submenu = this.nextElementSibling;
            const parent = this.parentElement;
            
            // Si on clique sur l'icône chevron, on toggle le sous-menu
            if (e.target.classList.contains('submenu-icon')) {
                e.preventDefault();
                parent.classList.toggle('active');
                submenu.classList.toggle('expanded');
                return;
            }
            
            // Sinon, on suit le lien normalement
            // Le comportement par défaut du lien sera de naviguer vers la page
        });
    });
});

// Fonction améliorée pour charger le contenu de la bibliothèque
function loadBibliothequeContent(section) {
    // Cacher toutes les sections
    document.querySelectorAll('.doc-section').forEach(section => {
        section.classList.remove('active');
    });

    // Afficher la section sélectionnée
    const selectedSection = document.getElementById(`${section}-content`);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
} 