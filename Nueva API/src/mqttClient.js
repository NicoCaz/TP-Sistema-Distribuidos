const mqtt = require('mqtt');
const MQTTController = require('./controllers/MQTTController');

class MQTTClient {
    constructor() {
        this.client = mqtt.connect(process.env.MQTT_BROKER_URL);
        this.controller = new MQTTController();
        this.activeCheckpoints = new Set(); // Conjunto para rastrear checkpoints activos
        this.setupEventHandlers();
    }

    setupEventHandlers() {
        // Manejar conexión
        this.client.on('connect', () => {
            console.log('🔗 Conectado a Mosquitto MQTT Broker');
            this.subscribe('checkpoint/+/data'); // Suscribe a todos los temas de datos de checkpoints
            this.subscribe('checkpoint/+/status'); // Suscribe a todos los temas de estado de checkpoints
        });

        // Manejar mensajes
        this.client.on('message', async (topic, message) => {
            console.log(`📩 Mensaje recibido en el tema ${topic}`);
            
            // Analizar el tipo de mensaje basado en el tema
            const [prefix, checkpointId, messageType] = topic.split('/');
            
            if (messageType === 'data') {
                await this.handleDataMessage(message);
            } else if (messageType === 'status') {
                await this.handleStatusMessage(message, checkpointId);
            }
        });

        // Manejar desconexiones de clientes
        this.client.on('offline', async () => {
            console.log('📴 Cliente MQTT desconectado');
            await this.handleDisconnection();
        });

        // Manejar errores
        this.client.on('error', (error) => {
            console.error('❌ Error en la conexión MQTT:', error);
        });
    }

    subscribe(topic) {
        this.client.subscribe(topic, (err) => {
            if (err) {
                console.error(`❌ Error al suscribirse a ${topic}:`, err);
            } else {
                console.log(`✅ Suscrito al tema: ${topic}`);
            }
        });
    }

    async handleDataMessage(message) {
        try {
            const jsonData = JSON.parse(message.toString());
            console.log('📦 Datos recibidos:', {
                checkpointID: jsonData.checkpointID,
                packageNum: jsonData.packageNum,
                totalPackages: jsonData.totalPackages,
                animalsCount: jsonData.animals?.length
            });

            // Registrar checkpoint como activo
            this.activeCheckpoints.add(jsonData.checkpointID);

            // Procesar el mensaje usando el controlador
            const result = await this.controller.updateCheckpoint(jsonData);

            if (result.success) {
                console.log(`✅ Mensaje procesado: ${result.message}`);
                
                if (result.complete) {
                    this.publish(`checkpoint/${jsonData.checkpointID}/response`, JSON.stringify({
                        status: 'success',
                        checkpointID: jsonData.checkpointID,
                        message: 'Transmisión completa'
                    }));
                }
            } else {
                console.error('❌ Error al procesar mensaje:', result.message);
                this.publish(`checkpoint/${jsonData.checkpointID}/error`, JSON.stringify({
                    status: 'error',
                    checkpointID: jsonData.checkpointID,
                    message: result.message
                }));
            }

        } catch (error) {
            console.error('❌ Error al procesar mensaje de datos:', error);
        }
    }

    async handleStatusMessage(message, checkpointId) {
        try {
            const status = JSON.parse(message.toString());
            if (status.status === 'offline') {
                await this.handleCheckpointDisconnection(checkpointId);
            }
        } catch (error) {
            console.error('❌ Error al procesar mensaje de estado:', error);
        }
    }

    async handleCheckpointDisconnection(checkpointId) {
        try {
            console.log(`📴 Checkpoint desconectado: ${checkpointId}`);
            
            // Remover del conjunto de checkpoints activos
            this.activeCheckpoints.delete(checkpointId);
            
            // Eliminar datos del checkpoint de la base de datos
            await this.controller.removeCheckpoint(checkpointId);
            
            console.log(`🗑️ Datos del checkpoint ${checkpointId} eliminados`);
        } catch (error) {
            console.error(`❌ Error al manejar desconexión del checkpoint ${checkpointId}:`, error);
        }
    }

    async handleDisconnection() {
        try {
            // Obtener todos los checkpoints activos
            const checkpoints = Array.from(this.activeCheckpoints);
            
            // Eliminar cada checkpoint
            for (const checkpointId of checkpoints) {
                await this.handleCheckpointDisconnection(checkpointId);
            }
            
            // Limpiar el conjunto de checkpoints activos
            this.activeCheckpoints.clear();
        } catch (error) {
            console.error('❌ Error al manejar desconexión general:', error);
        }
    }

    publish(topic, message) {
        this.client.publish(topic, message, { qos: 1 }, (err) => {
            if (err) {
                console.error(`❌ Error al publicar en ${topic}:`, err);
            } else {
                console.log(`📤 Mensaje publicado en ${topic}`);
            }
        });
    }

    disconnect() {
        this.handleDisconnection()
            .then(() => {
                this.client.end();
                console.log('👋 Desconectado del broker MQTT');
            })
            .catch(error => {
                console.error('❌ Error al desconectar:', error);
            });
    }
}

// Crear instancia
const mqttClient = new MQTTClient();

// Exportar la instancia
module.exports = mqttClient;