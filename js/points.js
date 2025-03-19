document.addEventListener('DOMContentLoaded', async function() {
    const db = window.db || {};
    
    // Récupérer l'utilisateur courant
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    const userId = currentUser.id;
    const token = localStorage.getItem('token');
    
    // Mettre à jour l'affichage des points
    updatePointsDisplay();
    
    // Gestion des packages de points
    const packageCards = document.querySelectorAll('.package-card');
    const paymentTotalElement = document.getElementById('payment-total');
    const pointsTotalElement = document.getElementById('points-total');
    
    let selectedValue = 1000; // Valeur par défaut
    
    if (packageCards.length > 0) {
        // Ajouter la classe 'selected' au package par défaut (1000 points)
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
    
    // Gestion des tâches sociales pour gagner des points
    const taskButtons = document.querySelectorAll('.task-button');
    
    if (taskButtons.length > 0 && userId) {
        // Récupérer les tâches déjà accomplies depuis MongoDB
        try {
            const response = await fetch(`/api/tasks?userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const completedTasksData = await response.json();
                const completedTasks = {};
                
                // Convertir la liste de tâches en objet pour faciliter la vérification
                completedTasksData.forEach(task => {
                    completedTasks[task.task] = true;
                });
                
                // Mettre à jour l'apparence des tâches déjà accomplies
                taskButtons.forEach(button => {
                    const taskCard = button.closest('.task-card');
                    const task = taskCard.getAttribute('data-task');
                    
                    if (completedTasks[task]) {
                        taskCard.classList.add('completed');
                        button.classList.add('completed');
                        button.innerHTML = '<i class="fas fa-check"></i> Complété';
                        button.disabled = true;
                    }
                });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des tâches accomplies:', error);
        }
        
        // Gestion des clics sur les boutons de tâches
        taskButtons.forEach(button => {
            button.addEventListener('click', async function() {
                const taskCard = this.closest('.task-card');
                const task = taskCard.getAttribute('data-task');
                const points = parseInt(this.getAttribute('data-points'), 10);
                
                // Utiliser les liens depuis le système de plateformes
                const url = window.platformLinks.getLink(`${task.toUpperCase()}_URL`);
                const verificationUrl = url; // Ou une autre URL spécifique pour la vérification
                
                // Ouvrir la page de la plateforme
                window.open(url, '_blank');
                
                // Vérification et attribution des points
                // ... reste du code existant ...

                // Ajouter des points à l'utilisateur
                const pointsResponse = await fetch(`/api/users/${userId}/points`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        points,
                        source: `Tâche sociale: ${platform.name}`,
                        date: new Date().toISOString(),
                        createNotification: true // Indication pour créer une notification
                    })
                });
            });
        });
    }
    
    // Fonction pour mettre à jour l'affichage des points
    async function updatePointsDisplay() {
        const pointsCountElements = document.querySelectorAll('.points-count');
        
        if (userId && token) {
            try {
                // Récupérer les points à jour depuis MongoDB
                const response = await fetch(`/api/users/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                
                if (response.ok) {
                    const userData = await response.json();
                    
                    // Mettre à jour localStorage
                    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
                    currentUser.points = userData.points;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    
                    // Mettre à jour les éléments d'affichage
                    pointsCountElements.forEach(el => {
                        el.textContent = userData.points || 0;
                    });
                } else {
                    throw new Error('Erreur lors de la récupération des données utilisateur');
                }
            } catch (error) {
                console.error('Erreur de mise à jour des points:', error);
                
                // Afficher les points depuis localStorage en cas d'erreur
                const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { points: 0 };
                pointsCountElements.forEach(el => {
                    el.textContent = currentUser.points || 0;
                });
            }
        } else {
            // Sans utilisateur connecté, afficher 0
            pointsCountElements.forEach(el => {
                el.textContent = '0';
            });
        }
    }
    
    // Fonction de vérification d'abonnement
    async function verifySubscription(platform, userIdentifier) {
        // Simulation d'une requête d'API pour vérifier l'abonnement
        return new Promise((resolve) => {
            // Afficher une animation de chargement pendant la vérification
            const verifyModal = createVerificationModal(platform);
            document.body.appendChild(verifyModal);
            
            setTimeout(() => {
                // Simuler une réponse de vérification (dans un environnement réel, cela serait une vraie vérification API)
                // Pour la démonstration, nous avons 80% de chances de succès
                const success = Math.random() < 0.8;
                
                // Supprimer le modal de chargement
                document.body.removeChild(verifyModal);
                
                if (success) {
                    resolve({
                        success: true,
                        message: `Abonnement vérifié sur ${platform}!`
                    });
                } else {
                    resolve({
                        success: false,
                        message: `Nous n'avons pas pu vérifier votre abonnement à ${platform}. Veuillez réessayer.`
                    });
                }
            }, 3000); // Simuler un délai de vérification
        });
    }
    
    // Créer le modal de vérification
    function createVerificationModal(platform) {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'verification-modal';
        modalContainer.innerHTML = `
            <div class="verification-content">
                <div class="verification-icon">
                    <i class="fa${platform === 'YouTube' ? 'b' : platform === 'WhatsApp' ? 'b' : 'b'} fa-${platform.toLowerCase()}"></i>
                </div>
                <h4>Vérification en cours</h4>
                <p>Nous vérifions votre abonnement à ${platform}...</p>
                <div class="verification-spinner">
                    <i class="fas fa-circle-notch fa-spin"></i>
                </div>
            </div>
        `;
        return modalContainer;
    }
    
    // Fonction pour capturer l'identifiant utilisateur
    function getUserIdentifier(platform) {
        return new Promise((resolve) => {
            const userIdModal = document.createElement('div');
            userIdModal.className = 'user-id-modal';
            userIdModal.innerHTML = `
                <div class="user-id-content">
                    <div class="user-id-header">
                        <h4>Vérification ${platform}</h4>
                        <button class="close-btn"><i class="fas fa-times"></i></button>
                    </div>
                    <p>Pour vérifier votre abonnement à ${platform}, veuillez entrer votre identifiant:</p>
                    <div class="user-id-input">
                        <input type="text" placeholder="Votre identifiant ${platform}" id="user-id-field">
                        <small class="help-text">
                            ${platform === 'YouTube' ? 'Exemple: votre nom d\'utilisateur ou email' : 
                              platform === 'Twitter' ? 'Exemple: @votrepseudo' : 
                              platform === 'Instagram' ? 'Exemple: votrepseudo' : 
                              platform === 'Telegram' ? 'Exemple: @votrepseudo' :
                              platform === 'WhatsApp' ? 'Exemple: +22897XXXXXX' : 'Votre identifiant'}
                        </small>
                    </div>
                    <div class="user-id-actions">
                        <button class="btn btn-cancel">Annuler</button>
                        <button class="btn btn-verify">Vérifier</button>
                    </div>
                </div>
            `;
            document.body.appendChild(userIdModal);
            
            // Gestion des événements
            const closeBtn = userIdModal.querySelector('.close-btn');
            const cancelBtn = userIdModal.querySelector('.btn-cancel');
            const verifyBtn = userIdModal.querySelector('.btn-verify');
            const userIdField = userIdModal.querySelector('#user-id-field');
            
            closeBtn.addEventListener('click', () => {
                document.body.removeChild(userIdModal);
                resolve(null);
            });
            
            cancelBtn.addEventListener('click', () => {
                document.body.removeChild(userIdModal);
                resolve(null);
            });
            
            verifyBtn.addEventListener('click', () => {
                const userId = userIdField.value.trim();
                if (userId) {
                    document.body.removeChild(userIdModal);
                    resolve(userId);
                } else {
                    userIdField.classList.add('error');
                    setTimeout(() => {
                        userIdField.classList.remove('error');
                    }, 1000);
                }
            });
            
            // Focus sur l'input
            setTimeout(() => {
                userIdField.focus();
            }, 100);
        });
    }
    
    // Fonction pour afficher une notification toast
    window.showToast = function(type, title, message) {
        const toast = document.createElement('div');
        toast.className = 'payment-toast';
        
        const icon = type === 'success' ? 'check-circle' : 'exclamation-circle';
        const iconColor = type === 'success' ? '#4CD964' : '#FF3B30';
        
        toast.innerHTML = `
            <div class="toast-icon" style="color: ${iconColor}"><i class="fas fa-${icon}"></i></div>
            <div class="toast-content">
                <h4>${title}</h4>
                <p>${message}</p>
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
    };
    
    // Fonction pour ajouter des points à l'utilisateur
    async function addPoints(amount, reason) {
        try {
            const response = await fetch('/api/user/points/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount,
                    reason
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Erreur lors de l\'ajout de points');
            }
            
            const data = await response.json();
            
            // Mettre à jour les points dans le localStorage
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            currentUser.points = data.newBalance;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            
            // Mettre à jour l'affichage des points
            updatePointsDisplay();
            
            return data;
        } catch (error) {
            console.error('Erreur:', error);
            throw error;
        }
    }
}); 