// client/src/components/ServicesForm/ServicesForm.jsx
import React, { useState } from 'react';
import styles from './ServicesForm.module.css';
// import axiosInstance from '../../config/axiosConfig'; // Descomentar si vas a enviar el formulario

const ServicesForm = () => {
  const [formData, setFormData] = useState({
    name: '',           // Antes 'frech'
    contact: '',        // Antes 'coana' (Email o Teléfono)
    vehicleInfo: '',    // Antes 'eleard' (Modelo/Año o Tipo de Servicio)
    serviceType: '',    // Antes 'corged' (Tipo de Tapicería/Servicio)
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Datos del formulario enviados:', formData);
    // Aquí iría tu lógica para enviar el formulario al backend con Axios
    // try {
    //   const response = await axiosInstance.post('/api/service-inquiry', formData); // Ruta de API para la consulta
    //   console.log('Formulario enviado con éxito:', response.data);
    //   alert('¡Tu solicitud ha sido enviada! Nos pondremos en contacto pronto.');
    //   // Limpiar formulario después de enviar
    //   setFormData({ name: '', contact: '', vehicleInfo: '', serviceType: '' });
    // } catch (error) {
    //   console.error('Error al enviar el formulario:', error);
    //   alert('Hubo un error al enviar tu solicitud. Por favor, inténtalo de nuevo.');
    // }
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>SOLICITAR SERVICIO</h3> {/* De 'CERTEMT SERVICES' */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="text"
          name="name"
          placeholder="Tu Nombre" // Antes 'frech'
          className={styles.inputField}
          value={formData.name}
          onChange={handleChange}
          required // Campo obligatorio
        />
        <input
          type="text" // Usamos 'text' para permitir email o teléfono
          name="contact"
          placeholder="Email o Teléfono" // Antes 'Coana'
          className={styles.inputField}
          value={formData.contact}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="vehicleInfo"
          placeholder="Marca, Modelo y Año del Coche" // Antes 'Eleard'
          className={styles.inputField}
          value={formData.vehicleInfo}
          onChange={handleChange}
          required
        />
        <select
          name="serviceType"
          className={styles.selectField}
          value={formData.serviceType}
          onChange={handleChange}
          required
        >
          <option value="">Selecciona el Tipo de Servicio</option> {/* Antes 'Corged' */}
          <option value="restoration">Restauración de Tapicería</option>
          <option value="customization">Diseño y Personalización</option>
          <option value="repair">Reparación de Asientos</option>
          <option value="leather-care">Mantenimiento y Cuidado del Cuero</option>
          <option value="other">Otro (especificar en mensaje)</option>
        </select>
        <button type="submit" className={styles.submitButton}>
          SOLICITAR COTIZACIÓN
        </button> {/* De 'Buy Now' */}
      </form>
    </div>
  );
};

export default ServicesForm;