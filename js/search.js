document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const searchForm = document.getElementById('searchForm');
    const searchInput = document.getElementById('globalSearch');
    const searchResults = document.getElementById('searchResults');
    const closeSearchResults = document.getElementById('closeSearchResults');
    const searchResultsContainer = document.getElementById('searchResultsContainer');
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    const searchTabs = document.querySelectorAll('.search-tab');
    
    // Données de recherche (dans un environnement réel, cela viendrait d'une API)
    let allResults = [];
    let currentTab = 'all';
    
    // Écouteur d'événement pour la soumission du formulaire
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const query = searchInput.value.trim();
        
        if (query.length >= 2) {
            performSearch(query);
        }
    });
    
    // Écouteur d'événement pour la saisie dans le champ de recherche
    searchInput.addEventListener('input', function() {
        const query = searchInput.value.trim();
        
        if (query.length >= 2) {
            performSearch(query);
        } else if (query.length === 0) {
            searchResults.classList.remove('active');
        }
    });
    
    // Fermer les résultats de recherche
    closeSearchResults.addEventListener('click', function() {
        searchResults.classList.remove('active');
    });
    
    // Cliquer ailleurs pour fermer les résultats
    document.addEventListener('click', function(e) {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.classList.remove('active');
        }
    });
    
    // Changer d'onglet de résultats
    searchTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabType = this.getAttribute('data-tab');
            
            // Mettre à jour l'onglet actif
            searchTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Filtrer les résultats selon l'onglet
            currentTab = tabType;
            filterResults();
        });
    });
    
    // Fonction pour effectuer la recherche
    async function performSearch(query) {
        try {
            // Dans un environnement réel, vous feriez un appel API ici
            // Exemple: const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            
            // Pour la démonstration, nous utilisons des données simulées
            allResults = await mockSearch(query);
            
            // Mettre à jour l'état des résultats
            if (allResults.length > 0) {
                searchResults.classList.add('active');
                noResults.style.display = 'none';
                filterResults();
            } else {
                searchResults.classList.add('active');
                noResults.style.display = 'block';
                resultsCount.textContent = '0 résultat';
                searchResultsContainer.innerHTML = '';
                searchResultsContainer.appendChild(noResults);
            }
        } catch (error) {
            console.error('Erreur de recherche:', error);
        }
    }
    
    // Fonction pour filtrer les résultats selon l'onglet sélectionné
    function filterResults() {
        let filteredResults = allResults;
        
        if (currentTab !== 'all') {
            filteredResults = allResults.filter(result => result.type === currentTab);
        }
        
        renderResults(filteredResults);
    }
    
    // Fonction pour afficher les résultats
    function renderResults(results) {
        // Effacer les résultats précédents
        searchResultsContainer.innerHTML = '';
        
        // Mettre à jour le compteur de résultats
        resultsCount.textContent = `${results.length} résultat${results.length > 1 ? 's' : ''}`;
        
        if (results.length === 0) {
            noResults.style.display = 'block';
            searchResultsContainer.appendChild(noResults);
            return;
        }
        
        // Créer les éléments de résultat
        results.forEach(result => {
            const resultItem = document.createElement('a');
            resultItem.href = result.url;
            resultItem.className = 'search-result-item';
            
            // Déterminer l'icône selon le type
            let iconClass = 'fas fa-file';
            let typeClass = 'document';
            
            if (result.type === 'projects') {
                iconClass = 'fas fa-project-diagram';
                typeClass = 'project';
            } else if (result.type === 'courses') {
                iconClass = 'fas fa-graduation-cap';
                typeClass = 'course';
            }
            
            resultItem.innerHTML = `
                <div class="result-icon ${typeClass}">
                    <i class="${iconClass}"></i>
                </div>
                <div class="result-info">
                    <div class="result-title">${highlightMatch(result.title, searchInput.value)}</div>
                    <p class="result-description">${result.description}</p>
                    <div class="result-meta">${result.meta}</div>
                </div>
            `;
            
            searchResultsContainer.appendChild(resultItem);
        });
    }
    
    // Fonction pour mettre en évidence les correspondances
    function highlightMatch(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Échapper les caractères spéciaux pour une utilisation dans regex
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    // Recherche simulée pour la démonstration
    function mockSearch(query) {
        query = query.toLowerCase();
        
        const mockData = [
            {
                id: 1,
                type: 'documents',
                title: 'Guide Python Avancé',
                description: 'Un guide complet sur les fonctionnalités avancées de Python',
                meta: 'Ajouté le 15 Mars 2024',
                url: '#docs-tech'
            },
            {
                id: 2,
                type: 'documents',
                title: 'Introduction à React Native',
                description: 'Développement mobile cross-platform avec React Native',
                meta: 'Ajouté le 10 Février 2024',
                url: '#docs-tech'
            },
            {
                id: 3,
                type: 'projects',
                title: 'Application Mobile de Santé',
                description: 'Une application mobile pour améliorer l\'accès aux soins de santé',
                meta: '75% complété',
                url: '#projects'
            },
            {
                id: 4,
                type: 'projects',
                title: 'Projet E-commerce',
                description: 'Développement d\'une plateforme e-commerce pour artisans locaux',
                meta: 'En cours',
                url: '#projects'
            },
            {
                id: 5,
                type: 'courses',
                title: 'Développement Web Full Stack',
                description: 'Formation complète en développement web moderne',
                meta: '12 modules restants',
                url: '#courses'
            },
            {
                id: 6,
                type: 'courses',
                title: 'Machine Learning pour débutants',
                description: 'Introduction aux concepts et applications du Machine Learning',
                meta: 'Nouveau cours',
                url: '#courses'
            }
        ];
        
        // Simuler un délai de recherche comme un vrai appel API
        return new Promise(resolve => {
            setTimeout(() => {
                const results = mockData.filter(item => {
                    return item.title.toLowerCase().includes(query) || 
                           item.description.toLowerCase().includes(query);
                });
                resolve(results);
            }, 300);
        });
    }
}); 