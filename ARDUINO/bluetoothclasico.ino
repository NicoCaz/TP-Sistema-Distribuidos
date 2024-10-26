#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>

WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "Fibertel WiFi980 2.4GHz";  
const char* password = "chesterton123";  // xD
const char* mqttServer = "localhost"; 
const int mqttPort = 1883; 
const char* topic = "test/topic"; // El topic donde se publicará la lista de dispositivos

unsigned long previousMillis = 0; // Almacena el último tiempo de ejecución
const long interval = 5000; // Intervalo de tiempo en milisegundos (5 segundos)

BLEScan* pBLEScan;

void setup() {
  Serial.begin(115200); 


  connectToWiFi();

  client.setServer(mqttServer, mqttPort);

  // Inicializar BLE
  BLEDevice::init("ESP32_BLE"); // Nombre del dispositivo BLE
  pBLEScan = BLEDevice::getScan(); // Crear el escáner BLE
  pBLEScan->setActiveScan(true); // Escaneo activo
  pBLEScan->setInterval(100); // Intervalo de escaneo
  pBLEScan->setWindow(99); // Ventana de escaneo
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Desconectado del Wi-Fi, intentando reconectar...");
    connectToWiFi(); // Intenta reconectar
  }

  unsigned long currentMillis = millis();  
  if (currentMillis - previousMillis >= interval) {   
    previousMillis = currentMillis; 

    // Escanear dispositivos BLE cercanos
    Serial.println("Buscando dispositivos BLE cercanos...");
    BLEScanResults * scanResults = pBLEScan->start(5,false); // Escanear durante 5 segundos
    int devicesFound = scanResults->getCount();

    if (devicesFound > 0) {
      for (int i = 0; i < devicesFound; i++) {
        String deviceAddress = scanResults->getDevice(i).getAddress().toString().c_str();

        // Publicar la dirección de cada dispositivo en MQTT una por una
        if (client.publish(topic, deviceAddress.c_str())) {
          Serial.print("Dispositivo BLE enviado a MQTT: ");
          Serial.println(deviceAddress);
        } else {
          Serial.println("Error al publicar en MQTT");
        }

        delay(1000); // Esperar 1 segundo antes de enviar el siguiente dispositivo
      }
    } else {
      Serial.println("No se encontraron dispositivos.");
    }
    pBLEScan->stop(); // Detener el escaneo
  }
}

void connectToWiFi() {
  Serial.print("Conectando a WiFi...");
  
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("."); 
  }

  Serial.println("");
  Serial.print("Conectado a WiFi. Dirección IP: ");
  Serial.println(WiFi.localIP());
}