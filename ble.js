let Noble = require('@abandonware/noble');
let Osc = require('osc')
let UUID_PRIMARY = "0b5dca24-b5ff-4d4e-923e-be8c16ae8b2e";
let UUID_SECONDARY = "05fe3c85-7f28-4685-ab2a-b036324da113";

let oscPort = new Osc.UDPPort({
  localAddress: "0.0.0.0",
  localPort: 57121,
  // This is where sclang is listening for OSC messages.
  remoteAddress: "127.0.0.1",
  remotePort: 57120,
});

let oscPortReady = false;
let primaryConnected = false;
let secondaryConnected = false;

oscPort.open();
oscPort.on("error", function (error) {
    console.log("An error occurred: ", error.message);
});
oscPort.on("ready", function () {
  console.log("Osc port ready!")
  oscPortReady = true;
});

Noble.on('stateChange', state => {
  if (state === 'poweredOn') {
    console.log('Scanning for primary sensor');
    Noble.startScanning([UUID_PRIMARY]);
  //  Noble.startScanning([UUID_SECONDARY]);
  } else {
    console.log('Scan failed');
    Noble.stopScanning();
  }
});

Noble.on('discover', peripheral => {
    // connect to the first peripheral that is scanned
    let name = peripheral.advertisement.localName;
    console.log(`Found ${peripheral.id}`);

    Noble.stopScanning();
    if (peripheral.id == 'eccb8ace4f1b4a92a591ac4d5041c30e') {
      connectSecondary(peripheral);
    } else {
      connectPrimary(peripheral);
    }
});

// Connect and set up to primary BLE device (tension + accel)
function connectPrimary(peripheral) {
  peripheral.connect(error => {
    console.log('Connected to', peripheral.id);
    peripheral.discoverAllServicesAndCharacteristics(onPrimaryDiscovered);
  });
  peripheral.on('disconnect', () => {
    console.log('[Primary] disconnected, attempting to reconnect...')
    Noble.startScanning([UUID_PRIMARY]);
  });
}

// Set up primary BLE device notifications (tension + accel)
function onPrimaryDiscovered(error, services, characteristics) {
  const tensionCharacteristic = characteristics[0];

  // data callback receives notifications
  tensionCharacteristic.on('data', (data, isNotification) => {
    if (oscPortReady) {
      oscPort.send({
        address: "/primary/tension",
        args: [
            {
                type: "f",
                value: data.readInt32LE(),
            }
        ]
      });
    }
  });

  // subscribe to be notified whenever the peripheral update the characteristic
  tensionCharacteristic.subscribe(error => {
    if (error) {
      console.error('Error subscribing to tension notifications');
    } else {
      console.log('Subscribed for tension notifications');
    }
  });

  const accelerationCharacteristic = characteristics[1];

  // data callback receives notifications
  accelerationCharacteristic.on('data', (data, isNotification) => {
    handleAcceleration('primary', data)
  });

  // subscribe to be notified whenever the peripheral update the characteristic
  accelerationCharacteristic.subscribe(error => {
    if (error) {
      console.error('Error subscribing to accelerationCharacteristic');
    } else {
      console.log('Subscribed for accelerationCharacteristic notifications');
    }
  });

  primaryConnected = true;
  if (!secondaryConnected) {
    console.log('Scanning for secondary sensor');
    Noble.startScanning([UUID_SECONDARY]);
  }

}

// Connect and set up to primary BLE device (tension + accel)
function connectSecondary(peripheral) {
  peripheral.connect(error => {
    console.log('[Secondary] connected to', peripheral.id);
    peripheral.discoverAllServicesAndCharacteristics(onSecondaryDiscovered);
  });
  peripheral.on('disconnect', () => {
    console.log('[Secondary] disconnected, attempting to reconnect...')
    Noble.startScanning([UUID_SECONDARY]);
  });
}

// Set up primary BLE device notifications (tension + accel)
function onSecondaryDiscovered(error, services, characteristics) {
  console.log('[Secondary] characteristics discovered');
  const secondaryAccelerationCharacteristic = characteristics[0];

  // data callback receives notifications
  secondaryAccelerationCharacteristic.on('data', (data, isNotification) => {
      handleAcceleration('secondary', data)
    }
  );

  // subscribe to be notified whenever the peripheral update the characteristic
  secondaryAccelerationCharacteristic.subscribe(error => {
    if (error) {
      console.error('[Secondary] Error subscribing to acceleration notifications');
    } else {
      console.log('[Secondary] Subscribed for acceleration notifications');
    }
  });

  secondaryConnected = true;
  if (!primaryConnected) {
    console.log('Scanning for primary sensor');
    Noble.startScanning([UUID_PRIMARY]);
  }

}

function handleAcceleration(ident, data) {
  let accX = data.readFloatLE();
  let accY = data.readFloatLE(4);
  let accZ = data.readFloatLE(8);
  accMag = Math.sqrt(accX * accX + accY * accY + accZ * accZ);
  angleXZ = Math.atan2(-accX, accZ);
  if (oscPortReady) {
    oscPort.send({
      timeTag: Osc.timeTag(0),
      packets: [
        {
          address: "/" + ident + "/accMag",
          args: [
            {
                type: "f",
                value: accMag,
            }
          ]
        },
        {
          address: "/" + ident + "/angleXZ",
          args: [
            {
                type: "f",
                value: angleXZ,
            }
          ]
        },
      ]
    });
  }
}
