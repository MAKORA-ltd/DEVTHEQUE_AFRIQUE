document.addEventListener('DOMContentLoaded', function() {
    // Éléments du DOM
    const notificationBadge = document.getElementById('notificationBadge');
    const notificationList = document.getElementById('notificationList');
    const noNotifications = document.getElementById('noNotifications');
    const markAllAsRead = document.getElementById('markAllAsRead');
    
    // État des notifications
    let notifications = [];
    let unreadCount = 0;
    
    // Charger les notifications
    async function loadNotifications() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch('/api/notifications', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erreur lors du chargement des notifications');
            
            notifications = await response.json();
            unreadCount = notifications.filter(n => !n.isRead).length;
            
            updateNotificationBadge();
            renderNotifications();
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
    
    // Mettre à jour le badge de notification
    function updateNotificationBadge() {
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            notificationBadge.style.display = 'block';
        } else {
            notificationBadge.style.display = 'none';
        }
    }
    
    // Afficher les notifications dans le dropdown
    function renderNotifications() {
        if (notifications.length === 0) {
            noNotifications.style.display = 'block';
            return;
        }
        
        noNotifications.style.display = 'none';
        notificationList.innerHTML = '';
        
        // Afficher les 5 dernières notifications
        const recentNotifications = notifications.slice(0, 5);
        
        recentNotifications.forEach(notification => {
            const notificationItem = createNotificationElement(notification);
            notificationList.appendChild(notificationItem);
        });
    }
    
    // Créer un élément de notification
    function createNotificationElement(notification) {
        const item = document.createElement('div');
        item.className = `notification-item d-flex align-items-start ${!notification.isRead ? 'unread' : ''}`;
        item.dataset.id = notification._id;
        
        // Icône selon le type de notification
        const iconClass = getIconForType(notification.type);
        
        // Date formatée
        const timeAgo = formatTimeAgo(new Date(notification.createdAt));
        
        item.innerHTML = `
            <div class="notification-icon ${notification.type}">
                <i class="${iconClass}"></i>
            </div>
            <div class="notification-content flex-grow-1">
                <div class="d-flex justify-content-between">
                    <h6 class="notification-title">${notification.title}</h6>
                    <small class="notification-time">${timeAgo}</small>
                </div>
                <p class="notification-message">${notification.message}</p>
            </div>
        `;
        
        // Ajouter un événement de clic pour marquer comme lu et rediriger
        item.addEventListener('click', () => {
            markAsRead(notification._id);
            if (notification.sourceUrl) {
                window.location.href = notification.sourceUrl;
            }
        });
        
        return item;
    }
    
    // Obtenir l'icône selon le type de notification
    function getIconForType(type) {
        const icons = {
            'account': 'fas fa-user-shield',
            'points': 'fas fa-coins',
            'mention': 'fas fa-at',
            'comment': 'fas fa-comment',
            'search': 'fas fa-search',
            'document': 'fas fa-file-alt',
            'system': 'fas fa-cog'
        };
        
        return icons[type] || 'fas fa-bell';
    }
    
    // Formater la date relative
    function formatTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) return 'à l\'instant';
        if (diffInSeconds < 3600) return `il y a ${Math.floor(diffInSeconds / 60)} min`;
        if (diffInSeconds < 86400) return `il y a ${Math.floor(diffInSeconds / 3600)} h`;
        if (diffInSeconds < 2592000) return `il y a ${Math.floor(diffInSeconds / 86400)} j`;
        
        // Format de date pour les notifications plus anciennes
        return date.toLocaleDateString();
    }
    
    // Marquer une notification comme lue
    async function markAsRead(notificationId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch(`/api/notifications/${notificationId}/read`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erreur lors du marquage de la notification');
            
            // Mettre à jour l'état local
            const notificationIndex = notifications.findIndex(n => n._id === notificationId);
            if (notificationIndex !== -1 && !notifications[notificationIndex].isRead) {
                notifications[notificationIndex].isRead = true;
                unreadCount--;
                updateNotificationBadge();
                
                // Mettre à jour l'UI
                const notificationElement = document.querySelector(`.notification-item[data-id="${notificationId}"]`);
                if (notificationElement) {
                    notificationElement.classList.remove('unread');
                }
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
    
    // Marquer toutes les notifications comme lues
    async function markAllNotificationsAsRead() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            
            const response = await fetch('/api/notifications/read-all', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) throw new Error('Erreur lors du marquage de toutes les notifications');
            
            // Mettre à jour l'état local
            notifications.forEach(notification => {
                notification.isRead = true;
            });
            
            unreadCount = 0;
            updateNotificationBadge();
            
            // Mettre à jour l'UI
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
        } catch (error) {
            console.error('Erreur:', error);
        }
    }
    
    // Ajouter des événements d'écoute
    if (markAllAsRead) {
        markAllAsRead.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            markAllNotificationsAsRead();
        });
    }
    
    // Charger les notifications au démarrage
    loadNotifications();
    
    // Configurer la connexion WebSocket pour les notifications en temps réel
    setupWebSocketConnection();
    
    function setupWebSocketConnection() {
        // Vérifier si Socket.io est chargé
        if (typeof io === 'undefined') {
            console.warn('Socket.io n\'est pas chargé, les notifications en temps réel ne fonctionneront pas');
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Connexion au serveur WebSocket
        const socket = io({
            auth: {
                token: token
            }
        });
        
        // Écouter les nouvelles notifications
        socket.on('new-notification', function(notification) {
            // Ajouter la nouvelle notification au début du tableau
            notifications.unshift(notification);
            unreadCount++;
            
            // Mettre à jour l'interface
            updateNotificationBadge();
            renderNotifications();
            
            // Afficher une notification système si le navigateur le permet
            showBrowserNotification(notification);
        });
        
        // Reconnexion en cas de déconnexion
        socket.on('disconnect', function() {
            console.log('Déconnecté du serveur de notifications');
            setTimeout(() => socket.connect(), 5000);
        });
    }
    
    // Afficher une notification du navigateur
    function showBrowserNotification(notification) {
        // Vérifier si les notifications du navigateur sont supportées et autorisées
        if (!("Notification" in window)) return;
        
        if (Notification.permission === "granted") {
            const notif = new Notification(notification.title, {
                body: notification.message,
                icon: '/images/logo.png'
            });
            
            notif.onclick = function() {
                window.focus();
                if (notification.sourceUrl) {
                    window.location.href = notification.sourceUrl;
                }
            };
        } 
        else if (Notification.permission !== "denied") {
            Notification.requestPermission();
        }
    }
    
    // Demander la permission pour les notifications du navigateur
    if ("Notification" in window && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}); 