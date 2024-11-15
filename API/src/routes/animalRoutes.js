const AnimalController = require('../controllers/animalController');
const responseHandler = require('../utils/responseHandler');

const controller = new AnimalController();

const animalRoutes = async (req, res) => {
    const method = req.method;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.pathname.split('/')[3];

    switch (true) {

        case method === 'GET' && url.pathname ==='/API/animals/position':
            await controller.getAnimalsPositions(req, res);
            break;
        case method === 'GET' && url.pathname === '/API/animals':
            await controller.getAll(req, res);
            break;
            
        case method === 'POST' && url.pathname === '/API/animals':
            await controller.create(req, res);
            break;
            
        case method === 'PATCH' && url.pathname.startsWith('/API/animals/'):
            await controller.update(req, res, id);
            break;
            
        case method === 'DELETE' && url.pathname.startsWith('/API/animals/'):
            await controller.delete(req, res, id);
            break;

        default:
            responseHandler.sendError(res, 'Ruta no encontrada', 404);
    }
};


module.exports = animalRoutes;
