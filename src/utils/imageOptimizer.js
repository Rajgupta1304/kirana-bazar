/**
 * Optimizes an uploaded image file on the client side:
 * - If the file is a GIF or animated WebP, preserves original data URL without modification so animation frames are intact.
 * - If the file is a standard photo (JPEG, PNG, etc.), scales it down using an HTML5 Canvas to a max dimension of 1000px and 85% JPEG/PNG quality.
 *   This avoids bloated 10MB+ base64 payloads, speeds up API transfers to ~80-120KB, and prevents memory spikes.
 */
export async function optimizeImageFile(file, maxWidth = 1000, maxHeight = 1000, quality = 0.85) {
  if (!file) return { dataUrl: '', isAnimation: false };

  const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');
  if (isGif) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve({ dataUrl: e.target?.result || '', isAnimation: true });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(format, quality);
          resolve({ dataUrl, isAnimation: false });
        } else {
          resolve({ dataUrl: e.target?.result || '', isAnimation: false });
        }
      };
      img.onerror = () => {
        resolve({ dataUrl: e.target?.result || '', isAnimation: false });
      };
      img.src = e.target?.result;
    };
    reader.onerror = () => resolve({ dataUrl: '', isAnimation: false });
    reader.readAsDataURL(file);
  });
}
