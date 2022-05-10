#include "Arduino_LSM9DS1.h"
#include "HX711.h"
#include "ArduinoBLE.h"

// HX711 circuit wiring
const int LOADCELL_DOUT_PIN = 3;
const int LOADCELL_SCK_PIN = 2;
float acceleration[3];

long reading;
HX711 scale;
int counter;

// BLE
BLEService tensionService("0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e"); 
BLEIntCharacteristic tensionCharacteristic("0b5dca25-b5ff-4d4e-923e-be8c16ae8b2e4", BLENotify);
BLECharacteristic accelerationCharacteristic ("0b5dca26-b5ff-4d4e-923e-be8c16ae8b2e4", BLENotify, sizeof(float) * 3);

void setup() {
  counter = millis();
  Serial.begin(9600);
 // while (!Serial);
  Serial.println("begin");
  digitalWrite(4, HIGH);


  scale.begin(LOADCELL_DOUT_PIN, LOADCELL_SCK_PIN);
  
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
  tensionService.addCharacteristic(tensionCharacteristic);
  tensionService.addCharacteristic(accelerationCharacteristic);

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
    IMU.readAcceleration(acceleration[0], acceleration[1], acceleration[2]);
  } 
}

void getScale() {
//  Serial.flush();

  if (scale.is_ready()) {
     // Read -32K when loaded with 150g
    // So 150 = m(-32)
    // m = -32 / 150
   reading = scale.read();// + 123891) * 150 / (-104873 + 123891);
   //reading = scale.read();
  // Serial.println(reading);

  }
}

void loop() {
  // listen for BLE peripherals to connect:

  //BLEDevice central = BLE.central();
 
  // if a central is connected:
 // if (central) {
    BLE.poll();
   // Serial.print("Connected to central: ");
    // print the central's MAC address:
//    Serial.println(central.address());
 
    // while the central is still connected to peripheral:
   // while (central.connected()) {
        getIMU();
        getScale();
        tensionCharacteristic.writeValue(reading);
        accelerationCharacteristic.writeValue(acceleration, sizeof(acceleration));
        //delay(200);
   // }
   //}
  
}
