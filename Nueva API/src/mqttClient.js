const mqtt = require('mqtt');
const MQTTController = require('./controllers/MQTTController');

class MQTTClient {
    constructor() {
        this.client = mqtt.connect(process.env.MQTT_BROKER_URL || 'mqtt://192.168.0.4:1883');
        this.controller = new MQTTController();
        this.activeCheckpoints = new Map();
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.client.on('connect', () => {
            console.log('🔗 Conectado a Mosquitto MQTT Broker');
            // Solo suscribirse al tema de datos
            this.client.subscribe('checkpoint', (err) => {
                if (!err) {
                    console.log('✅ Suscrito a topic checkpoint');
                } else {
                    console.error('❌ Error al suscribirse:', err);
                }
            });
        });
//"packageNum":1,"totalPackages":1,"checkpointID":"08:A6:F7:A1:8E:80","animals":[{"id":"2f:cf:7a:a8:9a:ac","rssi":-59},{"id":"7c:a4:49:17:c0:ee","rssi":-72}]}
        this.client.on('message', async (topic, message) => {
            
            console.log(` 📩 Mensaje recibido en el tema ${topic}: ${JSON.parse(message.toString())}`);
            const checkpointId = message.checkpointID;
            let jsonData = JSON.parse(message.toString());
            
            try {
                await this.handleDataMessage(message, checkpointId);
            } catch (error) {
                console.error(`❌ Error procesando mensaje de ${checkpointId}:`, error);
            }
        });

        this.client.on('error', (error) => {
            console.error('❌ Error en la conexión MQTT:', error);
        });
    }

    async handleDataMessage(message, checkpointId) {
        try {
            const jsonData = JSON.parse(message.toString());
            
            // Registrar checkpoint activo
            this.activeCheckpoints.set(checkpointId, new Date());

            console.log(`📦 Datos recibidos de ${checkpointId}:`, {
                checkpointID: checkpointId,
                animalsCount: jsonData.animals?.length
            });

            // Procesar datos con el controlador
            const result = await this.controller.updateCheckpoint(jsonData);
            
            if (result.success) {
                console.log(`✅ Datos de ${checkpointId} procesados correctamente`);
            } else {
                console.error(`❌ Error procesando datos de ${checkpointId}:`, result.message);
            }

        } catch (error) {
            console.error(`❌ Error procesando mensaje de ${checkpointId}:`, error);
        }
    }

    getActiveCheckpoints() {
        const checkpoints = [];
        this.activeCheckpoints.forEach((lastSeen, id) => {
            checkpoints.push({
                id,
                lastSeen: lastSeen.toISOString()
            });
        });
        return checkpoints;
    }

    async disconnect() {
        try {
            console.log('👋 Iniciando desconexión...');
            this.client.end();
            this.activeCheckpoints.clear();
            console.log('✅ Desconexión completada');
        } catch (error) {
            console.error('❌ Error durante la desconexión:', error);
            throw error;
        }
    }
}

const mqttClient = new MQTTClient();
module.exports = mqttClient;