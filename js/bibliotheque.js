document.addEventListener('DOMContentLoaded', function() {
    // Gestionnaire des catégories et sous-catégories
    const categoryContent = {
        'web': {
            title: 'Développement Web',
            description: 'Documentation complète sur le développement web front-end et back-end',
            subcategories: {
                'frontend': {
                    title: 'Front-End',
                    documents: [
                        {
                            title: 'Guide HTML5/CSS3',
                            type: 'PDF',
                            description: 'Les fondamentaux du développement front-end moderne',
                            level: 'Débutant',
                            size: '8.5 MB',
                            downloads: '2.3k',
                            rating: '4.9',
                            views: '7.8k'
                        },
                        // Autres documents...
                    ]
                },
                'backend': {
                    title: 'Back-End',
                    documents: [
                        {
                            title: 'Node.js Avancé',
                            type: 'PDF',
                            description: 'Développement backend avec Node.js et Express',
                            level: 'Avancé',
                            size: '12.3 MB',
                            downloads: '1.8k',
                            rating: '4.7',
                            views: '5.2k'
                        }
                    ]
                },
                'frameworks': {
                    title: 'Frameworks',
                    documents: []
                }
            }
        },
        // Autres catégories...
    };

    // Fonction pour charger le contenu d'une sous-catégorie
    function loadSubcategoryContent(subcategory) {
        const content = categoryContent[subcategory];
        if (!content) return;

        const contentArea = document.querySelector('.content-area');
        contentArea.innerHTML = `
            <div class="subcategory-header">
                <h2>${content.title}</h2>
                <p class="subcategory-description">${content.description}</p>
            </div>
            
            <div class="subcategory-sections">
                ${Object.entries(content.subcategories).map(([key, section]) => `
                    <div class="section-container">
                        <h3>${section.title}</h3>
                        <div class="documents-grid">
                            ${section.documents.map(doc => createDocumentCard(doc)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Fonction pour créer une carte de document
    function createDocumentCard(doc) {
        return `
            <div class="doc-card">
                <div class="doc-type">
                    <i class="fas fa-file-${doc.type.toLowerCase()}"></i>
                    <span class="format">${doc.type}</span>
                </div>
                <div class="doc-content">
                    <h3>${doc.title}</h3>
                    <p>${doc.description}</p>
                    <div class="doc-meta">
                        <span class="level">
                            <i class="fas fa-signal"></i> ${doc.level}
                        </span>
                        <span class="size">
                            <i class="fas fa-weight"></i> ${doc.size}
                        </span>
                    </div>
                    <div class="doc-stats">
                        <span><i class="fas fa-download"></i> ${doc.downloads}</span>
                        <span><i class="fas fa-star"></i> ${doc.rating}</span>
                        <span><i class="fas fa-eye"></i> ${doc.views}</span>
                    </div>
                </div>
                <div class="doc-actions">
                    <button class="btn btn-primary">
                        <i class="fas fa-download"></i> Télécharger
                    </button>
                    <button class="btn btn-outline-primary">
                        <i class="fas fa-bookmark"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Gestionnaire de clics pour les sous-catégories
    document.querySelectorAll('.subcategories li').forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const subcategory = this.dataset.subcategory;
            
            // Mettre à jour l'URL sans recharger la page
            history.pushState({}, '', `?category=${subcategory}`);
            
            // Charger le contenu
            loadSubcategoryContent(subcategory);
            
            // Mettre à jour la navigation active
            document.querySelectorAll('.subcategories li').forEach(li => {
                li.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // Gestion des liens de sous-catégories
    const subcategoryLinks = document.querySelectorAll('.subcategory-link');
    
    subcategoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Retirer la classe active de tous les liens
            subcategoryLinks.forEach(l => l.classList.remove('active'));
            // Ajouter la classe active au lien cliqué
            this.classList.add('active');
            
            // Si on veut ajouter une animation de transition
            if (this.getAttribute('href').startsWith('ia.html')) {
                e.preventDefault();
                const targetUrl = this.getAttribute('href');
                document.body.style.opacity = '0';
                setTimeout(() => {
                    window.location.href = targetUrl;
                }, 300);
            }
        });
    });
    
    // Vérifier si on vient d'une page IA et marquer le lien correspondant comme actif
    const currentHash = window.location.hash;
    if (currentHash) {
        const activeLink = document.querySelector(`[href$="${currentHash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    // Gestion de l'affichage des sections
    function showSection(sectionId) {
        // Cacher toutes les sections de contenu
        document.querySelectorAll('.content-area').forEach(section => {
            section.style.display = 'none';
        });
        
        // Afficher la section demandée
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Mettre à jour le fil d'Ariane
        updateBreadcrumb(sectionId);
    }

    // Mise à jour du fil d'Ariane
    function updateBreadcrumb(sectionId) {
        const breadcrumb = document.querySelector('.breadcrumb');
        const categoryName = document.querySelector('.category-name');
        const subcategoryName = document.querySelector('.subcategory-name');

        switch(sectionId) {
            case 'cybersecurity':
                categoryName.innerHTML = '<span>Cybersécurité</span>';
                subcategoryName.innerHTML = '';
                break;
            case 'ia-content':
                categoryName.innerHTML = '<span>Intelligence Artificielle</span>';
                subcategoryName.innerHTML = '';
                break;
            case 'database':
                categoryName.innerHTML = '<span>Bases de Données</span>';
                subcategoryName.innerHTML = '';
                break;
            case 'devops':
                categoryName.innerHTML = '<span>DevOps</span>';
                subcategoryName.innerHTML = '';
                break;
            case 'architecture':
                categoryName.innerHTML = '<span>Architecture Logicielle</span>';
                subcategoryName.innerHTML = '';
                break;
            default:
                categoryName.innerHTML = '<span>Intelligence Artificielle</span>';
                subcategoryName.innerHTML = '';
        }
    }

    // Gestionnaire de clics pour les liens IA
    document.querySelectorAll('[data-category="ia"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('ia-content');
        });
    });

    // Gestion des liens de sous-catégories IA
    document.querySelectorAll('.subcategory-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').split('#')[1];
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                showSection('ia-content');
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Gestionnaire de clics pour les liens Cybersécurité
    document.querySelectorAll('[data-category="cybersecurity"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('cybersecurity-content');
            updateBreadcrumb('cybersecurity');
        });
    });

    // Gestion des liens de sous-catégories Cybersécurité
    document.querySelectorAll('[data-category="cybersecurity"] .subcategory-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').split('#')[1];
            showSection('cybersecurity-content');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
            updateBreadcrumb('cybersecurity', this.textContent);
        });
    });

    // Gestionnaires pour Bases de Données
    document.querySelectorAll('[data-category="database"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('database-content');
            updateBreadcrumb('database');
        });
    });

    // Gestionnaires pour DevOps
    document.querySelectorAll('[data-category="devops"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('devops-content');
            updateBreadcrumb('devops');
        });
    });

    // Gestionnaires pour Architecture Logicielle
    document.querySelectorAll('[data-category="architecture"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showSection('architecture-content');
            updateBreadcrumb('architecture');
        });
    });

    // Amélioration de la recherche
    const librarySearch = document.getElementById('librarySearch');
    const clearSearch = document.getElementById('clearSearch');
    const searchSuggestions = document.getElementById('searchSuggestions');
    
    if (librarySearch && clearSearch) {
        // Afficher le bouton d'effacement lorsque l'utilisateur tape du texte
        librarySearch.addEventListener('input', function() {
            clearSearch.style.display = this.value ? 'block' : 'none';
            
            // Afficher les suggestions si l'utilisateur tape au moins 2 caractères
            if (this.value.length >= 2) {
                searchSuggestions.style.display = 'block';
            } else {
                searchSuggestions.style.display = 'none';
            }
        });
        
        // Effacer le champ de recherche
        clearSearch.addEventListener('click', function() {
            librarySearch.value = '';
            this.style.display = 'none';
            searchSuggestions.style.display = 'none';
            librarySearch.focus();
        });
        
        // Fermer les suggestions lorsque l'utilisateur clique ailleurs
        document.addEventListener('click', function(e) {
            if (!librarySearch.contains(e.target) && !searchSuggestions.contains(e.target)) {
                searchSuggestions.style.display = 'none';
            }
        });
    }
    
    // Bouton de recherche mobile
    const searchToggle = document.querySelector('.btn-search-toggle');
    const searchContainer = document.querySelector('.search-container');
    
    if (searchToggle && searchContainer) {
        searchToggle.addEventListener('click', function() {
            searchContainer.classList.toggle('visible');
            librarySearch.focus();
        });
    }
    
    // Mise à jour dynamique des fils d'Ariane
    const categoryItems = document.querySelectorAll('.category-item');
    const currentCategory = document.getElementById('currentCategory');
    const mobileCurrentCategory = document.getElementById('mobileCurrentCategory');
    
    if (categoryItems.length && (currentCategory || mobileCurrentCategory)) {
        categoryItems.forEach(item => {
            item.addEventListener('click', function() {
                const categoryName = this.querySelector('span').textContent;
                
                if (currentCategory) currentCategory.textContent = categoryName;
                if (mobileCurrentCategory) mobileCurrentCategory.textContent = categoryName;
                
                // Ajouter la classe active
                categoryItems.forEach(cat => cat.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    // Égaliser la hauteur des cartes
    equalizeCardHeights();
    
    // Égaliser la hauteur des cartes lors du redimensionnement
    window.addEventListener('resize', debounce(equalizeCardHeights, 200));
    
    // Fonction utilitaire pour limiter les appels fréquents lors du redimensionnement
    function debounce(func, wait) {
        let timeout;
        return function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, arguments), wait);
        };
    }
});

// Ajouter cette fonction pour égaliser la hauteur des cartes
function equalizeCardHeights() {
    // Fonction pour égaliser la hauteur des cartes de documents
    const docCards = document.querySelectorAll('.doc-card');
    let maxHeight = 0;
    
    // Réinitialiser les hauteurs
    docCards.forEach(card => {
        card.style.height = 'auto';
        const height = card.offsetHeight;
        maxHeight = Math.max(maxHeight, height);
    });
    
    // Appliquer la hauteur maximale à toutes les cartes
    if (maxHeight > 0 && window.innerWidth > 576) {
        docCards.forEach(card => {
            card.style.height = `${maxHeight}px`;
        });
    }
    
    // Égaliser également la hauteur des cartes de catégorie
    const categoryCards = document.querySelectorAll('.category-card');
    maxHeight = 0;
    
    categoryCards.forEach(card => {
        card.style.height = 'auto';
        const height = card.offsetHeight;
        maxHeight = Math.max(maxHeight, height);
    });
    
    if (maxHeight > 0 && window.innerWidth > 576) {
        categoryCards.forEach(card => {
            card.style.height = `${maxHeight}px`;
        });
    }
} 