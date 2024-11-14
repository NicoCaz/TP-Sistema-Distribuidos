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
        this.client.on('message', async (topic, message) => {
            const aux=JSON.parse(message.toString());
            console.log(aux);
            const checkpointId=aux.checkpointID;
            console.log(` 📩 Mensaje recibido en el tema ${topic}: ${checkpointId}`);    
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