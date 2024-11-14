const mqtt = require('mqtt');
const MQTTController = require('./controllers/MQTTController');

class MQTTClient {
    constructor() {
        this.client = mqtt.connect(process.env.MQTT_BROKER_URL);
        this.controller = new MQTTController();
        this.activeCheckpoints = new Map(); 
        this.connectionTimestamps = new Map(); 
        this.setupEventHandlers();
        this.startHealthCheck();
    }

    setupEventHandlers() {
        this.client.on('connect', () => {
            console.log('🔗 Conectado a Mosquitto MQTT Broker');
            this.client.subscribe('checkpoint/+/data');
            this.client.subscribe('checkpoint/+/status');
            this.client.subscribe('checkpoint/+/heartbeat');
        });

        this.client.on('message', async (topic, message) => {
            const [prefix, checkpointId, messageType] = topic.split('/');
            console.log(`📩 Mensaje recibido de ${checkpointId} - Tipo: ${messageType}`);

            try {
                switch (messageType) {
                    case 'data':
                        await this.handleDataMessage(message, checkpointId);
                        break;
                    case 'status':
                        await this.handleStatusMessage(message, checkpointId);
                        break;
                    case 'heartbeat':
                        this.updateCheckpointStatus(checkpointId);
                        break;
                }
            } catch (error) {
                console.error(`❌ Error procesando mensaje de ${checkpointId}:`, error);
            }
        });

        this.client.on('error', (error) => {
            console.error('❌ Error en la conexión MQTT:', error);
        });
    }

    updateCheckpointStatus(checkpointId) {
        const now = Date.now();
        this.connectionTimestamps.set(checkpointId, now);
        
        if (!this.activeCheckpoints.has(checkpointId)) {
            this.activeCheckpoints.set(checkpointId, {
                status: 'active',
                lastSeen: now,
                messageCount: 0
            });
            console.log(`✨ Nuevo checkpoint conectado: ${checkpointId}`);
        }

        const checkpointInfo = this.activeCheckpoints.get(checkpointId);
        checkpointInfo.lastSeen = now;
        checkpointInfo.messageCount++;
    }

    startHealthCheck() {
        // Verificar el estado de los checkpoints cada 30 segundos
        setInterval(() => {
            const now = Date.now();
            this.activeCheckpoints.forEach((info, checkpointId) => {
                const lastSeen = this.connectionTimestamps.get(checkpointId);
                // Si no se ha visto en 1 minuto, considerar desconectado
                if (now - lastSeen > 60000) {
                    this.handleCheckpointDisconnection(checkpointId);
                }
            });
        }, 30000);
    }

    async handleDataMessage(message, checkpointId) {
        try {
            const jsonData = JSON.parse(message.toString());
            this.updateCheckpointStatus(checkpointId);

            console.log(`📦 Datos recibidos de ${checkpointId}:`, {
                packageNum: jsonData.packageNum,
                totalPackages: jsonData.totalPackages,
                animalsCount: jsonData.animals?.length
            });

            const result = await this.controller.updateCheckpoint(jsonData);
            
            if (result.success) {
                this.publishResponse(checkpointId, {
                    status: 'success',
                    message: result.message
                });
            } else {
                console.error(`❌ Error procesando datos de ${checkpointId}:`, result.message);
                this.publishError(checkpointId, result.message);
            }

        } catch (error) {
            console.error(`❌ Error procesando mensaje de ${checkpointId}:`, error);
            this.publishError(checkpointId, 'Error procesando datos');
        }
    }

    publishResponse(checkpointId, response) {
        const topic = `checkpoint/${checkpointId}/response`;
        this.publish(topic, JSON.stringify(response));
    }

    publishError(checkpointId, error) {
        const topic = `checkpoint/${checkpointId}/error`;
        this.publish(topic, JSON.stringify({ error }));
    }

    publish(topic, message) {
        this.client.publish(topic, message, { qos: 1 }, (err) => {
            if (err) {
                console.error(`❌ Error publicando en ${topic}:`, err);
            } else {
                console.log(`📤 Mensaje publicado en ${topic}`);
            }
        });
    }

    getActiveCheckpoints() {
        const checkpoints = [];
        this.activeCheckpoints.forEach((info, id) => {
            checkpoints.push({
                id,
                lastSeen: new Date(info.lastSeen).toISOString(),
                messageCount: info.messageCount,
                status: info.status
            });
        });
        return checkpoints;
    }

    async disconnect() {
        try {
            console.log('👋 Iniciando desconexión...');
            
            // Desconectar todos los checkpoints activos
            const disconnectionPromises = Array.from(this.activeCheckpoints.keys())
                .map(checkpointId => this.handleCheckpointDisconnection(checkpointId));
            
            await Promise.all(disconnectionPromises);
            
            this.activeCheckpoints.clear();
            this.connectionTimestamps.clear();
            this.client.end();
            console.log('✅ Desconexión completada');
        } catch (error) {
            console.error('❌ Error durante la desconexión:', error);
            throw error;
        }
    }
}

const mqttClient = new MQTTClient();
module.exports = mqttClient;







