// Classe pour gérer les liens des plateformes
class PlatformLinks {
    constructor() {
        this.links = {};
        this.loaded = false;
    }

    // Charger les liens depuis le fichier texte
    async loadLinks() {
        try {
            const response = await fetch('/config/platforms.txt');
            if (!response.ok) {
                throw new Error('Erreur lors du chargement des liens');
            }
            
            const text = await response.text();
            this.parseLinks(text);
            this.loaded = true;
            console.log('Liens des plateformes chargés avec succès');
        } catch (error) {
            console.error('Erreur lors du chargement des liens:', error);
            // Charger les liens par défaut en cas d'échec
            this.loadDefaultLinks();
        }
    }

    // Analyser le contenu du fichier texte
    parseLinks(text) {
        const lines = text.split('\n');
        
        for (const line of lines) {
            // Ignorer les commentaires et les lignes vides
            if (line.trim().startsWith('#') || line.trim() === '') {
                continue;
            }
            
            // Extraire les paires clé-valeur
            const match = line.match(/^([A-Z_]+)=(.+)$/);
            if (match) {
                const [, key, value] = match;
                this.links[key] = value.trim();
            }
        }
    }

    // Charger des liens par défaut en cas d'échec
    loadDefaultLinks() {
        this.links = {
            SITE_URL: 'https://devtheque-afrique.com',
            TWITTER_URL: 'https://twitter.com/devtheque_afrique',
            YOUTUBE_URL: 'https://www.youtube.com/channel/devthequeafrique',
            INSTAGRAM_URL: 'https://www.instagram.com/devtheque_afrique/',
            TELEGRAM_GROUP_URL: 'https://t.me/devtheque_afrique',
            WHATSAPP_GROUP_INVITE: 'https://chat.whatsapp.com/invite/devthequeafrique',
            CONTACT_EMAIL: 'contact@devtheque-afrique.com'
        };
        this.loaded = true;
        console.log('Liens des plateformes par défaut chargés');
    }

    // Obtenir un lien spécifique
    getLink(platform) {
        if (!this.loaded) {
            console.warn('Les liens ne sont pas encore chargés');
        }
        return this.links[platform] || '#';
    }

    // Mettre à jour tous les liens dans le DOM
    updateDOMLinks() {
        // Rechercher tous les éléments avec l'attribut data-platform
        const elements = document.querySelectorAll('[data-platform]');
        
        elements.forEach(element => {
            const platform = element.getAttribute('data-platform');
            const link = this.getLink(platform);
            
            if (element.tagName === 'A') {
                element.href = link;
            } else {
                // Pour les autres éléments, chercher les liens enfants
                const links = element.querySelectorAll('a');
                links.forEach(linkElement => {
                    linkElement.href = link;
                });
            }
        });
    }
}

// Créer et exporter une instance
const platformLinks = new PlatformLinks();

// Charger les liens au démarrage de l'application
document.addEventListener('DOMContentLoaded', async () => {
    await platformLinks.loadLinks();
    platformLinks.updateDOMLinks();
    
    // Ajouter des écouteurs d'événements pour les boutons de tâches sociales
    const socialTaskButtons = document.querySelectorAll('.task-button');
    socialTaskButtons.forEach(button => {
        const task = button.closest('.task-card').getAttribute('data-task');
        button.addEventListener('click', () => {
            const link = platformLinks.getLink(`${task.toUpperCase()}_URL`);
            window.open(link, '_blank');
        });
    });
});

// Exporter l'instance pour une utilisation dans d'autres fichiers
window.platformLinks = platformLinks; 