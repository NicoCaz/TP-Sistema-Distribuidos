import { MapService } from '../services/MapService.js';

class MapPage {
    constructor() {
        console.log('Inicializando MapPage');
        this.mapService = new MapService();
        this.init();
    }

    async init() {
        await this.initializeMap();
        await this.loadPoints();
        // Actualizar posiciones de animales cada 30 segundos
        this.startAnimalPositionsUpdate();
    }

    async initializeMap() {
        // Crear el mapa centrado en Argentina
        this.map = L.map('map').setView([-38.416097, -63.616672], 4);
        
        // Añadir la capa de OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(this.map);

        // Crear capas para puntos y animales
        this.pointsLayer = L.layerGroup().addTo(this.map);
        this.animalsLayer = L.layerGroup().addTo(this.map);

        // Añadir control de capas
        const overlays = {
            "Puntos de Control": this.pointsLayer,
            "Animales": this.animalsLayer
        };
        L.control.layers(null, overlays).addTo(this.map);
    }

    async loadPoints() {
        try {
            // Limpiar puntos existentes
            this.pointsLayer.clearLayers();

            // Cargar puntos de control
            const points = await this.mapService.getCheckpoints();
            points.forEach(point => {
                const marker = L.marker([point.lat, point.long], {
                    icon: L.divIcon({
                        className: 'custom-div-icon',
                        html: `<div class="marker-pin"></div>
                              <i class="mdi mdi-map-marker"></i>`,
                        iconSize: [30, 42],
                        iconAnchor: [15, 42]
                    })
                });

                marker.bindPopup(`
                    <div class="popup-content">
                        <h3>${point.description}</h3>
                        <p>Lat: ${point.lat}</p>
                        <p>Long: ${point.long}</p>
                    </div>
                `);

                marker.addTo(this.pointsLayer);
            });

        } catch (error) {
            console.error('Error al cargar puntos:', error);
            alert('Error al cargar los puntos de control');
        }
    }

    async updateAnimalPositions() {
        try {
            // Limpiar marcadores de animales existentes
            this.animalsLayer.clearLayers();

            // Cargar nuevas posiciones
            const positions=[]; 
            //= await this.mapService.getAnimalPositions();
            positions.forEach(animal => {
                const marker = L.marker([animal.lat, animal.long], {
                    icon: L.divIcon({
                        className: 'custom-div-icon animal-icon',
                        html: `<div class="marker-pin animal-pin"></div>
                              <i class="mdi mdi-cow"></i>`,
                        iconSize: [30, 42],
                        iconAnchor: [15, 42]
                    })
                });

                marker.bindPopup(`
                    <div class="popup-content">
                        <h3>${animal.description}</h3>
                        <p>ID: ${animal.id}</p>
                        <p>Lat: ${animal.lat}</p>
                        <p>Long: ${animal.long}</p>
                    </div>
                `);

                marker.addTo(this.animalsLayer);
            });

        } catch (error) {
            console.error('Error al actualizar posiciones de animales:', error);
        }
    }

    startAnimalPositionsUpdate() {
        this.updateAnimalPositions();
        
        setInterval(() => {
            this.updateAnimalPositions();
        }, 5000);
    }

    cleanup() {
        if (this.map) {
            this.map.remove();
            this.map = null;
            this.mapService = null;
        }
        // Limpiar el intervalo si existe
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

let mapPageInstance = null;

window.initMapPage = () => {
    console.log('Inicializando nueva instancia de MapPage');
    if (!mapPageInstance) {
        mapPageInstance = new MapPage();
    }
};

window.cleanupMapPage = () => {
    console.log('Limpiando instancia de MapPage');
    if (mapPageInstance) {
        mapPageInstance.cleanup();
        mapPageInstance = null;
    }
};

if (document.readyState === 'complete' && window.location.pathname === '/mapa') {
    window.initMapPage();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname === '/mapa') {
            window.initMapPage();
        }
    });
}



export default MapPage;