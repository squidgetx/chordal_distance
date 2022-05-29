#include "Arduino_LSM9DS1.h"
#include "ArduinoBLE.h"

// Data packet contains 3 floats: one for each of the 3 accelerometer axes

const char *UUID = "05fe3c85-7f28-4685-ab2a-b036324da113";
const int TRANSMIT_INTERVAL_MS = 301;
float data[3];
BLEService tensionService(UUID);
BLECharacteristic dataCharacteristic(
    UUID,
    BLERead | BLENotify,
    sizeof(float) * 4);

long timestamp = 0;

void setup()
{
  Serial.begin(9600);
  Serial.println("begin");

  // attempt to start the IMU:
  if (!IMU.begin())
  {
    Serial.println("Failed to initialize IMU");
    while (true)
      ;
  }

  if (!BLE.begin())
  {
    Serial.println("starting BLE failed!");
    while (true)
      ;
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

void getIMU()
{
  if (IMU.accelerationAvailable() &&
      IMU.gyroscopeAvailable())
  {
    // read accelerometer & gyrometer:
    IMU.readAcceleration(data[0], data[1], data[2]);
  }
}

void loop()
{
  BLEDevice central = BLE.central();

  // if a central is connected to the peripheral:
  if (central)
  {
    // print the central's BT address:
    Serial.print("Connected to central: ");

    // while the central remains connected:
    while (central.connected())
    {
      // read sensors:
      if (millis() - timestamp > TRANSMIT_INTERVAL_MS)
      {
        getIMU();
        if (central.connected())
        {
          dataCharacteristic.writeValue(data, sizeof(data));
        }
        timestamp = millis();
      }
    }
  }
  else
  {
    Serial.println("disconnected");
  }
}
