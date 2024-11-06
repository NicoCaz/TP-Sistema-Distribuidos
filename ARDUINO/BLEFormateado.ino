#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "Fibertel WiFi980 2.4GHz";  
const char* password = "chesterton123";  // xD
const char* mqttServer = "192.168.0.4"; 
const int mqttPort = 1883; 
String macWemos;
const char* topic = "test/topic"; // El topic donde se publicará la lista de dispositivos

unsigned long previousMillis = 0; // Almacena el último tiempo de ejecución
const long interval = 5000; // Intervalo de tiempo en milisegundos (5 segundos)

BLEScan* pBLEScan;

/*class MyAdvertisedDeviceCallbacks : public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.printf("Advertised Device: %s \n", advertisedDevice.toString().c_str());

    // publicar la direccion del dispositivo en MQTT
    String deviceAddress = advertisedDevice.getAddress().toString().c_str();
    if (client.publish(topic, deviceAddress.c_str())) {
      Serial.print("Dispositivo BLE enviado a MQTT: ");
      Serial.println(deviceAddress);
    } else {
      Serial.println("Error al publicar en MQTT");
    }
  }
}; */

void setup() {
  Serial.begin(115200); 
  
  connectToWiFi();
  connectToMQTT();

  client.setServer(IPAddress(192, 168, 0, 4), mqttPort);

  // Inicializar BLE
  BLEDevice::init("ESP32_BLE"); // Nombre del dispositivo BLE
  pBLEScan = BLEDevice::getScan(); // Crear el escáner BLE
 // pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true); // Escaneo activo
  pBLEScan->setInterval(100); // Intervalo de escaneo
  pBLEScan->setWindow(99); // Ventana de escaneo
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Desconectado del Wi-Fi, intentando reconectar...");
    connectToWiFi(); // Intenta reconectar
  } else {
   /* Serial.println("Conexión Wi-Fi activa.");
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP()); */
  } 


  if (!client.connected()) {
    Serial.println("Desconectado del MQTT, intentando reconectar...");
    connectToMQTT(); // Intenta reconectar al MQTT
  } else {
    client.loop(); 
    unsigned long currentMillis = millis();  
      if (currentMillis - previousMillis >= interval) {   
        previousMillis = currentMillis; 

        // Escanear dispositivos BLE cercanos
        Serial.println("Buscando dispositivos BLE cercanos...");
        BLEScanResults * scanResults = pBLEScan->start(5, false); // Escanear durante 5 segundos
        pBLEScan->stop(); 


        String jsonData = "{ \"checkpointID\": \"" + macWemos + "\", \"animals\": [";

        // Mostrar la cantidad de dispositivos BLE encontrados
        Serial.println("Cantidad de cosos escaneados:");
        Serial.println(scanResults->getCount());

        // Iterar sobre los dispositivos BLE escaneados
        for (int i = 0; i < scanResults->getCount(); i++) {
          BLEAdvertisedDevice device = scanResults->getDevice(i);
          String id = device.getAddress().toString().c_str();
          int rssi = device.getRSSI();

          // Añadir cada dispositivo al JSON
          jsonData += "{ \"id\": \"" + id + "\", \"rssi\": " + String(rssi) + " }";

          // Añadir coma entre dispositivos, excepto después del último
          if (i < scanResults->getCount() - 1) {
            jsonData += ", ";  // Añadir coma entre elementos
          }
        }

        // Cerrar el array y el objeto JSON
        jsonData += "] }";
      Serial.println("Datos escaneados en JSON:");
      Serial.println(jsonData); // Imprimir el JSON en el formato deseado

        if (client.publish(topic, jsonData.c_str())) {
        Serial.println("Datos enviados al servidor MQTT");
      } else {
        Serial.println("Error al publicar en MQTT");
      }
      }
  }

  
}

void connectToWiFi() {
  Serial.print("Conectando a WiFi...");
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print("."); 
  }

  Serial.println("");
  Serial.print("Conectado a WiFi. Dirección IP: ");
  Serial.println(WiFi.localIP());
  macWemos = WiFi.macAddress(); 
  Serial.print("Direccion MAC WiFi: ");
  Serial.println(macWemos);
}

void connectToMQTT() {
  //while (!client.connected()) {
    Serial.print("Intentando conectar a MQTT...");
    // Intentar conectarse al servidor MQTT
    if (client.connect("ESP32Client")) { 
      Serial.println("conectado");
    } else {
      Serial.print("Error de conexión, rc=");
      Serial.print(client.state());
      Serial.println(" Intentando de nuevo en 5 segundos...");
      delay(5000); // Esperar 5 segundos antes de volver a intentar
    }
 // }
}