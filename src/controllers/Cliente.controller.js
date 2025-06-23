// src/controllers/Cliente.controller.js

// Importa el servicio Cliente para acceder a la lógica de negocio
import ClienteService from '../services/Cliente.service.js';
// Importa tu helper de Cloudinary para subir imágenes
import { imageUploadUtil } from '../utils/cloudinary.js';

class ClienteController {
    /**
     * Maneja la creación de un nuevo cliente (registro).
     * @param {object} req - Objeto de solicitud (contiene req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async createCliente(req, res) {
        try {
            let clienteData = req.body; // Se crea una copia mutable

            // Validación básica de entrada para el registro
            if (!clienteData.nombre || !clienteData.contacto || !clienteData.username || !clienteData.password) {
                return res.status(400).json({ message: 'Nombre, contacto, username y password son campos requeridos.' });
            }

            // --- Lógica para manejar la foto de perfil (Base64 a Cloudinary) ---
            if (clienteData.foto_perfil_url && typeof clienteData.foto_perfil_url === 'string' && clienteData.foto_perfil_url.startsWith('data:image')) {
                console.log("Controlador: Detectada imagen Base64 para subir en createCliente.");
                try {
                    const result = await imageUploadUtil(clienteData.foto_perfil_url);
                    clienteData.foto_perfil_url = result.secure_url; // Reemplaza Base64 con la URL de Cloudinary
                } catch (uploadError) {
                    console.error("Error al subir imagen a Cloudinary durante la creación:", uploadError.message);
                    // Opcional: Podrías retornar un error específico aquí o continuar sin la imagen
                    clienteData.foto_perfil_url = null; // Si falla la subida, se guarda como null
                    // return res.status(500).json({ message: 'Error al subir la foto de perfil.', error: uploadError.message });
                }
            } else if (clienteData.foto_perfil_url === '') {
                // Si se envía una cadena vacía, se asume que no hay imagen o se quiere limpiar
                clienteData.foto_perfil_url = null;
            }
            // Si foto_perfil_url es una URL válida ya (no Base64), o null, no se hace nada y se pasa directamente
            // --- Fin lógica foto de perfil ---

            const newCliente = await ClienteService.createCliente(clienteData);
            res.status(201).json({ message: 'Cliente registrado exitosamente.', cliente: newCliente });
        } catch (error) {
            // Manejo de errores específicos del servicio para duplicados
            if (error.message.includes('contacto ya está registrado') || error.message.includes('nombre de usuario ya está en uso')) {
                return res.status(409).json({ message: error.message }); // 409 Conflict
            }
            console.error('Error en ClienteController.createCliente (registro):', error);
            res.status(500).json({ message: 'Error interno del servidor al registrar cliente.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de todos los clientes (método original).
     * @param {object} req - Objeto de solicitud.
     * @param {object} res - Objeto de respuesta.
     */
    async getAllClientes(req, res) {
        try {
            const clientes = await ClienteService.getAllClientes();
            res.status(200).json(clientes);
        } catch (error) {
            console.error('Error en ClienteController.getAllClientes:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener clientes.', error: error.message });
        }
    }

    /**
     * Maneja la obtención de clientes con filtros, búsqueda y paginación.
     * Este es el NUEVO método para la funcionalidad extendida.
     * Extrae `searchTerm`, `page`, `limit` de los query parameters.
     * @param {object} req - Objeto de solicitud (contiene req.query).
     * @param {object} res - Objeto de respuesta.
     */
    async getPaginatedAndFilteredClientesController(req, res) {
        try {
            const { searchTerm, page, limit } = req.query;

            const filters = {};
            if (searchTerm) {
                filters.searchTerm = searchTerm;
            }

            const pageNum = parseInt(page, 10) || 1;
            const limitNum = parseInt(limit, 10) || 10;

            const clientes = await ClienteService.getPaginatedAndFilteredClientes(filters, pageNum, limitNum);
            res.status(200).json(clientes); // clientes ya contiene data y pagination
        } catch (error) {
            console.error('Error en ClienteController.getPaginatedAndFilteredClientesController:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener clientes (paginados/filtrados).', error: error.message });
        }
    }

    /**
     * Maneja la obtención de un cliente por su ID.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_cliente).
     * @param {object} res - Objeto de respuesta.
     */
    async getClienteById(req, res) {
        try {
            const { id_cliente } = req.params;
            const cliente = await ClienteService.getClienteById(id_cliente);
            res.status(200).json(cliente);
        } catch (error) {
            if (error.message.includes('Cliente no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en ClienteController.getClienteById:', error);
            res.status(500).json({ message: 'Error interno del servidor al obtener cliente.', error: error.message });
        }
    }

    /**
     * Maneja la actualización de un cliente.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_cliente y req.body).
     * @param {object} res - Objeto de respuesta.
     */
    async updateCliente(req, res) {
        try {
            const { id_cliente } = req.params;
            let updateData = req.body; // Se crea una copia mutable

            // Validación básica: no actualizar el ID
            if (updateData.id_cliente) {
                return res.status(400).json({ message: 'No se puede actualizar el ID del cliente.' });
            }

            // --- Lógica para manejar la foto de perfil (Base64 a Cloudinary o eliminar) ---
            // Solo si foto_perfil_url está presente en el cuerpo de la solicitud
            if (Object.prototype.hasOwnProperty.call(updateData, 'foto_perfil_url')) {
                if (updateData.foto_perfil_url && typeof updateData.foto_perfil_url === 'string' && updateData.foto_perfil_url.startsWith('data:image')) {
                    console.log("Controlador: Detectada nueva imagen Base64 para actualizar en updateCliente.");
                    try {
                        const result = await imageUploadUtil(updateData.foto_perfil_url);
                        updateData.foto_perfil_url = result.secure_url; // Reemplaza Base64 con la URL de Cloudinary
                    } catch (uploadError) {
                        console.error("Error al subir imagen a Cloudinary durante la actualización:", uploadError.message);
                        // Opcional: Podrías retornar un error específico aquí o continuar sin la imagen
                        updateData.foto_perfil_url = null; // Si falla la subida, se guarda como null
                        // return res.status(500).json({ message: 'Error al subir la foto de perfil.', error: uploadError.message });
                    }
                } else if (updateData.foto_perfil_url === '') {
                    // Si se envía una cadena vacía, significa que se quiere eliminar la foto
                    console.log("Controlador: Eliminando foto de perfil existente.");
                    updateData.foto_perfil_url = null;
                }
                // Si foto_perfil_url ya es una URL válida (no Base64) o ya es null, no se hace nada
            }
            // Si foto_perfil_url NO se envía en el body, se ignora y no se modifica en la DB
            // --- Fin lógica foto de perfil ---

            const updatedCliente = await ClienteService.updateCliente(id_cliente, updateData);
            res.status(200).json({ message: 'Cliente actualizado exitosamente.', cliente: updatedCliente });
        } catch (error) {
            if (error.message.includes('Cliente no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('contacto ya está registrado') || error.message.includes('username ya está en uso')) {
                return res.status(409).json({ message: error.message });
            }
            console.error('Error en ClienteController.updateCliente:', error);
            res.status(500).json({ message: 'Error interno del servidor al actualizar cliente.', error: error.message });
        }
    }

    /**
     * Maneja la eliminación de un cliente.
     * @param {object} req - Objeto de solicitud (contiene req.params.id_cliente).
     * @param {object} res - Objeto de respuesta.
     */
    async deleteCliente(req, res) {
        try {
            const { id_cliente } = req.params;
            await ClienteService.deleteCliente(id_cliente);
            res.status(200).json({ message: 'Cliente eliminado exitosamente.' });
        } catch (error) {
            if (error.message.includes('Cliente no encontrado')) {
                return res.status(404).json({ message: error.message });
            }
            console.error('Error en ClienteController.deleteCliente:', error);
            res.status(500).json({ message: 'Error interno del servidor al eliminar cliente.', error: error.message });
        }
    }
}

// Exporta una instancia de la clase para que sea un singleton
export default new ClienteController();
