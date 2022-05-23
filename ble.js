let Noble = require("@abandonware/noble");

/*
 * devices is an dict of objects describing properties of each device
 *   key is the uuid
 *   properties include:
 *     - uuid
 *     - characteristics (name, callback)
 */
let connect = function (device_array, socket) {
  let devices = {};
  for (let d of device_array) {
    devices[d.id] = d;
  }

  let uuids = Object.values(devices).map((d) => d.uuid);

  Noble.on("stateChange", (state) => {
    if (state === "poweredOn") {
      console.log("Scanning for devices...", uuids);
      Noble.startScanning(uuids);
    } else {
      console.log("Scan failed");
      Noble.stopScanning();
    }
  });

  Noble.on("discover", (peripheral) => {
    console.log(`Found ${peripheral.uuid}`);
    peripheral.connect((error) => {
      socket.emit("connect_ble", devices[peripheral.id].name);
      console.log("Connected to", peripheral.uuid);
      peripheral.discoverAllServicesAndCharacteristics(
        onDeviceDiscovered(peripheral)
      );
    });
    if (devices[peripheral.id].disconnectHandler == false) {
      peripheral.on("disconnect", () => {
        socket.emit("disconnect_ble", devices[peripheral.id].name);
        const uuid = devices[peripheral.id].uuid;
        devices[peripheral.id].disconnectHandler = true;
        console.log(`${uuid} disconnected, attempting to reconnect...`);
        Noble.startScanning([uuid]);
      });
    }
    /*
    if (connected.length == devices.length) {
      console.log("All devices connnected");
      Noble.stopScanning();
    }
    */
  });

  // Set up primary BLE device notifications (tension + accel)
  function onDeviceDiscovered(peripheral) {
    let device = devices[peripheral.id];
    return (error, services, characteristics) => {
      if (characteristics.length != device.characteristics.length) {
        console.log(
          `ERROR! Mismatched characteristic lengths for device ${device.uuid}`
        );
      }
      for (let i = 0; i < characteristics.length; i++) {
        const characteristic = characteristics[i];
        characteristic.on("data", (data) => {
          device.characteristics[i].callback(data);
          socket.emit("connect_ble", devices[peripheral.id].name);
        });
        characteristic.subscribe((error) => {
          if (error) {
            console.error("Error subscribing to notifications");
          } else {
            console.log("Subscribed to notifications");
          }
        });
      }
    };
  }
};

module.exports = {
  connect: connect,
};
