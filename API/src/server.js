const http = require('http');
require('dotenv').config();
const mqttClient = require('./mqttClient'); // Importamos el cliente MQTT

// Mapa de rutas HTTP
const routes = {
    '/API/animals': require('./routes/animalRoutes'),
    '/API/checkpoints': require('./routes/checkpointsRoutes'),
    '/API/availableDevices': require('./routes/deviceRoutes')
};

class Server {
    constructor() {
        this.server = null;
        this.mqttClient = mqttClient;
        this.port = process.env.PORT || 3000;
        this.setupServer();
        this.setupErrorHandlers();
    }

    setupServer() {
        this.server = http.createServer(async (req, res) => {
            // Configurar CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
            if (req.method === 'OPTIONS') {
                res.writeHead(204);
                res.end();
                return;
            }

            await this.handleRequest(req, res);
        });
    }

    async handleRequest(req, res) {
        try {
            const baseURL = `http://${req.headers.host}`;
            const reqUrl = new URL(req.url, baseURL);
            const pathname = reqUrl.pathname;

            console.log('URL solicitada:', pathname);
            
            const route = Object.keys(routes).find(key => pathname.startsWith(key));
            
            if (route) {
                console.log('Ruta encontrada:', route);
                await routes[route](req, res);
            } else {
                console.log('Ruta no encontrada');
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ 
                    error: 'Ruta no encontrada',
                    path: pathname,
                    availableRoutes: Object.keys(routes)
                }));
            }
        } catch (error) {
            console.error('Error en el servidor:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ 
                error: 'Error interno del servidor',
                message: error.message
            }));
        }
    }

    setupErrorHandlers() {
        // Manejar errores no capturados
        process.on('uncaughtException', (error) => {
            console.error('Error no capturado:', error);
        });

        process.on('unhandledRejection', (reason, promise) => {
            console.error('Promesa rechazada no manejada:', reason);
        });

        // Manejar señales de terminación
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    async shutdown() {
        console.log('\n🛑 Iniciando apagado gracioso...');
        
        try {
            // Desconectar cliente MQTT
            if (this.mqttClient) {
                console.log('📤 Cerrando conexión MQTT...');
                await this.mqttClient.disconnect();
            }

            // Cerrar servidor HTTP
            if (this.server) {
                console.log('🌐 Cerrando servidor HTTP...');
                this.server.close(() => {
                    console.log('✅ Servidor HTTP cerrado');
                    process.exit(0);
                });
            }
        } catch (error) {
            console.error('❌ Error durante el apagado:', error);
            process.exit(1);
        }
    }

    getServerStatus() {
        return {
            http: {
                port: this.port,
                status: this.server.listening ? 'running' : 'stopped'
            },
            mqtt: {
                activeCheckpoints: Array.from(this.mqttClient.activeCheckpoints || []),
                status: this.mqttClient.client.connected ? 'connected' : 'disconnected'
            }
        };
    }

    start() {
        // Iniciar servidor HTTP
        this.server.listen(this.port, () => {
            console.log(`\n🚀 Servicios iniciados:`);
            console.log(`🌐 Servidor HTTP: http://localhost:${this.port}`);
            console.log('📡 Cliente MQTT: Esperando conexiones...');
            console.log('\n👉 Presiona CTRL+C para detener los servicios\n');
        });
    }
}

// Crear y iniciar el servidor
const server = new Server();
server.start();

// Exportar para uso en tests u otros módulos
module.exports = server;