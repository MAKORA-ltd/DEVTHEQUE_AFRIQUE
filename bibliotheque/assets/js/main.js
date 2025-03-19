document.addEventListener('DOMContentLoaded', function() {
    // Gestion de la navigation des catégories
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Toggle active state
            categoryItems.forEach(cat => cat.classList.remove('active'));
            this.classList.add('active');
            
            // Gestion des sous-catégories
            const subcategories = this.querySelector('.subcategories');
            if (subcategories) {
                subcategories.style.display = 
                    subcategories.style.display === 'block' ? 'none' : 'block';
            }
        });
    });

    // Gestion des filtres
    const filterButtons = document.querySelectorAll('.filters button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            // Implémenter la logique de filtrage ici
        });
    });

    // Gestion de la recherche
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', function(e) {
        // Implémenter la logique de recherche en temps réel ici
        const searchTerm = e.target.value.toLowerCase();
        // Filtrer les résultats en fonction du terme de recherche
    });

    // Gestion des favoris
    const bookmarkButtons = document.querySelectorAll('.doc-actions .btn-outline-primary');
    bookmarkButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.toggle('active');
            // Implémenter la logique de sauvegarde des favoris
        });
    });

    // Gestion du responsive
    const sidebarToggle = document.createElement('button');
    sidebarToggle.className = 'sidebar-toggle btn btn-primary d-md-none';
    sidebarToggle.innerHTML = '<i class="fas fa-bars"></i>';
    document.querySelector('.main-header').prepend(sidebarToggle);

    sidebarToggle.addEventListener('click', function() {
        document.querySelector('.categories-sidebar').classList.toggle('active');
    });
}); 