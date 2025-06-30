import React from 'react';
import CotizacionForm from '../../components/ServicesForm/CotizacionForm';
import AuthHeader from '../../components/User/AuthHeader/AuthHeader';
import Footer from '../../components/Footer/Footer';
import styles from './ServicePage.module.css'; // Importa el CSS modularizado

const ServicePage = () => {
    // Aquí puedes obtener el ID del cliente del contexto de autenticación
    // Por ahora, usaremos un ID de prueba o lo dejaremos vacío si es para visitantes no logueados.
    // **Importante:** Debes reemplazar esto con la lógica real de Redux/Context para obtener el ID del usuario.
    const currentUserClienteId = 'some-logged-in-client-id'; // Reemplazar con lógica real

    const handleQuoteSubmit = (newQuote) => {
        console.log('Cotización enviada exitosamente desde Service Page:', newQuote);
        // Aquí puedes agregar lógica adicional después de enviar la cotización,
        // como mostrar una notificación, redirigir al usuario, etc.
        alert('¡Tu cotización ha sido enviada con éxito!');
    };

    return (
        <div className={styles.pageContainer}> {/* Contenedor principal para el layout */}
            <AuthHeader />

            <main className={styles.mainContent}> {/* Aplica la clase del CSS modularizado */}
                <h1 className={styles.pageTitle}>Nuestros Servicios y Cotizaciones</h1>
                <p className={styles.pageDescription}>
                    En NOVO Tapicería, estamos listos para transformar tus vehículos y muebles.
                    Describe tu proyecto a continuación para obtener una cotización personalizada.
                </p>

                <CotizacionForm
                    clienteId={currentUserClienteId}
                    onQuoteSubmit={handleQuoteSubmit}
                />
            </main>

            <Footer/>
        </div>
    );
};

export default ServicePage;