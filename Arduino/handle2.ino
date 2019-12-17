#include "Arduino_LSM9DS1.h"
#include "ArduinoBLE.h"

float acceleration[3];

// BLE
BLEService tensionService("05fe3c85-7f28-4685-ab2a-b036324da113"); 
BLECharacteristic accelerationCharacteristic ("05fe3c86-7f28-4685-ab2a-b036324da113", BLENotify, sizeof(float) * 3);

void setup() {
  
 // digitalWrite(4, HIGH);

  // attempt to start the IMU:
  if (!IMU.begin()) {
  //  Serial.println("Failed to initialize IMU");
    while (true);
  }
  
  if (!BLE.begin()) {
 //  Serial.println("starting BLE failed!");
    while (true);
  }
 // Serial.println("imu and ble begin");
 
  BLE.setLocalName("TensionSensor2");
  BLE.setAdvertisedService(tensionService);
  
   // add the characteristic to the service
  tensionService.addCharacteristic(accelerationCharacteristic);

  // add service:
  BLE.addService(tensionService);
 
  // start advertising
  BLE.advertise();
 
  //Serial.println("BLE Peripheral initialization success");
}


void getIMU() {
  if (IMU.accelerationAvailable() &&
      IMU.gyroscopeAvailable()) {
    // read accelerometer & gyrometer:
    IMU.readAcceleration(acceleration[0], acceleration[1], acceleration[2]);
  } 
}

void loop() {
    BLE.poll();
    getIMU();   
    accelerationCharacteristic.writeValue(acceleration, sizeof(acceleration));      
}
