export async function clientConvertToWebP(file: File): Promise<File> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("Could not get canvas context"));
                    return;
                }

                ctx.drawImage(img, 0, 0);

                canvas.toBlob((blob) => {
                    if (!blob) {
                        reject(new Error("Could not convert to WebP"));
                        return;
                    }

                    const webpFile = new File([blob], `${file.name.split('.')[0]}.webp`, {
                        type: 'image/webp',
                        lastModified: new Date().getTime()
                    });

                    resolve(webpFile);
                }, "image/webp", 0.8);
            };
            img.src = reader.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}