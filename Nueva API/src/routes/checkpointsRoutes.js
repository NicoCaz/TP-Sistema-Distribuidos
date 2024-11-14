const CheckpointsController = require('../controllers/checkpointsController');
const responseHandler = require('../utils/responseHandler');

const controller = new CheckpointsController();

const checkpointsRoutes = async (req, res) => {
    const method = req.method;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.pathname.split('/')[3];

    switch (true) {
        case method === 'GET' && url.pathname === '/API/checkpoints':
            await controller.getAll(req, res);
            break;
            
        case method === 'POST' && url.pathname === '/API/checkpoints':
            await controller.create(req, res);
            break;
            
        case method === 'PATCH' && url.pathname.startsWith('/API/checkpoints/'):
            await controller.update(req, res, id);
            break;
            
        case method === 'DELETE' && url.pathname.startsWith('/API/checkpoints/'):
            await controller.delete(req, res, id);
            break;
            
        default:
            responseHandler.sendError(res, 'Ruta no encontrada', 404);
    }
};


module.exports = checkpointsRoutes;
