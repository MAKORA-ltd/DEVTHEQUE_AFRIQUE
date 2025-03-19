document.addEventListener('DOMContentLoaded', function() {
    // Gestion des boutons d'achat de documents
    const purchaseButtons = document.querySelectorAll('.btn-purchase');
    const purchaseModal = document.getElementById('purchaseDocModal');
    
    if (purchaseButtons.length > 0 && purchaseModal) {
        purchaseButtons.forEach(button => {
            button.addEventListener('click', function() {
                const docCard = this.closest('.doc-card');
                const docTitle = docCard.getAttribute('data-title');
                const docAuthor = docCard.getAttribute('data-author');
                const docRating = docCard.getAttribute('data-rating');
                const docPoints = docCard.getAttribute('data-points');
                
                // Remplir les détails dans la modal
                document.getElementById('doc-title').textContent = docTitle;
                document.getElementById('doc-author').textContent = docAuthor;
                document.getElementById('doc-rating').textContent = docRating;
                document.getElementById('doc-points').textContent = docPoints;
                
                // Vérifier si l'utilisateur a assez de points
                checkUserBalance(parseInt(docPoints), 'document');
            });
        });
        
        // Gérer le clic sur le bouton d'achat final
        const purchaseDocButton = document.querySelector('.btn-purchase-doc');
        if (purchaseDocButton) {
            purchaseDocButton.addEventListener('click', function() {
                const pointsRequired = parseInt(document.getElementById('doc-points').textContent);
                processTransaction(pointsRequired, 'document');
            });
        }
    }
    
    // Gestion des boutons d'inscription aux formations
    const enrollButtons = document.querySelectorAll('.btn-enroll');
    const enrollModal = document.getElementById('enrollCourseModal');
    
    if (enrollButtons.length > 0 && enrollModal) {
        enrollButtons.forEach(button => {
            button.addEventListener('click', function() {
                const courseCard = this.closest('.course-card');
                const courseTitle = courseCard.getAttribute('data-title');
                const courseInstructor = courseCard.getAttribute('data-instructor');
                const courseRating = courseCard.getAttribute('data-rating');
                const coursePoints = courseCard.getAttribute('data-points');
                
                // Remplir les détails dans la modal
                document.getElementById('course-title').textContent = courseTitle;
                document.getElementById('course-instructor').textContent = courseInstructor;
                document.getElementById('course-rating').textContent = courseRating;
                document.getElementById('course-points').textContent = coursePoints;
                
                // Vérifier si l'utilisateur a assez de points
                checkUserBalance(parseInt(coursePoints), 'course');
            });
        });
        
        // Gérer le clic sur le bouton d'inscription final
        const enrollCourseButton = document.querySelector('.btn-enroll-course');
        if (enrollCourseButton) {
            enrollCourseButton.addEventListener('click', function() {
                const pointsRequired = parseInt(document.getElementById('course-points').textContent);
                processTransaction(pointsRequired, 'course');
            });
        }
    }
    
    // Fonction pour vérifier le solde de l'utilisateur
    function checkUserBalance(pointsRequired, type) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { points: 0 };
        const userPoints = currentUser.points || 0;
        
        // Vérifier si l'utilisateur a assez de points
        const insufficientFundsElement = type === 'course' ? 
            document.getElementById('insufficient-funds-course') : 
            document.getElementById('insufficient-funds');
        
        const purchaseButton = type === 'course' ? 
            document.querySelector('.btn-enroll-course') : 
            document.querySelector('.btn-purchase-doc');
        
        if (userPoints < pointsRequired) {
            if (insufficientFundsElement) insufficientFundsElement.style.display = 'block';
            if (purchaseButton) purchaseButton.disabled = true;
        } else {
            if (insufficientFundsElement) insufficientFundsElement.style.display = 'none';
            if (purchaseButton) purchaseButton.disabled = false;
        }
    }
    
    // Fonction pour traiter la transaction
    function processTransaction(pointsRequired, type) {
        // Récupérer les informations de l'utilisateur
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }
        
        // Vérifier à nouveau si l'utilisateur a assez de points
        if (currentUser.points < pointsRequired) {
            return;
        }
        
        // Déduire les points
        currentUser.points -= pointsRequired;
        
        // Ajouter l'élément acheté à l'historique de l'utilisateur
        if (!currentUser.purchases) {
            currentUser.purchases = [];
        }
        
        const itemName = type === 'course' ? 
            document.getElementById('course-title').textContent : 
            document.getElementById('doc-title').textContent;
        
        currentUser.purchases.push({
            type: type,
            name: itemName,
            points: pointsRequired,
            date: new Date().toISOString()
        });
        
        // Enregistrer les modifications
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Fermer la modal
        const modalId = type === 'course' ? 'enrollCourseModal' : 'purchaseDocModal';
        const modal = document.getElementById(modalId);
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal.hide();
        
        // Afficher une notification de succès
        const actionText = type === 'course' ? "Inscription réussie à" : "Téléchargement réussi de";
        
        if (window.showToast) {
            window.showToast('success', 'Félicitations!', `${actionText} "${itemName}". ${pointsRequired} points ont été déduits de votre compte.`);
        } else {
            const toast = document.createElement('div');
            toast.className = 'payment-toast';
            toast.innerHTML = `
                <div class="toast-icon"><i class="fas fa-check-circle"></i></div>
                <div class="toast-content">
                    <h4>Félicitations!</h4>
                    <p>${actionText} "${itemName}". ${pointsRequired} points ont été déduits de votre compte.</p>
                </div>
            `;
            document.body.appendChild(toast);
            
            // Supprimer la notification après 5 secondes
            setTimeout(() => {
                toast.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 5000);
        }
        
        // Mettre à jour le nombre de points affiché
        const pointsCountElements = document.querySelectorAll('.points-count');
        pointsCountElements.forEach(el => {
            el.textContent = currentUser.points;
        });
        
        // Si c'est un document, simuler le téléchargement
        if (type === 'document') {
            simulateDownload(itemName);
        } else {
            // Si c'est un cours, rediriger vers la page du cours
            setTimeout(() => {
                const courseSlug = itemName.toLowerCase().replace(/ /g, '-');
                window.location.href = `formation/${courseSlug}.html`;
            }, 1500);
        }
    }
    
    // Fonction pour simuler le téléchargement d'un document
    function simulateDownload(docName) {
        const downloadLink = document.createElement('a');
        downloadLink.href = '#'; // Dans un environnement réel, ce serait l'URL du document
        downloadLink.download = docName.replace(/ /g, '_') + '.pdf';
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        // Afficher une notification de téléchargement
        if (window.showToast) {
            window.showToast('success', 'Téléchargement', `Le document "${docName}" est en cours de téléchargement...`);
        }
        
        // Simuler un clic sur le lien de téléchargement
        setTimeout(() => {
            document.body.removeChild(downloadLink);
        }, 1000);
    }
}); 