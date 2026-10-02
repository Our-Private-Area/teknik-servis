/**
 * Client-side image compression utility.
 * Resizes large images (e.g. 5MB phone photos) down to suitable web dimensions
 * and compresses to WebP or JPEG. Keeps payload well under Firestore's 1MB doc limit.
 */

export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
  mimeType?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export function compressImageFile(file: File, options: CompressOptions = {}): Promise<string> {
  const {
    maxWidth = 900,
    maxHeight = 900,
    quality = 0.82,
    mimeType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    // If SVG, read as text/data URL directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / maxWidth > height / maxHeight) {
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
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Draw and export
        ctx.drawImage(img, 0, 0, width, height);

        try {
          const dataUrl = canvas.toDataURL(mimeType, quality);
          // If browser doesn't support webp, fallback to jpeg
          if (dataUrl.startsWith('data:image/webp') || mimeType !== 'image/webp') {
            resolve(dataUrl);
          } else {
            resolve(canvas.toDataURL('image/jpeg', quality));
          }
        } catch {
          resolve(canvas.toDataURL('image/jpeg', quality));
        }
      };

      img.onerror = () => reject(new Error('Görsel yüklenirken bir hata oluştu.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Dosya okunamadı.'));
    reader.readAsDataURL(file);
  });
}
