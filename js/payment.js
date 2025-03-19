document.addEventListener('DOMContentLoaded', function() {
    // Sélection des éléments
    const packageCards = document.querySelectorAll('.package-card');
    const paymentTotalElement = document.getElementById('payment-total');
    const pointsTotalElement = document.getElementById('points-total');
    const payButton = document.querySelector('.btn-payment');
    
    let selectedValue = 1000; // Valeur par défaut
    
    if (packageCards.length > 0) {
        // Sélectionner le package par défaut (1000 points)
        packageCards.forEach(card => {
            if (card.getAttribute('data-value') == selectedValue) {
                card.classList.add('selected');
            }
            
            card.addEventListener('click', function() {
                // Supprimer la sélection précédente
                packageCards.forEach(c => c.classList.remove('selected'));
                
                // Ajouter la classe 'selected' au package sélectionné
                this.classList.add('selected');
                
                // Mettre à jour la valeur sélectionnée
                selectedValue = parseInt(this.getAttribute('data-value'));
                
                // Mettre à jour le récapitulatif
                let price;
                switch(selectedValue) {
                    case 500:
                        price = 5;
                        break;
                    case 1000:
                        price = 9;
                        break;
                    case 2500:
                        price = 20;
                        break;
                    default:
                        price = 9;
                }
                
                paymentTotalElement.textContent = price + ' €';
                pointsTotalElement.textContent = selectedValue + ' points';
            });
        });
    }
    
    // Gestion du paiement
    if (payButton) {
        payButton.addEventListener('click', function() {
            // Afficher une animation de chargement
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement...';
            this.disabled = true;
            
            // Simuler un délai de traitement
            setTimeout(() => {
                // Mettre à jour les points dans localStorage
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser) {
                    currentUser.points += parseInt(selectedValue);
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
                
                // Fermer le modal
                const modal = document.querySelector('#addPointsModal');
                const bootstrapModal = bootstrap.Modal.getInstance(modal);
                bootstrapModal.hide();
                
                // Afficher une notification de succès
                if (window.showToast) {
                    window.showToast('success', 'Paiement réussi !', `${selectedValue} points ont été ajoutés à votre compte.`);
                } else {
                    const toast = document.createElement('div');
                    toast.className = 'payment-toast';
                    toast.innerHTML = `
                        <div class="toast-icon"><i class="fas fa-check-circle"></i></div>
                        <div class="toast-content">
                            <h4>Paiement réussi !</h4>
                            <p>${selectedValue} points ont été ajoutés à votre compte.</p>
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
                    const currentPoints = currentUser ? currentUser.points : parseInt(el.textContent);
                    el.textContent = currentPoints;
                });
                
                // Réinitialiser le bouton
                this.innerHTML = '<i class="fas fa-shopping-cart me-2"></i> Payer maintenant';
                this.disabled = false;
            }, 2000);
        });
    }
}); 