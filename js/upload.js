// Fonction pour uploader un fichier dans MongoDB
async function uploadFile(formData) {
    try {
        const response = await fetch('/api/community/files/upload', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erreur lors de l\'upload');
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Erreur d\'upload:', error);
        throw error;
    }
} 