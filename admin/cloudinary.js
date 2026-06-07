/* ═══════════════════════════════════════════════════════════════
   UNIBIKE — cloudinary.js
   Upload de imagens para Cloudinary.
   ═══════════════════════════════════════════════════════════════ */

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dvin8hkmv/image/upload";
const UPLOAD_PRESET = "unibike_upload";

async function uploadImage(file) {
    if (!file) {
        throw new Error("Nenhum arquivo fornecido para upload.");
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
        console.info('[Cloudinary] Iniciando upload...');
        const response = await fetch(CLOUDINARY_URL, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('[Cloudinary] Erro no upload:', errorData);
            throw new Error(`Erro no upload: ${errorData.error?.message || response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.secure_url) {
            throw new Error('URL não retornada pelo Cloudinary');
        }
        
        console.info('[Cloudinary] Upload concluído. URL:', data.secure_url);
        return data.secure_url;

    } catch (error) {
        console.error('[Cloudinary] Erro ao fazer upload:', error);
        throw error;
    }
}

export { uploadImage };
