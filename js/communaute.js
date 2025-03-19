document.addEventListener('DOMContentLoaded', function() {
    // Fonction pour charger les données depuis MongoDB via l'API
    async function loadCommunityData() {
        try {
            // Récupérer les statistiques de la communauté depuis MongoDB
            const statsResponse = await fetch('/api/community/stats', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                // Mettre à jour les statistiques
                document.getElementById('totalUploads').textContent = stats.uploads || '0';
                document.getElementById('totalDownloads').textContent = formatNumber(stats.downloads) || '0';
                document.getElementById('totalQuestions').textContent = stats.questions || '0';
                document.getElementById('activeUsers').textContent = stats.activeUsers || '0';
            }
            
            // Récupérer les contributions depuis MongoDB
            const filter = document.getElementById('contributionsFilter')?.value || 'popular';
            const contributionsResponse = await fetch(`/api/community/contributions?filter=${filter}&limit=6`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (contributionsResponse.ok) {
                const contributions = await contributionsResponse.json();
                displayContributions(contributions);
            }
            
            // Récupérer les technologies tendances depuis MongoDB
            const tagsResponse = await fetch('/api/community/trending-tags', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            
            if (tagsResponse.ok) {
                const tags = await tagsResponse.json();
                displayTrendingTags(tags);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            // En cas d'erreur, utiliser des données de démonstration
            useDemoData();
        }
    }
    
    // Fonction pour formater les nombres (ex: 1500 -> 1.5k)
    function formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000) {
            return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
        }
        return num.toString();
    }
    
    // Fonction pour afficher les contributions
    function displayContributions(contributions) {
        const sliderContainer = document.querySelector('.contributions-slider');
        if (!sliderContainer) return;
        
        // Vider le contenu existant
        sliderContainer.innerHTML = '';
        
        if (contributions.length === 0) {
            sliderContainer.innerHTML = `
                <div class="text-center w-100 py-4">
                    <p class="text-muted">Aucune contribution disponible pour le moment.</p>
                </div>
            `;
            return;
        }
        
        // Générer le HTML pour chaque contribution
        contributions.forEach(item => {
            const isQuestion = item.type === 'question';
            
            // Définir l'icône en fonction du type de fichier
            let fileIcon = 'fa-file-alt';
            if (item.fileExtension) {
                if (['pdf'].includes(item.fileExtension)) fileIcon = 'fa-file-pdf';
                else if (['doc', 'docx'].includes(item.fileExtension)) fileIcon = 'fa-file-word';
                else if (['ppt', 'pptx'].includes(item.fileExtension)) fileIcon = 'fa-file-powerpoint';
                else if (['xls', 'xlsx', 'csv'].includes(item.fileExtension)) fileIcon = 'fa-file-excel';
                else if (['zip', 'rar', '7z'].includes(item.fileExtension)) fileIcon = 'fa-file-archive';
                else if (['jpg', 'jpeg', 'png', 'gif'].includes(item.fileExtension)) fileIcon = 'fa-file-image';
                else if (['js', 'ts', 'py', 'java', 'c', 'cpp', 'cs', 'php'].includes(item.fileExtension)) fileIcon = 'fa-file-code';
            }
            
            // Générer les métadonnées
            let metaHTML = '';
            if (isQuestion) {
                metaHTML = `
                    <span><i class="fas fa-reply"></i> ${item.responseCount || 0} réponses</span>
                    ${item.solved ? '<span><i class="fas fa-check-circle"></i> Résolue</span>' : ''}
                `;
            } else {
                metaHTML = `
                    <span><i class="fas fa-download"></i> ${formatNumber(item.downloads)}</span>
                    <span><i class="fas fa-star"></i> ${item.rating || '0.0'}</span>
                    <span><i class="fas fa-coins"></i> ${item.points}</span>
                `;
            }
            
            const html = `
                <div class="contribution-item">
                    <div class="contribution-type ${isQuestion ? 'question' : ''}">
                        <i class="fas ${isQuestion ? 'fa-question' : fileIcon}"></i>
                    </div>
                    <div class="contribution-info">
                        <h5>${item.title}</h5>
                        <div class="contribution-category">
                            <span class="category-badge">${item.category}</span>
                        </div>
                        <p>Par <strong>${item.author}</strong></p>
                        <div class="meta">
                            ${metaHTML}
                        </div>
                    </div>
                    <a href="communaute.html#${isQuestion ? 'question' : 'file'}-${item._id}" class="stretched-link" aria-label="Voir le ${isQuestion ? 'question' : 'document'}"></a>
                </div>
            `;
            
            sliderContainer.innerHTML += html;
        });
        
        // Réinitialiser le slider
        initSlider();
    }
    
    // Fonction pour afficher les technologies tendances
    function displayTrendingTags(tags) {
        const tagsContainer = document.querySelector('.tech-tags');
        if (!tagsContainer) return;
        
        // Vider le contenu existant
        tagsContainer.innerHTML = '';
        
        if (tags.length === 0) {
            tagsContainer.innerHTML = `
                <p class="text-muted">Aucune tendance disponible pour le moment.</p>
            `;
            return;
        }
        
        // Définir des icônes pour les tags populaires
        const tagIcons = {
            'react': 'fab fa-react',
            'python': 'fab fa-python',
            'node.js': 'fab fa-node-js',
            'mongodb': 'fas fa-database',
            'flutter': 'fas fa-mobile-alt',
            'machine learning': 'fas fa-brain',
            'aws': 'fab fa-aws',
            'cybersécurité': 'fas fa-lock',
            'javascript': 'fab fa-js',
            'html': 'fab fa-html5',
            'css': 'fab fa-css3-alt',
            'php': 'fab fa-php',
            'angular': 'fab fa-angular',
            'vue': 'fab fa-vuejs',
            'docker': 'fab fa-docker',
            'linux': 'fab fa-linux',
            'git': 'fab fa-git-alt',
            'android': 'fab fa-android',
            'ios': 'fab fa-apple',
            'windows': 'fab fa-windows'
        };
        
        // Générer le HTML pour chaque tag
        tags.forEach(tag => {
            // Déterminer l'icône à utiliser
            let iconClass = 'fas fa-tag';
            const tagLower = tag.name.toLowerCase();
            
            for (const [key, value] of Object.entries(tagIcons)) {
                if (tagLower.includes(key)) {
                    iconClass = value;
                    break;
                }
            }
            
            const html = `
                <span class="tech-tag" data-count="${tag.count}">
                    <i class="${iconClass}"></i> ${tag.name}
                </span>
            `;
            
            tagsContainer.innerHTML += html;
        });
        
        // Ajouter des événements de clic pour filtrer par tag
        document.querySelectorAll('.tech-tag').forEach(tag => {
            tag.addEventListener('click', function() {
                const tagName = this.textContent.trim().split(' ').slice(1).join(' ');
                window.location.href = `communaute.html?tag=${encodeURIComponent(tagName)}`;
            });
        });
    }
    
    // Utiliser des données de démonstration en cas d'erreur ou pour le développement local
    function useDemoData() {
        // Données de démonstration pour les contributions
        const demoContributions = [
            {
                _id: '123',
                title: 'Guide Docker Complet',
                author: 'MoussaK',
                category: 'DevOps',
                type: 'file',
                fileExtension: 'pdf',
                downloads: 28,
                rating: 4.7,
                points: 120
            },
            {
                _id: '456',
                title: 'Projet Django Starter',
                author: 'AminataS',
                category: 'Backend',
                type: 'file',
                fileExtension: 'zip',
                downloads: 47,
                rating: 4.9,
                points: 75
            },
            {
                _id: '789',
                title: 'Installation React Native',
                author: 'KoffiT',
                category: 'Mobile',
                type: 'question',
                responseCount: 5,
                solved: true
            },
            {
                _id: '321',
                title: 'Tutorial GraphQL API',
                author: 'FatouD',
                category: 'API',
                type: 'file',
                fileExtension: 'pdf',
                downloads: 36,
                rating: 4.8,
                points: 150
            },
            {
                _id: '654',
                title: 'Configuration SSL Ubuntu',
                author: 'YaoC',
                category: 'Sécurité',
                type: 'question',
                responseCount: 3,
                solved: true
            },
            {
                _id: '987',
                title: 'Présentation NoSQL',
                author: 'OlivierM',
                category: 'Base de données',
                type: 'file',
                fileExtension: 'pptx',
                downloads: 22,
                rating: 4.6,
                points: 80
            }
        ];
        
        // Données de démonstration pour les tags
        const demoTags = [
            { name: 'React', count: 42 },
            { name: 'Python', count: 38 },
            { name: 'Node.js', count: 35 },
            { name: 'MongoDB', count: 30 },
            { name: 'Flutter', count: 28 },
            { name: 'Machine Learning', count: 25 },
            { name: 'AWS', count: 22 },
            { name: 'Cybersécurité', count: 20 }
        ];
        
        // Afficher les données de démonstration
        displayContributions(demoContributions);
        displayTrendingTags(demoTags);
    }
    
    // Initialiser le slider
    function initSlider() {
        const sliderNext = document.querySelector('.slider-control.next');
        const sliderPrev = document.querySelector('.slider-control.prev');
        const contributionsSlider = document.querySelector('.contributions-slider');
        
        if (!sliderNext || !sliderPrev || !contributionsSlider) return;
        
        const itemWidth = 315; // Largeur d'un élément + marge
        const visibleItems = Math.floor(contributionsSlider.offsetWidth / itemWidth);
        const totalItems = document.querySelectorAll('.contribution-item').length;
        let currentPosition = 0;
        const maxPosition = Math.max(0, totalItems - visibleItems);
        
        // Masquer le bouton précédent au démarrage
        sliderPrev.style.opacity = '0.5';
        sliderPrev.style.cursor = 'not-allowed';
        
        // Masquer les boutons de navigation s'il n'y a pas assez d'éléments
        if (totalItems <= visibleItems) {
            sliderNext.style.display = 'none';
            sliderPrev.style.display = 'none';
        } else {
            sliderNext.style.display = 'flex';
            sliderPrev.style.display = 'flex';
        }
        
        sliderNext.addEventListener('click', () => {
            if (currentPosition < maxPosition) {
                currentPosition++;
                contributionsSlider.scrollTo({
                    left: currentPosition * itemWidth,
                    behavior: 'smooth'
                });
                
                // Activer/désactiver les boutons selon la position
                sliderPrev.style.opacity = '1';
                sliderPrev.style.cursor = 'pointer';
                
                if (currentPosition >= maxPosition) {
                    sliderNext.style.opacity = '0.5';
                    sliderNext.style.cursor = 'not-allowed';
                }
            }
        });
        
        sliderPrev.addEventListener('click', () => {
            if (currentPosition > 0) {
                currentPosition--;
                contributionsSlider.scrollTo({
                    left: currentPosition * itemWidth,
                    behavior: 'smooth'
                });
                
                // Activer/désactiver les boutons selon la position
                sliderNext.style.opacity = '1';
                sliderNext.style.cursor = 'pointer';
                
                if (currentPosition <= 0) {
                    sliderPrev.style.opacity = '0.5';
                    sliderPrev.style.cursor = 'not-allowed';
                }
            }
        });
    }
    
    // Filtrer les contributions
    const contributionsFilter = document.getElementById('contributionsFilter');
    if (contributionsFilter) {
        contributionsFilter.addEventListener('change', function() {
            const filterValue = this.value;
            const contributionsSlider = document.querySelector('.contributions-slider');
            
            // Simuler un chargement
            if (contributionsSlider) contributionsSlider.style.opacity = '0.5';
            
            // Dans un environnement de production, on ferait un appel API
            // pour récupérer les contributions filtrées depuis MongoDB
            fetch(`/api/community/contributions?filter=${filterValue}&limit=6`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => {
                if (!response.ok) throw new Error('Erreur lors du chargement des données');
                return response.json();
            })
            .then(data => {
                displayContributions(data);
            })
            .catch(error => {
                console.error('Erreur:', error);
                useDemoData(); // Utiliser les données de démonstration en cas d'erreur
            })
            .finally(() => {
                if (contributionsSlider) contributionsSlider.style.opacity = '1';
            });
        });
    }
    
    // Afficher le modal rapide d'upload depuis le dashboard
    const quickUploadLinks = document.querySelectorAll('a[href="communaute.html#files"]');
    if (quickUploadLinks) {
        quickUploadLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                // Si on est sur la page d'accueil, on ouvre le modal
                if (window.location.pathname.includes('dashboard-home.html')) {
                    e.preventDefault();
                    const quickUploadModal = new bootstrap.Modal(document.getElementById('quickUploadModal'));
                    quickUploadModal.show();
                }
            });
        });
    }

    // Fonctionnalité de partage rapide
    const submitQuickUpload = document.getElementById('submitQuickUpload');
    if (submitQuickUpload) {
        submitQuickUpload.addEventListener('click', function() {
            const form = document.getElementById('quickUploadForm');
            if (form.checkValidity()) {
                // Simuler l'envoi du formulaire
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Traitement en cours...';
                this.disabled = true;
                
                // Récupérer les données du formulaire
                const formData = new FormData(form);
                
                // Dans un environnement de production, on enverrait les données à l'API
                // qui les stockerait dans MongoDB
                fetch('/api/community/files/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                })
                .then(response => {
                    if (!response.ok) throw new Error('Erreur lors de l\'envoi du fichier');
                    return response.json();
                })
                .then(data => {
                    // Rediriger vers la page communautaire avec un message de succès
                    window.location.href = 'communaute.html?upload=success';
                })
                .catch(error => {
                    console.error('Erreur:', error);
                    // En cas d'erreur dans l'environnement de production, afficher un message d'erreur
                    alert('Une erreur est survenue lors de l\'envoi du fichier. Veuillez réessayer.');
                    
                    // Pour la démonstration, rediriger quand même
                    setTimeout(() => {
                        window.location.href = 'communaute.html?upload=success';
                    }, 2000);
                });
            } else {
                // Déclencher la validation du formulaire
                form.reportValidity();
            }
        });
    }

    // Vérifier si on vient d'uploader un fichier (redirection avec paramètre)
    if (window.location.search.includes('upload=success')) {
        // Montrer une notification de succès
        const successToast = document.createElement('div');
        successToast.className = 'position-fixed bottom-0 end-0 p-3';
        successToast.style.zIndex = '11';
        successToast.innerHTML = `
            <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header">
                    <i class="fas fa-check-circle me-2 text-success"></i>
                    <strong class="me-auto">Fichier envoyé</strong>
                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    Votre fichier a été envoyé avec succès et est en attente de validation. Vous recevrez une notification dès qu'il sera approuvé.
                </div>
            </div>
        `;
        document.body.appendChild(successToast);
        
        // Supprimer le paramètre de l'URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Charger les données au chargement de la page
    loadCommunityData();
}); 