#include "Arduino_LSM9DS1.h"
#include "ArduinoBLE.h"
#include <HX711_ADC.h>
//default value: 16
// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 3;
const int LOADCELL_SCK_PIN = 2;
HX711_ADC LoadCell(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);

boolean newDataReady = 0;

float data[4];

long timestamp = 0;
//HX711 scale;
bool connected = false;

// BLE
BLEService tensionService("0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e"); 
BLECharacteristic dataCharacteristic ("0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e4", BLERead | BLENotify, sizeof(float) * 4);

void setup() {
  Serial.begin(9600);
  Serial.println("begin");

  LoadCell.begin();
  LoadCell.start(2000, true);
    
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
      if (millis() - timestamp > 40) { 
        getIMU();
        getScale();
        if (central.connected()) {
          dataCharacteristic.writeValue(data, sizeof(data));
        }
        timestamp = millis();
        //Serial.println(central.rssi());
      }
    }
  } else {
    Serial.println("disconnected");
  }
}
