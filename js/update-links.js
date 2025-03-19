// Script temporaire pour mettre à jour les liens sociaux
document.addEventListener('DOMContentLoaded', function() {
    // Cartographie des classes d'icônes Font Awesome aux plateformes
    const iconToPlatform = {
        'fa-youtube': 'YOUTUBE_URL',
        'fa-twitter': 'TWITTER_URL',
        'fa-instagram': 'INSTAGRAM_URL',
        'fa-linkedin': 'LINKEDIN_URL',
        'fa-telegram': 'TELEGRAM_GROUP_URL',
        'fa-whatsapp': 'WHATSAPP_GROUP_INVITE',
        'fa-facebook': 'FACEBOOK_URL',
        'fa-github': 'GITHUB_URL',
        'fa-discord': 'DISCORD_INVITE_URL'
    };
    
    // Trouver tous les liens contenant des icônes de réseaux sociaux
    const allLinks = document.querySelectorAll('a');
    
    allLinks.forEach(link => {
        // Vérifier si le lien a déjà un attribut data-platform
        if (link.hasAttribute('data-platform')) {
            return;
        }
        
        // Vérifier si le lien contient une icône de réseau social
        const icon = link.querySelector('i[class*="fa-"]');
        if (!icon) return;
        
        // Trouver la plateforme correspondante
        for (const [iconClass, platform] of Object.entries(iconToPlatform)) {
            if (icon.classList.contains(iconClass)) {
                link.setAttribute('data-platform', platform);
                console.log(`Mise à jour du lien : ${link.href} => ${platform}`);
                break;
            }
        }
    });
    
    console.log('Mise à jour des liens sociaux terminée');
}); 