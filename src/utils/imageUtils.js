export const watermarkImage = async (file, metadata) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Set canvas dimensions to match image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw original image
                ctx.drawImage(img, 0, 0);

                // Watermark Configuration
                const fontSize = Math.max(16, Math.floor(canvas.width / 40));
                const lineHeight = fontSize * 1.5;
                const padding = fontSize;
                const textBlockWidth = canvas.width - (padding * 2);

                // Prepare text lines
                const lines = [
                    `LAT: ${metadata.lat?.toFixed(6) || 'N/A'}  LNG: ${metadata.lng?.toFixed(6) || 'N/A'}`,
                    `ADDR: ${metadata.address || 'N/A'}`,
                    `PKG: #${metadata.orderId || 'N/A'}`,
                    `DISPATCHER: ${metadata.dispatcherName || 'N/A'}`,
                    `STORE: ${metadata.storeName || 'N/A'}`,
                    `TIME: ${new Date().toLocaleString()}`
                ];

                // Background for text
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                const textBlockHeight = (lines.length * lineHeight) + (padding * 2);
                ctx.fillRect(0, canvas.height - textBlockHeight, canvas.width, textBlockHeight);

                // Text settings
                ctx.font = `bold ${fontSize}px Arial, sans-serif`;
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'left';
                ctx.textBaseline = 'bottom';

                // Draw text lines
                let currentY = canvas.height - padding - ((lines.length - 1) * lineHeight);
                lines.forEach((line, index) => {
                    ctx.fillText(line, padding, canvas.height - padding - ((lines.length - 1 - index) * lineHeight));
                });

                // Convert back to file
                canvas.toBlob((blob) => {
                    const processedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now(),
                    });
                    resolve(processedFile);
                }, 'image/jpeg', 0.85);
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};
