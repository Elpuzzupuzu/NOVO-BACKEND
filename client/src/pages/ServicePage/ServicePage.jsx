// client/src/pages/ServicePage/ServicePage.jsx
import React from 'react';
import CotizacionForm from '../../components/ServicesForm/CotizacionForm'; // Ajusta la ruta de CotizacionForm
import AuthHeader from '../../components/User/AuthHeader/AuthHeader';


const ServicePage = () => {
    // Aquí puedes obtener el ID del cliente del contexto de autenticación
    // Por ahora, usaremos un ID de prueba o lo dejaremos vacío si es para visitantes no logueados.
    const currentUserClienteId = 'some-logged-in-client-id'; // Reemplazar con lógica real de autenticación (ej: de un Contexto)

    const handleQuoteSubmit = (newQuote) => {
        console.log('Cotización enviada exitosamente desde Service Page:', newQuote);
        // Aquí puedes agregar lógica adicional después de enviar la cotización,
        // como mostrar una notificación, redirigir al usuario, etc.
        alert('¡Tu cotización ha sido enviada con éxito!');
    };

    return (
        <div>
            {/* Incluye el encabezado en todas tus páginas si es parte del layout principal */}
            <AuthHeader />

            <main style={{ padding: '20px', backgroundColor: '#333', minHeight: 'calc(100vh - 60px)' }}> {/* Ajusta el padding y minHeight según tu AuthHeader y Footer */}
                <h1 style={{ color: 'yellow', textAlign: 'center', marginBottom: '30px' }}>Nuestros Servicios y Cotizaciones</h1>
                <p style={{ color: '#ccc', textAlign: 'center', maxWidth: '800px', margin: '0 auto 40px' }}>
                    En NOVO Tapicería de Lujo, estamos listos para transformar tus vehículos y muebles.
                    Describe tu proyecto a continuación para obtener una cotización personalizada.
                </p>

                <CotizacionForm
                    clienteId={currentUserClienteId}
                    onQuoteSubmit={handleQuoteSubmit}
                />
            </main>

            {/* Opcional: Incluye un pie de página si tienes uno */}
            {/* <Footer /> */}
        </div>
    );
};

export default ServicePage;