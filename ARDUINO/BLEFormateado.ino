#include <WiFi.h>
#include <PubSubClient.h>
#include <BLEDevice.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>
#include <ArduinoJson.h>

WiFiClient espClient;
PubSubClient client(espClient);

const char* ssid = "Fibertel WiFi980 2.4GHz";  
const char* password = "chesterton123";  // xD
const char* mqttServer = "192.168.0.4"; 
const int mqttPort = 1883; 
String macWemos;
int packageNum = 1;
int totalPackages = 1;
int paquetesMaximos = 7;

std::vector<std::string> deviceList;
const char* topic = "test/topic"; 

unsigned long previousMillis = 0; 
const long interval = 5000; 

BLEScan* pBLEScan;


void setup() {
  Serial.begin(115200); 
  connectToWiFi();
  connectToMQTT();
  client.setServer(IPAddress(192, 168, 0, 4), mqttPort);
  BLEDevice::init("ESP32_BLE"); 
  pBLEScan = BLEDevice::getScan(); 
  pBLEScan->setActiveScan(true); 
  pBLEScan->setInterval(100); 
  pBLEScan->setWindow(99); 
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Desconectado del Wi-Fi, intentando reconectar...");
    connectToWiFi(); 
  } else {
    /* Serial.println("Conexión Wi-Fi activa.");
    Serial.print("SSID: ");
    Serial.println(WiFi.SSID());
    Serial.print("Dirección IP: ");
    Serial.println(WiFi.localIP()); */
  }

  if (!client.connected()) {
    Serial.println("Desconectado del MQTT, intentando reconectar...");
    connectToMQTT(); 
  } else {
    client.loop();
    unsigned long currentMillis = millis();
    if (currentMillis - previousMillis >= interval) {
      previousMillis = currentMillis;

      
      Serial.println("Buscando dispositivos BLE cercanos...");
      BLEScanResults* foundDevices = pBLEScan->start(5); 

      int deviceCount = foundDevices->getCount();

     
      int packageNum = 1;
      int totalPackages = (deviceCount / paquetesMaximos) + 1;

      
      for (int i = 0; i < deviceCount; i++) {
        BLEAdvertisedDevice device = foundDevices->getDevice(i);
        String macAddress = device.getAddress().toString().c_str();
        int rssi = device.getRSSI();

        
        if (i % paquetesMaximos == 0) {
          
          DynamicJsonDocument doc(256); 
          doc["packageNum"] = packageNum;
          doc["totalPackages"] = totalPackages;
          doc["checkpointID"] = macWemos;

          JsonArray animals = doc.createNestedArray("animals");

          
          for (int j = i; j < min(i + paquetesMaximos, deviceCount); j++) {
            BLEAdvertisedDevice device = foundDevices->getDevice(j);
            String macAddress = device.getAddress().toString().c_str();
            int rssi = device.getRSSI();

            JsonObject animal = animals.createNestedObject();
            animal["id"] = macAddress;
            animal["rssi"] = rssi;
          }

          
          String jsonString;
          serializeJson(doc, jsonString);
          Serial.println("Enviando paquete:");
          Serial.println(jsonString);  
          if (client.publish(topic, jsonString.c_str())) {
             Serial.println("Datos enviados al servidor MQTT");
          } else {
             Serial.println("Error al publicar en MQTT");
         }

          
          packageNum++;
        }
      }

      delay(10000); 
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
    Serial.print("Intentando conectar a MQTT...");
    if (client.connect("ESP32Client")) { 
      Serial.println("conectado");
    } else {
      Serial.print("Error de conexión, rc=");
      Serial.print(client.state());
      Serial.println(" Intentando de nuevo en 5 segundos...");
      delay(5000); 
    }
}