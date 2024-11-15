const AvailableDevicesController = require('../controllers/AvailableDevicesController');
const responseHandler = require('../utils/responseHandler');

const controller = new AvailableDevicesController();

const deviceRoutes = async (req, res) => {
    const method = req.method;
    const url = new URL(req.url, `http://${req.headers.host}`);
    const id = url.pathname.split('/')[3];

    switch (true) {
        case method === 'GET' && url.pathname === '/API/availableDevices':
            await controller.getAll(req, res);
            break;
        default:
            responseHandler.sendError(res, 'Ruta no encontrada', 404);
    }
};


module.exports = deviceRoutes;
