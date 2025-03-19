// JavaScript pour améliorer l'expérience responsive

document.addEventListener('DOMContentLoaded', function() {
    // Gérer le scroll horizontal des contributions avec les boutons
    const contributionsSlider = document.querySelector('.contributions-slider');
    const prevButton = document.querySelector('.slider-control.prev');
    const nextButton = document.querySelector('.slider-control.next');
    
    if (contributionsSlider && prevButton && nextButton) {
        prevButton.addEventListener('click', function() {
            contributionsSlider.scrollBy({
                left: -300,
                behavior: 'smooth'
            });
        });
        
        nextButton.addEventListener('click', function() {
            contributionsSlider.scrollBy({
                left: 300,
                behavior: 'smooth'
            });
        });
        
        // Optimisation pour le tactile
        let isScrolling = false;
        let startX;
        let scrollLeft;
        
        contributionsSlider.addEventListener('touchstart', function(e) {
            isScrolling = true;
            startX = e.touches[0].pageX - contributionsSlider.offsetLeft;
            scrollLeft = contributionsSlider.scrollLeft;
        });
        
        contributionsSlider.addEventListener('touchmove', function(e) {
            if (!isScrolling) return;
            e.preventDefault();
            const x = e.touches[0].pageX - contributionsSlider.offsetLeft;
            const walk = (x - startX) * 2;
            contributionsSlider.scrollLeft = scrollLeft - walk;
        });
        
        contributionsSlider.addEventListener('touchend', function() {
            isScrolling = false;
        });
    }
    
    // Ajuster la hauteur des cartes pour qu'elles soient uniformes dans une rangée
    function equalizeCardHeights(selector) {
        const cards = document.querySelectorAll(selector);
        if (cards.length === 0) return;
        
        // Réinitialiser les hauteurs
        cards.forEach(card => {
            card.style.height = 'auto';
        });
        
        // Ignorer l'égalisation sur mobile
        if (window.innerWidth < 768) return;
        
        // Trouver la hauteur maximale
        let maxHeight = 0;
        cards.forEach(card => {
            maxHeight = Math.max(maxHeight, card.offsetHeight);
        });
        
        // Appliquer la hauteur maximale
        cards.forEach(card => {
            card.style.height = maxHeight + 'px';
        });
    }
    
    // Appliquer l'égalisation aux différentes sections de cartes
    function equalizeAllCardHeights() {
        equalizeCardHeights('.featured-card');
        equalizeCardHeights('.category-card');
        equalizeCardHeights('.stats-card');
        equalizeCardHeights('.community-card');
    }
    
    // Appeler lors du chargement et du redimensionnement
    equalizeAllCardHeights();
    window.addEventListener('resize', equalizeAllCardHeights);
    
    // Optimisation du menu sur mobile
    const navbarToggler = document.querySelector('.navbar-toggler');
    const navbarNav = document.querySelector('#navbarNav');
    
    if (navbarToggler && navbarNav) {
        // Fermer le menu lorsqu'un lien est cliqué sur mobile
        const navLinks = navbarNav.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth < 992) {
                    navbarToggler.click();
                }
            });
        });
    }
    
    // Détection de l'orientation de l'écran pour optimisations
    function handleOrientationChange() {
        if (window.matchMedia("(orientation: portrait)").matches) {
            document.body.classList.remove('landscape');
            document.body.classList.add('portrait');
        } else {
            document.body.classList.remove('portrait');
            document.body.classList.add('landscape');
        }
    }
    
    // Appeler au chargement et lors des changements d'orientation
    handleOrientationChange();
    window.addEventListener('orientationchange', handleOrientationChange);
}); 