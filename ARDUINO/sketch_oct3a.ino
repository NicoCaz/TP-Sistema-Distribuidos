#include <BluetoothSerial.h>

BluetoothSerial SerialBT;

int arreglo[5] = {26, 14, 12, 18, 17}; // Pines de los LEDs

void setup() {
  Serial.begin(115200); // Iniciar el puerto serie
  SerialBT.begin("ESP32_Device"); // Inicializar Bluetooth
  // Configurar los pines de los LEDs como salidas
  for (int i = 0; i < 5; i++) {
    pinMode(arreglo[i], OUTPUT);
  }
  Serial.println("El dispositivo está listo para emparejarse");
}

void loop() {
  // Verifica si hay datos disponibles para leer desde Bluetooth
  if (SerialBT.available()) {
    char receivedChar = SerialBT.read(); // Leer el carácter recibido
    Serial.print("Recibido: ");
    Serial.println(receivedChar);

    switch (receivedChar) {
      case '1':
        for (int i = 0; i < 5; i++) {
          digitalWrite(arreglo[i], HIGH); // Enciende el LED
          delay(250); // Espera 250 ms
          digitalWrite(arreglo[i], LOW); // Apaga el LED
        }
        break;

      case '2':
        for (int i = 0; i < 5; i++) {
          digitalWrite(arreglo[i], HIGH); // Enciende el LED
        }
        delay(3000);
        for (int i = 0; i < 5; i++) {
          digitalWrite(arreglo[i], LOW); // Apaga el LED
        }
        break;

      case '3':
        for (int i = 0; i < 5; i++) {
          digitalWrite(arreglo[0], HIGH);
          digitalWrite(arreglo[4], HIGH);
          delay(250);
          digitalWrite(arreglo[0], LOW);
          digitalWrite(arreglo[4], LOW);
          digitalWrite(arreglo[1], HIGH);
          digitalWrite(arreglo[3], HIGH);
          delay(250);
          digitalWrite(arreglo[1], LOW);
          digitalWrite(arreglo[3], LOW);
          digitalWrite(arreglo[2], HIGH);
          delay(250);
          digitalWrite(arreglo[2], LOW);
        }
        break;

      case '4':
        for (int i = 0; i < 5; i++) {
          digitalWrite(arreglo[i], HIGH); // Enciende el LED
          delay(250); // Espera 250 ms
        }
        for (int i = 4; i >= 0; i--) { // Corrección aquí
          digitalWrite(arreglo[i], LOW); // Apaga el LED
          delay(250); // Espera 250 ms
        }
        break;

      case '5':
        for (int i = 0; i < 5; i++) {
          digitalWrite(arreglo[i], LOW); // Apaga todos los LEDs
        }
        break;

      default:
        Serial.println("Número no válido. Envía un número del 1 al 5.");
        break;
    }
  }
}


