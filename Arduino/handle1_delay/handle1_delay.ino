#include "Arduino_LSM9DS1.h"
#include "ArduinoBLE.h"
#include <HX711_ADC.h>

// HX711 setup
const int LOADCELL_DOUT_PIN = 3;
const int LOADCELL_SCK_PIN = 2;

// autotare with 1s of data collection
const int LOADCELL_TARE_MS = 1000;
const bool LOADCELL_TARE = true;
HX711_ADC LoadCell(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

// Data packet contains 4 floats: one for each of the 3 accelerometer axes
// plus 1 float for the load sensor
const char* UUID = "0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e";
const int TRANSMIT_INTERVAL_MS = 30;
float data[4];
BLEService tensionService(UUID); 
BLECharacteristic dataCharacteristic(
  UUID, 
  BLERead | BLENotify, 
  sizeof(float) * 4
);

long timestamp = 0;

void setup() {
  Serial.begin(9600);
  Serial.println("begin");

  LoadCell.begin();
  LoadCell.start(LOADCELL_TARE_MS, LOADCELL_TARE);
    
  // attempt to start the IMU:
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU");
    while (true);
  }
  
  if (!BLE.begin()) {
    Serial.println("starting BLE failed!");
    while (true);
  }
  Serial.println("imu and ble begin");
 
  BLE.setLocalName("TensionSensor");
 
  BLE.setAdvertisedService(tensionService);
  
  // add the characteristic to the service
  tensionService.addCharacteristic(dataCharacteristic);

  // add service:
  BLE.addService(tensionService);
 
  // start advertising
  BLE.advertise();
 
  Serial.println("BLE Peripheral initialization success");
}


void getIMU() {
  if (IMU.accelerationAvailable() &&
      IMU.gyroscopeAvailable()) {
    // read accelerometer & gyrometer:
    IMU.readAcceleration(data[0], data[1], data[2]);
  } 
}

void getScale() {
  static bool newDataReady = false;
  if (LoadCell.update()) {
    newDataReady = true;
  }
  if (newDataReady) {
      float reading = LoadCell.getData();
      Serial.println(reading);
      data[3] = reading;
  }
}


void loop() {
  BLEDevice central = BLE.central();

  // if a central is connected to the peripheral:
  if (central) {
    // print the central's BT address:
    Serial.print("Connected to central: ");

    // while the central remains connected:
    while (central.connected()) {
      // read sensors:
      getScale();
      if (millis() - timestamp > TRANSMIT_INTERVAL_MS) { 
        getIMU();
        if (central.connected()) {
          dataCharacteristic.writeValue(data, sizeof(data));
        }
        timestamp = millis();
      }
    }
  } else {
    Serial.println("disconnected");
  }
}
