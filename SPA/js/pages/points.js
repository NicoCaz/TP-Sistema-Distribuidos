import { PointService } from '../services/PointService.js';
import { PointForm } from '../components/PointForm.js';
import { PointList } from '../components/PointList.js';

class PointsPage {
    constructor() {
        console.log('Inicializando PointsPage');
        this.pointService = new PointService();
        
        this.pointForm = new PointForm('pointForm', 
            this.handleSubmit.bind(this), 
            this.handleCancel.bind(this));
            
        this.pointList = new PointList('pointList', 
            this.handleEdit.bind(this), 
            this.handleDelete.bind(this));

        this.init();
    }

    async init() {
        console.log('Iniciando carga de datos de PointsPage');
        await this.loadPoints();
    }

    async loadPoints() {
        try {
            this.pointList.showLoading();
            console.log('Cargando puntos...');
            const points = await this.pointService.getPoints();
            console.log('Puntos cargados:', points);
            this.pointList.render(points);
        } catch (error) {
            console.error('Error al cargar puntos:', error);
            alert('Error al cargar los puntos');
        }
    }

    async handleSubmit(formData, editingId) {
        try {
            if (editingId) {
                await this.pointService.updatePoint(editingId, formData);
            } else {
                await this.pointService.addPoint(formData);
            }
            
            await this.loadPoints();
            this.pointForm.reset();
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    }

    handleEdit(point) {
        this.pointForm.startEditing(point);
    }

    async handleDelete(id) {
        try {
            await this.pointService.deletePoint(id);
            await this.loadPoints();
        } catch (error) {
            console.error('Error al eliminar:', error);
            alert('Error al eliminar el punto');
        }
    }

    handleCancel() {
        this.pointForm.reset();
    }

    cleanup() {
        console.log('Limpiando instancia de PointsPage');
        this.pointForm = null;
        this.pointList = null;
        this.pointService = null;
    }
}

let pointsPageInstance = null;

window.initPointsPage = () => {
    console.log('Inicializando nueva instancia de PointsPage');
    if (!pointsPageInstance) {
        pointsPageInstance = new PointsPage();
    } else {
        console.log('Instancia de PointsPage ya existe, recargando datos');
        pointsPageInstance.init();
    }
};

window.cleanupPointsPage = () => {
    console.log('Ejecutando limpieza global de PointsPage');
    if (pointsPageInstance) {
        pointsPageInstance.cleanup();
        pointsPageInstance = null;
    }
};

if (document.readyState === 'complete' && window.location.pathname === '/puntos') {
    window.initPointsPage();
} else {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname === '/puntos') {
            window.initPointsPage();
        }
    });
}