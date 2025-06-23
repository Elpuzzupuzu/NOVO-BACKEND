// src/utils/cloudinary.js

// Importa la librería Cloudinary
import { v2 as cloudinary } from 'cloudinary'; // Usar import ES Modules para Cloudinary v2

// Configura Cloudinary con tus credenciales
// NOTA: Estas credenciales se usarán para la subida. Es crucial NO exponerlas en el frontend.
cloudinary.config({
    cloud_name: "dww7jqzne", // Tu Cloud Name proporcionado
    api_key: "859572793359467",   // Tu API Key proporcionada
    api_secret: "IAQ7bjXiwy-mH0MJjcMcSOTTOO4" // Tu API Secret proporcionada
});

/**
 * Sube una imagen (en formato Base64 o URL) a Cloudinary.
 * @param {string} file - La cadena Base64 de la imagen (ej: "data:image/jpeg;base64,...") o una URL de imagen.
 * @returns {Promise<object>} Un objeto con la información de la imagen subida, incluyendo su `secure_url`.
 * @throws {Error} Si la subida a Cloudinary falla.
 */
async function imageUploadUtil(file) {
    try {
        console.log("Iniciando subida de imagen a Cloudinary...");
        // Log para depuración, mostrando el inicio de la cadena Base64 (los primeros 50 caracteres)
        console.log("Datos de imagen (fragmento):", file.substring(0, 50) + "...");

        const result = await cloudinary.uploader.upload(file, {
            resource_type: 'auto' // Cloudinary detectará el tipo de recurso automáticamente
        });

        console.log("Imagen subida exitosamente a Cloudinary:", result.secure_url);
        return result;
    } catch (error) {
        console.error("❌ Error al subir imagen a Cloudinary:", error.message);
        throw new Error(`Error al subir imagen a Cloudinary: ${error.message}`);
    }
}

// Exportamos la función usando sintaxis de ES Modules
export { imageUploadUtil };
