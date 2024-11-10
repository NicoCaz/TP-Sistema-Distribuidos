let map = null;

function initializeMap() {
    console.log('Iniciando inicialización del mapa');
    
    // Esperar un momento para asegurar que el DOM esté listo
    setTimeout(() => {
        const mapElement = document.getElementById('map');
        console.log('Buscando elemento del mapa:', mapElement);
        
        if (!mapElement) {
            console.error('Elemento del mapa no encontrado');
            return;
        }

        // Limpiar mapa existente si existe
        if (map) {
            console.log('Limpiando mapa existente');
            map.remove();
            map = null;
        }

        try {
            console.log('Creando nuevo mapa');
            map = L.map('map', {
                center: [-34.603722, -58.381592],
                zoom: 13
            });

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Agregar marcadores
            const markers = [
                { lat: -34.603722, lng: -58.381592, popup: 'alimentación' },
                { lat: -34.608722, lng: -58.373602, popup: 'cerca del lago' },
                { lat: -34.615722, lng: -58.370002, popup: 'área de descanso' },
                { lat: -34.620722, lng: -58.365002, popup: 'Marker 4' },
                { lat: -34.625722, lng: -58.360002, popup: 'Marker 5' }
            ];

            markers.forEach(marker => {
                L.marker([marker.lat, marker.lng])
                    .addTo(map)
                    .bindPopup(marker.popup);
            });

            // Forzar actualización del tamaño del mapa
            setTimeout(() => {
                map.invalidateSize();
                console.log('Mapa inicializado y actualizado');
            }, 100);

        } catch (error) {
            console.error('Error al inicializar el mapa:', error);
        }
    }, 100);
}

// Exponer la función globalmente
window.initializeMap = initializeMap;