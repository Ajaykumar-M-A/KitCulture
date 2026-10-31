/**
 * Client-side high performance image compressor using HTML5 Canvas.
 * Compresses raw high-res camera/phone photos before transmission over the network.
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1600,
    maxHeight = 2000,
    quality = 0.85,
    format = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    // If it's not an image file, reject
    if (!file.type.startsWith('image/')) {
      return reject(new Error('Selected file is not an image.'));
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio scale
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        // Smooth scaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to Blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Canvas compression failed.'));
            }

            const fileNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
            const newFileName = `${fileNameWithoutExt}.webp`;
            const compressedFile = new File([blob], newFileName, {
              type: format,
              lastModified: Date.now()
            });

            const originalKb = Math.round(file.size / 1024);
            const compressedKb = Math.round(blob.size / 1024);
            const savingsPct = file.size > blob.size
              ? Math.round(((file.size - blob.size) / file.size) * 100)
              : 0;

            const previewUrl = URL.createObjectURL(blob);

            resolve({
              blob,
              file: compressedFile,
              originalSizeKb: originalKb,
              compressedSizeKb: compressedKb,
              savings: `${savingsPct}%`,
              previewUrl
            });
          },
          format,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image for compression.'));
    };

    reader.onerror = () => reject(new Error('Failed to read file from disk.'));
  });
}
