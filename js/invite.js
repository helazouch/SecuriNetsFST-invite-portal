document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('invite-form');
    const emailInput = document.getElementById('email');
    const qrResult = document.getElementById('qr-result');
    const qrCodeDiv = document.getElementById('qr-code');
    const downloadBtn = document.getElementById('download-qr');
    const errorMessage = document.getElementById('error-message');

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        qrResult.style.display = 'none';
    }

    function showSuccess() {
        errorMessage.style.display = 'none';
        qrResult.style.display = 'block';
    }

    function createDownloadLink(canvas, email) {
        const dataURL = canvas.toDataURL('image/png');
        const fileName = `qr-code-${email.replace('@', '_').replace('.', '_')}.png`;
        
        // Masquer le bouton original
        downloadBtn.style.display = 'none';
        
        // Créer le lien de téléchargement
        const downloadLink = document.createElement('a');
        downloadLink.href = dataURL;
        downloadLink.download = fileName;
        downloadLink.className = 'btn btn-secondary';
        downloadLink.innerHTML = 'Télécharger mon QR Code';
        downloadLink.style.textDecoration = 'none';
        downloadLink.style.display = 'inline-block';
        downloadLink.style.width = '100%';
        downloadLink.style.marginTop = '1rem';
        
        // Ajouter le lien après le bouton original
        downloadBtn.parentNode.insertBefore(downloadLink, downloadBtn.nextSibling);
        
        console.log('Lien de téléchargement créé !');
    }

    function generateWithAPI(email, qrData) {
        // Adapter la taille selon la largeur de l'écran
        const isMobile = window.innerWidth <= 640;
        const size = isMobile ? 200 : 256;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrData)}`;
        
        const img = document.createElement('img');
        img.src = qrUrl;
        img.alt = 'QR Code';
        img.style.width = size + 'px';
        img.style.height = size + 'px';
        img.style.border = '2px solid #490599';
        img.style.borderRadius = '12px';
        img.crossOrigin = 'anonymous';
        
        img.onload = function() {
            try {
                const isMobile = window.innerWidth <= 640;
                const size = isMobile ? 200 : 256;
                
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = size;
                canvas.height = size;
                ctx.drawImage(img, 0, 0, size, size);
                createDownloadLink(canvas, email);
            } catch (error) {
                console.log('Erreur canvas, création lien direct');
                createDirectLink(qrUrl, email);
            }
        };
        
        img.onerror = function() {
            createDirectLink(qrUrl, email);
        };
        
        qrCodeDiv.innerHTML = '';
        qrCodeDiv.appendChild(img);
        showSuccess();
    }

    function createDirectLink(qrUrl, email) {
        const fileName = `qr-code-${email.replace('@', '_').replace('.', '_')}.png`;
        
        downloadBtn.style.display = 'none';
        
        const directLink = document.createElement('a');
        directLink.href = qrUrl;
        directLink.download = fileName;
        directLink.target = '_blank';
        directLink.className = 'btn btn-secondary';
        directLink.innerHTML = 'Télécharger mon QR Code';
        directLink.style.textDecoration = 'none';
        directLink.style.width = '100%';
        directLink.style.marginTop = '1rem';
        
        downloadBtn.parentNode.insertBefore(directLink, downloadBtn.nextSibling);
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        
        if (!email) {
            showError('Veuillez saisir une adresse email valide.');
            return;
        }

        // Validation email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Format d\'email invalide. Veuillez saisir une adresse valide.');
            return;
        }

        // Nettoyer les anciens éléments
        const oldLinks = qrResult.querySelectorAll('a');
        oldLinks.forEach(link => link.remove());
        downloadBtn.style.display = 'inline-block';

        // Créer les données pour le QR code
        const qrData = JSON.stringify({
            email: email.toLowerCase(),
            timestamp: new Date().toISOString(),
            event: 'AG_CHECKIN_2025'
        });

        // Essayer avec la librairie QRCode en premier
        if (typeof QRCode !== 'undefined') {
            try {
                qrCodeDiv.innerHTML = '';
                
                // Adapter la taille selon la largeur de l'écran
                const isMobile = window.innerWidth <= 640;
                const qrSize = isMobile ? 200 : 256;
                
                const canvas = document.createElement('canvas');
                await QRCode.toCanvas(canvas, qrData, {
                    width: qrSize,
                    margin: 2,
                    color: {
                        dark: '#333333',
                        light: '#FFFFFF'
                    }
                });
                
                // Styliser le canvas
                canvas.style.border = '2px solid #490599';
                canvas.style.borderRadius = '12px';
                
                qrCodeDiv.appendChild(canvas);
                showSuccess();
                createDownloadLink(canvas, email);
                
                console.log('QR Code généré avec succès !');
                return;
                
            } catch (error) {
                console.log('Erreur avec QRCode, utilisation de l\'API...');
            }
        }
        
        // Utiliser l'API comme fallback
        generateWithAPI(email, qrData);
    });
});